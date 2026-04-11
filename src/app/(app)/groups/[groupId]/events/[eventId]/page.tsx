import { redirect } from "next/navigation";

type GroupEventLegacyPageProps = {
  params: Promise<{ groupId: string; eventId: string }>;
};

export default async function GroupEventLegacyPage({ params }: GroupEventLegacyPageProps) {
  const { groupId, eventId } = await params;
  const returnTo = `/grupos/${groupId}`;
  redirect(`/eventos/${eventId}?returnTo=${encodeURIComponent(returnTo)}`);
}
