import { cn } from "@/lib/utils"

/**
 * Skeleton Component
 * 
 * Componente base para estados de loading.
 * Sprint 6: Adicionado shimmer animation para melhor UX.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-shimmer rounded-md bg-muted", className)}
      {...props}
      aria-label="Carregando..."
      role="status"
    />
  )
}

export { Skeleton }
