/**
 * Undo System - Helper para ações com desfazer
 * 
 * Sistema de undo para ações críticas com janela de 8 segundos.
 * Integra com sonner toasts para mostrar botão "Desfazer".
 * 
 * @example
 * const undo = await markAsPaidWithUndo(chargeId, groupId);
 * // Usuário tem 8 segundos para desfazer
 */

import { toast } from "sonner";

export interface UndoAction<T = any> {
  execute: () => Promise<T>;
  undo: () => Promise<void>;
  successMessage: string;
  undoMessage?: string;
  duration?: number; // Duração em ms (padrão: 8000 = 8s)
}

/**
 * Executa uma ação com possibilidade de desfazer
 * 
 * @param action Ação com execute e undo
 * @returns Resultado da ação executada
 */
export async function executeWithUndo<T = any>(
  action: UndoAction<T>
): Promise<T> {
  const duration = action.duration || 8000; // 8 segundos padrão
  let isUndone = false;
  let undoTimeout: NodeJS.Timeout | null = null;

  try {
    // Executar ação
    const result = await action.execute();

    // Criar toast com botão de desfazer
    const toastId = toast.success(action.successMessage, {
      description: "Você pode desfazer esta ação nos próximos 8 segundos.",
      duration: duration,
      action: {
        label: "Desfazer",
        onClick: async () => {
          isUndone = true;
          if (undoTimeout) {
            clearTimeout(undoTimeout);
          }

          try {
            await action.undo();
            toast.success(action.undoMessage || "Ação desfeita com sucesso!", {
              id: toastId,
            });
          } catch (error) {
            toast.error("Erro ao desfazer ação", {
              description: error instanceof Error ? error.message : "Erro desconhecido",
              id: toastId,
            });
          }
        },
      },
    });

    // Timeout para desabilitar undo após a duração
    undoTimeout = setTimeout(() => {
      if (!isUndone) {
        // Remover botão de desfazer após timeout
        toast.dismiss(toastId);
      }
    }, duration);

    return result;
  } catch (error) {
    if (undoTimeout) {
      clearTimeout(undoTimeout);
    }
    throw error;
  }
}

/**
 * Helper específico para marcar charge como pago com undo
 */
export async function markChargeAsPaidWithUndo(
  chargeId: string,
  groupId: string,
  currentStatus: string
): Promise<void> {
  return executeWithUndo({
    execute: async () => {
      const response = await fetch(`/api/groups/${groupId}/charges/${chargeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao marcar como pago");
      }

      return response.json();
    },
    undo: async () => {
      const response = await fetch(`/api/groups/${groupId}/charges/${chargeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: currentStatus || "pending" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao desfazer ação");
      }
    },
    successMessage: "Cobrança marcada como paga",
    undoMessage: "Status da cobrança restaurado",
    duration: 8000,
  });
}

/**
 * Helper específico para cancelar charge com undo
 */
export async function cancelChargeWithUndo(
  chargeId: string,
  groupId: string,
  currentStatus: string
): Promise<void> {
  return executeWithUndo({
    execute: async () => {
      const response = await fetch(`/api/groups/${groupId}/charges/${chargeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "canceled" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao cancelar cobrança");
      }

      return response.json();
    },
    undo: async () => {
      const response = await fetch(`/api/groups/${groupId}/charges/${chargeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: currentStatus || "pending" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao desfazer ação");
      }
    },
    successMessage: "Cobrança cancelada",
    undoMessage: "Cancelamento desfeito",
    duration: 8000,
  });
}

/**
 * Helper genérico para deletar com undo
 * 
 * @param deleteFn Função que deleta o item
 * @param restoreFn Função que restaura o item
 * @param itemName Nome do item para mensagens
 */
export async function deleteWithUndo<T = any>(
  deleteFn: () => Promise<T>,
  restoreFn: () => Promise<void>,
  itemName: string = "item"
): Promise<T> {
  return executeWithUndo({
    execute: deleteFn,
    undo: restoreFn,
    successMessage: `${itemName} excluído`,
    undoMessage: `${itemName} restaurado`,
    duration: 8000,
  });
}

