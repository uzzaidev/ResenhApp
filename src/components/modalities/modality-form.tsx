'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

export function ModalityForm({
  groupId,
  initialData,
  modalityId,
  onSuccess,
  onCancel,
}: ModalityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ModalityFormData>({
    name: initialData?.name || '',
    icon: initialData?.icon || '⚽',
    color: initialData?.color || '#10b981',
    trainingsPerWeek: initialData?.trainingsPerWeek || 2,
    description: initialData?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = modalityId
        ? `/api/modalities/${modalityId}`
        : '/api/modalities';

      const method = modalityId ? 'PATCH' : 'POST';

      const body = modalityId
        ? formData
        : { ...formData, groupId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar modalidade');
      }

      toast.success(
        modalityId ? 'Modalidade atualizada!' : 'Modalidade criada!'
      );

      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Nome da Modalidade <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Ex: Futebol, Basquete, Vôlei..."
            required
            maxLength={50}
            disabled={isLoading}
          />
        </div>

        {/* Ícone e Cor */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="icon">Ícone (Emoji)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              placeholder="⚽"
              maxLength={2}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                disabled={isLoading}
                className="h-10 w-20"
              />
              <Input
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="#10b981"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Treinos por Semana */}
        <div className="space-y-2">
          <Label htmlFor="trainingsPerWeek">Treinos por Semana</Label>
          <Input
            id="trainingsPerWeek"
            type="number"
            min={0}
            max={7}
            value={formData.trainingsPerWeek}
            onChange={(e) =>
              setFormData({
                ...formData,
                trainingsPerWeek: parseInt(e.target.value) || 0,
              })
            }
            disabled={isLoading}
          />
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Descrição opcional da modalidade..."
            maxLength={500}
            rows={4}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            {formData.description?.length || 0}/500 caracteres
          </p>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {modalityId ? 'Atualizar' : 'Criar'} Modalidade
        </Button>
      </div>
    </form>
  );
}
