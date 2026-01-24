'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ModalityIcon } from '../modalities/modality-icon';

interface Modality {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  positions?: string[];
}

interface AddModalityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  groupId: string;
  onSuccess?: () => void;
}

export function AddModalityModal({
  open,
  onOpenChange,
  userId,
  groupId,
  onSuccess,
}: AddModalityModalProps) {
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [selectedModalityId, setSelectedModalityId] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const selectedModality = modalities.find((m) => m.id === selectedModalityId);

  useEffect(() => {
    if (open) {
      fetchModalities();
    }
  }, [open, groupId]);

  useEffect(() => {
    if (selectedModalityId) {
      fetchPositions(selectedModalityId);
    } else {
      setAvailablePositions([]);
      setSelectedPositions([]);
    }
  }, [selectedModalityId]);

  const fetchModalities = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`/api/modalities?groupId=${groupId}`);
      if (!response.ok) throw new Error('Erro ao carregar modalidades');

      const data = await response.json();
      setModalities(data.modalities || []);
    } catch (error) {
      toast.error('Erro ao carregar modalidades');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchPositions = async (modalityId: string) => {
    try {
      const response = await fetch(`/api/modalities/${modalityId}/positions`);
      if (!response.ok) throw new Error('Erro ao carregar posições');

      const data = await response.json();
      setAvailablePositions(data.positions || []);
    } catch (error) {
      setAvailablePositions([]);
    }
  };

  const togglePosition = (position: string) => {
    setSelectedPositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedModalityId) {
      toast.error('Selecione uma modalidade');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/athletes/${userId}/modalities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modalityId: selectedModalityId,
          rating,
          positions: selectedPositions.length > 0 ? selectedPositions : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao adicionar modalidade');
      }

      toast.success('Modalidade adicionada!');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Modalidade</DialogTitle>
          <DialogDescription>
            Vincule o atleta a uma nova modalidade esportiva.
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selecionar Modalidade */}
            <div className="space-y-2">
              <Label htmlFor="modality">
                Modalidade <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedModalityId}
                onValueChange={setSelectedModalityId}
                disabled={isLoading}
              >
                <SelectTrigger id="modality">
                  <SelectValue placeholder="Selecione uma modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {modalities.map((modality) => (
                    <SelectItem key={modality.id} value={modality.id}>
                      <div className="flex items-center gap-2">
                        {modality.icon && <span>{modality.icon}</span>}
                        {modality.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-10)</Label>
              <Select
                value={rating.toString()}
                onValueChange={(value) => setRating(parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger id="rating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                    <SelectItem key={r} value={r.toString()}>
                      {r} {r >= 8 ? '⭐' : r >= 6 ? '👍' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Posições */}
            {availablePositions.length > 0 && (
              <div className="space-y-2">
                <Label>Posições Preferidas</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg">
                  {availablePositions.map((position) => (
                    <div key={position} className="flex items-center space-x-2">
                      <Checkbox
                        id={`position-${position}`}
                        checked={selectedPositions.includes(position)}
                        onCheckedChange={() => togglePosition(position)}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={`position-${position}`}
                        className="text-sm cursor-pointer"
                      >
                        {position}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || !selectedModalityId}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Adicionar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
