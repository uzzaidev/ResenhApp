"use client";

import { Button } from "@/components/ui/button";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type RsvpAction = "yes" | "no";
export type RsvpButtonStatus = "idle" | "loading" | "confirmed" | "declined" | "error";

type RsvpButtonProps = {
  action: RsvpAction;
  status: RsvpButtonStatus;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  dataTestId?: string;
};

function getLabel(action: RsvpAction, status: RsvpButtonStatus): string {
  if (status === "loading") {
    return action === "yes" ? "Confirmando presença..." : "Cancelando presença...";
  }

  if (status === "confirmed") {
    return "Presença confirmada";
  }

  if (status === "declined") {
    return "Presença cancelada";
  }

  if (status === "error") {
    return "Erro ao responder RSVP, tente novamente";
  }

  return action === "yes" ? "Confirmar presença" : "Não vou";
}

function getVisibleText(action: RsvpAction, status: RsvpButtonStatus): string {
  if (status === "loading") {
    return action === "yes" ? "Confirmando..." : "Cancelando...";
  }

  if (status === "confirmed") {
    return "Confirmado";
  }

  if (status === "declined") {
    return "Cancelado";
  }

  if (status === "error") {
    return "Tentar Novamente";
  }

  return action === "yes" ? "Confirmar Presença" : "Não Vou";
}

function getIcon(action: RsvpAction, status: RsvpButtonStatus) {
  if (status === "loading") {
    return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
  }

  if (status === "confirmed") {
    return <Check className="mr-2 h-4 w-4" />;
  }

  if (status === "declined") {
    return <X className="mr-2 h-4 w-4" />;
  }

  return action === "yes" ? <Check className="mr-2 h-4 w-4" /> : <X className="mr-2 h-4 w-4" />;
}

export function RsvpButton({
  action,
  status,
  disabled,
  onClick,
  className,
  size = "lg",
  dataTestId,
}: RsvpButtonProps) {
  const isConfirm = action === "yes";
  const variant = isConfirm ? "default" : "outline";
  const ariaLabel = getLabel(action, status);
  const visibleText = getVisibleText(action, status);
  const isDisabled = disabled || status === "loading";

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={isDisabled}
      onClick={onClick}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      className={cn(
        "transition-all duration-200",
        !isConfirm && status === "declined" && "border-destructive/40 text-destructive",
        status === "error" && "border-destructive/40",
        className
      )}
    >
      {getIcon(action, status)}
      {visibleText}
    </Button>
  );
}
