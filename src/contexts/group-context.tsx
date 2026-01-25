"use client";

/**
 * Group Context - Gerenciamento de Grupo Atual
 * 
 * Contexto para gerenciar o grupo selecionado atualmente,
 * permitindo navegação e compartilhamento de estado entre páginas.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

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
      setGroups(data.groups || []);

      // Se não há grupo atual e há grupos disponíveis, seleciona o primeiro
      if (!currentGroup && data.groups && data.groups.length > 0) {
        const firstGroup = data.groups[0];
        setCurrentGroupState(firstGroup);
        
        // Persiste no localStorage
        localStorage.setItem("currentGroupId", firstGroup.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      console.error("Error loading groups:", err);
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
      setCurrentGroup(group);
      
      // Se estiver em uma página específica de grupo, redireciona para dashboard
      if (pathname?.includes("/groups/")) {
        router.push("/dashboard");
      }
    }
  }, [groups, pathname, router, setCurrentGroup]);

  /**
   * Carrega grupo salvo do localStorage na inicialização
   */
  useEffect(() => {
    const savedGroupId = localStorage.getItem("currentGroupId");
    
    if (savedGroupId && groups.length > 0) {
      const savedGroup = groups.find((g) => g.id === savedGroupId);
      if (savedGroup && savedGroup.id !== currentGroup?.id) {
        setCurrentGroupState(savedGroup);
      }
    }
  }, [groups, currentGroup]);

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

