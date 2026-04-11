# ResenhApp V2.0 — Arquitetura (do Código)
> FATO (do código) — extraído de src/, supabase/, vercel.json

## Visão Geral

```mermaid
graph TB
    subgraph Client["Cliente (Browser)"]
        UI[React 19 Components]
        ZS[Zustand Store\nauth-store]
        GC[GroupContext\ngrupo ativo]
        DM[DirectModeContext\nmodo simplificado]
    end

    subgraph NextJS["Next.js 16 (Vercel)"]
        APP[App Router\nsrc/app]
        MW[Middleware\nNextAuth Session]
        API[API Routes\n54 endpoints]
        SC[Server Components\nSSR data fetch]
    end

    subgraph Auth["Autenticação"]
        NA[NextAuth v5 beta\nCredentials Provider]
        JWT[JWT Cookie\nHTTP-only]
        PA[pg-adapter\nPostgreSQL session]
    end

    subgraph DB["Banco de Dados"]
        SB[Supabase PostgreSQL\n~47 tabelas]
        RLS[RLS Policies\nRow Level Security]
        FN[PostgreSQL Functions\n~70 funções]
        RT[Realtime\n6 tabelas]
        ST[Storage\n4 buckets]
    end

    subgraph Infra["Infraestrutura"]
        VR[Vercel\nDeploy + Crons]
        CF[Cloudflare\nDNS + CDN]
        SN[Sentry\nError Tracking]
    end

    UI --> GC
    UI --> ZS
    UI --> API
    SC --> DB
    API --> NA
    API --> DB
    NA --> JWT
    NA --> PA
    PA --> DB
    DB --> RLS
    DB --> FN
    DB --> RT
    RT --> UI
    VR --> CF
    API --> SN
    SC --> SN
```

## Padrões de Roteamento

### App Router (Next.js 16)
- **Route Groups**: `(dashboard)` — agrupa rotas com layout compartilhado sem afetar URL
- **Dynamic Routes**: `[groupId]`, `[eventId]`, `[id]`, `[userId]`, `[chargeId]`, `[modalityId]`, `[inviteId]`
- **API Routes**: Convenção `route.ts` dentro de `src/app/api/`
- **Layouts**: Cascata de layouts (`layout.tsx`) aplicados automaticamente

### Tipos de Componentes
| Tipo | Indicador | Uso |
|------|-----------|-----|
| Server Component | sem "use client" | Data fetching, SSR, páginas |
| Client Component | "use client" no topo | Interatividade, hooks, contextos |

## Camadas da Aplicação

```
┌─────────────────────────────────────────────────────┐
│ CAMADA DE APRESENTAÇÃO                               │
│ src/components/ (105 arquivos)                       │
│ shadcn/ui + Tailwind CSS + Design System UzzAI       │
├─────────────────────────────────────────────────────┤
│ CAMADA DE ESTADO                                     │
│ Zustand (auth-store) + GroupContext + DirectMode     │
├─────────────────────────────────────────────────────┤
│ CAMADA DE ROTEAMENTO                                 │
│ Next.js App Router (src/app/)                        │
│ Server Components + Client Components                │
├─────────────────────────────────────────────────────┤
│ CAMADA DE API                                        │
│ API Routes (src/app/api/) — 54 endpoints             │
│ Validação Zod + Auth NextAuth + Rate Limiting        │
├─────────────────────────────────────────────────────┤
│ CAMADA DE NEGÓCIO                                    │
│ src/lib/ (auth, pix, credits, permissions, etc.)     │
├─────────────────────────────────────────────────────┤
│ CAMADA DE DADOS                                      │
│ src/db/client.ts — postgres@3.4.8                    │
│ SQL direto (template literals)                       │
├─────────────────────────────────────────────────────┤
│ BANCO DE DADOS                                       │
│ Supabase PostgreSQL (~47 tabelas, ~70 functions)     │
│ RLS Policies + Triggers + Realtime                   │
└─────────────────────────────────────────────────────┘
```

## Hierarquia de Grupos

```mermaid
graph TD
    A[Atlética\nparent_group_id = NULL\ngroup_type = 'athletic'] --> B[Pelada A\ngroup_type = 'pelada']
    A --> C[Pelada B\ngroup_type = 'pelada']
    A --> D[Pelada C\ngroup_type = 'pelada']
```

- Máximo 2 níveis
- Atlética pode ter múltiplas peladas filhas
- Admin da Atlética gerencia todas as filhas

## Design System
- **Paleta**: UzzAI Retrofuturista
  - Mint #1ABC9C (CTAs, destaques)
  - Black #1C1C1C (fundos)
  - Silver #B0B0B0 (textos secundários)
  - Blue #2E86AB (suporte)
  - Gold #FFD700 (premium)
- **Fontes**: Poppins (títulos), Inter (corpo), Exo 2 (métricas), Fira Code (código)
- **Dark Mode**: Suporte via CSS classes (tema padrão dark)
