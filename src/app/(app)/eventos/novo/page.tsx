import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { sql } from "@/db/client";
import { getCurrentUser } from "@/lib/auth-helpers";
import { EventForm } from "@/components/events/event-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type NewEventPageProps = {
  searchParams: Promise<{ groupId?: string; type?: string }>;
};

type AdminGroup = {
  id: string;
  name: string;
  description: string | null;
};

function buildNewEventHref(groupId: string, type?: string) {
  const params = new URLSearchParams({ groupId });
  if (type) {
    params.set("type", type);
  }
  return `/eventos/novo?${params.toString()}`;
}

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  const params = await searchParams;

  const adminGroupsRaw = await sql`
    SELECT
      g.id,
      g.name,
      g.description
    FROM groups g
    INNER JOIN group_members gm ON g.id = gm.group_id
    WHERE gm.user_id = ${user.id}
      AND gm.role = 'admin'
    ORDER BY g.name ASC
  `;
  const adminGroups = adminGroupsRaw as unknown as AdminGroup[];

  if (adminGroups.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Sem permissao para criar eventos</CardTitle>
            <CardDescription>
              Voce precisa ser admin de um grupo para criar eventos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/grupos/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar Grupo
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Voltar ao Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedGroup =
    adminGroups.find((group) => group.id === params.groupId) ??
    (adminGroups.length === 1 ? adminGroups[0] : null);

  if (!selectedGroup) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Novo Evento</h1>
          <p className="mt-1 text-muted-foreground">
            Selecione em qual grupo o evento sera criado.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {adminGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <CardTitle className="text-xl">{group.name}</CardTitle>
                <CardDescription>
                  {group.description || "Grupo sem descricao."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={buildNewEventHref(group.id, params.type)}>
                    <Users className="mr-2 h-4 w-4" />
                    Criar neste grupo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-navy via-navy-light to-green-dark text-white">
        <div className="container mx-auto max-w-2xl px-4 py-12">
          <h1 className="mb-2 text-4xl font-bold">Criar Novo Evento</h1>
          <p className="text-lg text-gray-200">{selectedGroup.name}</p>

          {adminGroups.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {adminGroups.map((group) => (
                <Button
                  key={group.id}
                  asChild
                  size="sm"
                  variant={group.id === selectedGroup.id ? "default" : "outline"}
                  className={group.id === selectedGroup.id ? "" : "bg-white/10 text-white hover:bg-white/20"}
                >
                  <Link href={buildNewEventHref(group.id, params.type)}>{group.name}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <EventForm groupId={selectedGroup.id} mode="create" />
      </div>
    </div>
  );
}
