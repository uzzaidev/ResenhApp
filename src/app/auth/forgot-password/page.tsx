"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok && res.status !== 404) {
        const data = await res.json();
        setError(data.error ?? "Erro ao enviar email. Tente novamente.");
        setIsLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Erro ao enviar email. Tente novamente.");
    } finally {
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
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold text-navy">Recuperar senha</CardTitle>
            <CardDescription className="text-center">
              {submitted
                ? "Verifique seu email"
                : "Digite seu email para receber o link de recuperação"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Se o email <strong>{email}</strong> estiver cadastrado, você receberá um link
                  para redefinir sua senha em breve.
                </p>
                <p className="text-xs text-gray-500">
                  Não recebeu? Verifique sua pasta de spam.
                </p>
                <Button asChild className="w-full bg-green-600 text-white hover:bg-green-700">
                  <Link href="/auth/signin">Voltar para o login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                </Button>

                <Button asChild variant="ghost" className="w-full text-gray-600">
                  <Link href="/auth/signin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o login
                  </Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
