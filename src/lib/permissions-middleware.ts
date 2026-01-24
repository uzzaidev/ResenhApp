/**
 * Permissions Middleware
 * 
 * Helper para integrar verificações de permissões em rotas API.
 * 
 * Usage:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   return withPermissionCheck(
 *     request,
 *     async (user, groupId, permissions) => {
 *       // Your logic here
 *       return NextResponse.json({ success: true });
 *     }
 *   );
 * }
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { getGroupPermissions, canManageGroup, type GroupPermissions } from "@/lib/permissions";
import logger from "@/lib/logger";

export interface PermissionCheckOptions {
  /** Requer que usuário seja admin (default: false) */
  requireAdmin?: boolean;
  /** Requer que usuário possa gerenciar grupo (admin ou athletic admin) */
  requireManage?: boolean;
  /** Permitir acesso se usuário for membro (default: true) */
  allowMember?: boolean;
}

/**
 * Wrapper para rotas que requerem verificação de permissões
 * 
 * Verifica automaticamente:
 * 1. Autenticação do usuário
 * 2. Membership no grupo
 * 3. Permissões específicas
 * 
 * @param request - NextRequest
 * @param handler - Handler que recebe (user, groupId, permissions)
 * @param options - Opções de permissão
 */
export async function withPermissionCheck<T = any>(
  request: NextRequest,
  handler: (
    user: any,
    groupId: string,
    permissions: GroupPermissions
  ) => Promise<NextResponse<T>>,
  options: PermissionCheckOptions = {}
): Promise<NextResponse> {
  const {
    requireAdmin = false,
    requireManage = false,
    allowMember = true,
  } = options;

  try {
    // 1. Authenticate user
    const user = await requireAuth();

    // 2. Get groupId from request
    let groupId: string | null = null;

    if (request.method === "GET") {
      const { searchParams } = new URL(request.url);
      groupId = searchParams.get("group_id");
    } else {
      const body = await request.json();
      groupId = body.groupId || body.group_id;
    }

    if (!groupId) {
      return NextResponse.json(
        { error: "group_id é obrigatório" },
        { status: 400 }
      );
    }

    // 3. Get permissions
    const permissions = await getGroupPermissions(user.id, groupId);

    // 4. Check if user is member
    if (!permissions.isAdmin && !allowMember) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    // 5. Check if admin is required
    if (requireAdmin && !permissions.isAdmin) {
      return NextResponse.json(
        { error: "Apenas administradores do grupo têm acesso" },
        { status: 403 }
      );
    }

    // 6. Check if manage permission is required
    if (requireManage && !permissions.canManage) {
      return NextResponse.json(
        { error: "Você não tem permissão para gerenciar este grupo" },
        { status: 403 }
      );
    }

    // 7. Execute handler
    return await handler(user, groupId, permissions);
  } catch (error) {
    if (error instanceof Error && error.message === "Não autenticado") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    logger.error({ error }, "Error in permissions middleware");
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

/**
 * Verificar permissões sem executar handler
 * Útil para validações customizadas
 */
export async function checkPermissions(
  userId: string,
  groupId: string
): Promise<GroupPermissions> {
  return getGroupPermissions(userId, groupId);
}

/**
 * Middleware para verificar se usuário pode gerenciar grupo
 * Útil para rotas de admin
 */
export async function requireGroupManage(
  userId: string,
  groupId: string
): Promise<{ allowed: boolean; error?: string }> {
  const canManage = await canManageGroup(userId, groupId);

  if (!canManage) {
    return {
      allowed: false,
      error: "Você não tem permissão para gerenciar este grupo",
    };
  }

  return { allowed: true };
}

