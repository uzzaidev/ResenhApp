"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getSafePath(path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = getSafePath(searchParams.get("callbackUrl"));
  const signInHref = callbackUrl
    ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/auth/signin";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no minimo 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const referralCode = searchParams.get("ref") || undefined;
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email: email.toLowerCase(),
          password,
          referralCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao criar conta");
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams({
        message: "Conta criada com sucesso! Faca login para continuar.",
      });
      if (callbackUrl) {
        params.set("callbackUrl", callbackUrl);
      }
      router.push(`/auth/signin?${params.toString()}`);
    } catch (signupError) {
      console.error("Signup error:", signupError);
      setError("Erro ao criar conta. Tente novamente.");
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy-light to-green-dark">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="relative z-10 mx-4 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2C12 2 16 6 16 12C16 18 12 22 12 22" stroke="currentColor" strokeWidth="2" />
              <path d="M2 12C2 12 6 8 12 8C18 8 22 12 22 12" stroke="currentColor" strokeWidth="2" />
              <path d="M2 12C2 12 6 16 12 16C18 16 22 12 22 12" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">RESENHAFC</h1>
          <p className="text-gray-200">Organize seus treinos de forma profissional</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold text-navy">Criar Conta</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados abaixo para criar sua conta gratis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-navy">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-green-600 focus:ring-green-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-navy">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-green-600 focus:ring-green-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-navy">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="border-gray-300 focus:border-green-600 focus:ring-green-600"
                />
                <p className="text-xs text-gray-500">Minimo de 6 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-navy">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="border-gray-300 focus:border-green-600 focus:ring-green-600"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 text-white hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Criando conta..."
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar conta gratis
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Ja tem uma conta?</span>
                </div>
              </div>

              <div className="mt-4">
                <Button asChild variant="outline" className="w-full border-navy text-navy hover:bg-navy hover:text-white">
                  <Link href={signInHref}>Fazer login</Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-gray-600 hover:text-green-600 hover:underline">
                Voltar para o inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
