"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURE_COSTS, GROUP_CREATION_COSTS } from "@/lib/credits-config";

type CreditsUsageGuideProps = {
  compact?: boolean;
};

const GROUP_FEATURE_COSTS = [
  { key: "recurring_training", label: "Treino recorrente" },
  { key: "qrcode_checkin", label: "Check-in por QR Code" },
  { key: "convocation", label: "Convocacao de jogo" },
  { key: "analytics", label: "Analytics avancado (mensal)" },
  { key: "split_pix", label: "Split Pix por evento" },
  { key: "tactical_board", label: "Salvar tatica na tabelinha" },
] as const;

const CREATION_COSTS = [
  { key: "atletica", label: "Criar Atletica" },
  { key: "standalone", label: "Criar Grupo Independente" },
  { key: "modality_group", label: "Criar Grupo de Modalidade (filho)" },
] as const;

export function CreditsUsageGuide({ compact = false }: CreditsUsageGuideProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>O que a Quota faz</CardTitle>
        <CardDescription>
          Transparencia de consumo para recursos premium e criacao de entidades
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className={`grid gap-3 ${compact ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          {GROUP_FEATURE_COSTS.map((item) => (
            <div key={item.key} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Consome <span className="font-semibold">{FEATURE_COSTS[item.key]}</span> quotas
              </p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Custos para criacao de grupos</h3>
          <div className={`grid gap-3 ${compact ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {CREATION_COSTS.map((item) => (
              <div key={item.key} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Custo: <span className="font-semibold">{GROUP_CREATION_COSTS[item.key]}</span> quotas
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
