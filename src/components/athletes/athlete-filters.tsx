'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AthleteFiltersProps {
  onFilterChange: (filters: AthleteFilterValues) => void;
  modalities?: Array<{ id: string; name: string }>;
}

export interface AthleteFilterValues {
  search: string;
  modalityId: string | null;
  minRating: number | null;
  maxRating: number | null;
  position: string | null;
}

export function AthleteFilters({ onFilterChange, modalities = [] }: AthleteFiltersProps) {
  const [filters, setFilters] = useState<AthleteFilterValues>({
    search: '',
    modalityId: null,
    minRating: null,
    maxRating: null,
    position: null,
  });

  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof AthleteFilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: AthleteFilterValues = {
      search: '',
      modalityId: null,
      minRating: null,
      maxRating: null,
      position: null,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters =
    filters.modalityId !== null ||
    filters.minRating !== null ||
    filters.maxRating !== null ||
    filters.position !== null;

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Busca */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar atletas..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Filtros Avançados */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                {[
                  filters.modalityId,
                  filters.minRating,
                  filters.maxRating,
                  filters.position,
                ].filter(Boolean).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Filtros Avançados</h4>
              <p className="text-sm text-muted-foreground">
                Refine sua busca por modalidade, rating ou posição
              </p>
            </div>

            {/* Modalidade */}
            {modalities.length > 0 && (
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select
                  value={filters.modalityId || 'all'}
                  onValueChange={(value) =>
                    updateFilter('modalityId', value === 'all' ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as modalidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as modalidades</SelectItem>
                    {modalities.map((modality) => (
                      <SelectItem key={modality.id} value={modality.id}>
                        {modality.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="minRating" className="text-xs text-muted-foreground">
                    Mínimo
                  </Label>
                  <Select
                    value={filters.minRating?.toString() || 'any'}
                    onValueChange={(value) =>
                      updateFilter('minRating', value === 'any' ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger id="minRating">
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Qualquer</SelectItem>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxRating" className="text-xs text-muted-foreground">
                    Máximo
                  </Label>
                  <Select
                    value={filters.maxRating?.toString() || 'any'}
                    onValueChange={(value) =>
                      updateFilter('maxRating', value === 'any' ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger id="maxRating">
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Qualquer</SelectItem>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="flex-1"
              >
                Limpar
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
