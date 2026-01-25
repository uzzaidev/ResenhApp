import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * ProgressBar - Componente para exibir progresso
 * Design System UzzAI
 * 
 * @example
 * <ProgressBar value={75} variant="mint" showLabel />
 * <ProgressBar value={50} variant="gradient" size="lg" />
 */

const progressBarVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-secondary/20",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const progressFillVariants = cva(
  "h-full transition-all duration-500 ease-out rounded-full",
  {
    variants: {
      variant: {
        mint: "bg-uzzai-mint",
        blue: "bg-uzzai-blue",
        gold: "bg-uzzai-gold",
        silver: "bg-uzzai-silver",
        black: "bg-uzzai-black",
        gradient: "bg-gradient-to-r from-uzzai-mint to-uzzai-blue",
        "gradient-gold": "bg-gradient-to-r from-uzzai-gold to-uzzai-mint",
        "gradient-blue": "bg-gradient-to-r from-uzzai-blue to-uzzai-mint",
        success: "bg-green-500",
        warning: "bg-uzzai-gold",
        error: "bg-red-500",
        default: "bg-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarVariants> {
  /** Valor do progresso (0-100) */
  value: number;
  /** Valor máximo (padrão: 100) */
  max?: number;
  /** Variante de cor */
  variant?: VariantProps<typeof progressFillVariants>["variant"];
  /** Mostrar label com porcentagem */
  showLabel?: boolean;
  /** Label customizado */
  label?: string;
  /** Posição do label */
  labelPosition?: "top" | "bottom" | "inside";
  /** Animação de pulso */
  animated?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      size,
      variant = "default",
      value,
      max = 100,
      showLabel = false,
      label,
      labelPosition = "top",
      animated = false,
      ...props
    },
    ref
  ) => {
    // Garantir que o valor está entre 0 e max
    const clampedValue = Math.min(Math.max(value, 0), max);
    const percentage = (clampedValue / max) * 100;

    const displayLabel = label || `${Math.round(percentage)}%`;

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {/* Label no topo */}
        {showLabel && labelPosition === "top" && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">{displayLabel}</span>
            {value !== max && (
              <span className="text-xs text-muted-foreground">
                {clampedValue}/{max}
              </span>
            )}
          </div>
        )}

        {/* Barra de progresso */}
        <div className={cn(progressBarVariants({ size }))}>
          <div
            className={cn(
              progressFillVariants({ variant }),
              animated && "animate-pulse"
            )}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={clampedValue}
            aria-valuemin={0}
            aria-valuemax={max}
          >
            {/* Label dentro da barra */}
            {showLabel && labelPosition === "inside" && size !== "sm" && (
              <div className="flex h-full items-center justify-center">
                <span
                  className={cn(
                    "text-xs font-semibold",
                    variant === "gold" || variant === "gradient-gold"
                      ? "text-uzzai-black"
                      : "text-white"
                  )}
                >
                  {displayLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Label na base */}
        {showLabel && labelPosition === "bottom" && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-foreground">{displayLabel}</span>
            {value !== max && (
              <span className="text-xs text-muted-foreground">
                {clampedValue}/{max}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

export { ProgressBar, progressBarVariants, progressFillVariants };


