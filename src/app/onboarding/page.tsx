import { redirect } from "next/navigation";

type OnboardingPageProps = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { returnTo } = await searchParams;
  const safeReturnTo =
    returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : null;

  if (safeReturnTo) {
    redirect(`/onboarding/step/1?returnTo=${encodeURIComponent(safeReturnTo)}`);
  }

  redirect("/onboarding/step/1");
}
