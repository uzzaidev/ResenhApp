import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

type Params = Promise<{ groupId: string }>;

/**
 * GET /api/groups/:groupId/receiver-profiles
 * Lista receiver profiles disponíveis para o grupo
 * 
 * Sprint 2: RSVP → Charge Automática
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { groupId } = await params;
    const user = await requireAuth();

    // Verificar se usuário é membro do grupo
    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId}::BIGINT AND user_id = ${user.id}
      LIMIT 1
    `;
    const membership = membershipQuery[0];

    if (!membership) {
      return NextResponse.json(
        { error: "Você não é membro deste grupo" },
        { status: 403 }
      );
    }

    // Buscar receiver profiles do grupo
    // 1. Receiver profiles do tipo 'user' (admins do grupo)
    // 2. Receiver profiles do tipo 'institution' (se houver instituição)
    const receiverProfilesQuery = await sql`
      SELECT 
        rp.id,
        rp.type,
        rp.entity_id,
        rp.pix_key,
        rp.pix_type,
        rp.name,
        rp.city,
        rp.created_at
      FROM receiver_profiles rp
      WHERE (
        -- Receiver profiles de admins do grupo
        (rp.type = 'user' AND rp.entity_id IN (
          SELECT user_id FROM group_members
          WHERE group_id = ${groupId}::BIGINT AND role = 'admin'
        ))
        -- Ou receiver profiles da instituição (se implementado)
        OR (rp.type = 'institution' AND rp.entity_id IN (
          SELECT institution_id FROM groups
          WHERE id = ${groupId}::BIGINT AND institution_id IS NOT NULL
        ))
      )
      ORDER BY rp.created_at DESC
    `;

    const receiverProfiles = receiverProfilesQuery.map((rp: any) => ({
      id: rp.id,
      type: rp.type,
      entityId: rp.entity_id,
      pixKey: rp.pix_key,
      pixType: rp.pix_type,
      name: rp.name,
      city: rp.city,
      createdAt: rp.created_at,
    }));

    return NextResponse.json({ receiverProfiles });
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error fetching receiver profiles");
    return NextResponse.json(
      { error: "Erro ao buscar perfis de recebedor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/:groupId/receiver-profiles
 * Cria um novo receiver profile para o grupo
 * 
 * Sprint 2: RSVP → Charge Automática
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { groupId } = await params;
    const user = await requireAuth();
    const body = await request.json();

    const { type, pixKey, pixType, name, city } = body;

    // Validações
    if (!type || !['user', 'institution'].includes(type)) {
      return NextResponse.json(
        { error: "Tipo inválido. Use 'user' ou 'institution'" },
        { status: 400 }
      );
    }

    if (!pixKey || !pixType || !name || !city) {
      return NextResponse.json(
        { error: "Campos obrigatórios: pixKey, pixType, name, city" },
        { status: 400 }
      );
    }

    // Verificar se usuário é admin do grupo
    const membershipQuery = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId}::BIGINT AND user_id = ${user.id}
      LIMIT 1
    `;
    const membership = membershipQuery[0];

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json(
        { error: "Apenas admins podem criar receiver profiles" },
        { status: 403 }
      );
    }

    // Determinar entity_id baseado no tipo
    let entityId: string;
    if (type === 'user') {
      entityId = user.id; // Usar ID do admin atual
    } else {
      // Para institution, precisaria buscar institution_id do grupo
      // Por enquanto, usar user.id como fallback
      entityId = user.id;
    }

    // Criar receiver profile
    const receiverProfileQuery = await sql`
      INSERT INTO receiver_profiles (
        type,
        entity_id,
        pix_key,
        pix_type,
        name,
        city
      )
      VALUES (
        ${type},
        ${entityId},
        ${pixKey},
        ${pixType},
        ${name},
        ${city}
      )
      RETURNING *
    `;

    const receiverProfile = receiverProfileQuery[0];

    logger.info(
      { groupId, receiverProfileId: receiverProfile.id, userId: user.id },
      "Receiver profile created"
    );

    return NextResponse.json(
      {
        receiverProfile: {
          id: receiverProfile.id,
          type: receiverProfile.type,
          entityId: receiverProfile.entity_id,
          pixKey: receiverProfile.pix_key,
          pixType: receiverProfile.pix_type,
          name: receiverProfile.name,
          city: receiverProfile.city,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error creating receiver profile");
    return NextResponse.json(
      { error: "Erro ao criar perfil de recebedor" },
      { status: 500 }
    );
  }
}

