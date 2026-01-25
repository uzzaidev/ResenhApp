'use client';

import { Button } from '@/components/ui/button';
import { Zap, LayoutDashboard } from 'lucide-react';
import { useDirectMode } from '@/contexts/direct-mode-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function DirectModeToggle() {
  const { isDirectMode, toggleDirectMode } = useDirectMode();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDirectMode}
            className={`relative transition-all ${
              isDirectMode
                ? 'bg-uzzai-mint/20 text-uzzai-mint hover:bg-uzzai-mint/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            aria-label={isDirectMode ? 'Desativar modo direto' : 'Ativar modo direto'}
          >
            {isDirectMode ? (
              <Zap className="h-5 w-5" />
            ) : (
              <LayoutDashboard className="h-5 w-5" />
            )}
            {isDirectMode && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-uzzai-mint rounded-full animate-pulse" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">
            {isDirectMode ? 'Modo Direto Ativo' : 'Ativar Modo Direto'}
            <br />
            <span className="text-gray-400">
              {isDirectMode
                ? 'Layout otimizado para agilidade'
                : 'Layout simplificado e rápido'}
            </span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

