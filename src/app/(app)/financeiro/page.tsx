import { redirect } from "next/navigation";
import Link from "next/link";
import { DollarSign, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserCurrentGroup } from "@/lib/group-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyStateServer } from "@/components/ui/empty-state-server";
import { PaymentsContent } from "@/components/payments/payments-content";

export default async function FinanceiroPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const currentGroup = await getUserCurrentGroup(user.id);
  const groupId = currentGroup?.id || null;

  if (!groupId) {
    return (
      <div className="space-y-6">
        <EmptyStateServer
          icon={Users}
          title="Voce nao faz parte de nenhum grupo"
          description="Entre em um grupo para acessar o financeiro"
          action={{
            label: "Entrar em grupo",
            href: "/grupos/join",
          }}
        />
      </div>
    );
  }

  const isAdmin = currentGroup?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="mt-1 text-muted-foreground">
            Cobrancas, pagamentos e conciliacao do grupo ativo.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/grupos/${groupId}/pagamentos`}>Abrir visao completa</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {currentGroup?.name || "Grupo ativo"}
          </CardTitle>
          <CardDescription>
            Use este painel para acompanhar pendencias e registrar pagamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentsContent groupId={groupId} isAdmin={isAdmin} />
        </CardContent>
      </Card>
    </div>
  );
}
