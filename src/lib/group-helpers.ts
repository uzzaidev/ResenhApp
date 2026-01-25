/**
 * Group Helpers - Server-side utilities
 * 
 * Helpers para buscar grupo atual em Server Components.
 * Como Server Components não têm acesso ao localStorage,
 * usamos cookies ou buscamos o primeiro grupo do usuário.
 * 
 * Sprint 1: GroupContext + Multi-Grupo
 */

import { cookies } from "next/headers";
import { sql } from "@/db/client";

export interface UserGroup {
  id: string;
  name: string;
  description?: string | null;
  groupType?: "athletic" | "pelada";
  parentGroupId?: string | null;
  role?: "admin" | "member";
  memberCount?: number;
}

/**
 * Busca o grupo atual do usuário (Server Component)
 * 
 * Prioridade:
 * 1. Cookie `currentGroupId` (se existir e for válido)
 * 2. Primeiro grupo do usuário
 */
export async function getUserCurrentGroup(userId: string): Promise<UserGroup | null> {
  try {
    // Tentar buscar do cookie
    const cookieStore = await cookies();
    const savedGroupId = cookieStore.get("currentGroupId")?.value;

    let groupId: string | null = null;

    if (savedGroupId) {
      // Verificar se o grupo existe e o usuário é membro
      const groupCheck = await sql`
        SELECT g.id
        FROM groups g
        INNER JOIN group_members gm ON g.id = gm.group_id
        WHERE g.id = ${savedGroupId} AND gm.user_id = ${userId}
        LIMIT 1
      `;

      if (groupCheck.length > 0) {
        groupId = (groupCheck[0] as any).id;
      }
    }

    // Se não encontrou no cookie, buscar primeiro grupo
    if (!groupId) {
      const firstGroup = await sql`
        SELECT g.id
        FROM groups g
        INNER JOIN group_members gm ON g.id = gm.group_id
        WHERE gm.user_id = ${userId}
        ORDER BY g.created_at DESC
        LIMIT 1
      `;

      if (firstGroup.length > 0) {
        groupId = (firstGroup[0] as any).id;
      }
    }

    if (!groupId) {
      return null;
    }

    // Buscar dados completos do grupo
    const groupData = await sql`
      SELECT
        g.id,
        g.name,
        g.description,
        g.group_type,
        g.parent_group_id,
        gm.role,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id)::INTEGER AS member_count
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE g.id = ${groupId} AND gm.user_id = ${userId}
      LIMIT 1
    `;

    if (groupData.length === 0) {
      return null;
    }

    const g = groupData[0] as any;

    return {
      id: g.id,
      name: g.name,
      description: g.description,
      groupType: g.group_type,
      parentGroupId: g.parent_group_id,
      role: g.role,
      memberCount: Number(g.member_count) || 0,
    };
  } catch (error) {
    console.error("Error fetching user current group:", error);
    return null;
  }
}

/**
 * Busca todos os grupos do usuário (Server Component)
 */
export async function getUserGroups(userId: string): Promise<UserGroup[]> {
  try {
    const groups = await sql`
      SELECT
        g.id,
        g.name,
        g.description,
        g.group_type,
        g.parent_group_id,
        gm.role,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id)::INTEGER AS member_count
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ${userId}
      ORDER BY g.created_at DESC
    `;

    return groups.map((g: any) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      groupType: g.group_type,
      parentGroupId: g.parent_group_id,
      role: g.role,
      memberCount: Number(g.member_count) || 0,
    }));
  } catch (error) {
    console.error("Error fetching user groups:", error);
    return [];
  }
}


