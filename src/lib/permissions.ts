/**
 * Permissions & Hierarchy System
 * 
 * Gerencia permissões e hierarquia de grupos (atléticas e peladas).
 * 
 * Hierarquia:
 * - Atléticas (parent_group_id = NULL)
 *   └─ Grupos filhos (parent_group_id = athletic_id)
 * 
 * Permissões:
 * - Admin de atlética pode gerenciar grupos filhos
 * - Admin de grupo pode gerenciar apenas seu grupo
 * - Member não pode gerenciar grupos
 */

import { sql } from "@/db/client";
import logger from "@/lib/logger";
import {
  fromDbGroupType,
  isAthleticGroupType,
  normalizeRequestedGroupType,
  type AnyGroupType,
  type CanonicalGroupType,
} from "@/lib/group-type";

// =====================================================
// TYPES
// =====================================================

export interface GroupHierarchy {
  id: string;
  name: string;
  groupType: CanonicalGroupType;
  parentGroupId: string | null;
  children?: GroupHierarchy[];
}

export interface GroupPermissions {
  canManage: boolean;
  canCreateChild: boolean;
  canEditSettings: boolean;
  canManageMembers: boolean;
  canManageFinances: boolean;
  isAdmin: boolean;
  isAthleticAdmin: boolean; // Admin da atlética pai
}

// =====================================================
// HIERARCHY QUERIES
// =====================================================

/**
 * Get group hierarchy (parent + all children)
 */
export async function getGroupHierarchy(groupId: string): Promise<GroupHierarchy | null> {
  try {
    // Get root group (athletic or standalone)
    const rootQuery = await sql`
      SELECT 
        id,
        name,
        group_type as "groupType",
        parent_group_id as "parentGroupId"
      FROM groups
      WHERE id = ${groupId}
    `;

    if (!rootQuery || rootQuery.length === 0) {
      return null;
    }

    const rootRow = rootQuery[0] as any;
    const root: GroupHierarchy = {
      id: rootRow.id,
      name: rootRow.name,
      groupType: fromDbGroupType(rootRow.groupType, rootRow.parentGroupId),
      parentGroupId: rootRow.parentGroupId,
    };

    // If this is a child group, get the parent first
    if (root.parentGroupId) {
      const parentQuery = await sql`
        SELECT 
          id,
          name,
          group_type as "groupType",
          parent_group_id as "parentGroupId"
        FROM groups
        WHERE id = ${root.parentGroupId}
      `;

      if (parentQuery && parentQuery.length > 0) {
        const parentRow = parentQuery[0] as any;
        const parent: GroupHierarchy = {
          id: parentRow.id,
          name: parentRow.name,
          groupType: fromDbGroupType(parentRow.groupType, parentRow.parentGroupId),
          parentGroupId: parentRow.parentGroupId,
        };
        parent.children = await getChildGroups(parent.id);
        return parent;
      }
    }

    // Get children for this group
    root.children = await getChildGroups(root.id);

    return root;
  } catch (error) {
    logger.error({ error, groupId }, "Error getting group hierarchy");
    return null;
  }
}

/**
 * Get all child groups
 */
async function getChildGroups(parentId: string): Promise<GroupHierarchy[]> {
  try {
    const children = await sql`
      SELECT 
        id,
        name,
        group_type as "groupType",
        parent_group_id as "parentGroupId"
      FROM groups
      WHERE parent_group_id = ${parentId}
      ORDER BY created_at ASC
    `;

    return children.map((row: any) => ({
      id: row.id,
      name: row.name,
      groupType: fromDbGroupType(row.groupType, row.parentGroupId),
      parentGroupId: row.parentGroupId,
    })) as GroupHierarchy[];
  } catch (error) {
    logger.error({ error, parentId }, "Error getting child groups");
    return [];
  }
}

/**
 * Get all groups a user can manage (direct + hierarchy)
 */
export async function getManagedGroups(userId: string): Promise<GroupHierarchy[]> {
  try {
    // Get groups where user is admin/owner OR creator of the group
    const adminGroups = await sql`
      SELECT DISTINCT
        g.id,
        g.name,
        g.group_type as "groupType",
        g.parent_group_id as "parentGroupId"
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = ${userId}
      WHERE (
        (gm.role IN ('admin', 'owner'))
        OR g.created_by = ${userId}
      )
      ORDER BY g.created_at ASC
    `;

    const groups: GroupHierarchy[] = [];

    const mappedGroups = adminGroups.map((row: any) => ({
      id: row.id,
      name: row.name,
      groupType: fromDbGroupType(row.groupType, row.parentGroupId),
      parentGroupId: row.parentGroupId,
    })) as GroupHierarchy[];

    for (const group of mappedGroups) {
      // If athletic, include children
      if (group.groupType === "atletica" && !group.parentGroupId) {
        group.children = await getChildGroups(group.id);
      }
      groups.push(group);
    }

    return groups;
  } catch (error) {
    logger.error({ error, userId }, "Error getting managed groups");
    return [];
  }
}

// =====================================================
// PERMISSION CHECKS
// =====================================================

/**
 * Check if user can manage a group (using SQL function)
 * 
 * Returns true if:
 * - User is admin of the group
 * - User is admin of the parent athletic
 */
export async function canManageGroup(
  userId: string,
  groupId: string
): Promise<boolean> {
  try {
    // Evita depender da função SQL legada (que só considera role = 'admin').
    // No modelo atual também aceitamos 'owner' como administrador.
    const directAdmin = await sql`
      SELECT EXISTS(
        SELECT 1
        FROM group_members
        WHERE group_id = ${groupId}
          AND user_id = ${userId}
          AND role IN ('admin', 'owner')
      ) as can_manage
    `;

    if (directAdmin[0]?.can_manage) {
      return true;
    }

    // Criador do grupo também pode gerenciar (fallback robusto)
    const creatorCheck = await sql`
      SELECT EXISTS(
        SELECT 1
        FROM groups
        WHERE id = ${groupId}
          AND created_by = ${userId}
      ) as can_manage
    `;

    if (creatorCheck[0]?.can_manage) {
      return true;
    }

    const parentAdmin = await sql`
      SELECT EXISTS(
        SELECT 1
        FROM groups g
        INNER JOIN group_members gm ON gm.group_id = g.parent_group_id
        WHERE g.id = ${groupId}
          AND gm.user_id = ${userId}
          AND gm.role IN ('admin', 'owner')
      ) as can_manage
    `;

    return Boolean(parentAdmin[0]?.can_manage);
  } catch (error) {
    logger.error({ error, userId, groupId }, "Error checking manage permission");
    return false;
  }
}

/**
 * Check if user can create a child group under a parent
 * 
 * Rules:
 * - Only admins of athletic groups can create child groups
 * - Cannot create children of pelada groups
 * - Cannot create children if already has a parent (max 2 levels)
 */
export async function canCreateGroup(
  userId: string,
  parentGroupId?: string
): Promise<{ canCreate: boolean; reason?: string }> {
  try {
    // If no parent, user can always create a top-level group
    if (!parentGroupId) {
      return { canCreate: true };
    }

    // Check if user is admin of parent group
    const isAdmin = await canManageGroup(userId, parentGroupId);

    if (!isAdmin) {
      return {
        canCreate: false,
        reason: "Você não é admin do grupo pai",
      };
    }

    // Check parent group type and hierarchy
    const parentQuery = await sql`
      SELECT 
        group_type as "groupType",
        parent_group_id as "parentGroupId"
      FROM groups
      WHERE id = ${parentGroupId}
    `;

    if (!parentQuery || parentQuery.length === 0) {
      return {
        canCreate: false,
        reason: "Grupo pai não encontrado",
      };
    }

    const parent = parentQuery[0];

    // Only athletic groups can have children
    if (!isAthleticGroupType(parent.groupType)) {
      return {
        canCreate: false,
        reason: "Apenas atléticas podem ter grupos filhos",
      };
    }

    // Parent cannot already be a child (max 2 levels)
    if (parent.parentGroupId) {
      return {
        canCreate: false,
        reason: "Hierarquia máxima de 2 níveis (atlética → grupo)",
      };
    }

    return { canCreate: true };
  } catch (error) {
    logger.error({ error, userId, parentGroupId }, "Error checking create permission");
    return {
      canCreate: false,
      reason: "Erro ao verificar permissões",
    };
  }
}

/**
 * Get all permissions for a user in a group
 */
export async function getGroupPermissions(
  userId: string,
  groupId: string
): Promise<GroupPermissions> {
  try {
    // Check if user can manage group
    const canManage = await canManageGroup(userId, groupId);

    // Get user role in group
    const roleQuery = await sql`
      SELECT role
      FROM group_members
      WHERE group_id = ${groupId}
        AND user_id = ${userId}
    `;

    const isAdmin = roleQuery[0]?.role === "admin" || roleQuery[0]?.role === "owner";

    // Check if user is admin of parent athletic
    const parentQuery = await sql`
      SELECT 
        g.parent_group_id,
        gm.role as parent_role
      FROM groups g
      LEFT JOIN group_members gm 
        ON g.parent_group_id = gm.group_id 
        AND gm.user_id = ${userId}
      WHERE g.id = ${groupId}
    `;

    const isAthleticAdmin =
      parentQuery[0]?.parent_role === "admin" || parentQuery[0]?.parent_role === "owner";

    // Get group type to determine createChild permission
    const groupQuery = await sql`
      SELECT 
        group_type as "groupType",
        parent_group_id as "parentGroupId"
      FROM groups
      WHERE id = ${groupId}
    `;

    const group = groupQuery[0];
    const canCreateChild =
      isAdmin &&
      isAthleticGroupType(group?.groupType) &&
      !group?.parentGroupId;

    return {
      canManage,
      canCreateChild,
      canEditSettings: canManage,
      canManageMembers: canManage,
      canManageFinances: canManage,
      isAdmin,
      isAthleticAdmin,
    };
  } catch (error) {
    logger.error({ error, userId, groupId }, "Error getting permissions");
    return {
      canManage: false,
      canCreateChild: false,
      canEditSettings: false,
      canManageMembers: false,
      canManageFinances: false,
      isAdmin: false,
      isAthleticAdmin: false,
    };
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Check if group is athletic (top-level)
 */
export async function isAthletic(groupId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT 
        group_type as "groupType",
        parent_group_id as "parentGroupId"
      FROM groups
      WHERE id = ${groupId}
    `;

    if (!result || result.length === 0) {
      return false;
    }

    const group = result[0];
    return isAthleticGroupType(group.groupType) && !group.parentGroupId;
  } catch (error) {
    logger.error({ error, groupId }, "Error checking if athletic");
    return false;
  }
}

/**
 * Get parent athletic ID (if exists)
 */
export async function getParentAthletic(groupId: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT parent_group_id as "parentGroupId"
      FROM groups
      WHERE id = ${groupId}
    `;

    return result[0]?.parentGroupId || null;
  } catch (error) {
    logger.error({ error, groupId }, "Error getting parent athletic");
    return null;
  }
}

/**
 * Count child groups
 */
export async function countChildGroups(parentId: string): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM groups
      WHERE parent_group_id = ${parentId}
    `;

    return parseInt(result[0]?.count || "0");
  } catch (error) {
    logger.error({ error, parentId }, "Error counting child groups");
    return 0;
  }
}

/**
 * Validate group hierarchy before creation/update
 */
export async function validateHierarchy(
  groupType: AnyGroupType,
  parentGroupId?: string
): Promise<{ valid: boolean; error?: string }> {
  // Top-level groups are always valid
  if (!parentGroupId) {
    return { valid: true };
  }

  try {
    // Check if parent exists
    const parentQuery = await sql`
      SELECT 
        group_type as "groupType",
        parent_group_id as "parentGroupId"
      FROM groups
      WHERE id = ${parentGroupId}
    `;

    if (!parentQuery || parentQuery.length === 0) {
      return { valid: false, error: "Grupo pai não encontrado" };
    }

    const parent = parentQuery[0];

    // Parent must be athletic
    if (!isAthleticGroupType(parent.groupType)) {
      return { valid: false, error: "Grupo pai deve ser uma atlética" };
    }

    // Parent cannot have a parent (max 2 levels)
    if (parent.parentGroupId) {
      return { valid: false, error: "Hierarquia máxima de 2 níveis" };
    }

    // Child must be pelada
    const normalized = normalizeRequestedGroupType(groupType, parentGroupId);
    if (normalized !== "modality_group") {
      return { valid: false, error: "Grupos filhos devem ser do tipo modalidade" };
    }

    return { valid: true };
  } catch (error) {
    logger.error({ error, groupType, parentGroupId }, "Error validating hierarchy");
    return { valid: false, error: "Erro ao validar hierarquia" };
  }
}
