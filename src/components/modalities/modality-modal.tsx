'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ModalityForm } from './modality-form';

interface ModalityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  modality?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    trainingsPerWeek?: number;
    description?: string;
  };
  onSuccess?: () => void;
}

export function ModalityModal({
  open,
  onOpenChange,
  groupId,
  modality,
  onSuccess,
}: ModalityModalProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {modality ? 'Editar Modalidade' : 'Nova Modalidade'}
          </DialogTitle>
          <DialogDescription>
            {modality
              ? 'Atualize as informações da modalidade esportiva.'
              : 'Crie uma nova modalidade esportiva para o grupo.'}
          </DialogDescription>
        </DialogHeader>

        <ModalityForm
          groupId={groupId}
          modalityId={modality?.id}
          initialData={
            modality
              ? {
                  name: modality.name,
                  icon: modality.icon,
                  color: modality.color,
                  trainingsPerWeek: modality.trainingsPerWeek,
                  description: modality.description,
                }
              : undefined
          }
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
