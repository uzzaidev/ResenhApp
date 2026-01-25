'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModalityCard } from '@/components/modalities/modality-card';
import { ModalityModal } from '@/components/modalities/modality-modal';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useGroup } from '@/contexts/group-context';
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

interface Modality {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  athletesCount: number;
  trainingsPerWeek?: number;
}

export default function ModalidadesPage() {
  const router = useRouter();
  const { currentGroup, isLoading: isLoadingGroup } = useGroup();
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingModality, setEditingModality] = useState<Modality | null>(null);
  const [deletingModalityId, setDeletingModalityId] = useState<string | null>(null);

  useEffect(() => {
    if (currentGroup?.id) {
      loadModalities();
    }
  }, [currentGroup?.id]);

  async function loadModalities() {
    if (!currentGroup?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/modalities?group_id=${currentGroup.id}`);
      if (!response.ok) throw new Error('Erro ao carregar modalidades');

      const data = await response.json();
      setModalities(data.modalities || []);
    } catch (error) {
      toast.error('Erro ao carregar modalidades');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingModalityId) return;

    try {
      const response = await fetch(`/api/modalities/${deletingModalityId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir');

      toast.success('Modalidade excluída com sucesso');
      setDeletingModalityId(null);
      loadModalities();
    } catch (error) {
      toast.error('Erro ao excluir modalidade');
    }
  }

  const handleEdit = (modality: Modality) => {
    setEditingModality(modality);
  };

  const handleCloseEditModal = () => {
    setEditingModality(null);
  };

  const totalAthletes = modalities.reduce((sum, m) => sum + (m.athletesCount || 0), 0);
  const avgTrainings =
    modalities.length > 0
      ? (
          modalities
            .filter((m) => m.trainingsPerWeek)
            .reduce((sum, m) => sum + (m.trainingsPerWeek || 0), 0) /
          modalities.filter((m) => m.trainingsPerWeek).length
        ).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modalidades</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as modalidades esportivas do seu grupo
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Modalidade
        </Button>
      </div>

      {/* Stats Cards */}
      {modalities.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Modalidades</CardDescription>
              <CardTitle className="text-3xl">{modalities.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Atletas</CardDescription>
              <CardTitle className="text-3xl">{totalAthletes}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Média de Treinos/Semana</CardDescription>
              <CardTitle className="text-3xl">{avgTrainings}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Modalities Grid */}
      {modalities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              Nenhuma modalidade criada ainda
            </h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira modalidade esportiva para começar
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Modalidade
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modalities.map((modality) => (
            <ModalityCard
              key={modality.id}
              modality={modality}
              onEdit={() => handleEdit(modality)}
              onDelete={() => setDeletingModalityId(modality.id)}
              onViewDetails={() => router.push(`/modalidades/${modality.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {currentGroup?.id && (
        <ModalityModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          groupId={currentGroup.id}
          onSuccess={loadModalities}
        />
      )}

      {/* Edit Modal */}
      {editingModality && currentGroup?.id && (
        <ModalityModal
          open={true}
          onOpenChange={handleCloseEditModal}
          groupId={currentGroup.id}
          modality={editingModality}
          onSuccess={() => {
            handleCloseEditModal();
            loadModalities();
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={deletingModalityId !== null}
        onOpenChange={(open) => !open && setDeletingModalityId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir modalidade?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta modalidade? Esta ação não pode
              ser desfeita e todos os vínculos com atletas serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
