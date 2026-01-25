"use client";

/**
 * Modalities Grid - Dashboard V2
 * 
 * Grid visual de modalidades ativas com cards grandes,
 * ícones, gradientes e estatísticas.
 */

import { ModalityCard } from "@/components/modalities/modality-card";
import { getGroupModalities, type ModalityWithStats } from "@/lib/modalities";
import { useGroup } from "@/contexts/group-context";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Dumbbell } from "lucide-react";

export function ModalitiesGrid() {
  const { currentGroup } = useGroup();
  const [modalities, setModalities] = useState<ModalityWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadModalities() {
      if (!currentGroup?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getGroupModalities(currentGroup.id);
        setModalities(data.filter((m) => m.isActive).slice(0, 6)); // Top 6
      } catch (error) {
        console.error("Error loading modalities:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadModalities();
  }, [currentGroup?.id]);

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-heading">Modalidades Ativas</h2>
            <p className="text-gray-600 text-sm mt-1">Carregando...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (modalities.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-heading">Modalidades Ativas</h2>
            <p className="text-gray-600 text-sm mt-1">Esportes disponíveis no momento</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/modalidades">
              Ver todas <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <EmptyState
          icon={Dumbbell}
          title="Nenhuma modalidade ativa"
          description="Crie uma modalidade para começar a gerenciar treinos e atletas."
          action={{
            label: "Criar Modalidade",
            onClick: () => window.location.href = "/modalidades",
          }}
        />
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-heading">Modalidades Ativas</h2>
          <p className="text-gray-600 text-sm mt-1">Esportes disponíveis no momento</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/modalidades">
            Ver todas <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modalities.map((modality) => (
          <ModalityCard
            key={modality.id}
            modality={modality}
            onEdit={() => {}}
            onDelete={() => {}}
            onViewDetails={() => window.location.href = `/modalidades/${modality.id}`}
          />
        ))}
      </div>
    </section>
  );
}

