"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ButtonWithLoading, ButtonStatus } from "@/components/ui/button-with-loading";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";

type EventFormProps = {
  groupId: string;
  mode: "create" | "edit";
  eventId?: string;
  initialData?: {
    startsAt: string;
    maxPlayers: number;
    maxGoalkeepers: number;
    waitlistEnabled: boolean;
  };
};

export function EventForm({ groupId, mode, eventId, initialData }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const [submitStatus, setSubmitStatus] = useState<ButtonStatus>('idle');

  // Format datetime for input (needs to be in local time for datetime-local input)
  const formatDateTimeLocal = (isoString?: string) => {
    if (!isoString) {
      // Default to tomorrow at 18:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      return tomorrow.toISOString().slice(0, 16);
    }
    return new Date(isoString).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    startsAt: formatDateTimeLocal(initialData?.startsAt),
    maxPlayers: initialData?.maxPlayers || 10,
    maxGoalkeepers: initialData?.maxGoalkeepers || 2,
    waitlistEnabled: initialData?.waitlistEnabled ?? true,
    // SPRINT 2: Payment fields
    hasCharge: false,
    price: "",
    receiverProfileId: "",
    autoChargeOnRsvp: true,
  });

  const [isChargeSectionOpen, setIsChargeSectionOpen] = useState(false);
  const [receiverProfiles, setReceiverProfiles] = useState<Array<{
    id: string;
    name: string;
    pixKey: string;
    pixType: string;
  }>>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // Carregar receiver profiles do grupo
  useEffect(() => {
    async function loadReceiverProfiles() {
      if (!formData.hasCharge) return;

      setIsLoadingProfiles(true);
      try {
        const response = await fetch(`/api/groups/${groupId}/receiver-profiles`);
        if (response.ok) {
          const data = await response.json();
          setReceiverProfiles(data.receiverProfiles || []);
        }
      } catch (error) {
        console.error("Error loading receiver profiles:", error);
      } finally {
        setIsLoadingProfiles(false);
      }
    }

    loadReceiverProfiles();
  }, [groupId, formData.hasCharge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');

    try {
      const url = mode === "create" ? "/api/events" : `/api/events/${eventId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const body =
        mode === "create"
          ? {
              groupId,
              startsAt: new Date(formData.startsAt).toISOString(),
              maxPlayers: formData.maxPlayers,
              maxGoalkeepers: formData.maxGoalkeepers,
              waitlistEnabled: formData.waitlistEnabled,
              // SPRINT 2: Payment fields
              price: formData.hasCharge && formData.price ? parseFloat(formData.price) : null,
              receiverProfileId: formData.hasCharge && formData.receiverProfileId ? formData.receiverProfileId : null,
              autoChargeOnRsvp: formData.hasCharge ? formData.autoChargeOnRsvp : null,
            }
          : {
              startsAt: new Date(formData.startsAt).toISOString(),
              maxPlayers: formData.maxPlayers,
              maxGoalkeepers: formData.maxGoalkeepers,
              waitlistEnabled: formData.waitlistEnabled,
              price: formData.hasCharge && formData.price ? parseFloat(formData.price) : null,
              receiverProfileId: formData.hasCharge && formData.receiverProfileId ? formData.receiverProfileId : null,
              autoChargeOnRsvp: formData.hasCharge ? formData.autoChargeOnRsvp : null,
            };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erro ao ${mode === "create" ? "criar" : "atualizar"} evento`);
      }

      setSubmitStatus('success');

      toast({
        title: mode === "create" ? "Evento criado!" : "Evento atualizado!",
        description: `O evento foi ${mode === "create" ? "criado" : "atualizado"} com sucesso.`,
      });

      // Redirect to the event or group page após 1 segundo
      setTimeout(() => {
        if (mode === "create") {
          router.push(`/groups/${groupId}/events/${data.event.id}`);
        } else {
          router.push(`/groups/${groupId}/events/${eventId}`);
        }
      }, 1000);
    } catch (error) {
      setSubmitStatus('error');
      
      handleError(error, {
        eventId,
        onRetry: () => handleSubmit(e as any),
      });

      // Reset status após 3 segundos
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Novo Evento" : "Editar Evento"}</CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Configure os detalhes do novo evento"
              : "Atualize os detalhes do evento"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startsAt">Data e Hora *</Label>
            <Input
              id="startsAt"
              type="datetime-local"
              value={formData.startsAt}
              onChange={(e) =>
                setFormData({ ...formData, startsAt: e.target.value })
              }
              required
              disabled={submitStatus === 'loading'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Máximo de Jogadores *</Label>
              <Input
                id="maxPlayers"
                type="number"
                min="4"
                max="30"
                value={formData.maxPlayers}
                onChange={(e) =>
                  setFormData({ ...formData, maxPlayers: parseInt(e.target.value, 10) })
                }
                required
                disabled={submitStatus === 'loading'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxGoalkeepers">Máximo de Goleiros *</Label>
              <Input
                id="maxGoalkeepers"
                type="number"
                min="0"
                max="4"
                value={formData.maxGoalkeepers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxGoalkeepers: parseInt(e.target.value, 10),
                  })
                }
                required
                disabled={submitStatus === 'loading'}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="waitlistEnabled"
              type="checkbox"
              checked={formData.waitlistEnabled}
              onChange={(e) =>
                setFormData({ ...formData, waitlistEnabled: e.target.checked })
              }
              disabled={submitStatus === 'loading'}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="waitlistEnabled" className="cursor-pointer">
              Habilitar lista de espera
            </Label>
          </div>

          {/* SPRINT 2: Payment Section */}
          <div className="pt-4 border-t">
            <Collapsible open={isChargeSectionOpen} onOpenChange={setIsChargeSectionOpen}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasCharge"
                      checked={formData.hasCharge}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        setFormData({
                          ...formData,
                          hasCharge: isChecked,
                          price: isChecked ? formData.price : "",
                          receiverProfileId: isChecked ? formData.receiverProfileId : "",
                        });
                        if (isChecked) setIsChargeSectionOpen(true);
                      }}
                      disabled={submitStatus === 'loading'}
                    />
                    <Label htmlFor="hasCharge" className="cursor-pointer flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Este treino tem cobrança
                    </Label>
                  </div>
                  {formData.hasCharge && (
                    isChargeSectionOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </div>
              </CollapsibleTrigger>

              {formData.hasCharge && (
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço por atleta (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="20.00"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required={formData.hasCharge}
                      disabled={submitStatus === 'loading'}
                    />
                    <p className="text-xs text-muted-foreground">
                      Valor que cada atleta pagará ao confirmar presença
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiverProfileId">Quem recebe</Label>
                    {isLoadingProfiles ? (
                      <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                        Carregando perfis...
                      </div>
                    ) : (
                      <select
                        id="receiverProfileId"
                        value={formData.receiverProfileId}
                        onChange={(e) =>
                          setFormData({ ...formData, receiverProfileId: e.target.value })
                        }
                        disabled={submitStatus === 'loading' || isLoadingProfiles}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Selecione quem recebe...</option>
                        {receiverProfiles.length === 0 ? (
                          <option value="" disabled>
                            Nenhum perfil configurado. Configure em Configurações do Grupo.
                          </option>
                        ) : (
                          receiverProfiles.map((profile) => (
                            <option key={profile.id} value={profile.id}>
                              {profile.name} ({profile.pixType}: {profile.pixKey})
                            </option>
                          ))
                        )}
                      </select>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Perfil que receberá os pagamentos via Pix
                    </p>
                    {receiverProfiles.length === 0 && formData.hasCharge && (
                      <p className="text-xs text-amber-600">
                        ⚠️ Configure um receiver profile nas configurações do grupo primeiro
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="autoChargeOnRsvp"
                      type="checkbox"
                      checked={formData.autoChargeOnRsvp}
                      onChange={(e) =>
                        setFormData({ ...formData, autoChargeOnRsvp: e.target.checked })
                      }
                      disabled={submitStatus === 'loading'}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="autoChargeOnRsvp" className="cursor-pointer">
                      Gerar cobrança automaticamente ao confirmar presença
                    </Label>
                  </div>

                  {formData.price && parseFloat(formData.price) > 0 && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Preview:</p>
                      <p className="text-xs text-muted-foreground">
                        Ao confirmar presença, será gerada uma cobrança de{" "}
                        <span className="font-semibold">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(parseFloat(formData.price))}
                        </span>{" "}
                        por atleta
                      </p>
                    </div>
                  )}
                </CollapsibleContent>
              )}
            </Collapsible>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitStatus === 'loading'}
          >
            Cancelar
          </Button>
          <ButtonWithLoading
            type="submit"
            status={submitStatus}
            idleText={mode === "create" ? "Criar Evento" : "Salvar Alterações"}
            loadingText={mode === "create" ? "Criando..." : "Salvando..."}
            successText={mode === "create" ? "Criado!" : "Salvo!"}
            errorText="Tentar Novamente"
          />
        </CardFooter>
      </form>
    </Card>
  );
}
