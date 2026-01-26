"use client";

/**
 * Empty State - Componente para Estados Vazios
 * 
 * Exibe mensagem quando não há dados, com ícone,
 * título, descrição e ação sugerida.
 * 
 * Melhorado no Sprint 6:
 * - Suporte a children (links secundários)
 * - Variantes (default, error, search)
 * - Tamanhos (sm, md, lg)
 * - Melhor estilização (ícone maior, mais espaçamento)
 */

import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void; // Opcional se href for fornecido
    href?: string; // Se fornecido, renderiza como Link
  };
  children?: React.ReactNode; // Para links secundários ou conteúdo customizado
  variant?: "default" | "error" | "search";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  variant = "default",
  size = "md",
  className,
}: EmptyStateProps) {
  // Tamanhos do ícone
  const iconSizes = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  };

  // Tamanhos do container do ícone
  const iconContainerSizes = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  // Variantes de cor
  const variantStyles = {
    default: {
      iconBg: "bg-muted/50",
      iconColor: "text-muted-foreground",
      titleColor: "text-foreground",
      descriptionColor: "text-muted-foreground",
    },
    error: {
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      titleColor: "text-foreground",
      descriptionColor: "text-muted-foreground",
    },
    search: {
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      titleColor: "text-foreground",
      descriptionColor: "text-muted-foreground",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {/* Ícone */}
      <div
        className={cn(
          "rounded-full mb-6 flex items-center justify-center",
          iconContainerSizes[size],
          styles.iconBg
        )}
      >
        <Icon className={cn(iconSizes[size], styles.iconColor)} />
      </div>

      {/* Título */}
      <h3
        className={cn(
          "font-semibold mb-2",
          size === "sm" && "text-base",
          size === "md" && "text-lg",
          size === "lg" && "text-xl",
          styles.titleColor
        )}
      >
        {title}
      </h3>

      {/* Descrição */}
      <p
        className={cn(
          "mb-6 max-w-sm",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-lg",
          styles.descriptionColor
        )}
      >
        {description}
      </p>

      {/* Ação Principal */}
      {action && (
        <div className="mb-4">
          {action.href ? (
            <Button asChild variant={variant === "error" ? "destructive" : "default"}>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : action.onClick ? (
            <Button
              onClick={action.onClick}
              variant={variant === "error" ? "destructive" : "default"}
            >
              {action.label}
            </Button>
          ) : null}
        </div>
      )}

      {/* Conteúdo Secundário (links, dicas, etc.) */}
      {children && (
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}
