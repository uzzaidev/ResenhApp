"use client";

/**
 * Pix Payment Card Component
 * 
 * Displays Pix QR Code and copy-paste payload for payment
 * Sprint 3: Pix QR Code + ReceiverProfiles
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, QrCode, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PixPaymentCardProps {
  chargeId: string;
  amount: number;
  pixPayload?: string | null;
  qrImageUrl?: string | null;
  receiverName?: string | null;
  dueDate?: Date | null;
}

export function PixPaymentCard({
  chargeId,
  amount,
  pixPayload: initialPixPayload,
  qrImageUrl: initialQrImageUrl,
  receiverName,
  dueDate,
}: PixPaymentCardProps) {
  const { toast } = useToast();
  const [pixPayload, setPixPayload] = useState<string | null>(initialPixPayload || null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(initialQrImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate Pix if not available
  useEffect(() => {
    if (!pixPayload || !qrImageUrl) {
      generatePix();
    }
  }, []);

  const generatePix = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/charges/${chargeId}/pix`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar Pix QR Code");
      }

      const data = await response.json();
      setPixPayload(data.payload);
      setQrImageUrl(data.qrImage);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar Pix QR Code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!pixPayload) return;

    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Código Pix copiado para a área de transferência",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Pagamento via Pix
            </CardTitle>
            <CardDescription>
              Escaneie o QR Code ou copie o código para pagar
            </CardDescription>
          </div>
          {(!pixPayload || !qrImageUrl) && (
            <Button
              variant="outline"
              size="sm"
              onClick={generatePix}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Gerar QR Code
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Image */}
        {qrImageUrl ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <img
                src={qrImageUrl}
                alt="QR Code Pix"
                className="w-64 h-64"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Escaneie com o app do seu banco
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              QR Code não disponível. Clique em "Gerar QR Code" para criar.
            </p>
          </div>
        )}

        {/* Copy-Paste Payload */}
        {pixPayload && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Código Pix (Copia e Cola)</label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-muted rounded-md font-mono text-xs break-all">
                {pixPayload}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cole este código no app do seu banco para pagar
            </p>
          </div>
        )}

        {/* Payment Info */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Valor:</span>
            <span className="text-lg font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(amount)}
            </span>
          </div>

          {receiverName && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recebedor:</span>
              <span className="text-sm">{receiverName}</span>
            </div>
          )}

          {dueDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Vencimento:</span>
              <Badge variant={dueDate < new Date() ? "destructive" : "secondary"}>
                {format(dueDate, "dd/MM/yyyy", { locale: ptBR })}
              </Badge>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-2">Como pagar:</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Abra o app do seu banco</li>
            <li>Escaneie o QR Code ou cole o código Pix</li>
            <li>Confirme o pagamento</li>
            <li>Após pagar, marque como pago no sistema</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

