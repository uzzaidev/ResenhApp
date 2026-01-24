'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface PositionsConfigProps {
  modalityId: string;
  modalityName: string;
  onSuccess?: () => void;
}

export function PositionsConfig({
  modalityId,
  modalityName,
  onSuccess,
}: PositionsConfigProps) {
  const [positions, setPositions] = useState<string[]>([]);
  const [newPosition, setNewPosition] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Carregar posições atuais
  useEffect(() => {
    fetchPositions();
  }, [modalityId]);

  const fetchPositions = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`/api/modalities/${modalityId}/positions`);
      if (!response.ok) throw new Error('Erro ao carregar posições');

      const data = await response.json();
      setPositions(data.positions || []);
    } catch (error) {
      toast.error('Erro ao carregar posições');
    } finally {
      setIsFetching(false);
    }
  };

  const addPosition = () => {
    const trimmed = newPosition.trim();
    if (!trimmed) {
      toast.error('Digite um nome para a posição');
      return;
    }

    if (positions.includes(trimmed)) {
      toast.error('Esta posição já existe');
      return;
    }

    setPositions([...positions, trimmed]);
    setNewPosition('');
  };

  const removePosition = (position: string) => {
    setPositions(positions.filter((p) => p !== position));
  };

  const loadDefaultPositions = async () => {
    setIsLoading(true);
    try {
      // Buscar posições padrão baseadas no nome da modalidade
      const response = await fetch(`/api/modalities/${modalityId}/positions?default=true`);
      if (!response.ok) throw new Error('Erro ao carregar posições padrão');

      const data = await response.json();
      if (data.positions && data.positions.length > 0) {
        setPositions(data.positions);
        toast.success('Posições padrão carregadas!');
      } else {
        toast.info('Nenhuma posição padrão disponível para esta modalidade');
      }
    } catch (error) {
      toast.error('Erro ao carregar posições padrão');
    } finally {
      setIsLoading(false);
    }
  };

  const savePositions = async () => {
    if (positions.length === 0) {
      toast.error('Adicione pelo menos uma posição');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/modalities/${modalityId}/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positions }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar posições');
      }

      toast.success('Posições atualizadas!');
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Posições - {modalityName}</CardTitle>
        <CardDescription>
          Defina as posições disponíveis para esta modalidade. Atletas poderão escolher suas posições preferidas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Adicionar posição */}
        <div className="space-y-2">
          <Label htmlFor="newPosition">Adicionar Nova Posição</Label>
          <div className="flex gap-2">
            <Input
              id="newPosition"
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPosition();
                }
              }}
              placeholder="Ex: Atacante, Goleiro, Lateral..."
              disabled={isLoading}
            />
            <Button
              type="button"
              onClick={addPosition}
              disabled={isLoading || !newPosition.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Botão de carregar posições padrão */}
        <Button
          type="button"
          variant="outline"
          onClick={loadDefaultPositions}
          disabled={isLoading}
          className="w-full"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Carregar Posições Padrão
        </Button>

        {/* Lista de posições */}
        <div className="space-y-2">
          <Label>Posições Configuradas ({positions.length})</Label>
          {positions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center border-2 border-dashed rounded-lg">
              Nenhuma posição configurada. Adicione posições ou carregue as padrões.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 p-4 border rounded-lg min-h-[100px]">
              {positions.map((position) => (
                <Badge
                  key={position}
                  variant="secondary"
                  className="text-sm py-1.5 px-3"
                >
                  {position}
                  <button
                    type="button"
                    onClick={() => removePosition(position)}
                    disabled={isLoading}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            onClick={savePositions}
            disabled={isLoading || positions.length === 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Posições
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
