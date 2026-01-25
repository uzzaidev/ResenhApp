"use client";

/**
 * Confirmed Avatars - Lista de Avatares Confirmados
 * 
 * Exibe avatares dos atletas confirmados com overlap visual
 * e contador para os restantes.
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Attendee {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

interface ConfirmedAvatarsProps {
  attendees: Attendee[];
  maxVisible?: number;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ConfirmedAvatars({
  attendees,
  maxVisible = 5,
  className,
}: ConfirmedAvatarsProps) {
  const visibleAttendees = attendees.slice(0, maxVisible);
  const remainingCount = Math.max(0, attendees.length - maxVisible);

  if (attendees.length === 0) {
    return (
      <div className={cn("text-sm text-gray-500", className)}>
        Nenhuma confirmação ainda
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-gray-600">Confirmados:</span>

      <div className="flex -space-x-2">
        <TooltipProvider>
          {visibleAttendees.map((attendee, index) => (
            <Tooltip key={attendee.id}>
              <TooltipTrigger asChild>
                <Avatar className="border-2 border-white hover:z-10 transition-transform hover:scale-110 cursor-pointer">
                  <AvatarImage src={attendee.avatarUrl || undefined} alt={attendee.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white text-xs">
                    {getInitials(attendee.name)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{attendee.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 border-2 border-white text-sm font-semibold text-gray-700 hover:z-10 transition-transform hover:scale-110 cursor-pointer">
                  +{remainingCount}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{remainingCount} {remainingCount === 1 ? "outro confirmado" : "outros confirmados"}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}

