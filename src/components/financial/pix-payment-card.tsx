"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Loader2, AlertCircle, Smartphone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PixPaymentCardProps {
  chargeId: string;
  amount: number;
  receiverName?: string | null;
  dueDate?: Date | null;
  status?: string | null;
  canSelfReport?: boolean;
}

type PixData = {
  pixKey?: string;
  pixKeyRaw?: string;
  pixType?: string;
  receiverName?: string;
  bankName?: string | null;
  instructions?: string | null;
};

const BANK_LINKS = [
  { label: "Nubank", href: "nubank://" },
  { label: "Inter", href: "bancointer://" },
  { label: "PicPay", href: "picpay://" },
];

export function PixPaymentCard({
  chargeId,
  amount,
  receiverName,
  dueDate,
  status,
  canSelfReport = false,
}: PixPaymentCardProps) {
  const { toast } = useToast();
  const [pixData, setPixData] = useState<PixData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [localStatus, setLocalStatus] = useState<string>(status || "pending");

  const isSelfReported = localStatus === "self_reported";
  const isPaid = localStatus === "paid";
  const isDenied = localStatus === "denied";

  useEffect(() => {
    setLocalStatus(status || "pending");
  }, [status]);

  useEffect(() => {
    let active = true;
    const loadPixData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/charges/${chargeId}/pix`);
        if (!response.ok) {
          throw new Error("Dados PIX indisponíveis");
        }
        const data = await response.json();
        if (active) {
          setPixData({
            pixKey: data.pixKey,
            pixKeyRaw: data.pixKeyRaw || data.payload,
            pixType: data.pixType,
            receiverName: data.receiverName,
            bankName: data.bankName,
            instructions: data.instructions,
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao carregar dados PIX",
          variant: "destructive",
        });
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadPixData();
    return () => {
      active = false;
    };
  }, [chargeId, toast]);

  const copyToClipboard = async () => {
    const keyToCopy = pixData.pixKeyRaw || pixData.pixKey;
    if (!keyToCopy) return;

    try {
      await navigator.clipboard.writeText(keyToCopy);
      setCopied(true);
      toast({
        title: "Copiado",
        description: "Chave PIX copiada para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a chave PIX.",
        variant: "destructive",
      });
    }
  };

  const handleSelfReport = async () => {
    setIsReporting(true);
    try {
      const response = await fetch(`/api/charges/${chargeId}/self-report`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Erro ao reportar pagamento");
      }
      setLocalStatus("self_reported");
      toast({
        title: "Pagamento reportado",
        description: "Agora aguarde a confirmação do admin do grupo.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao reportar pagamento",
        variant: "destructive",
      });
    } finally {
      setIsReporting(false);
    }
  };

  const displayReceiverName = pixData.receiverName || receiverName || "Recebedor";
  const showSelfReportButton = canSelfReport && !isPaid && !isSelfReported;

  const statusBadge = useMemo(() => {
    if (isPaid) return <Badge className="bg-green-600">Pago</Badge>;
    if (isSelfReported) return <Badge variant="secondary">Aguardando confirmação</Badge>;
    if (isDenied) return <Badge variant="destructive">Pagamento negado</Badge>;
    return <Badge variant="outline">Pendente</Badge>;
  }, [isDenied, isPaid, isSelfReported]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Pagamento via PIX</CardTitle>
            <CardDescription>Use a chave PIX abaixo para pagar no app do banco.</CardDescription>
          </div>
          {statusBadge}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando chave PIX...
          </div>
        ) : !pixData.pixKeyRaw && !pixData.pixKey ? (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Chave PIX não disponível para esta cobrança.
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">Chave PIX</label>
            <div className="flex gap-2">
              <div className="flex-1 rounded-md border bg-muted p-3 font-mono text-xs break-all">
                {pixData.pixKey || pixData.pixKeyRaw}
              </div>
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tipo: {(pixData.pixType || "não informado").toUpperCase()}
            </p>
          </div>
        )}

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Valor</span>
            <span className="text-lg font-bold">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Recebedor</span>
            <span className="text-sm">{displayReceiverName}</span>
          </div>
          {pixData.bankName && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Banco</span>
              <span className="text-sm">{pixData.bankName}</span>
            </div>
          )}
          {dueDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Vencimento</span>
              <Badge variant={dueDate < new Date() && !isPaid ? "destructive" : "secondary"}>
                {format(dueDate, "dd/MM/yyyy", { locale: ptBR })}
              </Badge>
            </div>
          )}
        </div>

        {pixData.instructions && (
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="mb-1 font-medium">Instruções</p>
            <p className="text-muted-foreground">{pixData.instructions}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {BANK_LINKS.map((link) => (
            <Button key={link.label} variant="outline" onClick={() => (window.location.href = link.href)}>
              <Smartphone className="mr-2 h-4 w-4" />
              {link.label}
            </Button>
          ))}
        </div>

        {showSelfReportButton && (
          <Button className="w-full" onClick={handleSelfReport} disabled={isReporting}>
            {isReporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Já paguei"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
