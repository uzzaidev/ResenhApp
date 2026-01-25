'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useGroup } from '@/contexts/group-context';
import { AthletesTable } from '@/components/athletes/athletes-table';
import { AthleteFilters, type AthleteFilterValues } from '@/components/athletes/athlete-filters';
import { AddModalityModal } from '@/components/athletes/add-modality-modal';

interface Modality {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface AthleteModality {
  modalityId: string;
  modalityName: string;
  modalityIcon?: string;
  modalityColor?: string;
  rating?: number;
  positions?: string[];
}

interface Athlete {
  id: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  modalities?: AthleteModality[];
}

export default function AthletesPage() {
  const router = useRouter();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AthleteFilterValues>({
    search: '',
    modalityId: null,
    minRating: null,
    maxRating: null,
    position: null,
  });
  const [showAddModalityModal, setShowAddModalityModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { currentGroup } = useGroup();

  useEffect(() => {
    if (currentGroup?.id) {
      fetchData();
    }
  }, [currentGroup?.id]);

  const fetchData = async () => {
    if (!currentGroup?.id) return;
    
    setIsLoading(true);
    try {
      // Fetch modalities
      const modalitiesResponse = await fetch(`/api/modalities?group_id=${currentGroup.id}`);
      if (modalitiesResponse.ok) {
        const modalitiesData = await modalitiesResponse.json();
        setModalities(modalitiesData.modalities || []);
      }

      // Fetch athletes with their modalities
      // In production, this would be a proper API endpoint
      const athletesResponse = await fetch(`/api/group-members?groupId=${currentGroup.id}`);
      if (athletesResponse.ok) {
        const athletesData = await athletesResponse.json();

        // Fetch modalities for each athlete
        const athletesWithModalities = await Promise.all(
          (athletesData.members || []).map(async (member: any) => {
            try {
              const modalitiesResponse = await fetch(
                `/api/athletes/${member.user.id}/modalities?group_id=${currentGroup.id}`
              );
              if (modalitiesResponse.ok) {
                const modalitiesData = await modalitiesResponse.json();
                return {
                  id: member.id,
                  user: member.user,
                  modalities: modalitiesData.modalities || [],
                };
              }
            } catch (error) {
              console.error('Error fetching athlete modalities:', error);
            }
            return {
              id: member.id,
              user: member.user,
              modalities: [],
            };
          })
        );

        setAthletes(athletesWithModalities);
      }
    } catch (error) {
      toast.error('Erro ao carregar atletas');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter athletes based on current filters
  const filteredAthletes = useMemo(() => {
    return athletes.filter((athlete) => {
      // Search filter
      if (
        filters.search &&
        !athlete.user.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Modality filter
      if (filters.modalityId) {
        const hasModality = athlete.modalities?.some(
          (m) => m.modalityId === filters.modalityId
        );
        if (!hasModality) return false;
      }

      // Rating filter
      if (filters.minRating || filters.maxRating) {
        const athleteModality = filters.modalityId
          ? athlete.modalities?.find((m) => m.modalityId === filters.modalityId)
          : null;

        if (!athleteModality || !athleteModality.rating) return false;

        if (filters.minRating && athleteModality.rating < filters.minRating) {
          return false;
        }
        if (filters.maxRating && athleteModality.rating > filters.maxRating) {
          return false;
        }
      }

      return true;
    });
  }, [athletes, filters]);

  const handleAddModality = (userId: string) => {
    setSelectedUserId(userId);
    setShowAddModalityModal(true);
  };

  const handleViewDetails = (userId: string) => {
    router.push(`/atletas/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Atletas</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os atletas e suas modalidades esportivas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Atletas</CardDescription>
            <CardTitle className="text-3xl">{athletes.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Modalidades Ativas</CardDescription>
            <CardTitle className="text-3xl">{modalities.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Atletas Multi-Modalidades</CardDescription>
            <CardTitle className="text-3xl">
              {athletes.filter((a) => (a.modalities?.length || 0) > 1).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <AthleteFilters onFilterChange={setFilters} modalities={modalities} />

      {/* Athletes Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {filteredAthletes.length}{' '}
                {filteredAthletes.length === 1 ? 'Atleta' : 'Atletas'}
              </CardTitle>
              <CardDescription>
                {filters.search || filters.modalityId || filters.minRating || filters.maxRating
                  ? 'Resultados filtrados'
                  : 'Todos os atletas do grupo'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AthletesTable
            athletes={filteredAthletes}
            onAddModality={handleAddModality}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      {/* Add Modality Modal */}
      <AddModalityModal
        open={showAddModalityModal}
        onOpenChange={setShowAddModalityModal}
        userId={selectedUserId}
        groupId={currentGroup?.id || ''}
        onSuccess={fetchData}
      />
    </div>
  );
}
