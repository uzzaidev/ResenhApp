import { headers } from "next/headers";
import { sql } from "@/db/client";
import { auth } from "./auth";

async function resolveSession() {
  // Prefer explicit request context (headers/cookies) for route handlers.
  try {
    const requestHeaders = await headers();
    const host = requestHeaders.get("host") || "localhost";
    const protocol = requestHeaders.get("x-forwarded-proto") || "http";
    const request = new Request(`${protocol}://${host}`, {
      headers: requestHeaders,
    });
    const sessionFromHeaders = await auth(request as any);
    if (sessionFromHeaders?.user) {
      return sessionFromHeaders;
    }
  } catch {
    // Continue to direct auth() fallback below.
  }

  const directSession = await auth();
  if (directSession?.user) {
    return directSession;
  }

  return null;
}

/**
 * Helper para obter o usuario autenticado nas rotas da API.
 * Retorna o usuario com informacoes do banco de dados.
 */
export async function getCurrentUser() {
  const session = await resolveSession();

  if (!session || !session.user) {
    return null;
  }

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

    return null;
  } catch (error) {
    console.error("Erro ao buscar usuario no banco:", error);
    return null;
  }
}

/**
 * Helper para verificar se ha um usuario autenticado.
 * Lanca erro 401 se nao houver usuario autenticado.
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    const error = new Error("Nao autenticado");
    (error as Error & { code?: string }).code = "AUTH_REQUIRED";
    throw error;
  }

  return user;
}

export function isUnauthorizedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const code = (error as Error & { code?: string }).code;
  if (code === "AUTH_REQUIRED") return true;

  const message = error.message.toLowerCase();
  return (
    message.includes("nao autenticado") ||
    message.includes("não autenticado") ||
    message.includes("nÃ£o autenticado")
  );
}
