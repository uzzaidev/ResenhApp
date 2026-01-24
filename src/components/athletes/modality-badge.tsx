"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Modality {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface ModalityBadgeProps {
  modalities: Modality[];
  maxVisible?: number;
  onBadgeClick?: (modalityId: string) => void;
}

export function ModalityBadge({
  modalities,
  maxVisible = 3,
  onBadgeClick,
}: ModalityBadgeProps) {
  const visibleModalities = modalities.slice(0, maxVisible);
  const hiddenCount = modalities.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1">
      {visibleModalities.map((modality) => (
        <Badge
          key={modality.id}
          variant="secondary"
          className="cursor-pointer hover:opacity-80"
          style={
            modality.color
              ? {
                  backgroundColor: `${modality.color}20`,
                  color: modality.color,
                  borderColor: modality.color,
                }
              : undefined
          }
          onClick={() => onBadgeClick?.(modality.id)}
        >
          {modality.icon && <span className="mr-1">{modality.icon}</span>}
          {modality.name}
        </Badge>
      ))}

      {hiddenCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="cursor-help">
                +{hiddenCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {modalities.slice(maxVisible).map((modality) => (
                  <div key={modality.id} className="text-sm">
                    {modality.icon} {modality.name}
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
