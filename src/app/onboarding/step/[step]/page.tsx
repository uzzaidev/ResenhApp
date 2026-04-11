import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserGroups } from "@/lib/group-helpers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GroupSetupStep } from "@/components/onboarding/group-setup-step";
import { ModalitySelectionStep } from "@/components/onboarding/modality-selection-step";
import { CompleteOnboardingButton } from "@/components/onboarding/complete-onboarding-button";

type PageProps = {
  params: Promise<{ step: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

const STEPS: Record<string, { title: string; description: string }> = {
  "1": {
    title: "Boas-vindas",
    description:
      "Em poucos passos voce define seu contexto inicial e entra na plataforma com tudo pronto.",
  },
  "2": {
    title: "Criar ou entrar em grupo",
    description: "Toda experiencia principal comeca por um grupo.",
  },
  "3": {
    title: "Qual modalidade voce pratica?",
    description: "Escolha suas modalidades de interesse para personalizar seu inicio.",
  },
  "4": {
    title: "Pronto para comecar",
    description: "Confirme para finalizar onboarding e seguir para o seu contexto principal.",
  },
};

function getSafeReturnTo(path?: string): string | null {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

function buildStepHref(step: string, returnTo?: string | null): string {
  if (!returnTo) {
    return `/onboarding/step/${step}`;
  }
  return `/onboarding/step/${step}?returnTo=${encodeURIComponent(returnTo)}`;
}

export default async function OnboardingStepPage({ params, searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  const { step } = await params;
  const { returnTo } = await searchParams;
  const safeReturnTo = getSafeReturnTo(returnTo);

  const config = STEPS[step];
  if (!config) {
    redirect(buildStepHref("1", safeReturnTo));
  }

  const userGroups = await getUserGroups(user.id);

  const previousStep = Number(step) > 1 ? String(Number(step) - 1) : null;

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Onboarding - Etapa {step}/4</CardTitle>
          <CardDescription>{config.title}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">{config.description}</p>

          {step === "1" && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                O objetivo aqui e simples: entrar ou criar seu grupo, escolher suas modalidades e
                acessar o app com contexto real.
              </div>

              <Button asChild className="w-full">
                <Link href={buildStepHref("2", safeReturnTo)}>Comecar onboarding</Link>
              </Button>
            </div>
          )}

          {step === "2" && (
            <GroupSetupStep
              existingGroups={userGroups.map((group) => ({
                id: group.id,
                name: group.name,
                role: group.role,
              }))}
              returnTo={safeReturnTo ?? undefined}
            />
          )}

          {step === "3" && <ModalitySelectionStep returnTo={safeReturnTo ?? undefined} />}

          {step === "4" && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                Ao concluir, voce sera redirecionado para o contexto principal do app.
              </div>

              <CompleteOnboardingButton returnTo={safeReturnTo ?? undefined} />
            </div>
          )}

          {previousStep && (
            <Button asChild variant="outline" className="w-full">
              <Link href={buildStepHref(previousStep, safeReturnTo)}>Voltar etapa anterior</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
