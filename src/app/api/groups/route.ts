import { NextRequest, NextResponse } from "next/server";
import { isUnauthorizedError, requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { createGroupSchema } from "@/lib/validations";
import logger from "@/lib/logger";
import { generateInviteCode } from "@/lib/utils";
import {
  fromDbGroupType,
  normalizeRequestedGroupType,
  toDbGroupType,
} from "@/lib/group-type";
import {
  consumeCreditsForGroupCreation,
  ensureCreditsForGroupCreation,
} from "@/lib/group-creation-credits";

// GET /api/groups - List all groups for current user
export async function GET() {
  try {
    const user = await requireAuth();

    const groups = await sql`
      SELECT
        g.id,
        g.name,
        g.description,
        g.privacy,
        g.photo_url,
        g.created_at,
        g.group_type,
        g.parent_group_id,
        gm.role AS user_role,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id)::INTEGER AS member_count
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ${user.id}
      ORDER BY g.created_at DESC
    `;

    const mappedGroups = groups.map((g: any) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      groupType: fromDbGroupType(g.group_type, g.parent_group_id),
      rawGroupType: g.group_type,
      parentGroupId: g.parent_group_id,
      role: g.user_role,
      memberCount: Number(g.member_count) || 0,
    }));

    return NextResponse.json({ groups: mappedGroups });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "NÃƒÂ£o autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching groups");
    return NextResponse.json({ error: "Erro ao buscar grupos" }, { status: 500 });
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const validation = createGroupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados invÃƒÂ¡lidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, privacy, groupType, parentGroupId } = validation.data;
    const normalizedGroupType = normalizeRequestedGroupType(groupType, parentGroupId);

    if (parentGroupId) {
      const { validateHierarchy, canCreateGroup } = await import("@/lib/permissions");

      const createCheck = await canCreateGroup(user.id, parentGroupId);
      if (!createCheck.canCreate) {
        return NextResponse.json(
          { error: createCheck.reason || "NÃƒÂ£o ÃƒÂ© possÃƒÂ­vel criar grupo filho" },
          { status: 403 }
        );
      }

      const hierarchyCheck = await validateHierarchy(normalizedGroupType, parentGroupId);
      if (!hierarchyCheck.valid) {
        return NextResponse.json(
          { error: hierarchyCheck.error || "Hierarquia invÃƒÂ¡lida" },
          { status: 400 }
        );
      }
    }

    if (normalizedGroupType === "modality_group" && !parentGroupId) {
      return NextResponse.json(
        { error: "Grupo de modalidade exige uma atlÃƒÂ©tica pai" },
        { status: 400 }
      );
    }

    const dbGroupType = toDbGroupType(normalizedGroupType);
    const effectiveParentId =
      normalizedGroupType === "atletica" || normalizedGroupType === "standalone"
        ? null
        : parentGroupId || null;

    const creditCheck = await ensureCreditsForGroupCreation(
      sql,
      user.id,
      normalizedGroupType
    );
    if (!creditCheck.allowed) {
      const quotaReason = "Quota insuficiente para criacao";
      return NextResponse.json(
        {
          error: quotaReason,
          requiredCredits: creditCheck.required,
          currentBalance: creditCheck.balance ?? 0,
        },
        { status: 402 }
      );
    }

    const inviteCode = generateInviteCode();
    const result = await sql.begin(async (tx: any) => {
      const groupQuery = await tx`
        INSERT INTO groups (
          name,
          description,
          privacy,
          group_type,
          parent_group_id,
          created_by
        )
        VALUES (
          ${name},
          ${description || null},
          ${privacy},
          ${dbGroupType},
          ${effectiveParentId},
          ${user.id}
        )
        RETURNING *
      `;
      const group = groupQuery[0];

      await tx`
        INSERT INTO group_members (user_id, group_id, role)
        VALUES (${user.id}, ${group.id}, 'admin')
      `;

      await tx`
        INSERT INTO wallets (owner_type, owner_id, balance_cents)
        VALUES ('group', ${group.id}, 0)
      `;

      await tx`
        INSERT INTO invites (group_id, code, created_by)
        VALUES (${group.id}, ${inviteCode}, ${user.id})
      `;

      const creditConsumption = await consumeCreditsForGroupCreation(
        tx,
        user.id,
        normalizedGroupType
      );

      return { group, creditConsumption };
    });

    const group = result.group;

    logger.info(
      {
        groupId: group.id,
        userId: user.id,
        groupType: normalizedGroupType,
        dbGroupType,
        parentGroupId: effectiveParentId,
        requiredCredits: creditCheck.required,
        creditsDeferred: creditCheck.deferred,
      },
      "Group created"
    );

    return NextResponse.json(
      {
        group: {
          ...group,
          groupType: normalizedGroupType,
          rawGroupType: dbGroupType,
          parent_group_id: effectiveParentId,
          inviteCode,
        },
        credits: {
          required: creditCheck.required,
          deferred: creditCheck.deferred,
          charged: result.creditConsumption.charged,
          amount: result.creditConsumption.amount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "NÃƒÂ£o autenticado" }, { status: 401 });
    }
    logger.error(error, "Error creating group");
    return NextResponse.json({ error: "Erro ao criar grupo" }, { status: 500 });
  }
}

