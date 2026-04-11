'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Star,
  Edit,
  TrendingUp,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { ModalityIcon } from '@/components/modalities/modality-icon';
import { AddModalityModal } from '@/components/athletes/add-modality-modal';
import { EditRatingModal } from '@/components/athletes/edit-rating-modal';

interface AthleteModality {
  modalityId: string;
  modalityName: string;
  modalityIcon?: string;
  modalityColor?: string;
  rating?: number;
  positions?: string[];
}

interface AthleteDetails {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email?: string;
    avatar_url?: string;
  };
  modalities: AthleteModality[];
}

export default function AthleteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  // Temporary groupId - would come from context in production
  const groupId = 'temp-group-id';

  const [athlete, setAthlete] = useState<AthleteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModality, setSelectedModality] = useState<{
    id: string;
    name: string;
    rating?: number;
    positions?: string[];
  } | null>(null);

  useEffect(() => {
    fetchAthlete();
  }, [userId]);

  const fetchAthlete = async () => {
    setIsLoading(true);
    try {
      // Fetch athlete modalities
      const response = await fetch(
        `/api/athletes/${userId}/modalities?groupId=${groupId}`
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar atleta');
      }

      const data = await response.json();

      // Mock user data - in production this would come from a proper API
      setAthlete({
        id: 'temp-id',
        userId,
        user: {
          id: userId,
          name: 'Atleta',
          avatar_url: undefined,
        },
        modalities: data.modalities || [],
      });
    } catch (error) {
      toast.error('Erro ao carregar atleta');
      router.push('/atletas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditModality = (modality: AthleteModality) => {
    setSelectedModality({
      id: modality.modalityId,
      name: modality.modalityName,
      rating: modality.rating,
      positions: modality.positions,
    });
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!athlete) return null;

  const avgRating =
    athlete.modalities.filter((m) => m.rating).length > 0
      ? (
          athlete.modalities
            .filter((m) => m.rating)
            .reduce((sum, m) => sum + (m.rating || 0), 0) /
          athlete.modalities.filter((m) => m.rating).length
        ).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/atletas')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={athlete.user.avatar_url} />
              <AvatarFallback className="text-2xl">
                {athlete.user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-3xl font-bold">{athlete.user.name}</h1>
              {athlete.user.email && (
                <p className="text-muted-foreground mt-1">
                  {athlete.user.email}
                </p>
              )}
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {athlete.modalities.length}{' '}
                    {athlete.modalities.length === 1
                      ? 'modalidade'
                      : 'modalidades'}
                  </span>
                </div>
                {avgRating && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span>Rating médio: {avgRating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Modalidade
        </Button>
      </div>

      {/* Modalidades */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Modalidades</h2>

        {athlete.modalities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Nenhuma modalidade cadastrada
              </h3>
              <p className="text-muted-foreground mb-4">
                Adicione modalidades para começar a acompanhar o desempenho do
                atleta
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Modalidade
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {athlete.modalities.map((modality) => (
              <Card
                key={modality.modalityId}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleEditModality(modality)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <ModalityIcon
                        icon={modality.modalityIcon}
                        color={modality.modalityColor}
                        size="sm"
                      />
                      <div>
                        <CardTitle className="text-base">
                          {modality.modalityName}
                        </CardTitle>
                        {modality.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {modality.rating}/10
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditModality(modality);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {modality.positions && modality.positions.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">
                        Posições Preferidas
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {modality.positions.map((position) => (
                          <Badge
                            key={position}
                            variant="secondary"
                            className="text-xs"
                          >
                            {position}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {athlete.modalities.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Estatísticas</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Rating Médio</CardDescription>
                <CardTitle className="text-3xl">
                  {avgRating || '-'}
                  {avgRating && <span className="text-base ml-2">/10</span>}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Modalidades Ativas</CardDescription>
                <CardTitle className="text-3xl">
                  {athlete.modalities.length}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Posições Diferentes</CardDescription>
                <CardTitle className="text-3xl">
                  {
                    new Set(
                      athlete.modalities.flatMap((m) => m.positions || [])
                    ).size
                  }
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddModalityModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        userId={userId}
        groupId={groupId}
        onSuccess={fetchAthlete}
      />

      {selectedModality && (
        <EditRatingModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          userId={userId}
          modalityId={selectedModality.id}
          modalityName={selectedModality.name}
          currentRating={selectedModality.rating}
          currentPositions={selectedModality.positions}
          onSuccess={fetchAthlete}
        />
      )}
    </div>
  );
}
