'use client';

import { useState } from 'react';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import { NotificationsDropdown } from '@/components/notifications/notifications-dropdown';
import { SearchCommand } from '@/components/ui/search-command';
import { GroupSwitcher } from './group-switcher';
import { DirectModeToggle } from './direct-mode-toggle';
import { usePathname } from 'next/navigation';
import { useGroup } from '@/contexts/group-context';

export function Topbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const { currentGroup } = useGroup();

  // Get page title based on pathname
  const getPageInfo = () => {
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 1 && segments[0] === 'dashboard') {
      return {
        title: 'Dashboard',
        subtitle: 'Visão geral da atlética - Semana 48/2025'
      };
    }

    if (segments.includes('modalidades')) {
      return {
        title: 'Modalidades',
        subtitle: 'Gestão de esportes e modalidades'
      };
    }

    if (segments.includes('atletas')) {
      return {
        title: 'Atletas',
        subtitle: 'Gestão de atletas e membros'
      };
    }

    if (segments.includes('treinos')) {
      return {
        title: 'Treinos',
        subtitle: 'Gestão de treinos e confirmações'
      };
    }

    if (segments.includes('financeiro')) {
      return {
        title: 'Financeiro',
        subtitle: 'Gestão de pagamentos e cobranças'
      };
    }

    if (segments.includes('frequencia')) {
      return {
        title: 'Frequência',
        subtitle: 'Controle de presença e check-ins'
      };
    }

    if (segments.includes('rankings')) {
      return {
        title: 'Rankings',
        subtitle: 'Estatísticas e classificações'
      };
    }

    if (segments.includes('jogos')) {
      return {
        title: 'Jogos Oficiais',
        subtitle: 'Competições e convocações'
      };
    }

    return {
      title: 'Dashboard',
      subtitle: 'Visão geral da atlética'
    };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <header className="sticky top-0 z-40 h-16 md:h-[70px] bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-800">
      <div className="flex h-full items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Left: Mobile Menu + Page Title */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>

          {/* Page Title */}
          <div className="hidden md:block">
            <h1 className="text-xl md:text-2xl font-bold font-heading">{title}</h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
              {currentGroup ? `${subtitle} - ${currentGroup.name}` : subtitle}
            </p>
          </div>
          
          {/* Group Switcher (Mobile) */}
          <div className="md:hidden">
            <GroupSwitcher />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Group Switcher (Desktop) */}
          <div className="hidden md:block">
            <GroupSwitcher />
          </div>
          
          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar atletas, treinos..."
                className="w-[300px] pl-9 bg-gray-800/50 border-gray-700 focus:border-teal-500"
                onClick={() => setSearchOpen(true)}
                readOnly
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-700 bg-gray-800 px-1.5 font-mono text-[10px] font-medium text-gray-400">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          {/* Search Button (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Search Command Dialog */}
          <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />

          {/* Direct Mode Toggle */}
          <DirectModeToggle />

          {/* Notifications */}
          <NotificationsDropdown />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 md:gap-3 hover:bg-gray-800 transition-colors"
              >
                <Avatar className="h-8 w-8 md:h-9 md:w-9">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white font-semibold">
                    PV
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold">Pedro Vitor</span>
                  <span className="text-xs text-gray-400">Atleta de Ouro</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem>
                Meus Créditos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
