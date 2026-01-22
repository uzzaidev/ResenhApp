import { auth } from "./auth";
import { sql } from "@/db/client";

/**
 * Helper para obter o usuário autenticado nas rotas da API
 * Retorna o usuário com informações do banco de dados
 */
export async function getCurrentUser() {
  const session = await auth();
  
  if (!session || !session.user) {
    return null;
  }

  // Buscar informações adicionais do usuário no banco
  try {
    const dbUser = await sql`
      SELECT id, name, email, image, created_at, updated_at
      FROM users
      WHERE id = ${session.user.id}
    `;

    if (Array.isArray(dbUser) && dbUser.length > 0) {
      const user = dbUser[0] as any;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    }

    // Se o usuário não existe no banco (não deveria acontecer), retornar null
    return null;
  } catch (error) {
    console.error("Erro ao buscar usuário no banco:", error);
    return null;
  }
}

/**
 * Helper para verificar se há um usuário autenticado
 * Lança erro 401 se não houver usuário autenticado
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Não autenticado");
  }
  
  return user;
}
