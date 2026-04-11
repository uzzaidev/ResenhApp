import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateServerProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  children?: React.ReactNode;
  variant?: "default" | "error" | "search";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function EmptyStateServer({
  icon: Icon,
  title,
  description,
  action,
  children,
  variant = "default",
  size = "md",
  className,
}: EmptyStateServerProps) {
  const iconSizes = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  };

  const iconContainerSizes = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const variantStyles = {
    default: {
      iconBg: "bg-muted/50",
      iconColor: "text-muted-foreground",
    },
    error: {
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
    },
    search: {
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
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
      <div
        className={cn(
          "rounded-full mb-6 flex items-center justify-center",
          iconContainerSizes[size],
          styles.iconBg
        )}
      >
        <Icon className={cn(iconSizes[size], styles.iconColor)} />
      </div>

      <h3
        className={cn(
          "font-semibold mb-2 text-foreground",
          size === "sm" && "text-base",
          size === "md" && "text-lg",
          size === "lg" && "text-xl"
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "mb-6 max-w-sm text-muted-foreground",
          size === "sm" && "text-sm",
          size === "md" && "text-base",
          size === "lg" && "text-lg"
        )}
      >
        {description}
      </p>

      {action ? (
        <Button asChild variant={variant === "error" ? "destructive" : "default"}>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : null}

      {children ? (
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">{children}</div>
      ) : null}
    </div>
  );
}
