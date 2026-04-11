import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BuyCreditsPageClient } from "@/components/credits/buy-credits-page-client";

const PACKAGES = [
  { id: "starter", name: "Iniciante", credits: 300, price: 9.9 },
  { id: "popular", name: "Popular", credits: 1000, price: 24.9, highlight: true },
  { id: "pro", name: "Pro", credits: 3000, price: 59.9 },
  { id: "athlete", name: "Atleta", credits: 10000, price: 149.9 },
];

export default async function BuyCreditsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-6 py-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Comprar quota</h1>
        <p className="text-muted-foreground">Fase inicial de monetizacao com fluxo manual via PIX.</p>
      </div>

      <BuyCreditsPageClient packages={PACKAGES} />

      <Card>
        <CardHeader>
          <CardTitle>Como funciona agora</CardTitle>
          <CardDescription>Fluxo manual ate a integracao com gateway.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Escolha o pacote e envie a solicitacao.</p>
          <p>2. O time envia os dados PIX da plataforma.</p>
          <p>3. Voce paga e a confirmacao e feita manualmente.</p>
          <p>4. As quotas sao adicionadas na sua carteira pessoal.</p>
        </CardContent>
      </Card>
    </div>
  );
}
