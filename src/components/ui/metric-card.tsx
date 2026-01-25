/**
 * MetricCard V2 - Design System UzzAI
 *
 * Componente de card de métrica reutilizável com suporte a:
 * - Gradientes por feature
 * - Ícones dinâmicos
 * - Variações de tamanho
 * - Trends (aumento/diminuição)
 * - Loading states
 *
 * Uso:
 * <MetricCard
 *   feature="modalities"
 *   title="Total de Modalidades"
 *   value={5}
 *   icon={Dumbbell}
 *   trend={{ value: 12, direction: 'up' }}
 * />
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { colors } from "@/lib/design-system";

// ============================================================================
// TYPES
// ============================================================================

export type FeatureType = keyof typeof colors.features;

const metricCardVariants = cva(
  "relative overflow-hidden transition-all hover:shadow-lg",
  {
    variants: {
      variant: {
        // UzzAI Brand colors
        mint: "border-uzzai-mint/30 bg-uzzai-mint/5 hover:border-uzzai-mint/50",
        blue: "border-uzzai-blue/30 bg-uzzai-blue/5 hover:border-uzzai-blue/50",
        gold: "border-uzzai-gold/30 bg-uzzai-gold/5 hover:border-uzzai-gold/50",
        silver: "border-uzzai-silver/30 bg-uzzai-silver/5 hover:border-uzzai-silver/50",
        black: "border-uzzai-black/30 bg-uzzai-black/5 hover:border-uzzai-black/50",

        // Feature colors
        modalities: "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40",
        athletes: "border-green-500/20 bg-green-500/5 hover:border-green-500/40",
        trainings: "border-violet-500/20 bg-violet-500/5 hover:border-violet-500/40",
        games: "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40",
        financial: "border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40",
        attendance: "border-pink-500/20 bg-pink-500/5 hover:border-pink-500/40",
        rankings: "border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/40",
        analytics: "border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40",

        // Gradient variant (card inteiro com gradiente)
        gradient: "border-0 text-white",

        default: "border-border bg-card hover:border-primary/50",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
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

// ============================================================================
// PROPS
// ============================================================================

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;

  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };

  feature?: FeatureType;
  showGradient?: boolean;
  isLoading?: boolean;
  sparkline?: number[]; // Array de valores para gráfico sparkline

  // Legacy props for backward compatibility
  trendValue?: string;
  description?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      className,
      variant,
      size = "md",
      title,
      value,
      subtitle,
      icon: Icon,
      trend,
      feature,
      showGradient = true,
      isLoading = false,
      // Legacy props
      trendValue,
      description,
      ...props
    },
    ref
  ) => {
    // Se feature for especificada, usa ela como variant
    const finalVariant = feature || variant || 'default';

    // Mapeamento de cores por variant
    const getFeatureColors = () => {
      if (feature && colors.features[feature]) {
        return colors.features[feature];
      }
      return null;
    };

    const featureColors = getFeatureColors();

    // Legacy: converter trendValue para trend object
    const finalTrend = trend || (trendValue ? {
      value: parseFloat(trendValue.replace(/[^0-9.-]/g, '')),
      direction: trendValue.startsWith('+') ? 'up' as const : 'down' as const,
    } : undefined);

    const finalSubtitle = subtitle || description;

    const TrendIcon = finalTrend?.direction === "up" ? TrendingUp : TrendingDown;

    // Loading state
    if (isLoading) {
      return (
        <Card ref={ref} className={cn(metricCardVariants({ variant: finalVariant as any, size }), className)} {...props}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        ref={ref}
        className={cn(
          metricCardVariants({ variant: finalVariant as any, size }),
          finalVariant === 'gradient' && featureColors && `bg-gradient-to-br ${featureColors.gradient}`,
          className
        )}
        {...props}
      >
        {/* Gradiente no topo */}
        {showGradient && finalVariant !== 'gradient' && (
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1 rounded-t-lg",
              // UzzAI Brand gradients
              variant === "mint" && "bg-gradient-to-r from-uzzai-mint to-uzzai-blue",
              variant === "blue" && "bg-gradient-to-r from-uzzai-blue to-uzzai-mint",
              variant === "gold" && "bg-gradient-to-r from-uzzai-gold to-uzzai-mint",
              variant === "silver" && "bg-gradient-to-r from-uzzai-silver to-uzzai-black",
              variant === "black" && "bg-gradient-to-r from-uzzai-black to-uzzai-blue",
              // Feature gradients
              feature && featureColors && `bg-gradient-to-r ${featureColors.gradient}`,
              !variant && !feature && "bg-gradient-to-r from-primary to-secondary"
            )}
          />
        )}

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn(
            "text-sm font-medium",
            finalVariant === 'gradient' ? "text-white/80" : "text-muted-foreground"
          )}>
            {title}
          </CardTitle>
          {Icon && (
            <div
              className={cn(
                "rounded-lg p-2",
                finalVariant === 'gradient' ? "bg-white/20 text-white" :
                variant === "mint" && "bg-uzzai-mint/20 text-uzzai-mint",
                variant === "blue" && "bg-uzzai-blue/20 text-uzzai-blue",
                variant === "gold" && "bg-uzzai-gold/20 text-uzzai-gold",
                variant === "silver" && "bg-uzzai-silver/20 text-uzzai-silver",
                variant === "black" && "bg-uzzai-black/20 text-uzzai-black",
                feature && featureColors && `${featureColors.bg} ${featureColors.text}`,
                !variant && !feature && "bg-primary/20 text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="flex items-baseline justify-between">
            <div
              className={cn(
                "text-2xl md:text-3xl font-bold font-exo2",
                finalVariant === 'gradient' ? "text-white" :
                variant === "mint" && "text-uzzai-mint",
                variant === "blue" && "text-uzzai-blue",
                variant === "gold" && "text-uzzai-gold",
                variant === "silver" && "text-uzzai-silver",
                variant === "black" && "text-uzzai-black",
                feature && featureColors && featureColors.text,
                !variant && !feature && "text-foreground"
              )}
            >
              {value}
            </div>

            {finalTrend && (
              <div className={cn(
                trendVariants({ trend: finalTrend.direction }),
                finalVariant === 'gradient' && "text-white"
              )}>
                <TrendIcon className="h-3 w-3" />
                <span>{finalTrend.value > 0 ? '+' : ''}{finalTrend.value}%</span>
              </div>
            )}
          </div>

          {finalSubtitle && (
            <p className={cn(
              "text-xs mt-1",
              finalVariant === 'gradient' ? "text-white/70" : "text-muted-foreground"
            )}>
              {finalSubtitle}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
);
MetricCard.displayName = "MetricCard";

// ============================================================================
// METRIC CARD SKELETON
// ============================================================================

export function MetricCardSkeleton({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return <MetricCard title="" value="" isLoading size={size} className={className} />;
}

// ============================================================================
// METRIC GRID - Helper para grids de métricas
// ============================================================================

export interface MetricGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

export function MetricGrid({ children, cols = 4, className }: MetricGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={cn('grid gap-4', gridCols[cols], className)}>{children}</div>;
}

export { MetricCard, metricCardVariants };
