'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ButtonWithLoading, ButtonStatus } from '@/components/ui/button-with-loading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField } from '@/components/ui/form-field';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { toast } from 'sonner';
import { z } from 'zod';

interface ModalityFormData {
  name: string;
  icon?: string;
  color?: string;
  trainingsPerWeek?: number;
  description?: string;
}

interface ModalityFormProps {
  groupId: string;
  initialData?: ModalityFormData;
  modalityId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Schema de validação Zod
const modalitySchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(50, 'Nome deve ter no máximo 50 caracteres'),
  icon: z.string().max(2, 'Ícone deve ter no máximo 2 caracteres').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)').optional(),
  trainingsPerWeek: z.number().min(0, 'Treinos por semana deve ser maior ou igual a 0').max(7, 'Treinos por semana deve ser menor ou igual a 7').optional(),
  description: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
});

export function ModalityForm({
  groupId,
  initialData,
  modalityId,
  onSuccess,
  onCancel,
}: ModalityFormProps) {
  const { handleError } = useErrorHandler();
  const [submitStatus, setSubmitStatus] = useState<ButtonStatus>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<ModalityFormData>({
    name: initialData?.name || '',
    icon: initialData?.icon || '⚽',
    color: initialData?.color || '#10b981',
    trainingsPerWeek: initialData?.trainingsPerWeek || 2,
    description: initialData?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitStatus('loading');

    try {
      // Validação com Zod
      const validation = modalitySchema.safeParse(formData);
      
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        setSubmitStatus('error');
        
        // Mostrar primeiro erro no toast
        const firstError = validation.error.errors[0];
        toast.error('Dados inválidos', {
          description: firstError.message,
        });
        
        setTimeout(() => setSubmitStatus('idle'), 2000);
        return;
      }

      const url = modalityId
        ? `/api/modalities/${modalityId}`
        : '/api/modalities';

      const method = modalityId ? 'PATCH' : 'POST';

      const body = modalityId
        ? validation.data
        : { ...validation.data, groupId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar modalidade');
      }

      setSubmitStatus('success');
      
      toast.success(
        modalityId ? 'Modalidade atualizada!' : 'Modalidade criada!'
      );

      // Chamar onSuccess após 1 segundo
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (error) {
      setSubmitStatus('error');
      
      handleError(error, {
        onRetry: () => handleSubmit(e as any),
      });

      // Reset status após 3 segundos
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Nome */}
        <FormField
          label="Nome da Modalidade"
          required
          error={errors.name}
          hint="Mínimo 3 caracteres, máximo 50"
        >
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder="Ex: Futebol, Basquete, Vôlei..."
            required
            maxLength={50}
            disabled={submitStatus === 'loading'}
            className={errors.name ? 'border-destructive' : ''}
          />
        </FormField>

        {/* Ícone e Cor */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Ícone (Emoji)"
            error={errors.icon}
            hint="Máximo 2 caracteres"
          >
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => {
                setFormData({ ...formData, icon: e.target.value });
                if (errors.icon) setErrors({ ...errors, icon: '' });
              }}
              placeholder="⚽"
              maxLength={2}
              disabled={submitStatus === 'loading'}
              className={errors.icon ? 'border-destructive' : ''}
            />
          </FormField>

          <FormField
            label="Cor"
            error={errors.color}
            hint="Formato hexadecimal (#RRGGBB)"
          >
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => {
                  setFormData({ ...formData, color: e.target.value });
                  if (errors.color) setErrors({ ...errors, color: '' });
                }}
                disabled={submitStatus === 'loading'}
                className="h-10 w-20"
              />
              <Input
                value={formData.color}
                onChange={(e) => {
                  setFormData({ ...formData, color: e.target.value });
                  if (errors.color) setErrors({ ...errors, color: '' });
                }}
                placeholder="#10b981"
                disabled={submitStatus === 'loading'}
                className={errors.color ? 'border-destructive' : ''}
              />
            </div>
          </FormField>
        </div>

        {/* Treinos por Semana */}
        <FormField
          label="Treinos por Semana"
          error={errors.trainingsPerWeek}
          hint="Entre 0 e 7 treinos"
        >
          <Input
            id="trainingsPerWeek"
            type="number"
            min={0}
            max={7}
            value={formData.trainingsPerWeek}
            onChange={(e) => {
              setFormData({
                ...formData,
                trainingsPerWeek: parseInt(e.target.value) || 0,
              });
              if (errors.trainingsPerWeek) setErrors({ ...errors, trainingsPerWeek: '' });
            }}
            disabled={submitStatus === 'loading'}
            className={errors.trainingsPerWeek ? 'border-destructive' : ''}
          />
        </FormField>

        {/* Descrição */}
        <FormField
          label="Descrição"
          error={errors.description}
          hint={`${formData.description?.length || 0}/500 caracteres`}
        >
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            placeholder="Descrição opcional da modalidade..."
            maxLength={500}
            rows={4}
            disabled={submitStatus === 'loading'}
            className={errors.description ? 'border-destructive' : ''}
          />
        </FormField>
      </div>

      {/* Ações */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitStatus === 'loading'}
          >
            Cancelar
          </Button>
        )}
        <ButtonWithLoading
          type="submit"
          status={submitStatus}
          idleText={modalityId ? 'Atualizar Modalidade' : 'Criar Modalidade'}
          loadingText={modalityId ? 'Atualizando...' : 'Criando...'}
          successText={modalityId ? 'Atualizado!' : 'Criado!'}
          errorText="Tentar Novamente"
        />
      </div>
    </form>
  );
}
