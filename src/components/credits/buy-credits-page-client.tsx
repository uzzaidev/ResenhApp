"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
  highlight?: boolean;
};

type PurchaseRequest = {
  id: string;
  package_code: string;
  credits_amount: number;
  price_brl: number;
  status: string;
  created_at: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function BuyCreditsPageClient({ packages }: { packages: CreditPackage[] }) {
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);

  const loadRequests = async () => {
    const response = await fetch("/api/credits/buy/requests");
    const data = await response.json();
    if (response.ok) {
      setRequests(data.requests || []);
    }
  };

  useEffect(() => {
    loadRequests().catch(() => {
      // no-op while migration is pending
    });
  }, []);

  const handleRequest = async (pkg: CreditPackage) => {
    setLoadingPackage(pkg.id);
    setMessage(null);
    try {
      const response = await fetch("/api/credits/buy/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageCode: pkg.id,
          creditsAmount: pkg.credits,
          priceBrl: pkg.price,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Falha ao solicitar quota");
      }
      setMessage("Solicitacao registrada. Aguarde as instrucoes de pagamento PIX.");
      await loadRequests();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao solicitar quota");
    } finally {
      setLoadingPackage(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => {
          const unit = pkg.price / pkg.credits;
          return (
            <Card key={pkg.id} className={pkg.highlight ? "border-primary" : undefined}>
              <CardHeader>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.credits.toLocaleString("pt-BR")} quotas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-2xl font-semibold">{formatCurrency(pkg.price)}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(unit)} por quota</p>
                <Button
                  className="w-full"
                  variant={pkg.highlight ? "default" : "outline"}
                  disabled={loadingPackage !== null}
                  onClick={() => handleRequest(pkg)}
                >
                  {loadingPackage === pkg.id ? "Solicitando..." : "Solicitar quota"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {message && (
        <Card>
          <CardContent className="py-4 text-sm">{message}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Minhas solicitacoes de quota</CardTitle>
          <CardDescription>Acompanhe o status das compras de quota.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma solicitacao registrada.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{req.package_code}</p>
                <p className="text-muted-foreground">
                  {req.credits_amount} quotas | {formatCurrency(Number(req.price_brl))}
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {req.status} | {new Date(req.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

