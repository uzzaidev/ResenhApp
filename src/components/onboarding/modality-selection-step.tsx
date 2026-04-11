"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MODALITY_OPTIONS = [
  "Futsal",
  "Futebol 7",
  "Futebol 11",
  "Volei",
  "Basquete",
  "Handebol",
  "Tenis",
  "Beach Tennis",
  "Corrida",
  "Funcional",
];

type ModalitySelectionStepProps = {
  returnTo?: string;
};

function getSafeReturnTo(path?: string): string | null {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

export function ModalitySelectionStep({ returnTo }: ModalitySelectionStepProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeReturnTo = useMemo(() => getSafeReturnTo(returnTo), [returnTo]);

  useEffect(() => {
    async function loadSavedModalities() {
      try {
        const response = await fetch("/api/onboarding/modalities");
        const data = await response.json().catch(() => ({}));
        if (response.ok && Array.isArray(data?.modalities)) {
          setSelectedModalities(
            data.modalities
              .filter((value: unknown): value is string => typeof value === "string")
              .slice(0, 10)
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void loadSavedModalities();
  }, []);

  function toggleModality(modality: string) {
    setSelectedModalities((previous) =>
      previous.includes(modality)
        ? previous.filter((value) => value !== modality)
        : [...previous, modality]
    );
  }

  async function handleContinue() {
    setError(null);
    if (selectedModalities.length === 0) {
      setError("Selecione pelo menos uma modalidade para continuar.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/onboarding/modalities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modalities: selectedModalities }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel salvar suas modalidades");
      }

      const params = new URLSearchParams();
      const groupId = searchParams.get("groupId");
      if (groupId && groupId.startsWith("/") === false) {
        params.set("groupId", groupId);
      }
      if (safeReturnTo) {
        params.set("returnTo", safeReturnTo);
      }

      router.push(params.toString() ? `/onboarding/step/4?${params.toString()}` : "/onboarding/step/4");
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Falha ao salvar modalidades");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Escolha as modalidades que voce pratica com mais frequencia.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {MODALITY_OPTIONS.map((modality) => {
          const selected = selectedModalities.includes(modality);
          return (
            <button
              key={modality}
              type="button"
              onClick={() => toggleModality(modality)}
              className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/40"
              }`}
              disabled={saving}
            >
              {modality}
            </button>
          );
        })}
      </div>

      <Button onClick={handleContinue} disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          "Continuar"
        )}
      </Button>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
