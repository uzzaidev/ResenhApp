"use client";

/**
 * RSVP Progress - Componente de Progress Bar para Confirmações
 * 
 * Exibe progresso de confirmações de presença em treinos
 * com barra visual e contadores.
 */

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RsvpProgressProps {
  confirmed: number;
  total: number;
  percentage?: number;
  className?: string;
}

export function RsvpProgress({
  confirmed,
  total,
  percentage,
  className,
}: RsvpProgressProps) {
  const calculatedPercentage = percentage ?? (total > 0 ? (confirmed / total) * 100 : 0);
  const roundedPercentage = Math.round(calculatedPercentage);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Confirmações</span>
        <span className="font-bold text-green-600">
          {confirmed}/{total} ({roundedPercentage}%)
        </span>
      </div>

      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${calculatedPercentage}%` }}
        />
      </div>
    </div>
  );
}

