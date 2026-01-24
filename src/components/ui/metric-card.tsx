import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * MetricCard - Componente para exibir métricas com tendências
 * Design System UzzAI
 * 
 * @example
 * <MetricCard
 *   title="Confirmados"
 *   value="18/20"
 *   trend="up"
 *   trendValue="+15%"
 *   variant="mint"
 *   icon={<Users className="h-4 w-4" />}
 * />
 */

const metricCardVariants = cva(
  "relative overflow-hidden transition-all hover:shadow-lg",
  {
    variants: {
      variant: {
        mint: "border-uzzai-mint/30 bg-uzzai-mint/5 hover:border-uzzai-mint/50",
        blue: "border-uzzai-blue/30 bg-uzzai-blue/5 hover:border-uzzai-blue/50",
        gold: "border-uzzai-gold/30 bg-uzzai-gold/5 hover:border-uzzai-gold/50",
        silver: "border-uzzai-silver/30 bg-uzzai-silver/5 hover:border-uzzai-silver/50",
        black: "border-uzzai-black/30 bg-uzzai-black/5 hover:border-uzzai-black/50",
        default: "border-border bg-card hover:border-primary/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const trendVariants = cva(
  "inline-flex items-center gap-1 text-xs font-semibold",
  {
    variants: {
      trend: {
        up: "text-green-600 dark:text-green-400",
        down: "text-red-600 dark:text-red-400",
        neutral: "text-uzzai-silver",
      },
    },
    defaultVariants: {
      trend: "neutral",
    },
  }
);

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  /** Título da métrica */
  title: string;
  /** Valor principal da métrica */
  value: string | number;
  /** Tendência da métrica */
  trend?: "up" | "down" | "neutral";
  /** Valor da tendência (ex: "+15%", "-5%") */
  trendValue?: string;
  /** Descrição adicional */
  description?: string;
  /** Ícone opcional */
  icon?: React.ReactNode;
  /** Mostrar gradiente no topo */
  showGradient?: boolean;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      className,
      variant,
      title,
      value,
      trend,
      trendValue,
      description,
      icon,
      showGradient = true,
      ...props
    },
    ref
  ) => {
    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

    return (
      <Card
        ref={ref}
        className={cn(metricCardVariants({ variant }), className)}
        {...props}
      >
        {/* Gradiente no topo */}
        {showGradient && (
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1 rounded-t-lg",
              variant === "mint" && "bg-gradient-to-r from-uzzai-mint to-uzzai-blue",
              variant === "blue" && "bg-gradient-to-r from-uzzai-blue to-uzzai-mint",
              variant === "gold" && "bg-gradient-to-r from-uzzai-gold to-uzzai-mint",
              variant === "silver" && "bg-gradient-to-r from-uzzai-silver to-uzzai-black",
              variant === "black" && "bg-gradient-to-r from-uzzai-black to-uzzai-blue",
              variant === "default" && "bg-gradient-to-r from-primary to-secondary"
            )}
          />
        )}

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div
              className={cn(
                "rounded-lg p-2",
                variant === "mint" && "bg-uzzai-mint/20 text-uzzai-mint",
                variant === "blue" && "bg-uzzai-blue/20 text-uzzai-blue",
                variant === "gold" && "bg-uzzai-gold/20 text-uzzai-gold",
                variant === "silver" && "bg-uzzai-silver/20 text-uzzai-silver",
                variant === "black" && "bg-uzzai-black/20 text-uzzai-black",
                variant === "default" && "bg-primary/20 text-primary"
              )}
            >
              {icon}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="flex items-baseline justify-between">
            <div
              className={cn(
                "text-2xl font-bold",
                variant === "mint" && "text-uzzai-mint",
                variant === "blue" && "text-uzzai-blue",
                variant === "gold" && "text-uzzai-gold",
                variant === "silver" && "text-uzzai-silver",
                variant === "black" && "text-uzzai-black",
                variant === "default" && "text-foreground"
              )}
            >
              {value}
            </div>

            {trend && trendValue && (
              <div className={cn(trendVariants({ trend }))}>
                <TrendIcon className="h-3 w-3" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>

          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    );
  }
);
MetricCard.displayName = "MetricCard";

export { MetricCard, metricCardVariants };

