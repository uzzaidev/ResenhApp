"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

type CompleteOnboardingButtonProps = {
  returnTo?: string;
};

function getSafeReturnTo(path?: string): string {
  if (!path) return "/dashboard";
  if (!path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  return path;
}

export function CompleteOnboardingButton({ returnTo }: CompleteOnboardingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { update } = useSession();
  const destination = getSafeReturnTo(returnTo);

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complete: true }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Falha ao concluir onboarding");
      }

      await update({ onboardingCompleted: true });
      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao concluir onboarding");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button onClick={handleComplete} disabled={loading}>
        {loading ? "Concluindo..." : "Concluir onboarding"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
