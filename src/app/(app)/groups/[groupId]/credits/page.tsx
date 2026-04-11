import { redirect } from "next/navigation";

type RouteParams = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupCreditsLegacyPage({ params }: RouteParams) {
  const { groupId } = await params;
  redirect(`/configuracoes?tab=quota&groupId=${encodeURIComponent(groupId)}`);
}
