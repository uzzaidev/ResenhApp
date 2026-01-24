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
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EditRatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  modalityId: string;
  modalityName: string;
  currentRating?: number;
  currentPositions?: string[];
  onSuccess?: () => void;
}

export function EditRatingModal({
  open,
  onOpenChange,
  userId,
  modalityId,
  modalityName,
  currentRating = 5,
  currentPositions = [],
  onSuccess,
}: EditRatingModalProps) {
  const [rating, setRating] = useState(currentRating);
  const [selectedPositions, setSelectedPositions] = useState<string[]>(currentPositions);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(currentRating);
      setSelectedPositions(currentPositions);
      fetchPositions();
    }
  }, [open, currentRating, currentPositions]);

  const fetchPositions = async () => {
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
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/athletes/${userId}/modalities/${modalityId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating,
            positions: selectedPositions.length > 0 ? selectedPositions : undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar');
      }

      toast.success('Rating atualizado!');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/athletes/${userId}/modalities/${modalityId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao remover');
      }

      toast.success('Modalidade removida!');
      setShowDeleteConfirm(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar {modalityName}</DialogTitle>
            <DialogDescription>
              Atualize o rating e posições preferidas do atleta.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="flex gap-3 justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover modalidade?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{modalityName}</strong> deste
              atleta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
