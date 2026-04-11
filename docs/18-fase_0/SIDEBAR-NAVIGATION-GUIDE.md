# 🧭 Sidebar Navigation - Guia de Implementação

> **Data:** 2026-02-27  
> **Status:** ✅ Implementado  
> **Versão:** 1.0

---

## 📋 Visão Geral

A **Sidebar Navigation** é um componente de navegação hierárquica que se adapta automaticamente ao contexto do usuário, suportando dois tipos de grupos (atléticas vs peladas) e diferentes níveis de permissão.

---

## 🎯 Features Implementadas

### ✅ Navegação Hierárquica
- Seções organizadas (Principal, Gestão, Análise, Ferramentas)
- Suporte a seções colapsáveis
- Navegação contextual baseada no grupo atual

### ✅ Suporte a Dois Tipos de Grupos

**Peladas (pelada):**
- Navegação simplificada
- Foco em eventos e pagamentos
- Ferramentas premium básicas

**Atléticas (athletic):**
- Navegação completa
- Seção de Análise (Rankings, Estatísticas, Modalidades)
- Ferramentas premium avançadas (Analytics)

### ✅ Badges e Contadores
- Notificações de eventos
- Pagamentos pendentes
- Indicadores premium
- Custo em créditos

### ✅ Permissões por Role
- **Admin:** Acesso completo + Configurações
- **Member:** Acesso básico

### ✅ Design System UzzAI
- Cores da paleta retrofuturista
- Tipografia oficial (Poppins, Exo 2)
- Gradientes da marca
- Estados de hover e active

---

## 📦 Componente

### Localização

```
src/components/layout/sidebar.tsx
```

### Props

```typescript
interface SidebarProps {
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
```

---

## 🚀 Exemplos de Uso

### Exemplo 1: Dashboard (sem grupo específico)

```tsx
import { Sidebar } from "@/components/layout/sidebar";

export function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar notifications={3} />
      <main className="flex-1 overflow-y-auto">
        {/* Conteúdo do dashboard */}
      </main>
    </div>
  );
}
```

---

### Exemplo 2: Grupo tipo "pelada" (usuário membro)

```tsx
import { Sidebar } from "@/components/layout/sidebar";

export function PeladaGroupLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar
        groupId="123e4567-e89b-12d3-a456-426614174000"
        groupType="pelada"
        userRole="member"
        pendingPayments={2}
        notifications={1}
      />
      <main className="flex-1 overflow-y-auto">
        {/* Conteúdo do grupo */}
      </main>
    </div>
  );
}
```

**Navegação exibida:**
- ✅ Principal (Dashboard, Grupos)
- ✅ Gestão (Eventos, Financeiro)
- ✅ Ferramentas (Treinos Recorrentes, Convocações)
- ❌ Análise (não disponível para peladas)
- ❌ Configurações (não é admin)

---

### Exemplo 3: Grupo tipo "athletic" (usuário admin)

```tsx
import { Sidebar } from "@/components/layout/sidebar";

export function AthleticGroupLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar
        groupId="987fcdeb-51a2-43f7-9876-543210fedcba"
        groupType="athletic"
        userRole="admin"
        pendingPayments={5}
        notifications={8}
      />
      <main className="flex-1 overflow-y-auto">
        {/* Conteúdo da atlética */}
      </main>
    </div>
  );
}
```

**Navegação exibida:**
- ✅ Principal (Dashboard, Grupos)
- ✅ Gestão (Eventos, Financeiro, **Configurações**)
- ✅ **Análise** (Rankings, Estatísticas, Modalidades)
- ✅ Ferramentas (Treinos Recorrentes, Convocações, **Analytics**)

---

### Exemplo 4: Integração com Layout Existente

```tsx
// src/app/groups/[groupId]/layout.tsx
import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentUser } from "@/lib/auth-helpers";
import { sql } from "@/db/client";

export default async function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { groupId: string };
}) {
  const user = await getCurrentUser();
  
  // Buscar informações do grupo
  const group = await sql`
    SELECT
      g.group_type,
      gm.role
    FROM groups g
    INNER JOIN group_members gm ON g.id = gm.group_id
    WHERE g.id = ${params.groupId} AND gm.user_id = ${user.id}
  `.then(rows => rows[0]);

  // Buscar contadores
  const pendingPayments = await sql`
    SELECT COUNT(*) as count
    FROM charges
    WHERE user_id = ${user.id} AND status = 'pending'
  `.then(rows => rows[0].count);

  return (
    <div className="flex h-screen">
      <Sidebar
        groupId={params.groupId}
        groupType={group.group_type}
        userRole={group.role}
        pendingPayments={pendingPayments}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
```

---

## 🎨 Estrutura de Navegação

### Seção: Principal

| Item | Rota | Ícone | Disponível |
|------|------|-------|------------|
| Dashboard | `/groups/{groupId}` ou `/dashboard` | Home | Sempre |
| Grupos | `/dashboard` | Users | Sempre |

---

### Seção: Gestão

| Item | Rota | Ícone | Disponível | Badge |
|------|------|-------|------------|-------|
| Eventos | `/groups/{groupId}/events` | Calendar | Sempre | Notificações |
| Financeiro | `/groups/{groupId}/payments` | DollarSign | Sempre | Pagamentos pendentes |
| Configurações | `/groups/{groupId}/settings` | Settings | Apenas admin | - |

---

### Seção: Análise (apenas atléticas)

| Item | Rota | Ícone | Disponível | Premium |
|------|------|-------|------------|---------|
| Rankings | `/groups/{groupId}/rankings` | Trophy | Athletic | Não |
| Estatísticas | `/groups/{groupId}/stats` | BarChart3 | Athletic | Não |
| Modalidades | `/groups/{groupId}/modalities` | Target | Athletic | Sim ⭐ |

---

### Seção: Ferramentas (colapsável)

| Item | Rota | Ícone | Disponível | Custo |
|------|------|-------|------------|-------|
| Treinos Recorrentes | `/groups/{groupId}/recurring` | Zap | Sempre | 5 créditos |
| Convocações | `/groups/{groupId}/convocations` | Target | Sempre | 3 créditos |
| Analytics | `/groups/{groupId}/analytics` | BarChart3 | Athletic | 10 créditos/mês |

---

## 🎯 Estados Visuais

### Item Ativo
- Background: `bg-uzzai-mint/10`
- Texto: `text-uzzai-mint`
- Font weight: `font-medium`

### Item Hover
- Background: `hover:bg-accent`
- Texto: `hover:text-foreground`

### Item Premium
- Ícone: ⭐ (Sparkles) em dourado
- Badge: Custo em créditos

### Badges
- **Notificações:** Variante `destructive` (vermelho)
- **Créditos:** Variante `secondary` (prata)

---

## 🔧 Customização

### Adicionar Nova Seção

```typescript
// Em src/components/layout/sidebar.tsx
const sections: NavSection[] = [
  // ... seções existentes
  {
    title: "Nova Seção",
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        title: "Novo Item",
        href: `/groups/${groupId}/novo-item`,
        icon: Star,
        isPremium: true,
        badge: "10 créditos",
        badgeVariant: "secondary",
        description: "Descrição do item",
      },
    ],
  },
];
```

---

### Adicionar Condição Personalizada

```typescript
// Exemplo: Mostrar item apenas para grupos com mais de 20 membros
const sections: NavSection[] = [
  {
    title: "Gestão",
    items: [
      // ... itens existentes
      ...(memberCount > 20
        ? [
            {
              title: "Campeonatos",
              href: `/groups/${groupId}/tournaments`,
              icon: Trophy,
              description: "Gerenciar campeonatos",
            } as NavItem,
          ]
        : []),
    ],
  },
];
```

---

## 📱 Responsividade

A sidebar é **fixa** com largura de `256px` (w-64).

Para torná-la responsiva em mobile:

```tsx
// Exemplo com estado de abertura/fechamento
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function ResponsiveLayout({ children, ...sidebarProps }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Mobile: Sidebar overlay */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        isOpen ? "block" : "hidden"
      )}>
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
        <div className="absolute left-0 top-0 bottom-0">
          <Sidebar {...sidebarProps} />
        </div>
      </div>

      {/* Desktop: Sidebar fixa */}
      <div className="hidden lg:block">
        <Sidebar {...sidebarProps} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile: Botão menu */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden m-4"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {children}
      </main>
    </div>
  );
}
```

---

## ✅ Checklist de Implementação

- [x] Criar componente `Sidebar.tsx`
- [x] Implementar navegação hierárquica
- [x] Adicionar suporte a `groupType` (athletic vs pelada)
- [x] Implementar seções (Principal, Gestão, Análise, Ferramentas)
- [x] Adicionar badges (notificações, contadores, créditos)
- [x] Aplicar Design System UzzAI
- [x] Testar estados (active, hover)
- [x] Criar documentação completa
- [x] Criar exemplos de uso
- [ ] Integrar em layout existente (próximo passo)
- [ ] Testar responsividade mobile (próximo passo)

---

## 🔗 Arquivos Relacionados

- **Componente:** `src/components/layout/sidebar.tsx`
- **Exemplos:** `src/components/layout/sidebar-example.tsx`
- **Design System:** `src/components/ui/README.md`
- **Checklist:** `docs/18-fase_0/CHECKLIST-EXECUCAO.md`

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Implementado  
**Próximo:** Integração com layouts existentes






