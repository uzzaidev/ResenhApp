"use client";

/**
 * Upcoming Trainings - Lista de PrÃ³ximos Treinos
 *
 * Lista expandida de treinos prÃ³ximos com cards visuais
 * e confirmaÃ§Ã£o de presenÃ§a inline.
 */

import { TrainingCard } from "@/components/trainings/training-card";
import { useGroup } from "@/contexts/group-context";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

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

export function UpcomingTrainings() {
  const { currentGroup } = useGroup();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrainings() {
      if (!currentGroup?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/groups/${currentGroup.id}/upcoming-trainings`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro ao carregar treinos (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const mappedTrainings: Training[] = (data.trainings || []).map((training: any) => {
          const startsAt = new Date(training.startsAt);
          return {
            id: training.id,
            name: training.name,
            date: startsAt,
            time: startsAt.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            venue: training.venueName ? { id: "", name: training.venueName } : null,
            modality: null,
            price: typeof training.price === "number" ? training.price : undefined,
            isRecurring: false,
            confirmedCount: Number(training.confirmedCount || 0),
            maxPlayers: Number(training.maxPlayers || 0),
            userStatus: training.userStatus || null,
            confirmedAttendees: training.confirmedAttendees || [],
          };
        });

        setTrainings(mappedTrainings);
      } catch (error) {
        console.error("Error loading trainings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTrainings();
  }, [currentGroup?.id]);

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-heading">PrÃ³ximos Treinos</h2>
            <p className="text-gray-600 text-sm mt-1">Carregando...</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (trainings.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-heading">PrÃ³ximos Treinos</h2>
            <p className="text-gray-600 text-sm mt-1">Confirme sua presenÃ§a nos treinos</p>
          </div>
          <Button asChild>
            <Link href="/eventos?tipo=treino">
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <EmptyState
          icon={Calendar}
          title="Nenhum treino agendado"
          description="NÃ£o hÃ¡ treinos prÃ³ximos no momento."
          action={{
            label: "Ver todos os treinos",
            onClick: () => {
              window.location.href = "/eventos?tipo=treino";
            },
          }}
        />
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-heading">PrÃ³ximos Treinos</h2>
          <p className="text-gray-600 text-sm mt-1">Confirme sua presenÃ§a nos treinos</p>
        </div>
        <Button asChild>
          <Link href="/eventos?tipo=treino">
            Ver todos <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {trainings.map((training) => (
          <TrainingCard key={training.id} training={training} expanded />
        ))}
      </div>
    </section>
  );
}


