"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useGroup } from "@/contexts/group-context";
import {
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Trophy,
  Target,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Medal,
  CheckCircle,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  groupId,
  pendingPayments = 0,
  ...props
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentGroup } = useGroup();
  const { data: session } = useSession();
  const currentTipo = searchParams.get("tipo")?.toLowerCase() || null;
  const resolvedGroupId = groupId ?? currentGroup?.id;
  const groupHref = resolvedGroupId ? `/grupos/${resolvedGroupId}` : "/grupos/new";
  const profileHref = session?.user?.id ? `/atletas/${session.user.id}` : "/configuracoes";
  const athleteName = session?.user?.name || session?.user?.email || "Atleta";
  const athleteRole = "Atleta";

  const athleteInitials = React.useMemo(() => {
    const value = athleteName.trim();
    if (!value) return "AT";
    return value
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [athleteName]);

  const sections: NavSection[] = [
    {
      title: "Principal",
      items: [
        { title: "Dashboard", href: "/dashboard", icon: BarChart3 },
        { title: "Grupos", href: groupHref, icon: FolderOpen },
      ],
    },
    {
      title: "Eventos",
      collapsible: true,
      defaultOpen: true,
      items: [
        { title: "Todos", href: "/eventos", icon: Calendar },
        { title: "Treinos", href: "/eventos?tipo=treino", icon: Calendar },
        { title: "Jogos", href: "/eventos?tipo=jogo", icon: Trophy },
      ],
    },
    {
      title: "Operacional",
      items: [
        {
          title: "Financeiro",
          href: "/financeiro",
          icon: DollarSign,
          badge: pendingPayments > 0 ? pendingPayments : undefined,
          badgeVariant: "destructive",
        },
        { title: "Atletas", href: "/atletas", icon: Users },
      ],
    },
    {
      title: "Analise",
      items: [
        { title: "Rankings", href: "/rankings", icon: Medal },
        { title: "Frequencia", href: "/frequencia", icon: CheckCircle },
      ],
    },
    {
      title: "Ferramentas",
      collapsible: true,
      defaultOpen: false,
      items: [
        { title: "Tabelinha Tatica", href: "/tabelinha", icon: Target, badge: "NOVO", badgeVariant: "new" },
        { title: "Modalidades", href: "/modalidades", icon: Dumbbell },
        { title: "Configuracoes", href: "/configuracoes", icon: Settings },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "flex h-full w-72 flex-col gap-3 border-r border-uzzai-silver/20 bg-gradient-to-b from-uzzai-black via-[#132a35] to-uzzai-black p-4 text-white",
        className
      )}
      {...props}
    >
      <div className="mb-2 rounded-xl border border-uzzai-mint/25 bg-uzzai-mint/8 px-3 py-2.5">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-uzzai-mint to-uzzai-blue shadow-brand">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="text-sm font-bold font-poppins">
            <span className="text-uzzai-mint">Uzz</span>
            <span className="font-exo2 text-uzzai-blue">Ai</span>
          </span>
        </div>
        {currentGroup ? (
          <Link href={`/grupos/${currentGroup.id}`} className="truncate text-xs text-white/70 hover:text-white transition-colors">
            {currentGroup.name}
          </Link>
        ) : (
          <p className="truncate text-xs text-white/70">Nenhum grupo selecionado</p>
        )}
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
        {sections.map((section) => (
          <NavSection key={section.title} section={section} pathname={pathname} currentTipo={currentTipo} />
        ))}
      </nav>

      <div className="mt-auto border-t border-uzzai-silver/20 pt-4">
        <Link
          href={profileHref}
          className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 transition-colors hover:border-white/20 hover:bg-white/10"
        >
          <Avatar className="h-9 w-9 border border-white/20">
            <AvatarImage src={session?.user?.image ?? ""} alt={athleteName} />
            <AvatarFallback className="bg-gradient-to-br from-uzzai-mint to-uzzai-blue text-xs font-semibold text-white">
              {athleteInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs text-white/60">{athleteRole}</p>
            <p className="truncate text-sm font-medium text-white">{athleteName}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function NavSection({
  section,
  pathname,
  currentTipo,
}: {
  section: NavSection;
  pathname: string;
  currentTipo: string | null;
}) {
  const [isOpen, setIsOpen] = React.useState(section.defaultOpen ?? true);

  if (section.collapsible) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between px-2 py-1 text-sm font-semibold text-white/70 transition-colors hover:text-white"
        >
          {section.title}
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {isOpen && (
          <div className="space-y-1 pt-1">
            {section.items.map((item) => (
              <NavItem key={item.href} item={item} pathname={pathname} currentTipo={currentTipo} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-white/60">{section.title}</p>
      <div className="space-y-1">
        {section.items.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} currentTipo={currentTipo} />
        ))}
      </div>
    </div>
  );
}

function NavItem({
  item,
  pathname,
  currentTipo,
}: {
  item: NavItem;
  pathname: string;
  currentTipo: string | null;
}) {
  const hrefPath = item.href.split("?")[0];
  const hrefQuery = item.href.split("?")[1] || "";
  const hrefTipo = new URLSearchParams(hrefQuery).get("tipo")?.toLowerCase() || null;

  const isEventosPath = hrefPath === "/eventos";
  const isActive = isEventosPath
    ? pathname === "/eventos" && ((hrefTipo === null && (currentTipo === null || currentTipo === "todos")) || hrefTipo === currentTipo)
    : pathname === hrefPath || pathname.startsWith(hrefPath + "/");

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "bg-uzzai-mint/20 font-medium text-uzzai-mint"
          : "text-white/75 hover:bg-white/6 hover:text-white"
      )}
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 truncate">{item.title}</span>

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
