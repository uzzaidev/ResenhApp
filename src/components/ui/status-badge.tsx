import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, X, Clock, AlertCircle, Minus, DollarSign } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * StatusBadge - Componente para exibir status com ícones
 * Design System UzzAI
 * 
 * @example
 * <StatusBadge variant="confirmed">CONFIRMADO</StatusBadge>
 * <StatusBadge variant="pending">PENDENTE</StatusBadge>
 * <StatusBadge variant="cancelled">CANCELADO</StatusBadge>
 */

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        // Status de Confirmação (RSVP)
        confirmed: "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30",
        pending: "bg-uzzai-gold/20 text-uzzai-gold border border-uzzai-gold/30",
        cancelled: "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30",
        declined: "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30",
        
        // Status de Pagamento
        paid: "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30",
        unpaid: "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30",
        "payment-pending": "bg-uzzai-gold/20 text-uzzai-gold border border-uzzai-gold/30",
        
        // Status Gerais
        active: "bg-uzzai-mint/20 text-uzzai-mint border border-uzzai-mint/30",
        inactive: "bg-uzzai-silver/20 text-uzzai-silver border border-uzzai-silver/30",
        processing: "bg-uzzai-blue/20 text-uzzai-blue border border-uzzai-blue/30",
        
        // Status Premium
        premium: "bg-gradient-to-r from-uzzai-gold/20 to-uzzai-mint/20 text-uzzai-gold border border-uzzai-gold/30",
        
        // Status Neutros
        default: "bg-uzzai-silver/20 text-uzzai-silver border border-uzzai-silver/30",
        info: "bg-uzzai-blue/20 text-uzzai-blue border border-uzzai-blue/30",
        warning: "bg-uzzai-gold/20 text-uzzai-gold border border-uzzai-gold/30",
        error: "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30",
        success: "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30",
      },
      size: {
        sm: "text-[10px] px-2 py-0.5",
        md: "text-xs px-3 py-1",
        lg: "text-sm px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  /** Mostrar ícone automaticamente baseado no variant */
  showIcon?: boolean;
  /** Ícone customizado (sobrescreve o ícone automático) */
  icon?: React.ReactNode;
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, variant, size, showIcon = true, icon, children, ...props }, ref) => {
    // Mapear ícones baseado no variant
    const getIcon = () => {
      if (icon) return icon;
      if (!showIcon) return null;

      switch (variant) {
        case "confirmed":
        case "paid":
        case "active":
        case "success":
          return <Check className="h-3 w-3" />;
        
        case "cancelled":
        case "declined":
        case "unpaid":
        case "error":
          return <X className="h-3 w-3" />;
        
        case "pending":
        case "payment-pending":
        case "processing":
          return <Clock className="h-3 w-3" />;
        
        case "warning":
          return <AlertCircle className="h-3 w-3" />;
        
        case "premium":
          return <DollarSign className="h-3 w-3" />;
        
        case "inactive":
        case "default":
          return <Minus className="h-3 w-3" />;
        
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(statusBadgeVariants({ variant, size }), className)}
        {...props}
      >
        {getIcon()}
        <span>{children}</span>
      </div>
    );
  }
);
StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };

