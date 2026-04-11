"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Attendee = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

type ConfirmedAvatarsProps = {
  attendees: Attendee[];
  maxVisible?: number;
  className?: string;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
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
    return <div className={cn("text-sm text-gray-500", className)}>Nenhuma confirmação ainda</div>;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-gray-600">Confirmados:</span>

      <div className="flex -space-x-2">
        <TooltipProvider>
          {visibleAttendees.map((attendee) => (
            <Tooltip key={attendee.id}>
              <TooltipTrigger asChild>
                <Avatar className="cursor-pointer border-2 border-white transition-transform hover:z-10 hover:scale-110">
                  <AvatarImage src={attendee.avatarUrl || undefined} alt={attendee.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-400 text-xs text-white">
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
                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-200 text-sm font-semibold text-gray-700 transition-transform hover:z-10 hover:scale-110">
                  +{remainingCount}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {remainingCount} {remainingCount === 1 ? "outro confirmado" : "outros confirmados"}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}

