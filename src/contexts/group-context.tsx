"use client";

/**
 * Group Context - Gerenciamento de Grupo Atual
 * 
 * Contexto para gerenciar o grupo selecionado atualmente,
 * permitindo navegação e compartilhamento de estado entre páginas.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface Group {
  id: string;
  name: string;
  description?: string | null;
  groupType?: "athletic" | "pelada";
  parentGroupId?: string | null;
  role?: "admin" | "member";
  memberCount?: number;
}

interface GroupContextType {
  currentGroup: Group | null;
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  setCurrentGroup: (group: Group | null) => void;
  loadGroups: () => Promise<void>;
  switchGroup: (groupId: string) => Promise<void>;
  // Alias para compatibilidade com código existente
  userGroups: Group[];
  fetchUserGroups: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [currentGroup, setCurrentGroupState] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Carrega grupos do usuário
   */
  const loadGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/groups");
      if (!response.ok) {
        throw new Error("Erro ao carregar grupos");
      }

      const data = await response.json();
      const loadedGroups = data.groups || [];
      setGroups(loadedGroups);

      // Tentar carregar grupo salvo do localStorage
      const savedGroupId = typeof window !== 'undefined' 
        ? localStorage.getItem("currentGroupId") 
        : null;

      if (savedGroupId && loadedGroups.length > 0) {
        const savedGroup = loadedGroups.find((g: Group) => g.id === savedGroupId);
        if (savedGroup) {
          setCurrentGroupState(savedGroup);
          return;
        }
      }

      // Se não há grupo atual e há grupos disponíveis, seleciona o primeiro
      if (!currentGroup && loadedGroups.length > 0) {
        const firstGroup = loadedGroups[0];
        setCurrentGroupState(firstGroup);
        
        // Persiste no localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem("currentGroupId", firstGroup.id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Error loading groups:", err);
      toast.error("Erro ao carregar grupos");
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup]);

  /**
   * Define grupo atual
   */
  const setCurrentGroup = useCallback((group: Group | null) => {
    setCurrentGroupState(group);
    
    if (group) {
      localStorage.setItem("currentGroupId", group.id);
    } else {
      localStorage.removeItem("currentGroupId");
    }
  }, []);

  /**
   * Troca de grupo
   */
  const switchGroup = useCallback(async (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      try {
        // Atualizar no servidor (cookie)
        const response = await fetch("/api/groups/switch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupId }),
        });

        if (!response.ok) {
          throw new Error("Erro ao alternar grupo");
        }

        // Atualizar estado local
        setCurrentGroup(group);
        toast.success(`Grupo alterado para: ${group.name}`);
        
        // Se estiver em uma página específica de grupo, redireciona para dashboard
        if (pathname?.includes("/groups/")) {
          router.push("/dashboard");
        } else {
          // Refresh para atualizar Server Components
          router.refresh();
        }
      } catch (error) {
        console.error("Error switching group:", error);
        toast.error("Erro ao alternar grupo");
      }
    }
  }, [groups, pathname, router, setCurrentGroup]);

  // Alias para compatibilidade
  const fetchUserGroups = loadGroups;
  const userGroups = groups;

  /**
   * Carrega grupos na montagem do componente
   */
  useEffect(() => {
    loadGroups();
  }, []);

  const value: GroupContextType = {
    currentGroup,
    groups,
    isLoading,
    error,
    setCurrentGroup,
    loadGroups,
    switchGroup,
    // Aliases para compatibilidade
    userGroups,
    fetchUserGroups,
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

/**
 * Hook para usar o GroupContext
 */
export function useGroup() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
}

