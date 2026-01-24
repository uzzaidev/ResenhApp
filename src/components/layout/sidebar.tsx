"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Trophy,
  Target,
  Zap,
  ChevronDown,
  ChevronRight,
  Plus,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Collapsible será implementado quando @radix-ui/react-collapsible estiver instalado
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";

/**
 * Sidebar Navigation - Design System UzzAI
 * 
 * Navegação hierárquica com suporte a:
 * - Dois tipos de grupos (athletic vs pelada)
 * - Seções organizadas (Principal, Gestão, Análise, Ferramentas)
 * - Badges e contadores
 * - Navegação responsiva
 * 
 * @example
 * <Sidebar
 *   groupId="123"
 *   groupType="athletic"
 *   userRole="admin"
 *   pendingPayments={3}
 * />
 */

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: "default" | "destructive" | "outline" | "secondary";
  isPremium?: boolean;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** ID do grupo atual */
  groupId?: string;
  /** Tipo do grupo (athletic = atléticas, pelada = peladas) */
  groupType?: "athletic" | "pelada";
  /** Role do usuário no grupo */
  userRole?: "admin" | "member";
  /** Contador de pagamentos pendentes */
  pendingPayments?: number;
  /** Contador de notificações */
  notifications?: number;
}

export function Sidebar({
  className,
  groupId,
  groupType = "pelada",
  userRole = "member",
  pendingPayments = 0,
  notifications = 0,
  ...props
}: SidebarProps) {
  const pathname = usePathname();

  // Definir seções baseado no tipo de grupo
  const sections: NavSection[] = React.useMemo(() => {
    const isAthletic = groupType === "athletic";
    const isAdmin = userRole === "admin";

    const baseSections: NavSection[] = [
      {
        title: "Principal",
        items: [
          {
            title: "Dashboard",
            href: groupId ? `/groups/${groupId}` : "/dashboard",
            icon: Home,
            description: "Visão geral",
          },
          {
            title: "Grupos",
            href: "/dashboard",
            icon: Users,
            description: "Meus grupos",
          },
        ],
      },
      {
        title: "Gestão",
        items: [
          {
            title: "Eventos",
            href: groupId ? `/groups/${groupId}/events` : "/dashboard",
            icon: Calendar,
            badge: notifications > 0 ? notifications : undefined,
            badgeVariant: "destructive",
            description: "Peladas e jogos",
          },
          {
            title: "Financeiro",
            href: groupId ? `/groups/${groupId}/payments` : "/dashboard",
            icon: DollarSign,
            badge: pendingPayments > 0 ? pendingPayments : undefined,
            badgeVariant: "destructive",
            description: "Pagamentos",
          },
          ...(isAdmin
            ? [
                {
                  title: "Configurações",
                  href: groupId ? `/groups/${groupId}/settings` : "/dashboard",
                  icon: Settings,
                  description: "Gerenciar grupo",
                } as NavItem,
              ]
            : []),
        ],
      },
    ];

    // Adicionar seções específicas para atléticas
    if (isAthletic) {
      baseSections.push({
        title: "Análise",
        collapsible: true,
        defaultOpen: true,
        items: [
          {
            title: "Rankings",
            href: groupId ? `/groups/${groupId}/rankings` : "/dashboard",
            icon: Trophy,
            description: "Artilheiros e MVPs",
          },
          {
            title: "Estatísticas",
            href: groupId ? `/groups/${groupId}/stats` : "/dashboard",
            icon: BarChart3,
            description: "Análise detalhada",
          },
          {
            title: "Modalidades",
            href: groupId ? `/groups/${groupId}/modalities` : "/dashboard",
            icon: Target,
            isPremium: true,
            description: "Múltiplas modalidades",
          },
        ],
      });
    }

    // Adicionar ferramentas premium
    baseSections.push({
      title: "Ferramentas",
      collapsible: true,
      defaultOpen: false,
      items: [
        {
          title: "Treinos Recorrentes",
          href: groupId ? `/groups/${groupId}/recurring` : "/dashboard",
          icon: Zap,
          isPremium: true,
          badge: "5 créditos",
          badgeVariant: "secondary",
          description: "Automatizar treinos",
        },
        {
          title: "Convocações",
          href: groupId ? `/groups/${groupId}/convocations` : "/dashboard",
          icon: Target,
          isPremium: true,
          badge: "3 créditos",
          badgeVariant: "secondary",
          description: "Jogos oficiais",
        },
        ...(isAthletic
          ? [
              {
                title: "Analytics",
                href: groupId ? `/groups/${groupId}/analytics` : "/dashboard",
                icon: BarChart3,
                isPremium: true,
                badge: "10 créditos/mês",
                badgeVariant: "secondary",
                description: "Dashboards avançados",
              } as NavItem,
            ]
          : []),
      ],
    });

    return baseSections;
  }, [groupId, groupType, userRole, pendingPayments, notifications]);

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col gap-2 border-r bg-background p-4",
        className
      )}
      {...props}
    >
      {/* Logo */}
      <div className="mb-4 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-uzzai-mint to-uzzai-blue">
          <span className="text-lg font-bold text-white">P</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold font-poppins">
            <span className="text-uzzai-mint">Uzz</span>
            <span className="text-uzzai-blue font-exo2">Ai</span>
          </span>
          <span className="text-xs text-muted-foreground">Peladeiros</span>
        </div>
      </div>

      {/* Quick Actions */}
      {groupId && (
        <div className="mb-4 space-y-2">
          <Button
            asChild
            size="sm"
            className="w-full bg-uzzai-mint hover:bg-uzzai-mint/90 text-uzzai-black"
          >
            <Link href={`/groups/${groupId}/events/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento
            </Link>
          </Button>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-4 overflow-y-auto">
        {sections.map((section) => (
          <NavSection
            key={section.title}
            section={section}
            pathname={pathname}
          />
        ))}
      </nav>

      {/* Footer - Credits Balance (se tiver groupId) */}
      {groupId && (
        <div className="mt-auto border-t pt-4">
          <Link
            href={`/groups/${groupId}/credits`}
            className="flex items-center justify-between rounded-lg border border-uzzai-gold/30 bg-gradient-to-r from-uzzai-gold/10 to-uzzai-mint/10 p-3 transition-colors hover:border-uzzai-gold/50"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-uzzai-gold" />
              <div>
                <p className="text-xs font-medium">Créditos</p>
                <p className="text-xs text-muted-foreground">Ver saldo</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      )}
    </div>
  );
}

// Componente interno para renderizar seção
function NavSection({
  section,
  pathname,
}: {
  section: NavSection;
  pathname: string;
}) {
  const [isOpen, setIsOpen] = React.useState(section.defaultOpen ?? true);

  if (section.collapsible) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between px-2 py-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          {section.title}
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <div className="space-y-1 pt-1">
            {section.items.map((item) => (
              <NavItem key={item.href} item={item} pathname={pathname} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
        {section.title}
      </p>
      <div className="space-y-1">
        {section.items.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </div>
  );
}

// Componente interno para renderizar item de navegação
function NavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
        isActive
          ? "bg-uzzai-mint/10 text-uzzai-mint font-medium"
          : "text-muted-foreground hover:text-foreground"
      )}
      title={item.description}
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 truncate">{item.title}</span>
      
      {/* Premium Badge */}
      {item.isPremium && (
        <Sparkles className="h-3 w-3 text-uzzai-gold flex-shrink-0" />
      )}
      
      {/* Badge/Counter */}
      {item.badge && (
        <Badge
          variant={item.badgeVariant || "default"}
          className={cn(
            "h-5 px-1.5 text-[10px] font-semibold",
            item.badgeVariant === "secondary" && "bg-uzzai-silver/20 text-uzzai-silver"
          )}
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

