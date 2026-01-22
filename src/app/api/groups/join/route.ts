import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

// POST /api/groups/join - Join a group using invite code
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Código de convite é obrigatório" },
        { status: 400 }
      );
    }

    // Find invite by code
    const inviteQuery = await sql`
      SELECT * FROM invites
      WHERE code = ${code}
    `;
    const invite = inviteQuery[0];

    if (!invite) {
      return NextResponse.json(
        { error: "Código de convite inválido" },
        { status: 404 }
      );
    }

    // Check if invite has expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Este convite já expirou" },
        { status: 400 }
      );
    }

    // Check if invite has reached max uses
    if (invite.max_uses && invite.used_count >= invite.max_uses) {
      return NextResponse.json(
        { error: "Este convite já atingiu o limite de usos" },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMemberQuery = await sql`
      SELECT * FROM group_members
      WHERE group_id = ${invite.group_id} AND user_id = ${user.id}
    `;
    const existingMember = existingMemberQuery[0];

    if (existingMember) {
      return NextResponse.json(
        { error: "Você já é membro deste grupo" },
        { status: 400 }
      );
    }

    // Add user as member
    await sql`
      INSERT INTO group_members (user_id, group_id, role)
      VALUES (${user.id}, ${invite.group_id}, 'member')
    `;

    // Increment invite used count
    await sql`
      UPDATE invites
      SET used_count = used_count + 1
      WHERE id = ${invite.id}
    `;

    // Create user wallet if doesn't exist
    const existingWalletQuery = await sql`
      SELECT * FROM wallets
      WHERE owner_type = 'user' AND owner_id = ${user.id}
    `;
    const existingWallet = existingWalletQuery[0];

    if (!existingWallet) {
      await sql`
        INSERT INTO wallets (owner_type, owner_id, balance_cents)
        VALUES ('user', ${user.id}, 0)
      `;
    }

    // Get group details
    const groupQuery = await sql`
      SELECT * FROM groups WHERE id = ${invite.group_id}
    `;
    const group = groupQuery[0];

    logger.info(
      { groupId: invite.group_id, userId: user.id, inviteId: invite.id },
      "User joined group via invite"
    );

    return NextResponse.json(
      {
        message: "Você entrou no grupo com sucesso",
        group,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    logger.error(error, "Error joining group");
    return NextResponse.json(
      { error: "Erro ao entrar no grupo" },
      { status: 500 }
    );
  }
}
