"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Building2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ParentGroup {
  id: string;
  name: string;
  groupType: string;
}

export function CreateGroupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingParents, setLoadingParents] = useState(false);
  const [availableParents, setAvailableParents] = useState<ParentGroup[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    privacy: "private",
    groupType: "pelada" as "athletic" | "pelada",
    parentGroupId: "" as string | undefined,
  });

  // Load available parent groups (atléticas where user is admin)
  useEffect(() => {
    async function loadParentGroups() {
      setLoadingParents(true);
      try {
        const response = await fetch("/api/groups/managed");
        if (response.ok) {
          const data = await response.json();
          // Filter only athletic groups (can have children)
          const athletics = data.groups?.filter(
            (g: ParentGroup) => g.groupType === "athletic"
          ) || [];
          setAvailableParents(athletics);
        }
      } catch (error) {
        console.error("Error loading parent groups:", error);
      } finally {
        setLoadingParents(false);
      }
    }

    loadParentGroups();
  }, []);

  // Reset parentGroupId when changing to athletic
  useEffect(() => {
    if (formData.groupType === "athletic") {
      setFormData((prev) => ({ ...prev, parentGroupId: undefined }));
    }
  }, [formData.groupType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        parentGroupId: formData.parentGroupId || undefined,
      };

      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar grupo");
      }

      const groupTypeLabel = formData.groupType === "athletic" ? "Atlética" : "Pelada";

      toast({
        title: `${groupTypeLabel} criada com sucesso!`,
        description: `Código de convite: ${data.group.inviteCode}`,
      });

      // Redirect to the new group page
      router.push(`/groups/${data.group.id}`);
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
          <CardTitle>Informações do Grupo</CardTitle>
          <CardDescription>
            Preencha os dados do seu novo grupo de futebol
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Group Type Selector */}
          <div className="space-y-2">
            <Label htmlFor="groupType">Tipo de Grupo *</Label>
            <Select
              value={formData.groupType}
              onValueChange={(value: "athletic" | "pelada") =>
                setFormData({ ...formData, groupType: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="groupType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="athletic">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Atlética</div>
                      <div className="text-xs text-muted-foreground">
                        Sistema completo + grupos filhos
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="pelada">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Pelada</div>
                      <div className="text-xs text-muted-foreground">
                        Grupo simples de futebol
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.groupType === "athletic"
                ? "Atléticas podem ter grupos filhos e acessar todas as features"
                : "Peladas são grupos simples, ideais para jogos casuais"}
            </p>
          </div>

          {/* Parent Group Selector (only for peladas) */}
          {formData.groupType === "pelada" && availableParents.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="parentGroupId">
                Atlética Pai (opcional)
              </Label>
              <Select
                value={formData.parentGroupId || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    parentGroupId: value === "none" ? undefined : value,
                  })
                }
                disabled={isLoading || loadingParents}
              >
                <SelectTrigger id="parentGroupId">
                  <SelectValue placeholder="Selecione uma atlética" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (independente)</SelectItem>
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
              <p className="text-xs text-muted-foreground">
                Vincular a uma atlética permite que admins dela gerenciem este grupo
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Grupo *</Label>
            <Input
              id="name"
              placeholder={
                formData.groupType === "athletic"
                  ? "Ex: Atlética de Computação"
                  : "Ex: Pelada do Fim de Semana"
              }
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva seu grupo de futebol..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isLoading}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacy">Privacidade</Label>
            <Select
              value={formData.privacy}
              onValueChange={(value) =>
                setFormData({ ...formData, privacy: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="privacy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Privado (somente com convite)</SelectItem>
                <SelectItem value="public">Público</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Card */}
          {formData.groupType === "athletic" && (
            <div className="rounded-lg border border-uzzai-mint/30 bg-uzzai-mint/5 p-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-uzzai-mint flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Recursos de Atléticas</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Criar grupos filhos (peladas)</li>
                    <li>• Gerenciar múltiplas modalidades</li>
                    <li>• Analytics avançados</li>
                    <li>• Hierarquia de permissões</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
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
