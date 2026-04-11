import { redirect } from "next/navigation";

type RouteParams = {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ type?: string }>;
};

export default async function LegacyGroupNewEventPage({ params, searchParams }: RouteParams) {
  const { groupId } = await params;
  const { type } = await searchParams;

  const query = new URLSearchParams({ groupId });
  if (type) {
    query.set("type", type);
  }

  redirect(`/eventos/novo?${query.toString()}`);
}
