"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, LogIn, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ExistingGroup = {
  id: string;
  name: string;
  role?: "admin" | "member" | string;
};

type GroupSetupStepProps = {
  existingGroups: ExistingGroup[];
  returnTo?: string;
};

type Mode = "existing" | "create" | "join";

function getSafeReturnTo(path?: string): string | null {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

export function GroupSetupStep({ existingGroups, returnTo }: GroupSetupStepProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(existingGroups.length > 0 ? "existing" : "create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const safeReturnTo = useMemo(() => getSafeReturnTo(returnTo), [returnTo]);

  function buildStep3Href(groupId: string) {
    const params = new URLSearchParams({ groupId });
    if (safeReturnTo) {
      params.set("returnTo", safeReturnTo);
    }
    return `/onboarding/step/3?${params.toString()}`;
  }

  async function switchGroup(groupId: string) {
    const response = await fetch("/api/groups/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error || "Nao foi possivel definir o grupo ativo");
    }
  }

  async function continueWithGroup(groupId: string) {
    setError(null);
    setLoading(true);
    try {
      await switchGroup(groupId);
      router.push(buildStep3Href(groupId));
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Falha ao continuar");
      setLoading(false);
    }
  }

  async function handleCreateGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName,
          description: "",
          privacy: "private",
          groupType: "standalone",
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel criar o grupo");
      }

      const createdGroupId = data?.group?.id as string | undefined;
      if (!createdGroupId) {
        throw new Error("Grupo criado sem identificador retornado");
      }

      await switchGroup(createdGroupId);
      router.push(buildStep3Href(createdGroupId));
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Falha ao criar grupo");
      setLoading(false);
    }
  }

  async function handleJoinGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode.trim().toUpperCase() }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel entrar no grupo");
      }

      const joinedGroupId = data?.group?.id as string | undefined;
      if (!joinedGroupId) {
        throw new Error("Entrada no grupo concluida sem identificador retornado");
      }

      await switchGroup(joinedGroupId);
      router.push(buildStep3Href(joinedGroupId));
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Falha ao entrar no grupo");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {existingGroups.length > 0 && (
          <Button
            type="button"
            variant={mode === "existing" ? "default" : "outline"}
            onClick={() => setMode("existing")}
            disabled={loading}
          >
            <Users className="mr-2 h-4 w-4" />
            Usar Grupo Atual
          </Button>
        )}

        <Button
          type="button"
          variant={mode === "create" ? "default" : "outline"}
          onClick={() => setMode("create")}
          disabled={loading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Criar Grupo
        </Button>

        <Button
          type="button"
          variant={mode === "join" ? "default" : "outline"}
          onClick={() => setMode("join")}
          disabled={loading}
        >
          <LogIn className="mr-2 h-4 w-4" />
          Entrar com Convite
        </Button>
      </div>

      {mode === "existing" && existingGroups.length > 0 && (
        <div className="space-y-3">
          {existingGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <CardDescription>
                  Papel: {group.role === "admin" ? "Admin" : "Membro"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  onClick={() => continueWithGroup(group.id)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Continuando...
                    </>
                  ) : (
                    "Continuar com este grupo"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {mode === "create" && (
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Nome do grupo</Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              placeholder="Ex: Pelada de Quarta"
              minLength={3}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading || groupName.trim().length < 3} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Building2 className="mr-2 h-4 w-4" />
                Criar e Continuar
              </>
            )}
          </Button>
        </form>
      )}

      {mode === "join" && (
        <form onSubmit={handleJoinGroup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Codigo do convite</Label>
            <Input
              id="invite-code"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              placeholder="ABC123XYZ"
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading || inviteCode.trim().length < 4} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar e Continuar"
            )}
          </Button>
        </form>
      )}

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
