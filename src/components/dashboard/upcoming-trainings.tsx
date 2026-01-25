"use client";

/**
 * Upcoming Trainings - Lista de Próximos Treinos
 * 
 * Lista expandida de treinos próximos com cards visuais
 * e confirmação de presença inline.
 */

import { TrainingCard } from "@/components/trainings/training-card";
import { useGroup } from "@/contexts/group-context";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar } from "lucide-react";

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
        // TODO: Conectar com API real no Sprint 2
        // Por enquanto, mock data
        const mockTrainings: Training[] = [
          {
            id: "1",
            name: "Treino Tático - Preparação Interatléticas",
            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            time: "20:00",
            venue: { id: "1", name: "Ginásio UFRGS" },
            modality: {
              id: "1",
              name: "FUTSAL",
              icon: "⚽",
              color: "blue",
            },
            price: 10,
            isRecurring: false,
            confirmedCount: 23,
            maxPlayers: 30,
            userStatus: "yes",
            confirmedAttendees: [
              { id: "1", name: "Pedro Vitor" },
              { id: "2", name: "Lucas Silva" },
              { id: "3", name: "Maria Oliveira" },
              { id: "4", name: "Rafael Costa" },
              { id: "5", name: "Ana Santos" },
            ],
          },
        ];
        setTrainings(mockTrainings);
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
            <h2 className="text-2xl font-bold font-heading">Próximos Treinos</h2>
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
            <h2 className="text-2xl font-bold font-heading">Próximos Treinos</h2>
            <p className="text-gray-600 text-sm mt-1">Confirme sua presença nos treinos</p>
          </div>
          <Button asChild>
            <Link href="/treinos">
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <EmptyState
          icon={Calendar}
          title="Nenhum treino agendado"
          description="Não há treinos próximos no momento."
          action={{
            label: "Ver todos os treinos",
            onClick: () => window.location.href = "/treinos",
          }}
        />
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-heading">Próximos Treinos</h2>
          <p className="text-gray-600 text-sm mt-1">Confirme sua presença nos treinos</p>
        </div>
        <Button asChild>
          <Link href="/treinos">
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


