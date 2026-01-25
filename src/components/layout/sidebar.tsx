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
  Medal,
  CheckCircle,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Sidebar Navigation V2 - Design System UzzAI
 *
 * Navegação hierárquica inspirada em ATLETICAS-SISTEMA-COMPLETO-V1.html
 * Seções: Principal, Gestão, Análise, Ferramentas
 */

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: "default" | "destructive" | "outline" | "secondary" | "new";
  isPremium?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  groupId?: string;
  pendingPayments?: number;
}

export function Sidebar({
  className,
  groupId = 'temp-group-id', // Temporário até ter context
  pendingPayments = 3,
  ...props
}: SidebarProps) {
  const pathname = usePathname();

  // Seções fixas baseadas na referência HTML
  const sections: NavSection[] = [
    {
      title: "Principal",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: BarChart3,
        },
        {
          title: "Modalidades",
          href: "/modalidades",
          icon: Dumbbell,
          badge: "5",
          badgeVariant: "new",
        },
        {
          title: "Atletas",
          href: "/atletas",
          icon: Users,
        },
      ],
    },
    {
      title: "Gestão",
      items: [
        {
          title: "Treinos",
          href: "/treinos",
          icon: Calendar,
        },
        {
          title: "Jogos Oficiais",
          href: "/jogos",
          icon: Trophy,
        },
        {
          title: "Financeiro",
          href: "/financeiro",
          icon: DollarSign,
          badge: pendingPayments > 0 ? pendingPayments : undefined,
          badgeVariant: "destructive",
        },
      ],
    },
    {
      title: "Análise",
      items: [
        {
          title: "Frequência",
          href: "/frequencia",
          icon: CheckCircle,
        },
        {
          title: "Rankings",
          href: "/rankings",
          icon: Medal,
        },
      ],
    },
    {
      title: "Ferramentas",
      collapsible: true,
      defaultOpen: false,
      items: [
        {
          title: "Tabelinha Tática",
          href: "/tabelinha",
          icon: Target,
          badge: "NOVO",
          badgeVariant: "new",
        },
        {
          title: "Configurações",
          href: "/settings",
          icon: Settings,
        },
      ],
    },
  ];

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

