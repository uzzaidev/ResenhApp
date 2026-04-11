'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on dashboard root
  if (pathname === '/dashboard') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);

  // Build breadcrumb items
  const routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    modalidades: 'Modalidades',
    atletas: 'Atletas',
    treinos: 'Treinos',
    financeiro: 'Financeiro',
    frequencia: 'Frequência',
    rankings: 'Rankings',
    jogos: 'Jogos',
    eventos: 'Eventos',
    novo: 'Novo Evento',
    groups: 'Grupos',
    grupos: 'Grupos',
    credits: 'Quota',
    settings: 'Configurações',
    configuracoes: 'Configurações',
    pagamentos: 'Pagamentos',
    events: 'Eventos',
  };

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;
    const looksLikeId = /^[a-f0-9-]{8,}$/i.test(segment);

    const label = looksLikeId
      ? 'Detalhes'
      : (routeLabels[segment] ??
        segment.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()));

    return {
      label,
      href,
      isLast,
    };
  });

  return (
    <nav className="mb-4 flex items-center space-x-2 text-sm text-muted-foreground">
      <Link
        href="/dashboard"
        className="flex items-center rounded-md p-1 transition-colors hover:text-uzzai-mint"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((breadcrumb, index) => (
        <Fragment key={breadcrumb.href}>
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
          {breadcrumb.isLast ? (
            <span className="truncate font-medium text-foreground">
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="truncate transition-colors hover:text-uzzai-mint"
            >
              {breadcrumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
