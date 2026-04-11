"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { Goal, Shield, Zap, TrendingUp } from "lucide-react";
import { RsvpAction, RsvpButton, RsvpButtonStatus } from "@/components/eventos/rsvp-button";

type Position = "gk" | "defender" | "midfielder" | "forward";

type EventRsvpFormProps = {
  eventId: string;
  currentAttendance: {
    preferred_position: string | null;
    secondary_position: string | null;
    status: string;
  } | null;
  eventStatus: string;
};

const POSITIONS = [
  { value: "gk", label: "Goleiro", Icon: Goal },
  { value: "defender", label: "Zagueiro", Icon: Shield },
  { value: "midfielder", label: "Meio-campo", Icon: Zap },
  { value: "forward", label: "Atacante", Icon: TrendingUp },
] as const;

export function EventRsvpForm({ eventId, currentAttendance, eventStatus }: EventRsvpFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const [rsvpStatus, setRsvpStatus] = useState<RsvpButtonStatus>("idle");
  const [activeAction, setActiveAction] = useState<RsvpAction | null>(null);
  const [preferredPosition, setPreferredPosition] = useState<Position | null>(
    (currentAttendance?.preferred_position as Position) || null
  );
  const [secondaryPosition, setSecondaryPosition] = useState<Position | null>(
    (currentAttendance?.secondary_position as Position) || null
  );
  const [showSecondaryPosition, setShowSecondaryPosition] = useState(
    !!currentAttendance?.preferred_position
  );

  const handlePrimaryPositionSelect = (position: Position) => {
    setPreferredPosition(position);
    setShowSecondaryPosition(true);
    // Reset secondary if same as new primary
    if (secondaryPosition === position) {
      setSecondaryPosition(null);
    }
  };

  const handleRsvp = async (status: RsvpAction) => {
    if (status === "yes" && !preferredPosition) {
      toast({
        title: "PosiÃ§Ã£o obrigatÃ³ria",
        description: "Selecione pelo menos sua posiÃ§Ã£o preferencial",
        variant: "destructive",
      });
      return;
    }

    if (preferredPosition === secondaryPosition && secondaryPosition !== null) {
      toast({
        title: "PosiÃ§Ãµes duplicadas",
        description: "Selecione posiÃ§Ãµes diferentes para 1Âª e 2Âª opÃ§Ã£o",
        variant: "destructive",
      });
      return;
    }

    setActiveAction(status);
    setRsvpStatus("loading");

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          role: preferredPosition === "gk" ? "gk" : "line",
          preferredPosition: status === "yes" ? preferredPosition : null,
          secondaryPosition: status === "yes" ? secondaryPosition : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao confirmar presenÃ§a");
      }

      const data = await response.json();

      // SPRINT 2: Show charge information if charge was created
      if (status === "yes" && data.charge) {
        const amount = parseFloat(data.charge.amount || data.charge.total_amount || 0);
        const formattedAmount = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(amount);

        toast({
          title: "PresenÃ§a confirmada!",
          description: `CobranÃ§a de ${formattedAmount} gerada automaticamente.`,
          action: data.charge.id ? (
            <ToastAction
              altText="Ver cobranÃ§a"
              onClick={() => router.push(`/financeiro/charges/${data.charge.id}`)}
            >
              Ver cobranÃ§a
            </ToastAction>
          ) : undefined,
        });
      } else {
        toast({
          title: status === "yes" ? "PresenÃ§a confirmada!" : "PresenÃ§a cancelada",
          description:
            status === "yes"
              ? "Sua confirmaÃ§Ã£o foi registrada com sucesso"
              : "Sua confirmaÃ§Ã£o foi removida",
        });
      }

      setRsvpStatus(status === "yes" ? "confirmed" : "declined");
      router.refresh();

      // Reset status apÃ³s 2 segundos
      setTimeout(() => {
        setRsvpStatus("idle");
        setActiveAction(null);
      }, 2000);
    } catch (error) {
      setRsvpStatus("error");
      
      // Usar error handler com retry
      handleError(error, {
        eventId,
        onRetry: () => handleRsvp(status),
      });

      // Reset status apÃ³s 3 segundos
      setTimeout(() => {
        setRsvpStatus("idle");
        setActiveAction(null);
      }, 3000);
    }
  };

  const isEventFinished = eventStatus === "finished";

  return (
    <div className="space-y-6">
      {/* Step 1: SeleÃ§Ã£o de posiÃ§Ã£o preferencial */}
      <div className="space-y-3">
        <Label className="text-base">1Âª PosiÃ§Ã£o Preferencial *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POSITIONS.map((pos) => {
            const IconComponent = pos.Icon;
            return (
              <button
                key={pos.value}
                type="button"
                disabled={isEventFinished || rsvpStatus === "loading"}
                onClick={() => handlePrimaryPositionSelect(pos.value)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  preferredPosition === pos.value
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-muted hover:border-primary/50"
                } ${isEventFinished ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex justify-center mb-2">
                  <IconComponent className="h-8 w-8" />
                </div>
                <div className="text-sm font-medium">{pos.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: SeleÃ§Ã£o de posiÃ§Ã£o secundÃ¡ria (conditional) */}
      {showSecondaryPosition && preferredPosition && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Label className="text-base">2Âª PosiÃ§Ã£o (Opcional)</Label>
          <p className="text-sm text-muted-foreground">
            VocÃª escolheu {POSITIONS.find(p => p.value === preferredPosition)?.label}.
            Quer adicionar uma segunda opÃ§Ã£o?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {POSITIONS.filter(pos => pos.value !== preferredPosition).map((pos) => {
              const IconComponent = pos.Icon;
              return (
                <button
                  key={pos.value}
                  type="button"
                  disabled={isEventFinished || rsvpStatus === "loading"}
                  onClick={() =>
                    setSecondaryPosition(secondaryPosition === pos.value ? null : pos.value)
                  }
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    secondaryPosition === pos.value
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-muted hover:border-primary/50"
                  } ${isEventFinished ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex justify-center mb-2">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <div className="text-sm font-medium">{pos.label}</div>
                </button>
              );
            })}
          </div>
          {secondaryPosition ? (
            <p className="text-xs text-muted-foreground">
              Clique novamente para remover a 2Âª posiÃ§Ã£o
            </p>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSecondaryPosition(null)}
              className="w-full sm:w-auto"
            >
              Pular (sem 2Âª posiÃ§Ã£o)
            </Button>
          )}
        </div>
      )}

      {/* BotÃµes de aÃ§Ã£o */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <RsvpButton
          action="yes"
          onClick={() => handleRsvp("yes")}
          disabled={isEventFinished || !preferredPosition}
          status={activeAction === "yes" ? rsvpStatus : "idle"}
          dataTestId="confirm-presence-button"
          className="flex-1"
        />
        <RsvpButton
          action="no"
          onClick={() => handleRsvp("no")}
          disabled={isEventFinished}
          status={activeAction === "no" ? rsvpStatus : "idle"}
          className="flex-1 sm:flex-none"
        />
      </div>

      {isEventFinished && (
        <p className="text-sm text-muted-foreground text-center">
          Este evento jÃ¡ foi finalizado
        </p>
      )}
    </div>
  );
}

