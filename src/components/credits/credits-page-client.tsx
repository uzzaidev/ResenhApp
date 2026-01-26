"use client";

import { useState, useEffect } from "react";
import { CreditsBalance } from "./credits-balance";
import { BuyCreditsModal, type CreditPackage } from "./buy-credits-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, History, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
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

export function CreditsPageClient({ groupId, userRole }: CreditsPageClientProps) {
  const { handleError } = useErrorHandler();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const isAdmin = userRole === "admin";

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/credits?group_id=${groupId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao buscar créditos");
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

  useEffect(() => {
    fetchCredits();
  }, [groupId]);

  const handlePurchaseSuccess = () => {
    fetchCredits();
    setShowBuyModal(false);
    toast.success("Créditos comprados com sucesso!");
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
          title="Erro ao carregar créditos"
          description="Não foi possível carregar as informações de créditos"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Créditos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os créditos do grupo e compre pacotes premium
          </p>
        </div>
      </div>

      {/* Credits Balance */}
      <CreditsBalance
        groupId={groupId}
        balance={balance.balance}
        purchased={balance.purchased}
        consumed={balance.consumed}
        onBuyClick={isAdmin ? () => setShowBuyModal(true) : undefined}
        onHistoryClick={() => setShowHistory(!showHistory)}
        isLoading={loading}
      />

      {/* Buy Credits Modal */}
      {isAdmin && (
        <BuyCreditsModal
          open={showBuyModal}
          onOpenChange={setShowBuyModal}
          groupId={groupId}
          packages={packages}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}

      {/* History Section */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Transações
            </CardTitle>
            <CardDescription>
              Visualize todas as compras e consumo de créditos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              O histórico completo de transações será exibido aqui em breve.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre o Sistema de Créditos</CardTitle>
          <CardDescription>
            Entenda como funcionam os créditos e features premium
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">O que são créditos?</h4>
            <p className="text-sm text-muted-foreground">
              Créditos são a moeda virtual do sistema que permite acessar features premium
              como treinos recorrentes, convocações, analytics e muito mais.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Como comprar?</h4>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Como administrador, você pode comprar pacotes de créditos clicando no botão 'Comprar Créditos' acima. Use cupons promocionais para obter descontos!"
                : "Apenas administradores do grupo podem comprar créditos. Entre em contato com um admin para adquirir mais créditos."}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Como são consumidos?</h4>
            <p className="text-sm text-muted-foreground">
              Os créditos são consumidos automaticamente quando você usa features premium.
              O consumo é transparente e você sempre saberá quantos créditos foram usados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

