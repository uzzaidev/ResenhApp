import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

async function schemaReady() {
  const result = await sql<{ exists: string | null }[]>`
    SELECT to_regclass('public.credit_purchase_requests')::TEXT AS exists
  `;
  return Boolean(result[0]?.exists);
}

function isAuthError(error: unknown): boolean {
  return error instanceof Error && /nao autenticado|não autenticado/i.test(error.message);
}

export async function GET() {
  try {
    const user = await requireAuth();
    const ready = await schemaReady();

    if (!ready) {
      return NextResponse.json({
        deferred: true,
        schemaReady: false,
        requests: [],
      });
    }

    const requests = await sql`
      SELECT
        id,
        package_code,
        credits_amount,
        price_brl,
        status,
        payment_reference,
        notes,
        created_at
      FROM credit_purchase_requests
      WHERE user_id = ${user.id}::UUID
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({
      deferred: false,
      schemaReady: true,
      requests,
    });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error(error, "Error listing credit purchase requests");
    return NextResponse.json({ error: "Erro ao listar solicitacoes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const ready = await schemaReady();

    if (!ready) {
      return NextResponse.json(
        {
          deferred: true,
          schemaReady: false,
          error: "Migration pendente para compras de quota",
        },
        { status: 409 }
      );
    }

    const body = await request.json();
    const packageCode = String(body.packageCode || "").trim().toLowerCase();
    const creditsAmount = Number(body.creditsAmount || 0);
    const priceBrl = Number(body.priceBrl || 0);

    if (!packageCode || creditsAmount <= 0 || priceBrl <= 0) {
      return NextResponse.json(
        { error: "Dados invalidos para solicitar compra" },
        { status: 400 }
      );
    }

    const inserted = await sql`
      INSERT INTO credit_purchase_requests (
        user_id,
        package_code,
        credits_amount,
        price_brl,
        status
      )
      VALUES (
        ${user.id}::UUID,
        ${packageCode},
        ${creditsAmount},
        ${priceBrl},
        'pending'
      )
      RETURNING id, status, created_at
    `;

    return NextResponse.json({ request: inserted[0] }, { status: 201 });
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error(error, "Error creating credit purchase request");
    return NextResponse.json({ error: "Erro ao criar solicitacao de compra" }, { status: 500 });
  }
}

