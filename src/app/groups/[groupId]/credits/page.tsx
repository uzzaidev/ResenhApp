import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserCurrentGroup } from "@/lib/group-helpers";
import { redirect } from "next/navigation";
import { CreditsPageClient } from "@/components/credits/credits-page-client";

type RouteParams = {
  params: Promise<{ groupId: string }>;
};

export default async function CreditsPage({ params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { groupId } = await params;

  // Verificar se o usuário é membro do grupo
  const currentGroup = await getUserCurrentGroup(user.id);
  
  if (!currentGroup || currentGroup.id !== groupId) {
    redirect("/dashboard");
  }

  return <CreditsPageClient groupId={groupId} userRole={currentGroup.role || "member"} />;
}

