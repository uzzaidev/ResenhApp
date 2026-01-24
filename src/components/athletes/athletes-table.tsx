'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, Eye, UserPlus, Star } from 'lucide-react';
import { ModalityBadge } from './modality-badge';

interface Athlete {
  id: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  modalities?: Array<{
    modalityId: string;
    modalityName: string;
    modalityIcon?: string;
    modalityColor?: string;
    rating?: number;
    positions?: string[];
  }>;
}

interface AthletesTableProps {
  athletes: Athlete[];
  onAddModality?: (userId: string) => void;
  onEditRating?: (userId: string, modalityId: string) => void;
  onViewDetails?: (userId: string) => void;
}

export function AthletesTable({
  athletes,
  onAddModality,
  onEditRating,
  onViewDetails,
}: AthletesTableProps) {
  if (athletes.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">Nenhum atleta encontrado</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Atleta</TableHead>
            <TableHead>Modalidades</TableHead>
            <TableHead className="w-[100px] text-center">Rating Médio</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {athletes.map((athlete) => {
            const avgRating =
              athlete.modalities && athlete.modalities.length > 0
                ? (
                    athlete.modalities
                      .filter((m) => m.rating)
                      .reduce((sum, m) => sum + (m.rating || 0), 0) /
                    athlete.modalities.filter((m) => m.rating).length
                  ).toFixed(1)
                : null;

            return (
              <TableRow key={athlete.id}>
                {/* Atleta */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={athlete.user.avatar_url} />
                      <AvatarFallback>
                        {athlete.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{athlete.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {athlete.modalities?.length || 0}{' '}
                        {athlete.modalities?.length === 1 ? 'modalidade' : 'modalidades'}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Modalidades */}
                <TableCell>
                  {athlete.modalities && athlete.modalities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {athlete.modalities.slice(0, 3).map((modality) => (
                        <Badge
                          key={modality.modalityId}
                          variant="secondary"
                          className="gap-1"
                        >
                          {modality.modalityIcon && (
                            <span className="text-base">{modality.modalityIcon}</span>
                          )}
                          {modality.modalityName}
                          {modality.rating && (
                            <span className="ml-1 text-xs opacity-70">
                              {modality.rating}/10
                            </span>
                          )}
                        </Badge>
                      ))}
                      {athlete.modalities.length > 3 && (
                        <Badge variant="outline">
                          +{athlete.modalities.length - 3}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Nenhuma modalidade
                    </span>
                  )}
                </TableCell>

                {/* Rating Médio */}
                <TableCell className="text-center">
                  {avgRating ? (
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{avgRating}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Ações */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onViewDetails?.(athlete.user.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onAddModality?.(athlete.user.id)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Adicionar Modalidade
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
