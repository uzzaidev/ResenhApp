"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface Notification {
  id: string;
  code?: string;
  type: string;
  title: string;
  message: string;
  action_url?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  related_type?: string | null;
  related_id?: string | null;
}

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook para gerenciar notificações com polling automático
 * 
 * @param pollingInterval Intervalo de polling em milissegundos (padrão: 30000 = 30s)
 * @param enabled Se o polling deve estar ativo (padrão: true)
 * 
 * @example
 * const { notifications, unreadCount, markAsRead } = useNotifications();
 */
export function useNotifications(
  pollingInterval: number = 30000,
  enabled: boolean = true
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/notifications");

      if (!response.ok) {
        if (response.status === 401) {
          // Não autenticado - não é um erro crítico
          setNotifications([]);
          setUnreadCount(0);
          setIsLoading(false);
          return;
        }
        throw new Error("Erro ao buscar notificações");
      }

      const data = await response.json();
      
      // Mapear para o formato esperado
      const mappedNotifications: Notification[] = (data.notifications || []).map((n: any) => ({
        id: String(n.id),
        code: n.code,
        type: n.type || 'general',
        title: n.title || '',
        message: n.body || n.message || '',
        action_url: n.action_url,
        is_read: n.is_read || false,
        read_at: n.read_at,
        created_at: n.created_at,
        related_type: n.related_type,
        related_id: n.related_id ? String(n.related_id) : null,
      }));

      setNotifications(mappedNotifications);
      setUnreadCount(data.unreadCount || 0);
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro desconhecido");
      setError(error);
      setIsLoading(false);
      console.error("Error fetching notifications:", error);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Erro ao marcar notificação como lida");
      }

      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro ao marcar como lida");
      toast.error("Erro", {
        description: error.message,
      });
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?action=mark-all-read", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erro ao marcar todas como lidas");
      }

      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
      setUnreadCount(0);

      toast.success("Todas as notificações foram marcadas como lidas");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro ao marcar todas como lidas");
      toast.error("Erro", {
        description: error.message,
      });
      throw error;
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir notificação");
      }

      // Atualizar estado local
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => {
        const notification = notifications.find((n) => n.id === id);
        return notification && !notification.is_read ? Math.max(0, prev - 1) : prev;
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro ao excluir notificação");
      toast.error("Erro", {
        description: error.message,
      });
      throw error;
    }
  }, [notifications]);

  // Polling
  useEffect(() => {
    if (!enabled) return;

    // Buscar imediatamente
    fetchNotifications();

    // Configurar polling
    const interval = setInterval(() => {
      fetchNotifications();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchNotifications, pollingInterval, enabled]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}

