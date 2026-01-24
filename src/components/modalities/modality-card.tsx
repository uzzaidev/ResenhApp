"use client";

import { MoreVertical, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ModalityCardProps {
  modality: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    athletesCount: number;
    trainingsPerWeek?: number;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
}

export function ModalityCard({
  modality,
  onEdit,
  onDelete,
  onViewDetails,
}: ModalityCardProps) {
  const iconStyle = modality.color
    ? { color: modality.color }
    : { color: "#1ABC9C" }; // UzzAI mint default

  return (
    <Card className="relative hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl" style={iconStyle}>
            {modality.icon || "⚽"}
          </span>
          <h3 className="font-semibold text-lg">{modality.name}</h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{modality.athletesCount} atletas</span>
        </div>

        {modality.trainingsPerWeek && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>{modality.trainingsPerWeek} treinos/semana</span>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={onViewDetails}
        >
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
}
