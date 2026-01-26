'use client';

import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonStatus = 'idle' | 'loading' | 'success' | 'error';

interface ButtonWithLoadingProps extends Omit<ButtonProps, 'children'> {
  status?: ButtonStatus;
  idleText: string;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  children?: React.ReactNode;
  onStatusChange?: (status: ButtonStatus) => void;
}

/**
 * Botão com estados de loading, success e error
 * 
 * Uso:
 * ```tsx
 * <ButtonWithLoading
 *   status={status}
 *   idleText="Confirmar Presença"
 *   loadingText="Confirmando..."
 *   successText="Confirmado!"
 *   errorText="Tentar Novamente"
 *   onClick={handleClick}
 * />
 * ```
 */
export function ButtonWithLoading({
  status = 'idle',
  idleText,
  loadingText,
  successText,
  errorText,
  children,
  className,
  onStatusChange,
  ...props
}: ButtonWithLoadingProps) {
  // Determinar texto baseado no status
  const getText = () => {
    switch (status) {
      case 'loading':
        return loadingText || 'Carregando...';
      case 'success':
        return successText || 'Concluído!';
      case 'error':
        return errorText || 'Erro';
      default:
        return idleText;
    }
  };

  // Determinar ícone baseado no status
  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="mr-2 h-4 w-4" />;
      case 'error':
        return <AlertCircle className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  // Determinar se está desabilitado
  const isDisabled = status === 'loading' || status === 'success' || (props as any).disabled;

  // Determinar variante baseado no status
  const getVariant = (): ButtonProps['variant'] => {
    if (status === 'success') return 'default';
    if (status === 'error') return 'destructive';
    return props.variant;
  };

  return (
    <Button
      {...props}
      variant={getVariant()}
      disabled={isDisabled}
      className={cn(
        'transition-all duration-200',
        status === 'success' && 'bg-green-600 hover:bg-green-700',
        status === 'error' && 'bg-red-600 hover:bg-red-700',
        className
      )}
    >
      {getIcon()}
      {children || getText()}
    </Button>
  );
}

