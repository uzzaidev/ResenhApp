'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { User, Calendar, Trophy, DollarSign } from 'lucide-react';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock search results - será substituído por busca real
const mockResults = {
  athletes: [
    { id: '1', name: 'Pedro Vitor Costa', email: 'pedro@example.com' },
    { id: '2', name: 'Lucas Silva', email: 'lucas@example.com' },
    { id: '3', name: 'Maria Oliveira', email: 'maria@example.com' },
  ],
  trainings: [
    { id: '1', name: 'Treino Tático - Futsal', date: '15/01/2026' },
    { id: '2', name: 'Treino Recepção - Vôlei', date: '16/01/2026' },
  ],
  modalities: [
    { id: '1', name: 'Futsal', athletesCount: 45 },
    { id: '2', name: 'Vôlei', athletesCount: 32 },
    { id: '3', name: 'Basquete', athletesCount: 28 },
  ],
};

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSelect = (type: string, id: string) => {
    onOpenChange(false);

    switch (type) {
      case 'athlete':
        router.push(`/atletas/${id}`);
        break;
      case 'training':
        router.push(`/treinos/${id}`);
        break;
      case 'modality':
        router.push(`/modalidades/${id}`);
        break;
    }
  };

  // Filter results based on query
  const filteredAthletes = mockResults.athletes.filter(
    a => a.name.toLowerCase().includes(query.toLowerCase()) ||
         a.email.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTrainings = mockResults.trainings.filter(
    t => t.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredModalities = mockResults.modalities.filter(
    m => m.name.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults = filteredAthletes.length > 0 ||
                     filteredTrainings.length > 0 ||
                     filteredModalities.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar atletas, treinos, modalidades..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {!hasResults && query.length > 0 && (
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        )}

        {filteredAthletes.length > 0 && (
          <CommandGroup heading="Atletas">
            {filteredAthletes.map((athlete) => (
              <CommandItem
                key={athlete.id}
                onSelect={() => handleSelect('athlete', athlete.id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <User className="h-4 w-4 text-teal-500" />
                <div className="flex-1">
                  <div className="font-medium">{athlete.name}</div>
                  <div className="text-xs text-gray-500">{athlete.email}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredTrainings.length > 0 && (
          <CommandGroup heading="Treinos">
            {filteredTrainings.map((training) => (
              <CommandItem
                key={training.id}
                onSelect={() => handleSelect('training', training.id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Calendar className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <div className="font-medium">{training.name}</div>
                  <div className="text-xs text-gray-500">{training.date}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredModalities.length > 0 && (
          <CommandGroup heading="Modalidades">
            {filteredModalities.map((modality) => (
              <CommandItem
                key={modality.id}
                onSelect={() => handleSelect('modality', modality.id)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Trophy className="h-4 w-4 text-purple-500" />
                <div className="flex-1">
                  <div className="font-medium">{modality.name}</div>
                  <div className="text-xs text-gray-500">
                    {modality.athletesCount} atletas
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
