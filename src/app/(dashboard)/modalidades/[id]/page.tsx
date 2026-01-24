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
  Settings,
  Users,
  TrendingUp,
  Edit,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { ModalityIcon } from '@/components/modalities/modality-icon';
import { ModalityModal } from '@/components/modalities/modality-modal';
import { PositionsConfig } from '@/components/modalities/positions-config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ModalityDetails {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  trainingsPerWeek?: number;
  athleteCount: number;
  athletes: Array<{
    userId: string;
    userName: string;
    userAvatar?: string;
    rating?: number;
    positions?: string[];
  }>;
}

export default function ModalityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const modalityId = params.id as string;

  const [modality, setModality] = useState<ModalityDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('athletes');

  useEffect(() => {
    fetchModality();
  }, [modalityId]);

  const fetchModality = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/modalities/${modalityId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Modalidade não encontrada');
          router.push('/modalidades');
          return;
        }
        throw new Error('Erro ao carregar modalidade');
      }

      const data = await response.json();
      setModality(data);
    } catch (error) {
      toast.error('Erro ao carregar modalidade');
      router.push('/modalidades');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!modality) return null;

  const avgRating =
    modality.athletes.filter((a) => a.rating).length > 0
      ? (
          modality.athletes
            .filter((a) => a.rating)
            .reduce((sum, a) => sum + (a.rating || 0), 0) /
          modality.athletes.filter((a) => a.rating).length
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
            onClick={() => router.push('/modalidades')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-start gap-4">
            <ModalityIcon
              icon={modality.icon}
              color={modality.color}
              size="xl"
            />
            <div>
              <h1 className="text-3xl font-bold">{modality.name}</h1>
              {modality.description && (
                <p className="text-muted-foreground mt-1">
                  {modality.description}
                </p>
              )}
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {modality.athleteCount}{' '}
                    {modality.athleteCount === 1 ? 'atleta' : 'atletas'}
                  </span>
                </div>
                {avgRating && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span>Rating médio: {avgRating}</span>
                  </div>
                )}
                {modality.trainingsPerWeek !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{modality.trainingsPerWeek}x por semana</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button onClick={() => setShowEditModal(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="athletes">
            <Users className="mr-2 h-4 w-4" />
            Atletas
          </TabsTrigger>
          <TabsTrigger value="positions">
            <Settings className="mr-2 h-4 w-4" />
            Posições
          </TabsTrigger>
        </TabsList>

        {/* Aba de Atletas */}
        <TabsContent value="athletes" className="space-y-4">
          {modality.athletes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Nenhum atleta nesta modalidade
                </h3>
                <p className="text-muted-foreground">
                  Adicione atletas à modalidade na página de atletas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modality.athletes.map((athlete) => (
                <Card key={athlete.userId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={athlete.userAvatar} />
                        <AvatarFallback>
                          {athlete.userName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">
                          {athlete.userName}
                        </CardTitle>
                        {athlete.rating && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {athlete.rating}/10
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {athlete.positions && athlete.positions.length > 0 && (
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {athlete.positions.map((position) => (
                          <Badge key={position} variant="secondary" className="text-xs">
                            {position}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Aba de Posições */}
        <TabsContent value="positions">
          <PositionsConfig
            modalityId={modality.id}
            modalityName={modality.name}
            onSuccess={fetchModality}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      <ModalityModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        groupId="" // Will be fetched from context
        modality={modality}
        onSuccess={fetchModality}
      />
    </div>
  );
}
