import { NextRequest, NextResponse } from "next/server";
import { isUnauthorizedError, requireAuth } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const postId = body.postId ? String(body.postId) : null;
    const commentId = body.commentId ? String(body.commentId) : null;
    const reason = String(body.reason || "").trim();

    if (!postId && !commentId) {
      return NextResponse.json(
        { error: "Informe postId ou commentId para denuncia" },
        { status: 400 }
      );
    }

    if (postId && commentId) {
      return NextResponse.json(
        { error: "Envie apenas um alvo por denuncia" },
        { status: 400 }
      );
    }

    if (reason.length < 3) {
      return NextResponse.json(
        { error: "Motivo deve ter pelo menos 3 caracteres" },
        { status: 400 }
      );
    }

    const inserted = await sql`
      INSERT INTO social_reports (reporter_id, post_id, comment_id, reason)
      VALUES (
        ${user.id}::UUID,
        ${postId ? sql`${postId}::UUID` : null},
        ${commentId ? sql`${commentId}::UUID` : null},
        ${reason}
      )
      RETURNING id, status, created_at
    `;

    return NextResponse.json(
      { report: inserted[0], message: "Denuncia registrada" },
      { status: 201 }
    );
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    logger.error({ error }, "Error creating social report");
    return NextResponse.json({ error: "Erro ao registrar denuncia" }, { status: 500 });
  }
}
