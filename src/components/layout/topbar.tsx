'use client';

import { useMemo, useState } from 'react';
import { Search, ChevronDown, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
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
import { ThemeToggle } from './theme-toggle';
import { useGroup } from '@/contexts/group-context';

function getInitials(name?: string | null) {
  if (!name) return 'PL';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export function Topbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const { currentGroup } = useGroup();
  const { data: session } = useSession();

  const pageInfo = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 1 && segments[0] === 'dashboard') {
      return { title: 'Dashboard', subtitle: 'Visao geral da atletica' };
    }

    if (segments.includes('modalidades')) {
      return { title: 'Modalidades', subtitle: 'Gestao de esportes e posicoes' };
    }

    if (segments.includes('atletas')) {
      return { title: 'Atletas', subtitle: 'Gestao de atletas e membros' };
    }

    if (segments.includes('treinos')) {
      return { title: 'Treinos', subtitle: 'Gestao de treinos e confirmacoes' };
    }

    if (segments.includes('financeiro')) {
      return { title: 'Financeiro', subtitle: 'Pagamentos, cobrancas e PIX' };
    }

    if (segments.includes('frequencia')) {
      return { title: 'Frequencia', subtitle: 'Controle de presenca' };
    }

    if (segments.includes('rankings')) {
      return { title: 'Rankings', subtitle: 'Estatisticas e classificacoes' };
    }

    if (segments.includes('configuracoes') || segments.includes('settings')) {
      return { title: 'Configuracoes', subtitle: 'Ajustes da conta e do grupo' };
    }

    if (segments.includes('pagamentos')) {
      return { title: 'Pagamentos', subtitle: 'Cobrancas e status financeiros' };
    }

    if (segments.includes('jogos')) {
      return { title: 'Jogos Oficiais', subtitle: 'Competicoes e convocacoes' };
    }

    if (segments.includes('groups') || segments.includes('grupos')) {
      return { title: 'Grupos', subtitle: 'Gestao de membros, eventos e configuracoes' };
    }

    if (segments.includes('eventos') || segments.includes('events')) {
      return { title: 'Eventos', subtitle: 'Treinos e jogos em um unico fluxo' };
    }

    return { title: 'Dashboard', subtitle: 'Visao geral da atletica' };
  }, [pathname]);

  const userName = session?.user?.name?.trim() || 'Usuario';
  const userRole = 'Membro';
  const userInitials = getInitials(session?.user?.name);
  const profileHref = session?.user?.id ? `/atletas/${session.user.id}` : '/auth/signin';
  const settingsHref = currentGroup?.id ? `/grupos/${currentGroup.id}/configuracoes` : '/configuracoes';
  const invitesHref = currentGroup?.id
    ? `/grupos/${currentGroup.id}/configuracoes?tab=invites`
    : '/grupos/new';

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-uzzai-silver/20 bg-card/85 backdrop-blur-md md:h-[70px]">
      <div className="flex h-full items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Abrir menu lateral">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-uzzai-silver/20 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="hidden md:block">
            <h1 className="font-heading text-xl font-bold md:text-2xl">{pageInfo.title}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
              {currentGroup ? `${pageInfo.subtitle} - ${currentGroup.name}` : pageInfo.subtitle}
            </p>
          </div>

          <div className="md:hidden">
            <GroupSwitcher />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:block">
            <GroupSwitcher />
          </div>

          <div className="hidden lg:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar atletas, eventos..."
                className="w-[290px] border-uzzai-silver/20 bg-background/70 pl-9"
                onClick={() => setSearchOpen(true)}
                readOnly
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 inline-flex h-5 -translate-y-1/2 select-none items-center gap-1 rounded border border-uzzai-silver/20 bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">Ctrl</span>K
              </kbd>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </Button>

          <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />

          <ThemeToggle />
          <NotificationsDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2.5 md:gap-3">
                <Avatar className="h-8 w-8 border border-uzzai-silver/20 md:h-9 md:w-9">
                  <AvatarImage src={session?.user?.image ?? ''} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-uzzai-mint to-uzzai-blue text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold">{userName}</span>
                  <span className="text-xs text-muted-foreground">{userRole}</span>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={profileHref}>Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={settingsHref}>Configuracoes</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={invitesHref}>Convites</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
