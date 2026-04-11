import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Calendar, MapPin, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { sql } from "@/db/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type EventPublicPageProps = {
  params: Promise<{ eventId: string }>;
};

type EventPreview = {
  id: string;
  starts_at: string;
  status: string;
  max_players: number | null;
  group_name: string;
  venue_name: string | null;
  confirmed_count: number;
};

function formatDate(dateISO: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(dateISO));
}

export default async function EventPublicPage({ params }: EventPublicPageProps) {
  const { eventId } = await params;
  const session = await auth();

  if (session?.user?.id) {
    redirect(`/eventos/${eventId}?returnTo=${encodeURIComponent(`/events/${eventId}`)}`);
  }

  const result = await sql<EventPreview[]>`
    SELECT
      e.id,
      e.starts_at,
      e.status,
      e.max_players,
      g.name as group_name,
      v.name as venue_name,
      (
        SELECT COUNT(*)
        FROM event_attendance ea
        WHERE ea.event_id = e.id
          AND ea.status = 'yes'
      )::INTEGER as confirmed_count
    FROM events e
    INNER JOIN groups g ON g.id = e.group_id
    LEFT JOIN venues v ON v.id = e.venue_id
    WHERE e.id = ${eventId}::UUID
    LIMIT 1
  `;

  if (!result.length) {
    notFound();
  }

  const event = result[0];
  const callbackUrl = `/events/${eventId}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-wider text-slate-300">Convite de Evento</p>
          <h1 className="text-3xl font-bold">{event.group_name}</h1>
          <p className="text-slate-300">
            Veja os detalhes do evento e entre no app para confirmar presenca.
          </p>
        </div>

        <Card className="border-slate-700 bg-slate-900/80 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Evento agendado</CardTitle>
            <CardDescription className="text-slate-300">
              Status atual: <span className="font-medium capitalize text-white">{event.status}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span>{formatDate(event.starts_at)}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-200">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>{event.venue_name || "Local a definir"}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-200">
              <Users className="h-4 w-4 text-emerald-400" />
              <span>
                {event.confirmed_count} confirmado(s)
                {typeof event.max_players === "number" ? ` de ${event.max_players} vagas` : ""}
              </span>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <Button asChild className="w-full">
                <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
                  Entrar para participar
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-slate-500 text-white hover:bg-slate-800">
                <Link href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
                  Criar conta
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
