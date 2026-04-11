"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Building2, Users, AlertTriangle } from "lucide-react";

interface ParentGroup {
  id: string;
  name: string;
  groupType: string;
  rawGroupType?: string;
  role?: string;
}

type GroupType = "atletica" | "modality_group" | "standalone";

export function CreateGroupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [quotaIssue, setQuotaIssue] = useState<{
    message: string;
    requiredCredits?: number;
    currentBalance?: number;
  } | null>(null);
  const [loadingParents, setLoadingParents] = useState(false);
  const [availableParents, setAvailableParents] = useState<ParentGroup[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    privacy: "private",
    groupType: "standalone" as GroupType,
    parentGroupId: "" as string | undefined,
  });

  const loadParentGroups = async () => {
    setLoadingParents(true);
    try {
      const managedResponse = await fetch("/api/groups/managed");
      let athletics: ParentGroup[] = [];

      if (managedResponse.ok) {
        const data = await managedResponse.json();
        athletics =
          data.groups?.filter(
            (g: ParentGroup) =>
              g.groupType === "atletica" ||
              g.groupType === "athletic" ||
              g.rawGroupType === "athletic"
          ) || [];
      }

      if (athletics.length === 0) {
        const groupsResponse = await fetch("/api/groups");
        if (groupsResponse.ok) {
          const data = await groupsResponse.json();
          athletics =
            data.groups?.filter(
              (g: ParentGroup) =>
                (g.groupType === "atletica" || g.rawGroupType === "athletic") &&
                g.role === "admin"
            ) || [];
        }
      }

      setAvailableParents(athletics);
    } catch (error) {
      console.error("Error loading parent groups:", error);
    } finally {
      setLoadingParents(false);
    }
  };

  useEffect(() => {
    loadParentGroups();
  }, []);

  useEffect(() => {
    if (formData.groupType !== "modality_group") {
      setFormData((prev) => ({ ...prev, parentGroupId: undefined }));
    }
  }, [formData.groupType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setQuotaIssue(null);

    try {
      const payload = {
        ...formData,
        parentGroupId: formData.parentGroupId || undefined,
      };

      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 402) {
          const normalizedMessage = String(
            data.error || "Quota insuficiente para criar grupo."
          ).replace(/cr[eé]ditos?/gi, "quota");
          setQuotaIssue({
            message: normalizedMessage,
            requiredCredits:
              typeof data.requiredCredits === "number" ? data.requiredCredits : undefined,
            currentBalance:
              typeof data.currentBalance === "number" ? data.currentBalance : undefined,
          });
          toast({
            title: "Quota insuficiente",
            description: "Compre quota antes de criar um novo grupo.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.error || "Erro ao criar grupo");
      }

      const groupTypeLabel =
        formData.groupType === "atletica"
          ? "Atletica"
          : formData.groupType === "modality_group"
            ? "Grupo de Modalidade"
            : "Grupo Independente";

      toast({
        title: `${groupTypeLabel} criado com sucesso!`,
        description: `Codigo de convite: ${data.group.inviteCode}`,
      });

      router.push(`/grupos/${data.group.id}`);
    } catch (error) {
      toast({
        title: "Erro ao criar grupo",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Informacoes do Grupo</CardTitle>
          <CardDescription>Defina o tipo e os dados do novo grupo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quotaIssue && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Quota insuficiente para criacao</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{quotaIssue.message}</p>
                {typeof quotaIssue.requiredCredits === "number" &&
                  typeof quotaIssue.currentBalance === "number" && (
                    <p>
                      Necessario: {quotaIssue.requiredCredits} quota(s) | Disponivel:{" "}
                      {quotaIssue.currentBalance} quota(s)
                    </p>
                  )}
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/configuracoes?tab=quota">Gerenciar quota</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/credits/buy">Solicitar compra</Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="groupType">Tipo de Grupo *</Label>
            <Select
              value={formData.groupType}
              onValueChange={(value: GroupType) => setFormData({ ...formData, groupType: value })}
              disabled={isLoading}
            >
              <SelectTrigger id="groupType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atletica">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Atletica</div>
                      <div className="text-xs text-muted-foreground">Tenant principal</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="modality_group">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Grupo de Modalidade</div>
                      <div className="text-xs text-muted-foreground">
                        Vinculado a uma atletica
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="standalone">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Grupo Independente</div>
                      <div className="text-xs text-muted-foreground">Sem atletica pai</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.groupType === "modality_group" && (
            <div className="space-y-2">
              <Label htmlFor="parentGroupId">Atletica Pai *</Label>
              {availableParents.length > 0 ? (
                <Select
                  value={formData.parentGroupId || ""}
                  onValueChange={(value) => setFormData({ ...formData, parentGroupId: value })}
                  disabled={isLoading || loadingParents}
                >
                  <SelectTrigger id="parentGroupId">
                    <SelectValue placeholder="Selecione uma atletica" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableParents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {parent.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  Nenhuma atletica administrada encontrada para vincular.
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadParentGroups}
                      disabled={loadingParents}
                    >
                      Recarregar Lista
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, groupType: "atletica" }))}
                    >
                      Criar Atletica Primeiro
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Grupo *</Label>
            <Input
              id="name"
              placeholder={
                formData.groupType === "atletica"
                  ? "Ex: Atletica de Computacao"
                  : formData.groupType === "modality_group"
                    ? "Ex: Futebol Society - Segunda"
                    : "Ex: Pelada do Fim de Semana"
              }
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              placeholder="Descreva o grupo..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacy">Privacidade</Label>
            <Select
              value={formData.privacy}
              onValueChange={(value) => setFormData({ ...formData, privacy: value })}
              disabled={isLoading}
            >
              <SelectTrigger id="privacy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Privado (somente convite)</SelectItem>
                <SelectItem value="public">Publico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.groupType === "atletica" && (
            <div className="rounded-lg border border-uzzai-mint/30 bg-uzzai-mint/5 p-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-uzzai-mint flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Recursos de Atletica</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Criar grupos de modalidade</li>
                    <li>• Gerenciar multiplas modalidades</li>
                    <li>• Hierarquia de permissoes</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Grupo
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
