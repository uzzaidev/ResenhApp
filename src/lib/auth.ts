import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sql } from "@/db/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  console.error("AUTH_SECRET is not configured.");

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET is not configured. The application cannot start without this environment variable.",
    );
  }

  console.warn("Running in development without AUTH_SECRET. Do not use this in production.");
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentialsSchema.parse(credentials);
          const normalizedEmail = email.toLowerCase();

          let result;
          try {
            result = await sql`
              SELECT id, name, email, password_hash, onboarding_completed
              FROM users
              WHERE email = ${normalizedEmail}
            `;
          } catch (usersError: any) {
            if (usersError?.code === "42703") {
              result = await sql`
                SELECT id, name, email, password_hash, TRUE as onboarding_completed
                FROM users
                WHERE email = ${normalizedEmail}
              `;
            } else {
              if (
                usersError?.code === "42P01" ||
                usersError?.message?.includes("does not exist")
              ) {
                console.error(
                  "[AUTH] Users table is missing. Legacy profiles fallback was removed in Fase 5. Apply users migrations.",
                );
              }
              throw usersError;
            }
          }

          if (!Array.isArray(result) || result.length === 0) {
            if (process.env.NODE_ENV === "development") {
              console.log("[AUTH] User not found for email:", normalizedEmail);
            }
            return null;
          }

          const user = result[0] as any;

          if (!user.password_hash) {
            if (process.env.NODE_ENV === "development") {
              console.log("[AUTH] User found but no password_hash");
            }
            return null;
          }

          const isValidPassword = await bcrypt.compare(password, user.password_hash);
          if (!isValidPassword) {
            if (process.env.NODE_ENV === "development") {
              console.log("[AUTH] Invalid password for user");
            }
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: null,
            onboardingCompleted: user.onboarding_completed !== false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("[AUTH] Authentication error:", {
            message: errorMessage,
            code: (error as any)?.code,
          });
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.onboardingCompleted =
          typeof user.onboardingCompleted === "boolean" ? user.onboardingCompleted : true;
      }

      if (
        trigger === "update" &&
        session &&
        Object.prototype.hasOwnProperty.call(session, "onboardingCompleted")
      ) {
        const onboardingCompleted = (session as { onboardingCompleted?: unknown }).onboardingCompleted;
        if (typeof onboardingCompleted === "boolean") {
          token.onboardingCompleted = onboardingCompleted;
        }
      }

      if (typeof token.onboardingCompleted !== "boolean") {
        // Backward compatibility for legacy tokens issued before onboarding flag existed.
        token.onboardingCompleted = true;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.onboardingCompleted = token.onboardingCompleted === false ? false : true;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.callback-url"
          : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-next-auth.csrf-token"
          : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
});
