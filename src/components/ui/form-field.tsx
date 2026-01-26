'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * FormField - Campo de formulário com label, erro e hint
 * 
 * Uso:
 * ```tsx
 * <FormField
 *   label="Nome"
 *   required
 *   error={errors.name?.message}
 *   hint="Mínimo 3 caracteres"
 * >
 *   <Input {...register('name')} />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  required = false,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={undefined} className={cn(error && 'text-destructive')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {/* Campo com borda vermelha se houver erro */}
      <div className={cn(
        'relative',
        error && 'ring-1 ring-destructive rounded-md'
      )}>
        {children}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="flex items-center gap-1 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Hint (dica) quando não há erro */}
      {!error && hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

