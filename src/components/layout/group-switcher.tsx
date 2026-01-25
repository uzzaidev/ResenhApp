"use client";

/**
 * Group Switcher Component
 * 
 * Dropdown para alternar entre grupos do usuário.
 * Exibido no Topbar para fácil acesso.
 * 
 * Sprint 1: GroupContext + Multi-Grupo
 */

import { useGroup } from "@/contexts/group-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Plus, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function GroupSwitcher() {
  const { currentGroup, groups, isLoading, switchGroup } = useGroup();
  const router = useRouter();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Users className="h-4 w-4 mr-2" />
        Carregando...
      </Button>
    );
  }

  if (groups.length === 0) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/groups/new">
          <Plus className="h-4 w-4 mr-2" />
          Criar Grupo
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 min-w-[140px] justify-between"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span className="truncate font-medium">
              {currentGroup?.name || "Selecionar Grupo"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Meus Grupos</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {groups.map((group) => (
          <DropdownMenuItem
            key={group.id}
            onClick={() => switchGroup(group.id)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              currentGroup?.id === group.id && "bg-uzzai-mint/10"
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="truncate">{group.name}</span>
              {group.memberCount !== undefined && (
                <span className="text-xs text-gray-400 ml-auto">
                  {group.memberCount}
                </span>
              )}
            </div>
            {currentGroup?.id === group.id && (
              <Check className="h-4 w-4 text-uzzai-mint ml-2 flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/groups/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Criar Novo Grupo
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

