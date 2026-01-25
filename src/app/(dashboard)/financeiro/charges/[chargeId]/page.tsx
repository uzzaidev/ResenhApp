import { getCurrentUser } from "@/lib/auth-helpers";
import { sql } from "@/db/client";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle2, Calendar, DollarSign, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PixPaymentCard } from "@/components/financial/pix-payment-card";

type ChargeDetailsPageProps = {
  params: Promise<{ chargeId: string }>;
};

export default async function ChargeDetailsPage({ params }: ChargeDetailsPageProps) {
  const { chargeId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Convert chargeId to bigint
  const chargeIdNum = BigInt(chargeId);

  // Fetch charge details
  const chargeQuery = await sql`
    SELECT 
      c.id,
      c.amount,
      c.description,
      c.due_date,
      c.status,
      c.pix_payload,
      c.qr_image_url,
      c.pix_generated_at,
      c.created_at,
      c.event_id,
      e.starts_at as event_date,
      e.group_id,
      rp.name as receiver_name,
      rp.pix_key,
      rp.pix_type,
      p.name as user_name
    FROM charges c
    LEFT JOIN events e ON c.event_id = e.id
    LEFT JOIN receiver_profiles rp ON c.receiver_profile_id = rp.id
    LEFT JOIN profiles p ON c.created_by = p.id
    WHERE c.id = ${chargeIdNum}
    LIMIT 1
  `;

  if (!chargeQuery || chargeQuery.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Cobrança não encontrada</h2>
              <p className="text-muted-foreground mb-4">
                A cobrança que você está procurando não existe ou foi removida.
              </p>
              <Button asChild>
                <a href="/financeiro">Voltar para Financeiro</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const charge = chargeQuery[0] as any;

  // Check if user has access to this charge
  // User can see if: they created it, they are in the group, or they have a charge_split
  const chargeSplitQuery = await sql`
    SELECT id, status, amount
    FROM charge_splits
    WHERE charge_id = ${chargeIdNum} AND user_id = ${user.id}
    LIMIT 1
  `;
  const chargeSplit = chargeSplitQuery[0] as any;

  const isOwner = charge.created_by === user.id;
  const hasSplit = !!chargeSplit;

  if (!isOwner && !hasSplit) {
    // Check if user is member of the group
    if (charge.group_id) {
      const membershipQuery = await sql`
        SELECT role FROM group_members
        WHERE group_id = ${charge.group_id} AND user_id = ${user.id}
        LIMIT 1
      `;
      const membership = membershipQuery[0] as any;

      if (!membership) {
        redirect("/financeiro");
      }
    } else {
      redirect("/financeiro");
    }
  }

  const amount = parseFloat(charge.amount);
  const dueDate = charge.due_date ? new Date(charge.due_date) : null;
  const isPaid = charge.status === "paid" || chargeSplit?.status === "paid";
  const isOverdue = dueDate && !isPaid && dueDate < new Date();

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Detalhes da Cobrança</h1>
          <p className="text-muted-foreground">
            {charge.description || "Cobrança de treino"}
          </p>
        </div>

        {/* Charge Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informações da Cobrança
              </CardTitle>
              <Badge
                variant={isPaid ? "default" : isOverdue ? "destructive" : "secondary"}
              >
                {isPaid ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Pago
                  </>
                ) : isOverdue ? (
                  "Vencido"
                ) : (
                  "Pendente"
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Valor</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(amount)}
                </p>
              </div>

              {dueDate && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Vencimento
                  </p>
                  <p className="text-lg font-semibold">
                    {format(dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}

              {charge.receiver_name && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Recebedor
                  </p>
                  <p className="text-lg">{charge.receiver_name}</p>
                </div>
              )}

              {charge.event_date && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Evento</p>
                  <p className="text-lg">
                    {format(new Date(charge.event_date), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pix Payment Card */}
        {!isPaid && (
          <PixPaymentCard
            chargeId={chargeId}
            amount={amount}
            pixPayload={charge.pix_payload}
            qrImageUrl={charge.qr_image_url}
            receiverName={charge.receiver_name}
            dueDate={dueDate}
          />
        )}

        {/* Paid Status */}
        {isPaid && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    Pagamento Confirmado
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Esta cobrança foi marcada como paga.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

