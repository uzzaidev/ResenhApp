"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Settings, UserCircle, Wallet, Ticket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGroup } from "@/contexts/group-context";

type SettingsTab = "profile" | "group" | "invites" | "quota";

function normalizeTab(value: string | null): SettingsTab {
  if (value === "profile" || value === "group" || value === "invites" || value === "quota") {
    return value;
  }
  return "profile";
}

export default function SettingsHubPage() {
  const { currentGroup } = useGroup();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const activeTab = normalizeTab(searchParams.get("tab"));
  const requestedGroupId = searchParams.get("groupId");
  const scopedGroupId = currentGroup?.id || requestedGroupId || null;
  const profileHref = session?.user?.id ? `/atletas/${session.user.id}` : "/auth/signin";
  const groupSettingsHref = currentGroup?.id ? `/grupos/${currentGroup.id}/configuracoes` : "/grupos/new";
  const invitesHref = currentGroup?.id
    ? `/grupos/${currentGroup.id}/configuracoes?tab=invites`
    : "/grupos/new";
  const quotaHref = scopedGroupId ? `/grupos/${scopedGroupId}/credits` : "/credits/buy";
  const quotaScopedHref = scopedGroupId
    ? `/configuracoes?tab=quota&groupId=${scopedGroupId}`
    : "/configuracoes?tab=quota";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuracoes</h1>
        <p className="mt-1 text-muted-foreground">Acesse seus ajustes de conta, grupo e quota de plataforma.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCircle className="h-5 w-5 text-uzzai-blue" />
              Perfil
            </CardTitle>
            <CardDescription>Dados pessoais e informacoes da conta.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={profileHref}>Abrir perfil</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-uzzai-mint" />
              Grupo
            </CardTitle>
            <CardDescription>Regras, convites, membros e preferencias do grupo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={groupSettingsHref}>Abrir grupo</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ticket className="h-5 w-5 text-uzzai-blue" />
              Convites
            </CardTitle>
            <CardDescription>Ver codigos, copiar link e compartilhar no WhatsApp.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={invitesHref}>Abrir convites</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-uzzai-gold" />
              Quota
            </CardTitle>
            <CardDescription>Saldo, historico e uso da quota da plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={quotaScopedHref}>Gerenciar quota</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {activeTab === "quota" && (
        <Card>
          <CardHeader>
            <CardTitle>Quota de Plataforma</CardTitle>
            <CardDescription>
              A quota e uma camada interna da plataforma e nao substitui cobrancas financeiras do grupo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Use esta area para acompanhar saldo de quota e ajustar consumo. Cobranca de atletas e pagamento PIX
              continuam no fluxo de financeiro.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={quotaHref}>Abrir painel de quota</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/credits/buy">Solicitar compra</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
