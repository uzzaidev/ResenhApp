"use client";

import { useState, useEffect } from "react";
import { CreditsBalance } from "./credits-balance";
import { BuyCreditsModal, type CreditPackage } from "./buy-credits-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, History, Sparkles, Wallet } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { CreditsUsageGuide } from "./credits-usage-guide";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { toast } from "sonner";

interface CreditsPageClientProps {
  groupId: string;
  userRole: string;
}

interface CreditBalance {
  groupId: string;
  balance: number;
  purchased: number;
  consumed: number;
}

interface PersonalWallet {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

interface PersonalCreditTransaction {
  id: string;
  amount: number;
  direction: "earn" | "spend";
  actionType: string;
  description: string | null;
  referenceId: string | null;
  createdAt: string;
}

export function CreditsPageClient({ groupId, userRole }: CreditsPageClientProps) {
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [personalDeferred, setPersonalDeferred] = useState(true);
  const [personalWallet, setPersonalWallet] = useState<PersonalWallet | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [personalHistory, setPersonalHistory] = useState<PersonalCreditTransaction[]>([]);

  const isAdmin = userRole === "admin";

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/credits?group_id=${groupId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao buscar quota");
      }

      const data = await response.json();
      setBalance(data.balance);
      setPackages(data.packages || []);
    } catch (error) {
      handleError(error, { onRetry: fetchCredits });
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalWallet = async () => {
    try {
      const response = await fetch("/api/credits/me");
      if (!response.ok) return;
      const data = await response.json();
      setPersonalDeferred(Boolean(data.deferred));
      setPersonalWallet(data.wallet || null);
    } catch {
      setPersonalDeferred(true);
      setPersonalWallet(null);
    }
  };

  const fetchPersonalHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await fetch("/api/credits/me/history?limit=50");
      if (!response.ok) {
        setPersonalHistory([]);
        return;
      }
      const data = await response.json();
      setPersonalHistory(Array.isArray(data.transactions) ? data.transactions : []);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
    fetchPersonalWallet();
  }, [groupId]);

  useEffect(() => {
    if (showHistory) {
      fetchPersonalHistory();
    }
  }, [showHistory]);

  const handlePurchaseSuccess = () => {
    fetchCredits();
    fetchPersonalWallet();
    setShowBuyModal(false);
    toast.success("Quota comprada com sucesso!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Sparkles}
          title="Erro ao carregar quota"
          description="Nao foi possivel carregar as informacoes de quota"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quota</h1>
          <p className="text-muted-foreground mt-1">
            Gestao de quota do grupo e da carteira pessoal
          </p>
        </div>
      </div>

      <CreditsBalance
        groupId={groupId}
        balance={balance.balance}
        purchased={balance.purchased}
        consumed={balance.consumed}
        onBuyClick={isAdmin ? () => setShowBuyModal(true) : undefined}
        onHistoryClick={() => setShowHistory(!showHistory)}
        isLoading={loading}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Carteira Pessoal
          </CardTitle>
          <CardDescription>
            Quota ganha por acoes no app e usada para criar/gerenciar entidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          {personalDeferred ? (
            <p className="text-sm text-muted-foreground">
              Modo pendente: carteira pessoal ainda nao esta ativa no banco. Assim que as migrations
              forem aplicadas, este bloco passa a mostrar saldo e movimentacoes reais.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Saldo atual</p>
                <p className="text-2xl font-semibold">{personalWallet?.balance ?? 0}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total ganho</p>
                <p className="text-2xl font-semibold">{personalWallet?.lifetimeEarned ?? 0}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total gasto</p>
                <p className="text-2xl font-semibold">{personalWallet?.lifetimeSpent ?? 0}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <BuyCreditsModal
          open={showBuyModal}
          onOpenChange={setShowBuyModal}
          groupId={groupId}
          packages={packages}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}

      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historico de Transacoes Pessoais
            </CardTitle>
            <CardDescription>Ultimas movimentacoes de quota da sua carteira</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {personalDeferred ? (
              <p className="text-sm text-muted-foreground">
                Historico pessoal indisponivel ate aplicar as migrations de quota pessoal.
              </p>
            ) : historyLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando historico...
              </div>
            ) : personalHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma movimentacao encontrada.</p>
            ) : (
              personalHistory.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {item.description || item.actionType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      item.direction === "earn" ? "text-green-600" : "text-amber-600"
                    }`}
                  >
                    {item.direction === "earn" ? "+" : "-"}
                    {item.amount}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      <CreditsUsageGuide />
    </div>
  );
}




