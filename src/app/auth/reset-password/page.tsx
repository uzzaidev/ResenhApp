"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao redefinir senha.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 3000);
    } catch {
      setError("Erro ao redefinir senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-navy via-navy-light to-green-dark">
        <Card className="mx-4 w-full max-w-md border-0 shadow-2xl">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-red-600">Link inválido ou expirado.</p>
            <Button asChild className="bg-green-600 text-white hover:bg-green-700">
              <Link href="/auth/forgot-password">Solicitar novo link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold text-navy">Nova senha</CardTitle>
            <CardDescription className="text-center">
              {success ? "Senha redefinida com sucesso!" : "Crie uma nova senha para sua conta"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <KeyRound className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Sua senha foi redefinida. Redirecionando para o login...
                </p>
                <Button asChild className="w-full bg-green-600 text-white hover:bg-green-700">
                  <Link href="/auth/signin">Ir para o login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-navy">Nova senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="border-gray-300 focus:border-green-600 focus:ring-green-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-navy">Confirmar nova senha</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
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
                  {isLoading ? "Salvando..." : "Redefinir senha"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
