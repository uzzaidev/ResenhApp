import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/client";
import { isUnauthorizedError, requireAuth } from "@/lib/auth-helpers";
import logger from "@/lib/logger";
import { z } from "zod";

const updateModalitiesSchema = z.object({
  modalities: z.array(z.string().min(2).max(40)).min(1).max(10),
});

function normalizeModalities(values: string[]) {
  const normalized = values
    .map((value) => value.trim())
    .filter((value) => value.length >= 2);
  return Array.from(new Set(normalized)).slice(0, 10);
}

function parseStoredModalities(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return [];
    }
  }

  return [];
}

export async function GET() {
  try {
    const user = await requireAuth();

    try {
      const result = await sql<{ onboarding_modalities: unknown }[]>`
        SELECT onboarding_modalities
        FROM users
        WHERE id = ${user.id}::UUID
        LIMIT 1
      `;

      const raw = result[0]?.onboarding_modalities;
      const modalities = parseStoredModalities(raw);

      return NextResponse.json({ modalities, schemaReady: true });
    } catch (columnError: any) {
      if (columnError?.code === "42703") {
        return NextResponse.json({ modalities: [], schemaReady: false });
      }
      throw columnError;
    }
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "NÃ£o autenticado" }, { status: 401 });
    }
    logger.error(error, "Error loading onboarding modalities");
    return NextResponse.json(
      { error: "Erro ao carregar modalidades de onboarding" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const validation = updateModalitiesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const modalities = normalizeModalities(validation.data.modalities);
    if (modalities.length === 0) {
      return NextResponse.json(
        { error: "Selecione ao menos uma modalidade valida" },
        { status: 400 }
      );
    }

    try {
      await sql`
        UPDATE users
        SET onboarding_modalities = ${sql.json(modalities)}::jsonb,
            updated_at = NOW()
        WHERE id = ${user.id}::UUID
      `;
    } catch (columnError: any) {
      if (columnError?.code === "42703") {
        return NextResponse.json(
          { error: "Migration pendente para onboarding_modalities", schemaReady: false },
          { status: 409 }
        );
      }
      throw columnError;
    }

    return NextResponse.json({
      ok: true,
      schemaReady: true,
      modalities,
    });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "NÃ£o autenticado" }, { status: 401 });
    }
    logger.error(error, "Error updating onboarding modalities");
    return NextResponse.json(
      { error: "Erro ao salvar modalidades de onboarding" },
      { status: 500 }
    );
  }
}

