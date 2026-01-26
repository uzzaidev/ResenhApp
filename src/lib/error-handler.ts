/**
 * Error Handler - Categorização e tratamento de erros
 * 
 * Categoriza erros e fornece mensagens e ações contextuais para o usuário.
 */

export type ErrorCategory =
  | 'EVENT_FULL'
  | 'ALREADY_CONFIRMED'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorAction {
  label: string;
  onClick: () => void;
}

export interface CategorizedError {
  category: ErrorCategory;
  title: string;
  description: string;
  action?: ErrorAction;
  duration?: number;
}

/**
 * Categoriza um erro baseado em sua mensagem ou código
 */
export function categorizeError(error: unknown): CategorizedError {
  // Se for uma instância de Error, usar a mensagem
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Erros de rede
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      stack.includes('ECONNREFUSED') ||
      stack.includes('ENOTFOUND')
    ) {
      return {
        category: 'NETWORK_ERROR',
        title: 'Sem conexão',
        description: 'Verifique sua internet e tente novamente.',
        duration: 5000,
      };
    }

    // Erros de autenticação
    if (
      message.includes('unauthorized') ||
      message.includes('não autenticado') ||
      message.includes('401')
    ) {
      return {
        category: 'UNAUTHORIZED',
        title: 'Sessão expirada',
        description: 'Faça login novamente para continuar.',
        duration: 5000,
      };
    }

    // Erros de permissão
    if (
      message.includes('forbidden') ||
      message.includes('sem permissão') ||
      message.includes('403') ||
      message.includes('não é membro')
    ) {
      return {
        category: 'FORBIDDEN',
        title: 'Sem permissão',
        description: 'Você não tem permissão para realizar esta ação.',
        duration: 5000,
      };
    }

    // Erros de validação
    if (
      message.includes('validation') ||
      message.includes('inválido') ||
      message.includes('required') ||
      message.includes('zod')
    ) {
      return {
        category: 'VALIDATION_ERROR',
        title: 'Dados inválidos',
        description: 'Verifique os campos preenchidos e tente novamente.',
        duration: 5000,
      };
    }

    // Erros de não encontrado
    if (
      message.includes('not found') ||
      message.includes('não encontrado') ||
      message.includes('404')
    ) {
      return {
        category: 'NOT_FOUND',
        title: 'Não encontrado',
        description: 'O recurso solicitado não foi encontrado.',
        duration: 5000,
      };
    }

    // Erros de servidor
    if (
      message.includes('server error') ||
      message.includes('erro do servidor') ||
      message.includes('500') ||
      message.includes('internal error')
    ) {
      return {
        category: 'SERVER_ERROR',
        title: 'Erro no servidor',
        description: 'Nossa equipe foi notificada. Tente novamente em alguns minutos.',
        duration: 7000,
      };
    }

    // Erros específicos do domínio
    if (message.includes('treino lotado') || message.includes('event full')) {
      return {
        category: 'EVENT_FULL',
        title: 'Treino lotado',
        description: 'Este treino já atingiu o número máximo de participantes.',
        duration: 5000,
      };
    }

    if (
      message.includes('já confirmou') ||
      message.includes('already confirmed')
    ) {
      return {
        category: 'ALREADY_CONFIRMED',
        title: 'Já confirmado',
        description: 'Você já confirmou presença neste treino.',
        duration: 3000,
      };
    }
  }

  // Erro desconhecido (fallback)
  return {
    category: 'UNKNOWN_ERROR',
    title: 'Algo deu errado',
    description: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    duration: 5000,
  };
}

/**
 * Cria ação contextual baseada na categoria do erro
 */
export function createErrorAction(
  category: ErrorCategory,
  context?: {
    eventId?: string;
    chargeId?: string;
    onRetry?: () => void;
    router?: any;
  }
): ErrorAction | undefined {
  switch (category) {
    case 'EVENT_FULL':
      if (context?.eventId && context?.router) {
        return {
          label: 'Ver lista de espera',
          onClick: () => context.router.push(`/treinos/${context.eventId}/waitlist`),
        };
      }
      break;

    case 'NETWORK_ERROR':
      if (context?.onRetry) {
        return {
          label: 'Tentar novamente',
          onClick: context.onRetry,
        };
      }
      break;

    case 'SERVER_ERROR':
      return {
        label: 'Contatar suporte',
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.open('/suporte', '_blank');
          }
        },
      };

    case 'UNAUTHORIZED':
      if (context?.router) {
        return {
          label: 'Fazer login',
          onClick: () => context.router.push('/auth/signin'),
        };
      }
      break;

    case 'NOT_FOUND':
      if (context?.router) {
        return {
          label: 'Voltar ao dashboard',
          onClick: () => context.router.push('/dashboard'),
        };
      }
      break;
  }

  return undefined;
}

/**
 * Handler principal de erros
 * 
 * Categoriza o erro, cria ação contextual e loga para monitoramento
 */
export function handleError(
  error: unknown,
  context?: {
    eventId?: string;
    chargeId?: string;
    userId?: string;
    onRetry?: () => void;
    router?: any;
  }
): CategorizedError {
  const categorized = categorizeError(error);
  
  // Adicionar ação contextual se disponível
  const action = createErrorAction(categorized.category, context);
  if (action) {
    categorized.action = action;
  }

  // Log para monitoramento com Sentry
  if (error instanceof Error) {
    // Importar Sentry dinamicamente (evita problemas de SSR)
    if (typeof window !== 'undefined') {
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error, {
          tags: {
            errorCategory: categorized.category,
          },
          extra: {
            context,
            title: categorized.title,
            description: categorized.description,
          },
        });
      }).catch(() => {
        // Se Sentry não estiver disponível, apenas logar
        if (process.env.NODE_ENV === 'development') {
          console.error('[Error Handler]', {
            category: categorized.category,
            error: error.message,
            context,
          });
        }
      });
    } else {
      // Server-side: usar logger
      const logger = require('./logger').default;
      logger.error(
        {
          category: categorized.category,
          error: error.message,
          stack: error.stack,
          context,
        },
        'Error handled'
      );
    }
  }

  return categorized;
}

