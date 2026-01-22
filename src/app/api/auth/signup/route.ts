import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import logger from "@/lib/logger";
import { checkRateLimit, RateLimitPresets } from "@/lib/rate-limit";

const signupSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export async function POST(request: NextRequest) {
  let requestBody: any = null; // Declarar no escopo da função para usar no catch

  try {
    // Rate limiting - 5 signup attempts per minute per IP
    const rateLimit = await checkRateLimit(request, RateLimitPresets.AUTH);

    if (rateLimit.limited) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${retryAfter} segundos.` },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': RateLimitPresets.AUTH.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          }
        }
      );
    }

    const body = await request.json();
    requestBody = body; // Salvar para usar no catch se necessário

    // Validar dados
    const validatedData = signupSchema.parse(body);
    const { name, email, password } = validatedData;

    // Verificar se o email já existe
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar usuário
    const newUser = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (
        ${name},
        ${email.toLowerCase()},
        ${passwordHash}
      )
      RETURNING id, name, email
    `;

    const user = Array.isArray(newUser) ? newUser[0] : (newUser as any)[0];
    
    logger.info({ userId: user.id }, "Novo usuário criado");

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Capturar TUDO sobre o erro
    const errorDetails = {
      // Básico
      type: typeof error,
      name: error?.constructor?.name || 'Unknown',
      message: error?.message || 'No message',
      stack: error?.stack,

      // PostgreSQL/Neon errors
      code: error?.code,
      detail: error?.detail,
      hint: error?.hint,
      routine: error?.routine,
      schema: error?.schema,
      table: error?.table,
      column: error?.column,
      constraint: error?.constraint,

      // Todas as propriedades do erro
      allKeys: Object.keys(error || {}),

      // String representation completa
      toString: String(error),

      // JSON attempt
      jsonAttempt: (() => {
        try {
          return JSON.stringify(error, Object.getOwnPropertyNames(error));
        } catch {
          return 'Failed to stringify';
        }
      })(),
    };

    logger.error({
      error: errorDetails,
      context: {
        email: requestBody?.email,
        name: requestBody?.name,
        hasPassword: !!requestBody?.password,
      }
    }, "Erro ao criar usuário");

    // Console log forçado para garantir que vemos no Vercel
    console.error('=== SIGNUP ERROR DETAILS ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Error detail:', error?.detail);
    console.error('Error keys:', Object.keys(error || {}));
    console.error('Error string:', String(error));
    console.error('============================');

    // Retornar erro específico
    const errorMessage = error?.message
      ? `Erro: ${error.message}`
      : "Erro ao criar conta. Verifique os logs.";

    return NextResponse.json(
      { error: errorMessage, debug: errorDetails.code || errorDetails.name },
      { status: 500 }
    );
  }
}
