"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Check } from "lucide-react";
import { CreateChargeModal } from "./create-charge-modal";
import { ChargesDataTable, type Charge } from "./charges-data-table";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { toast } from "sonner";

type PaymentsContentProps = {
  groupId: string;
  isAdmin: boolean;
};

export function PaymentsContent({ groupId, isAdmin }: PaymentsContentProps) {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingCharges, setLoadingCharges] = useState<Record<string, 'marking' | 'canceling' | 'deleting'>>({});
  const { handleError } = useErrorHandler();

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}/charges`);
      if (!response.ok) throw new Error("Erro ao buscar cobranças");
      
      const data = await response.json();
      setCharges(data.charges || []);
    } catch (error) {
      console.error("Erro ao buscar cobranças:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleMarkAsPaid = async (chargeId: string) => {
    setLoadingCharges(prev => ({ ...prev, [chargeId]: 'marking' }));
    
    try {
      const response = await fetch(`/api/groups/${groupId}/charges/${chargeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar cobrança");
      }

      toast.success("Cobrança marcada como paga", {
        description: "O status foi atualizado com sucesso.",
      });

      fetchCharges();
    } catch (error) {
      handleError(error, { chargeId, onRetry: () => handleMarkAsPaid(chargeId) });
    } finally {
      setLoadingCharges(prev => {
        const next = { ...prev };
        delete next[chargeId];
        return next;
      });
    }
  };

  const handleCancelCharge = async (chargeId: string) => {
    setLoadingCharges(prev => ({ ...prev, [chargeId]: 'canceling' }));
    
    try {
      const response = await fetch(`/api/groups/${groupId}/charges/${chargeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "canceled" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao cancelar cobrança");
      }

      toast.success("Cobrança cancelada", {
        description: "A cobrança foi cancelada com sucesso.",
      });

      fetchCharges();
    } catch (error) {
      handleError(error, { chargeId, onRetry: () => handleCancelCharge(chargeId) });
    } finally {
      setLoadingCharges(prev => {
        const next = { ...prev };
        delete next[chargeId];
        return next;
      });
    }
  };

  const handleDeleteCharge = async (chargeId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta cobrança?")) return;

    setLoadingCharges(prev => ({ ...prev, [chargeId]: 'deleting' }));
    
    try {
      const response = await fetch(`/api/groups/${groupId}/charges/${chargeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir cobrança");
      }

      toast.success("Cobrança excluída", {
        description: "A cobrança foi excluída com sucesso.",
      });

      fetchCharges();
    } catch (error) {
      handleError(error, { chargeId, onRetry: () => handleDeleteCharge(chargeId) });
    } finally {
      setLoadingCharges(prev => {
        const next = { ...prev };
        delete next[chargeId];
        return next;
      });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const totalPending = charges
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + c.amount_cents, 0);

  const totalPaid = charges
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.amount_cents, 0);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              {charges.filter((c) => c.status === "pending").length} cobrança(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {charges.filter((c) => c.status === "paid").length} pagamento(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Cobranças */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Cobranças</CardTitle>
            {isAdmin && (
              <Button onClick={() => setShowCreateModal(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Cobrança
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : (
            <ChargesDataTable
              data={charges}
              isAdmin={isAdmin}
              onMarkAsPaid={handleMarkAsPaid}
              onCancel={handleCancelCharge}
              onDelete={handleDeleteCharge}
              loadingCharges={loadingCharges}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de criação */}
      {showCreateModal && (
        <CreateChargeModal
          groupId={groupId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCharges();
          }}
        />
      )}
    </div>
  );
}
