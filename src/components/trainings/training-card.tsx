"use client";

/**
 * Training Card - Card Expandido de Treino
 * 
 * Card visual completo para exibir treinos com:
 * - Data destacada
 * - Badge de modalidade
 * - Progress bar de RSVP
 * - Avatares confirmados
 * - Badge RECORRENTE quando aplicável
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock,
  MapPin,
  DollarSign,
  Repeat,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { RsvpProgress } from "./rsvp-progress";
import { ConfirmedAvatars } from "./confirmed-avatars";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Training {
  id: string;
  name: string;
  date: Date;
  time: string;
  venue?: {
    id: string;
    name: string;
  } | null;
  modality?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  } | null;
  price?: number;
  isRecurring?: boolean;
  confirmedCount: number;
  maxPlayers: number;
  userStatus?: "yes" | "no" | "waitlist" | null;
  confirmedAttendees: Array<{
    id: string;
    name: string;
    avatarUrl?: string | null;
  }>;
}

interface TrainingCardProps {
  training: Training;
  expanded?: boolean;
  className?: string;
}

export function TrainingCard({
  training,
  expanded = false,
  className,
}: TrainingCardProps) {
  const confirmationPercentage =
    training.maxPlayers > 0
      ? (training.confirmedCount / training.maxPlayers) * 100
      : 0;

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Date Badge */}
          <div className="flex-shrink-0">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 text-white w-20">
              <div className="text-3xl font-extrabold">
                {format(training.date, "d")}
              </div>
              <div className="text-xs uppercase tracking-wide">
                {format(training.date, "MMM", { locale: ptBR })}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3 flex-wrap">
              {training.modality && (
                <Badge
                  className={cn(
                    "bg-gradient-to-r",
                    training.modality.color === "blue"
                      ? "from-blue-500 to-cyan-400"
                      : training.modality.color === "green"
                      ? "from-green-500 to-emerald-400"
                      : "from-violet-500 to-purple-400"
                  )}
                >
                  {training.modality.icon} {training.modality.name}
                </Badge>
              )}
              {training.isRecurring && (
                <Badge variant="outline">
                  <Repeat className="mr-1 h-3 w-3" /> Recorrente
                </Badge>
              )}
              {training.userStatus === "yes" && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Confirmado
                </Badge>
              )}
              {training.userStatus === "waitlist" && (
                <Badge variant="secondary">⏳ Lista de Espera</Badge>
              )}
            </div>

            <h3 className="text-xl font-bold mb-2">{training.name}</h3>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(training.date, "EEEE", { locale: ptBR })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {training.time}
              </div>
              {training.venue && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {training.venue.name}
                </div>
              )}
              {training.price && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  R$ {training.price.toFixed(2)}
                </div>
              )}
            </div>

            {/* RSVP Progress */}
            {expanded && (
              <div className="space-y-3">
                <RsvpProgress
                  confirmed={training.confirmedCount}
                  total={training.maxPlayers}
                  percentage={confirmationPercentage}
                />

                {/* Confirmed Avatars */}
                {training.confirmedAttendees.length > 0 && (
                  <ConfirmedAvatars
                    attendees={training.confirmedAttendees}
                    maxVisible={5}
                  />
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            {!training.userStatus ? (
              <Button className="w-full md:w-auto" size="lg" asChild>
                <Link href={`/events/${training.id}`}>Confirmar Presença</Link>
              </Button>
            ) : training.userStatus === "yes" ? (
              <Button variant="outline" className="w-full md:w-auto" asChild>
                <Link href={`/events/${training.id}`}>Ver Detalhes</Link>
              </Button>
            ) : (
              <Button variant="secondary" className="w-full md:w-auto" asChild>
                <Link href={`/events/${training.id}`}>Responder</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

