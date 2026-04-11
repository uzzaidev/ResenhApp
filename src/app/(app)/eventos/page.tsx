import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserCurrentGroup } from "@/lib/group-helpers";
import { sql } from "@/db/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, MapPin, Plus, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard, MetricGrid } from "@/components/ui/metric-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyStateServer } from "@/components/ui/empty-state-server";

type FilterType = "todos" | "treino" | "jogo";

type EventItem = {
  id: string;
  starts_at: string;
  status: string;
  event_type: string | null;
  venue_name: string | null;
  max_players: number | null;
  confirmed_count: number;
  opponent: string | null;
  our_score: number | null;
  opponent_score: number | null;
};

type EventosPageProps = {
  searchParams: Promise<{ tipo?: string }>;
};

function normalizeTipo(tipo?: string): FilterType {
  if (!tipo) return "todos";

  const normalized = tipo.toLowerCase();
  if (normalized === "treino" || normalized === "training") return "treino";
  if (normalized === "jogo" || normalized === "match" || normalized === "game") return "jogo";
  return "todos";
}

function normalizeEventType(eventType: string | null): "training" | "match" {
  if (eventType === "game" || eventType === "match") {
    return "match";
  }
  return "training";
}

function getEventTypeLabel(eventType: string | null): "Treino" | "Jogo" {
  return normalizeEventType(eventType) === "match" ? "Jogo" : "Treino";
}

export default async function EventosPage({ searchParams }: EventosPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin");
  }

  const params = await searchParams;
  const tipo = normalizeTipo(params.tipo);

  const currentGroup = await getUserCurrentGroup(user.id);
  const groupId = currentGroup?.id || null;

  if (!groupId) {
    return (
      <div className="space-y-6">
        <EmptyStateServer
          icon={Users}
          title="Voce nao faz parte de nenhum grupo"
          description="Entre em um grupo para acessar os eventos"
          action={{
            label: "Entrar em Grupo",
            href: "/grupos/join",
          }}
        />
      </div>
    );
  }

  const typeFilterSql =
    tipo === "treino"
      ? sql`AND (e.event_type = 'training' OR e.event_type IS NULL)`
      : tipo === "jogo"
      ? sql`AND (e.event_type = 'game' OR e.event_type = 'match')`
      : sql``;

  const eventColumnsResult = await sql<
    { has_opponent: boolean; has_our_score: boolean; has_opponent_score: boolean }[]
  >`
    SELECT
      EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'opponent'
      ) as has_opponent,
      EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'our_score'
      ) as has_our_score,
      EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'opponent_score'
      ) as has_opponent_score
  `;

  const eventColumns = eventColumnsResult[0] || {
    has_opponent: false,
    has_our_score: false,
    has_opponent_score: false,
  };

  const opponentSelectSql = eventColumns.has_opponent
    ? sql`e.opponent as opponent,`
    : sql`NULL::TEXT as opponent,`;
  const ourScoreSelectSql = eventColumns.has_our_score
    ? sql`e.our_score as our_score,`
    : sql`NULL::INTEGER as our_score,`;
  const opponentScoreSelectSql = eventColumns.has_opponent_score
    ? sql`e.opponent_score as opponent_score,`
    : sql`NULL::INTEGER as opponent_score,`;

  let upcomingEvents: EventItem[] = [];
  let recentEvents: EventItem[] = [];
  let totalEvents = 0;

  try {
    const upcomingResult = await sql`
      SELECT
        e.id,
        e.starts_at,
        e.status,
        e.event_type,
        e.max_players,
        ${opponentSelectSql}
        ${ourScoreSelectSql}
        ${opponentScoreSelectSql}
        v.name as venue_name,
        (SELECT COUNT(*) FROM event_attendance WHERE event_id = e.id AND status = 'yes') as confirmed_count
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.group_id = ${groupId}
        AND e.starts_at >= NOW()
        ${typeFilterSql}
      ORDER BY e.starts_at ASC
      LIMIT 12
    `;
    upcomingEvents = upcomingResult as unknown as EventItem[];

    const recentResult = await sql`
      SELECT
        e.id,
        e.starts_at,
        e.status,
        e.event_type,
        e.max_players,
        ${opponentSelectSql}
        ${ourScoreSelectSql}
        ${opponentScoreSelectSql}
        v.name as venue_name,
        (SELECT COUNT(*) FROM event_attendance WHERE event_id = e.id AND status = 'yes') as confirmed_count
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      WHERE e.group_id = ${groupId}
        AND e.starts_at < NOW()
        ${typeFilterSql}
      ORDER BY e.starts_at DESC
      LIMIT 12
    `;
    recentEvents = recentResult as unknown as EventItem[];

    const totalResult = await sql`
      SELECT COUNT(*) as count
      FROM events e
      WHERE e.group_id = ${groupId}
        AND e.starts_at > NOW() - INTERVAL '30 days'
        ${typeFilterSql}
    `;
    totalEvents = Number((totalResult[0] as any)?.count || 0);
  } catch (error) {
    console.error("Error fetching eventos hub:", error);
  }

  const returnTo = tipo === "todos" ? "/eventos" : `/eventos?tipo=${tipo}`;
  const thisWeekEnd = new Date();
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);
  const eventsThisWeek = upcomingEvents.filter((event) => {
    const eventDate = new Date(event.starts_at);
    return eventDate >= new Date() && eventDate <= thisWeekEnd;
  }).length;

  const avgAttendance =
    recentEvents.length > 0
      ? Math.round(
          (recentEvents.reduce((sum, event) => sum + Number(event.confirmed_count || 0), 0) /
            recentEvents.reduce((sum, event) => sum + Number(event.max_players || 20), 0)) *
            100
        )
      : 0;

  const headingByTipo: Record<FilterType, string> = {
    todos: "Todos os Eventos",
    treino: "Treinos",
    jogo: "Jogos",
  };

  const newEventParams = new URLSearchParams({ groupId });
  if (tipo === "jogo") {
    newEventParams.set("type", "game");
  } else if (tipo === "treino") {
    newEventParams.set("type", "training");
  }
  const newEventHref = `/eventos/novo?${newEventParams.toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eventos</h1>
          <p className="mt-1 text-muted-foreground">Treinos e jogos no mesmo fluxo operacional.</p>
        </div>

        <Button asChild>
          <Link href={newEventHref}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant={tipo === "todos" ? "default" : "outline"} size="sm">
          <Link href="/eventos">Todos</Link>
        </Button>
        <Button asChild variant={tipo === "treino" ? "default" : "outline"} size="sm">
          <Link href="/eventos?tipo=treino">Treinos</Link>
        </Button>
        <Button asChild variant={tipo === "jogo" ? "default" : "outline"} size="sm">
          <Link href="/eventos?tipo=jogo">Jogos</Link>
        </Button>
      </div>

      <MetricGrid cols={4}>
        <MetricCard
          feature="trainings"
          title={headingByTipo[tipo]}
          value={totalEvents}
          subtitle="Ultimos 30 dias"
          icon={Calendar}
        />
        <MetricCard
          feature="games"
          title="Proximos"
          value={upcomingEvents.length}
          subtitle="Eventos agendados"
          icon={Clock}
        />
        <MetricCard
          feature="attendance"
          title="Presenca Media"
          value={`${avgAttendance}%`}
          subtitle="Historico recente"
          icon={Users}
        />
        <MetricCard
          feature="analytics"
          title="Esta Semana"
          value={eventsThisWeek}
          subtitle="Ate 7 dias"
          icon={Trophy}
        />
      </MetricGrid>

      <Card>
        <CardHeader>
          <CardTitle>Proximos Eventos</CardTitle>
          <CardDescription>{upcomingEvents.length} agendado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <EmptyStateServer
              icon={Calendar}
              title="Nenhum evento agendado"
              description="Crie um novo evento para movimentar o grupo."
              action={{
                label: "Criar Evento",
                href: newEventHref,
              }}
            />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const eventDate = new Date(event.starts_at);
                const eventTypeLabel = getEventTypeLabel(event.event_type);
                const isMatch = normalizeEventType(event.event_type) === "match";
                return (
                  <Link
                    key={event.id}
                    href={`/eventos/${event.id}?returnTo=${encodeURIComponent(returnTo)}`}
                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-lg ${
                        isMatch ? "bg-amber-500/15" : "bg-violet-500/15"
                      }`}
                    >
                      {isMatch ? (
                        <Trophy className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Calendar className="h-5 w-5 text-violet-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="truncate font-semibold">{eventTypeLabel}</h3>
                        <Badge variant="secondary">{event.status}</Badge>
                        {event.opponent && <Badge variant="outline">vs {event.opponent}</Badge>}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>{eventDate.toLocaleDateString("pt-BR")}</span>
                        <span>{eventDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                        {event.venue_name && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.venue_name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-semibold">
                        {event.confirmed_count}/{event.max_players || "sem limite"}
                      </p>
                      <p className="text-xs text-muted-foreground">confirmados</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
            <CardDescription>Ultimos {recentEvents.length} evento(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentEvents.slice(0, 8).map((event) => {
                const eventDate = new Date(event.starts_at);
                const isMatch = normalizeEventType(event.event_type) === "match";
                return (
                  <Link
                    key={event.id}
                    href={`/eventos/${event.id}?returnTo=${encodeURIComponent(returnTo)}`}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">
                        {getEventTypeLabel(event.event_type)} - {eventDate.toLocaleDateString("pt-BR")}
                      </div>
                      {event.venue_name && (
                        <div className="text-xs text-muted-foreground">{event.venue_name}</div>
                      )}
                    </div>
                    {isMatch && event.our_score !== null && event.opponent_score !== null && (
                      <div className="font-semibold">
                        {event.our_score} x {event.opponent_score}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
