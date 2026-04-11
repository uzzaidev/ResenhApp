# Raio-X Estrutural — ResenhApp
## Análise de Navegação, Domínios e Prioridade de Correção

> **Data:** 2026-03-11
> **Baseado em:** middleware, (dashboard)/layout.tsx, groups/[groupId]/page.tsx, sidebar.tsx
> **Status:** ✅ Diagnóstico concluído

---

## TL;DR — Os 5 problemas reais

1. **Não existe middleware.ts** — auth é manual por página, sem proteção centralizada
2. **O app tem dois shells visuais incompatíveis** que o usuário atravessa sem perceber
3. **O sidebar aponta para fora de si mesmo** — "Novo Evento" te tira do dashboard
4. **groups/[groupId]/page.tsx é um app dentro do app** — tem seu próprio header, hero, back button
5. **DirectMode é um terceiro layout silencioso** — três estados de layout, zero clareza de quando cada um aparece

---

## 1. Middleware — Não existe

### O que foi encontrado

`middleware.ts` não existe na raiz nem em `src/`. O arquivo de `src/lib/auth.ts` exporta `{ handlers, signIn, signOut, auth }` via NextAuth, mas **nenhum arquivo registra o middleware do NextAuth para proteger rotas**.

### O que isso significa na prática

- Cada página protegida faz `getCurrentUser()` + `redirect("/auth/signin")` manualmente
- Não há garantia de que todas as páginas fazem essa verificação
- Um usuário não autenticado pode tentar acessar qualquer rota — o comportamento depende de cada `page.tsx` ter lembrado de verificar
- `/events/[eventId]/page.tsx` existe fora do (dashboard) — não está claro se é pública ou protegida

### Detalhe adicional encontrado em `auth.ts`

```ts
// Tenta primeiro 'users', depois 'profiles' se users não existir
result = await sql`SELECT ... FROM users ...`
// fallback:
result = await sql`SELECT ... FROM profiles INNER JOIN auth.users ...`
```

Isso indica que o sistema tem **duas tabelas de usuário coexistindo** (`users` e `profiles`) e o auth faz fallback entre elas. Os SQL queries no `groups/[groupId]/page.tsx` usam `users` diretamente — confirma que `users` é a tabela operacional real, mas `profiles` do Supabase também existe.

---

## 2. Os dois shells visuais — O problema central

### Shell A: `(dashboard)/layout.tsx`

```
┌─────────────────────────────────────────┐
│  Sidebar (fixed, 288px)  │  Topbar      │
│                          ├──────────────│
│  Principal               │  Breadcrumbs │
│   - Dashboard            │              │
│   - Modalidades          │   [page]     │
│   - Atletas              │              │
│  Gestão                  │              │
│   - Treinos              │              │
│   - Jogos Oficiais       │              │
│   - Financeiro           │              │
│  Análise                 │              │
│   - Frequência           │              │
│   - Rankings             │              │
│  Ferramentas             │              │
│   - Tabelinha Tática     │              │
│   - Configurações        │              │
│                          │              │
│  [Créditos]              │              │
└─────────────────────────────────────────┘
```

**Rotas que usam este shell:**
`/dashboard`, `/atletas`, `/treinos`, `/jogos`, `/frequencia`, `/rankings`, `/financeiro`, `/modalidades`, `/settings`

---

### Shell B: `groups/[groupId]/page.tsx` — um app diferente

```
┌─────────────────────────────────────────┐
│  DashboardHeader (userName)             │
├─────────────────────────────────────────│
│  Hero gradient (navy → green)           │
│  ← Voltar para o dashboard              │
│  Nome do Grupo        [Admin][Criar][$$] │
├─────────────────────────────────────────│
│  UpcomingEventsCard                     │
│  MyStatsCard                            │
│  RankingsCard (tabs)                    │
│  RecentMatchesCard                      │
└─────────────────────────────────────────┘
```

**Rotas que usam este shell:**
`/groups/[id]`, `/groups/[id]/events/[id]`, `/groups/[id]/settings`, `/groups/[id]/payments`

---

### O ponto de ruptura

O usuário está no Shell A navegando em `/treinos`. Clica num treino. Vai para `/groups/[id]/events/[id]`.

**O que acontece:**
- Sidebar some
- Breadcrumbs somem
- Aparece um header diferente
- Aparece um botão "← Voltar para o dashboard" hardcoded para `/dashboard`

**O que o usuário sente:**
- "Saí do app?"
- "Como volto para a lista de treinos?"
- "Por que a navegação mudou?"

Esse salto acontece **toda vez** que o usuário interage com qualquer evento, grupo ou ação que cruze a fronteira entre os dois shells.

---

## 3. O sidebar aponta para fora de si mesmo

### Botão "Novo Evento" no sidebar

```tsx
// sidebar.tsx:155-159
<Button asChild size="sm" className="w-full">
  <Link href={`/groups/${resolvedGroupId}/events/new`}>
    <Plus className="mr-2 h-4 w-4" />
    Novo Evento
  </Link>
</Button>
```

Quando o usuário clica em "Novo Evento" **dentro do dashboard (Shell A)**, é redirecionado para `/groups/[id]/events/new` que pertence ao **Shell B**. A sidebar desaparece.

### Link de Créditos no sidebar

```tsx
// sidebar.tsx:179-199
<Link href={`/groups/${resolvedGroupId}/credits`}>
  Créditos / Ver saldo
</Link>
```

Mesmo problema. "Ver saldo" sai do dashboard.

### Itens de nav que não aparecem no sidebar

| Rota existe | Aparece no sidebar? |
|-------------|----------------------|
| `/feed` | ❌ não |
| `/profile/[id]` | ❌ não |
| `/onboarding` | ❌ não |
| `/groups/new` | só se não há grupo |
| `/groups/[id]` | ❌ não |
| `/credits/buy` | ❌ não |

O feed social, perfil, onboarding e a própria página do grupo não têm entrada na navegação principal.

---

## 4. `groups/[groupId]/page.tsx` — app dentro do app

### Sintomas

- **539 linhas** de server component
- **9 queries SQL separadas** executadas em série no corpo do page
- **Seu próprio `DashboardHeader`** importado de `components/layout/dashboard-header.tsx` — componente de layout diferente do `Topbar` do Shell A
- **Back button hardcoded:** `<Link href="/dashboard">` — não usa `router.back()` nem breadcrumb dinâmico
- **Calcula ranking** inline no page (CTE complexa)
- **Não reutiliza nada do shell A** — é uma página totalmente autossuficiente

### Por que isso é um problema

```
(dashboard)/layout.tsx  ─── tem sidebar, topbar, breadcrumbs
groups/[groupId]/page.tsx ── tem DashboardHeader próprio, hero próprio, back button próprio
```

São dois sistemas de layout paralelos sem compartilhamento. Quando o produto crescer, mudanças de navegação precisarão ser feitas em dois lugares.

### A query mais sintomática

```tsx
// Linha 163 — usa tabela `users`, não `profiles`
FROM event_actions ea
INNER JOIN users u ON ea.subject_user_id = u.id
```

Confirma que o banco tem `users` como tabela operacional principal, mas o Supabase tem `profiles`. São dois sistemas de identidade.

---

## 5. DirectMode — o terceiro layout invisível

### O que é

```tsx
// (dashboard)/layout.tsx
const { isDirectMode } = useDirectMode();

if (isDirectMode) {
  return (
    <div className="min-h-screen">
      <Topbar />
      <main className="pt-16">{children}</main>  // ← sem sidebar, sem breadcrumbs
    </div>
  );
}
```

Existe um contexto `DirectModeContext` que quando ativado remove a sidebar inteiramente e renderiza apenas a `Topbar`. Isso cria um **terceiro estado de layout**.

### Os três estados de layout que existem hoje

| Estado | Quando | Visual |
|--------|--------|--------|
| Shell A — Normal | dentro de (dashboard), DirectMode=false | sidebar + topbar + breadcrumbs |
| Shell A — DirectMode | dentro de (dashboard), DirectMode=true | só topbar |
| Shell B — Group | dentro de groups/ | DashboardHeader + hero próprio |

O usuário pode transitar entre qualquer um desses estados dependendo de onde clica, sem perceber que o layout mudou de sistema.

---

## 6. Mapa do problema completo

```
Usuário está em /treinos (Shell A, sidebar visível)
        │
        ▼
  Clica num treino
        │
        ▼
  /groups/[id]/events/[id]   ← Shell B (sem sidebar)
        │
        ▼
  Clica "← Voltar para o dashboard"
        │
        ▼
  /dashboard (Shell A, sidebar visível)
        │
        ▼
  NÃO voltou para /treinos — voltou para o dashboard
  → usuário perdeu o contexto de onde estava
```

```
Usuário está em /dashboard (Shell A)
        │
        ▼
  Clica "Novo Evento" no sidebar
        │
        ▼
  /groups/[id]/events/new   ← Shell B (sem sidebar)
        │
        ▼
  Cria o evento
        │
        ▼
  Redireciona para... onde? /dashboard? /treinos? /groups/[id]?
  → comportamento pós-ação não está claro
```

---

## 7. O que mover, o que unificar, o que virar filtro

### Opção A — Trazer tudo para dentro do (dashboard) [recomendada]

**O que fazer:**
- Mover `groups/[groupId]/` para dentro de `(dashboard)/groups/[groupId]/`
- O `layout.tsx` do dashboard passa a envolver também as páginas de grupo
- A página `/groups/[id]` passa a ter sidebar + topbar como qualquer outra rota do dashboard
- Remover o `DashboardHeader` customizado da página de grupo — usar o `Topbar` existente
- Transformar "Grupo atual" no sidebar em link clicável para `/groups/[id]`
- O breadcrumb já existente cobre a navegação: `Dashboard > Grupos > [Nome do Grupo]`

**O que isso resolve:**
- Usuário nunca perde a sidebar ao navegar entre treinos, jogos e grupos
- "Novo Evento" no sidebar não quebra mais o contexto
- Créditos do grupo ficam acessíveis sem sair do shell

**Custo:** médio — requer mover arquivos e ajustar o `layout.tsx` para aceitar páginas de grupo sem o hero customizado

---

### Opção B — Criar layout para groups/ [menor esforço imediato]

**O que fazer:**
- Criar `groups/layout.tsx` que inclui a `Sidebar` e `Topbar`
- Mantém a estrutura de arquivos atual
- Remove o `DashboardHeader` redundante da página de grupo

**O que isso resolve:**
- Sidebar não desaparece ao entrar em `/groups/[id]`
- Não exige mover arquivos

**Custo:** baixo — criar um arquivo `groups/layout.tsx`

**Desvantagem:** ainda mantém dois route groups separados, o que pode criar confusão futura

---

### O que virar filtro (não rota separada)

`/treinos` e `/jogos` são a mesma coisa filtrada por `event_type`. Em vez de duas rotas, deveria ser:

```
/eventos?tipo=treino
/eventos?tipo=jogo
```

Ou melhor: uma única rota `/eventos` com tabs/filtros. A sidebar teria um item "Eventos" com sub-itens colapsáveis.

Mesmo vale para `/rankings` — é um subset do que já aparece em `/groups/[id]`.

---

## 8. Prioridade de correção

### P0 — Crítico (sem isso o app confunde qualquer usuário)

| # | Ação | Onde | Impacto |
|---|------|------|---------|
| 1 | Criar `middleware.ts` com NextAuth auth guard | raiz do projeto | todos os usuários desautenticados |
| 2 | Criar `groups/layout.tsx` com Sidebar + Topbar | `src/app/groups/layout.tsx` | quebra de contexto visual |
| 3 | Remover `DashboardHeader` de `groups/[groupId]/page.tsx` | `page.tsx:452` | header duplicado |
| 4 | Corrigir back button: de `/dashboard` para `router.back()` ou breadcrumb dinâmico | `page.tsx:459` | usuário perde contexto |

### P1 — Importante (navegação incompleta)

| # | Ação | Onde | Impacto |
|---|------|------|---------|
| 5 | Adicionar link para `/groups/[id]` no sidebar (nome do grupo clicável) | `sidebar.tsx:150` | grupo sem entrada direta na nav |
| 6 | "Novo Evento" no sidebar deve abrir modal ou rota dentro do dashboard | `sidebar.tsx:155` | sair do shell para criar evento |
| 7 | Definir se `/events/[eventId]` é pública ou privada — e implementar auth check | `app/events/[eventId]/page.tsx` | segurança e UX incertos |
| 8 | Adicionar Feed ao sidebar ou documentar que não é feature principal | `sidebar.tsx` | feature invisível |

### P2 — Estrutural (dívida técnica)

| # | Ação | Onde | Impacto |
|---|------|------|---------|
| 9 | Unificar `/treinos` e `/jogos` em `/eventos` com filtro por tipo | rotas + sidebar | rotas redundantes |
| 10 | Mover 9 queries de `groups/[groupId]/page.tsx` para server actions ou API | `page.tsx` | page de 539 linhas |
| 11 | Esclarecer/remover DirectMode ou documentar quando deve ser usado | `layout.tsx`, `contexts/` | terceiro layout silencioso |
| 12 | Consolidar `users` vs `profiles` — escolher um e manter consistência | auth.ts, queries | dois sistemas de identidade |

---

## 9. Quick wins — o que fazer primeiro

Se só tiver tempo para fazer 3 coisas, faça estas:

### 1. Criar `src/app/groups/layout.tsx`

```tsx
// src/app/groups/layout.tsx
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';

export default function GroupsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <Sidebar className="h-screen" />
      </aside>
      <div className="flex min-h-screen flex-col lg:pl-72">
        <Topbar />
        <div className="px-4 pt-4 md:px-6 lg:px-8">
          <Breadcrumbs />
        </div>
        <main className="flex-1 px-4 pb-8 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

Isso resolve o shell B instantaneamente. Todas as rotas de `/groups/` ganham sidebar sem mover um arquivo.

### 2. Criar `src/middleware.ts`

```ts
// src/middleware.ts  (ou raiz/middleware.ts)
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: [
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|simple-test).*)",
  ],
}
```

Centraliza a proteção de rotas. Sem isso qualquer rota nova pode ficar desprotegida silenciosamente.

### 3. Tornar o nome do grupo no sidebar clicável

```tsx
// sidebar.tsx linha 150 — de:
<p className="truncate text-xs text-white/70">{currentGroup?.name ?? "Nenhum grupo selecionado"}</p>

// Para:
{currentGroup ? (
  <Link href={`/groups/${currentGroup.id}`} className="truncate text-xs text-white/70 hover:text-white">
    {currentGroup.name}
  </Link>
) : (
  <p className="truncate text-xs text-white/70">Nenhum grupo selecionado</p>
)}
```

Dá ao usuário uma entrada direta para a página do grupo a partir do sidebar, sem precisar sair do shell.

---

## 10. Resumo final

| Problema | Causa | Correção |
|----------|-------|----------|
| Usuário perde sidebar ao entrar no grupo | `groups/` não tem layout | criar `groups/layout.tsx` |
| Auth não protege rotas globalmente | middleware.ts não existe | criar middleware.ts |
| "Novo Evento" quebra contexto | link aponta para fora do shell | modal ou rota interna |
| Voltar do grupo vai para dashboard, não para a lista | back button hardcoded | usar breadcrumb ou router.back() |
| Feed e perfil são invisíveis | sem link no sidebar | adicionar ao sidebar ou cortar |
| DirectMode causa terceiro layout | contexto sem UX clara | documentar ou remover |
| `/treinos` e `/jogos` são rotas duplicadas | event_type deveria ser filtro | unificar em `/eventos` |
| `users` vs `profiles` coexistem | migração incompleta | esclarecer e padronizar |

---

**Próximo passo recomendado:** implementar os 3 quick wins acima e então reavaliar com o olhar de um usuário novo entrando no app pela primeira vez.

---

**Gerado em:** 2026-03-11
**Baseado em leitura direta de:** middleware (ausente), layout.tsx, groups/[groupId]/page.tsx, sidebar.tsx, auth.ts
