'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { User, Calendar, Trophy, Gamepad2, Loader2 } from 'lucide-react';
import { useGroup } from '@/contexts/group-context';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  icon_url?: string | null;
  url: string;
}

interface SearchResults {
  athletes: SearchResult[];
  trainings: SearchResult[];
  games: SearchResult[];
  modalities: SearchResult[];
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();
  const { currentGroup } = useGroup();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    athletes: [],
    trainings: [],
    games: [],
    modalities: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce query (300ms)
  const debouncedQuery = useDebounce(query, 300);

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

  // Buscar resultados da API
  const searchResults = useCallback(async (searchQuery: string) => {
    if (!currentGroup?.id || !searchQuery || searchQuery.length < 2) {
      setResults({
        athletes: [],
        trainings: [],
        games: [],
        modalities: [],
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&group_id=${currentGroup.id}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar');
      }

      const data = await response.json();
      setResults(data.results || {
        athletes: [],
        trainings: [],
        games: [],
        modalities: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setResults({
        athletes: [],
        trainings: [],
        games: [],
        modalities: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup?.id]);

  // Buscar quando query mudar (com debounce)
  useEffect(() => {
    if (open && debouncedQuery) {
      searchResults(debouncedQuery);
    } else if (!debouncedQuery) {
      setResults({
        athletes: [],
        trainings: [],
        games: [],
        modalities: [],
      });
    }
  }, [debouncedQuery, open, searchResults]);

  // Limpar resultados quando fechar
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults({
        athletes: [],
        trainings: [],
        games: [],
        modalities: [],
      });
      setError(null);
    }
  }, [open]);

  const handleSelect = (url: string) => {
    onOpenChange(false);
    router.push(url);
  };

  const hasResults =
    results.athletes.length > 0 ||
    results.trainings.length > 0 ||
    results.games.length > 0 ||
    results.modalities.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar atletas, treinos, modalidades..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
          </div>
        )}

        {error && !isLoading && (
          <CommandEmpty>
            <div className="text-destructive text-sm">{error}</div>
          </CommandEmpty>
        )}

        {!isLoading && !error && !hasResults && query.length >= 2 && (
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        )}

        {!isLoading && !error && query.length < 2 && (
          <CommandEmpty>
            Digite pelo menos 2 caracteres para buscar
          </CommandEmpty>
        )}

        {!isLoading && !error && results.athletes.length > 0 && (
          <CommandGroup heading="👥 Atletas">
            {results.athletes.map((athlete) => (
              <CommandItem
                key={athlete.id}
                onSelect={() => handleSelect(athlete.url)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <User className="h-4 w-4 text-teal-500" />
                <div className="flex-1">
                  <div className="font-medium">{athlete.title}</div>
                  <div className="text-xs text-muted-foreground">{athlete.subtitle}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoading && !error && results.trainings.length > 0 && (
          <CommandGroup heading="📅 Treinos">
            {results.trainings.map((training) => (
              <CommandItem
                key={training.id}
                onSelect={() => handleSelect(training.url)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Calendar className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <div className="font-medium">{training.title}</div>
                  <div className="text-xs text-muted-foreground">{training.subtitle}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoading && !error && results.games.length > 0 && (
          <CommandGroup heading="⚽ Jogos">
            {results.games.map((game) => (
              <CommandItem
                key={game.id}
                onSelect={() => handleSelect(game.url)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Gamepad2 className="h-4 w-4 text-orange-500" />
                <div className="flex-1">
                  <div className="font-medium">{game.title}</div>
                  <div className="text-xs text-muted-foreground">{game.subtitle}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!isLoading && !error && results.modalities.length > 0 && (
          <CommandGroup heading="💪 Modalidades">
            {results.modalities.map((modality) => (
              <CommandItem
                key={modality.id}
                onSelect={() => handleSelect(modality.url)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Trophy className="h-4 w-4 text-purple-500" />
                <div className="flex-1">
                  <div className="font-medium">{modality.title}</div>
                  <div className="text-xs text-muted-foreground">{modality.subtitle}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
