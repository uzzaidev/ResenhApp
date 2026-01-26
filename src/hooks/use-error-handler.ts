'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { handleError, CategorizedError } from '@/lib/error-handler';

interface UseErrorHandlerOptions {
  eventId?: string;
  chargeId?: string;
  userId?: string;
  onRetry?: () => void;
}

/**
 * Hook para usar o error handler com toasts
 * 
 * Uso:
 * ```tsx
 * const { handleError: handleErrorWithToast } = useErrorHandler();
 * 
 * try {
 *   await someAction();
 * } catch (error) {
 *   handleErrorWithToast(error, { eventId: '123' });
 * }
 * ```
 */
export function useErrorHandler() {
  const router = useRouter();

  const handleErrorWithToast = (
    error: unknown,
    options?: UseErrorHandlerOptions
  ) => {
    const categorized = handleError(error, {
      ...options,
      router,
    });

    // Mostrar toast com ação contextual
    if (categorized.action) {
      toast.error(categorized.title, {
        description: categorized.description,
        action: {
          label: categorized.action.label,
          onClick: categorized.action.onClick,
        },
        duration: categorized.duration || 5000,
      });
    } else {
      toast.error(categorized.title, {
        description: categorized.description,
        duration: categorized.duration || 5000,
      });
    }

    return categorized;
  };

  return { handleError: handleErrorWithToast };
}

