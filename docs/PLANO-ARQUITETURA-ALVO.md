# Plano de Arquitetura-Alvo — ResenhApp
## Contrato Canônico do Produto + Plano de Implementação

> **Data:** 2026-03-11
> **Versão:** 1.2 — contradições resolvidas, pronto para GO
> **Status:** ✅ Aprovado para implementação
> **Baseado em:** DIAGNOSTICO-ESTRUTURAL-APP.md + RAIO-X-ESTRUTURAL.md
> **Propósito:** Congela as decisões estruturais para o time não continuar reforçando a bagunça

---

## TL;DR — O que muda

| Antes | Depois |
|-------|--------|
| Dois shells visuais incompatíveis | Um shell autenticado único para a experiência principal |
| `/treinos` e `/jogos` como domínios separados | `/eventos` com filtros de tipo |
| Grupo é um "app paralelo" | Grupo é uma página contextual dentro do shell |
| Créditos da plataforma na nav principal | Quota escondida em camada de plataforma |
| Onboarding opcional, dashboard pode estar vazio | Onboarding obrigatório em shell próprio antes da experiência completa |
| Auth manual por página | Middleware centralizado |
| "Perfil" e "Atleta" como conceitos separados | **Atleta** é o nome canônico — com flexibilidade contextual na UI |
| Ranking global cross-grupos | Ranking por tenant resolvido via grupo ativo |
| `users` vs `profiles` sem decisão formal | Hipótese preferencial: `users`, sujeito a validação na Fase 5 |

---

## Princípios do Produto

> Estas regras valem para qualquer nova decisão de produto, UX ou código.

1. **Um conceito, uma função** — nenhuma entidade faz dois trabalhos
2. **Um shell autenticado principal, uma experiência** — fluxos especiais (onboarding, compartilhamento) têm shells próprios e separados
3. **Grupo é a unidade operacional** — toda ação principal nasce de um grupo
4. **Evento é a unidade de ação** — treino e jogo são o mesmo domínio com tipos diferentes
5. **Dinheiro real e consumo de plataforma nunca disputam atenção** — são camadas distintas
6. **Atleta novo sempre entra com contexto** — nenhum dashboard vazio sem pertencimento a um grupo
7. **Fluxos principais vencem features periféricas** — grupos, eventos, presença e cobrança vêm antes de social, gamificação e quota
8. **Ranking respeita o tenant** — determinado pelo grupo ativo, não por seleção global
9. **Atleta é quem usa o app** — nome canônico no contexto esportivo, com flexibilidade textual na UI

---

## O que é Core vs o que é Suporte

### Core — o que justifica o produto existir

- Grupos
- Eventos (treinos e jogos)
- Presença / RSVP
- Financeiro do grupo (cobranças, PIX)
- Membros e permissões

### Suporte — existe, tem valor, mas não define a experiência

- Rankings (contextual por tenant)
- Perfil do atleta
- Modalidades
- Onboarding
- Notificações

### Congelado — não expandir até o core estar estável

- Feed social global
- Gamificação / achievements
- Referrals
- Quota exposta como feature
- Tabelinha tática (experimental)

---

## Parte 1 — Nomenclatura Oficial v1

> Regra: DB, código e UI devem usar o mesmo conceito. Este é o vocabulário do time.

### Entidades principais

| Conceito | Nome canônico UI | Nome no código | Nome no banco |
|----------|-----------------|----------------|---------------|
| Unidade operacional | **Grupo** | `Group` | `groups` |
| Subgrupo de modalidade | **Grupo de Modalidade** | `ModalityGroup` | `groups` (com `parent_group_id`) |
| Organização-pai | **Atlética** | `Athletic` | `groups` (com `group_type='atletica'`) |
| Ação do dia a dia | **Evento** | `Event` | `events` |
| Evento de prática | **Treino** | `Training` | `events` (com `event_type='training'`) |
| Evento competitivo | **Jogo** | `Match` | `events` (com `event_type='match'`) |
| Confirmação de presença | **RSVP** | `RSVP` | `event_attendance` |
| Vínculo usuário-grupo | **Membro** | `Member` | `group_members` |
| Cobrança financeira real | **Cobrança** | `Charge` | `charges` |
| Pagamento via PIX | **Pagamento** | `Payment` | `charge_splits` |
| Moeda interna da plataforma | **Quota de Plataforma** | `PlatformCredit` | `wallets` (owner_type='user') |
| Usuário no contexto esportivo | **Atleta** | `Athlete` | `users` |

### Decisão: Atleta = nome canônico (com flexibilidade contextual)

**Atleta** é o nome canônico para o usuário dentro do produto.

- Na UI: "Atleta", "Ver Atleta", "Perfil do Atleta"
- No código: `Athlete`, `AthleteProfile`
- No banco: tabela `users`
- Rota: `/atletas/[userId]` (estado alvo conceitual)

**Não existe mais `/profile/`** como domínio separado. Perfil é a página de um atleta.

| Contexto | Rota alvo | Rota técnica atual |
|----------|-----------|-------------------|
| Meu próprio perfil | `/atletas/me` | `/atletas/[meuId]` |
| Ver outro atleta | `/atletas/[userId]` | `/profile/[userId]` → redirect |
| Lista de atletas do grupo | `/atletas` | `/atletas` (mantém) |

**Nota de linguagem:** "Atleta" é o nome canônico de sistema. Na UI, textos contextuais podem usar "membro", "participante" ou "organizador" quando for mais natural — sem inconsistência técnica, desde que o sistema subjacente use `Athlete` e `/atletas`.

### Decisão: Ranking por Tenant via Grupo Ativo

**Não existe ranking global cross-grupos.**

O tenant atual é sempre resolvido pelo **grupo ativo** no contexto do atleta (via `group-context`).

| Estrutura | Tenant resolvido | Ranking cobre |
|-----------|-----------------|---------------|
| Atleta com subgrupo futsal ativo | Subgrupo futsal | atletas daquele subgrupo |
| Admin com atlética ativa | Atlética | todos os atletas da atlética + subgrupos |
| Atleta de grupo standalone | O próprio grupo | apenas atletas daquele grupo |

```
Atlética SP (grupo raiz)
  ├── Futsal      ← grupo ativo = Futsal → ranking do Futsal
  ├── Society     ← grupo ativo = Society → ranking do Society
  └── Atlética SP ← grupo ativo = Atlética → ranking consolidado

Pelada da Firma (standalone)
  └── grupo ativo = Pelada da Firma → ranking da Pelada da Firma
```

**Regras do tenant:**
- Quem define o tenant: o **grupo ativo** selecionado (group-context / group switcher)
- O admin da atlética pode alternar o grupo ativo entre atlética e subgrupos
- `/rankings` sempre abre o ranking do grupo ativo — sem seleção manual de tenant na URL
- Não existe `/rankings?tenant=...` — o contexto vem do grupo ativo

### Regras de nomenclatura

- **Nunca** usar "pelada" como nome de entidade no código — é linguagem informal de domínio
- **Nunca** usar "crédito" e "cobrança" no mesmo contexto sem qualificador — são camadas diferentes
- **Treino** e **Jogo** são subtipos de **Evento** — nunca domínios separados na nav ou no código
- **Atlética** só aparece na UI para admins de organizações — invisível para atleta comum
- O campo de tipo do evento é `event_type` — valores canônicos: `training` e `match`
- **Atleta** é o nome canônico do usuário — com flexibilidade textual contextual na UI

---

## Parte 2 — Duas Camadas de URL

> **Decisão importante:** manter as duas camadas separadas para não misturar reorganização com renomeação de URL.

### Camada A — URL Conceitual (nome canônico do produto)

São os paths que o produto deve ter no estado final.
Usados para documentação, wireframes, planning e nomenclatura de domínio.

```
/grupos/[id]
/eventos/[id]
/atletas/[id]
/configuracoes
```

### Camada B — URL Técnica Atual (paths reais no código agora)

São os paths que existem hoje e serão mantidos durante as Fases 0 e 1.
A migração de URL é uma **etapa isolada**, não misturada com reorganização de arquivos.

```
/groups/[id]        → conceitual: /grupos/[id]
/treinos            → conceitual: /eventos?tipo=treino
/jogos              → conceitual: /eventos?tipo=jogo
/profile/[id]       → conceitual: /atletas/[id]
```

### Regra de execução

- Fases 0 e 1: trabalhar com **URLs técnicas atuais** — não renomear paths
- A migração de URL para URLs canônicas é uma **etapa separada** após o shell estar estável
- Nas tabelas de tarefas das fases, o campo "Arquivo" usa o path técnico atual

---

## Parte 3 — Mapa de Rotas

### Estado atual (problema)

```
src/app/
  (dashboard)/           ← Shell A: com sidebar
    dashboard/
    treinos/
    jogos/
    financeiro/
    ...
  groups/                ← Shell B: sem sidebar (app paralelo)
    [groupId]/
    [groupId]/events/
    [groupId]/settings/
  feed/                  ← sem shell
  profile/               ← sem shell
  onboarding/            ← sem shell, fluxo solto
```

### Estado alvo — arquitetura de shells

```
src/app/
  ┌──────────────────────────────────────────────────────┐
  │ (auth)/                                              │
  │   ← shell mínimo público, sem autenticação          │
  │   signin/page.tsx                                    │
  │   signup/page.tsx                                    │
  │   error/page.tsx                                     │
  └──────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────┐
  │ (app)/                                               │
  │   ← SHELL PRINCIPAL AUTENTICADO                      │
  │   ← sidebar + topbar + breadcrumbs (sempre)          │
  │   ← inclui toda experiência operacional              │
  │                                                      │
  │   dashboard/page.tsx                                 │
  │   grupos/[groupId]/page.tsx                          │
  │   eventos/[eventId]/page.tsx                         │
  │   atletas/[userId]/page.tsx                          │
  │   financeiro/page.tsx                                │
  │   rankings/page.tsx                                  │
  │   configuracoes/page.tsx                             │
  └──────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────┐
  │ onboarding/                                          │
  │   ← shell próprio autenticado, sem sidebar           │
  │   ← fora do shell principal por design               │
  │   ← requer auth, mas não faz parte da exp. principal │
  │                                                      │
  │   page.tsx                                           │
  │   step/[step]/page.tsx                               │
  └──────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────┐
  │ events/[eventId]/page.tsx                            │
  │   ← rota pública de compartilhamento                 │
  │   ← sem autenticação obrigatória                     │
  │   ← shell mínimo de preview                         │
  └──────────────────────────────────────────────────────┘
```

### Regra corrigida sobre rotas autenticadas

> Toda rota que faz parte da **experiência operacional principal** vive dentro de `(app)/`.
>
> Fluxos autenticados especiais — onboarding, compartilhamento, futuramente pagamento externo — ficam em route groups próprios **fora** de `(app)/`, mas ainda protegidos por auth quando necessário.

### Rotas que viram redirects (não apagar — redirecionar)

| Rota técnica atual | Redireciona para | Quando |
|--------------------|-----------------|--------|
| `/treinos` | `/eventos?tipo=treino` | Fase 2 |
| `/jogos` | `/eventos?tipo=jogo` | Fase 2 |
| `/groups/[id]` | `/grupos/[id]` | Fase 1 (migração de URL) |
| `/groups/[id]/events/[id]` | `/eventos/[id]` | Fase 2 |
| `/profile/[id]` | `/atletas/[id]` | Fase 1 (migração de URL) |
| `/groups/[id]/credits` | `/configuracoes` (aba Quota) | Fase 4 |

---

## Parte 4 — Shell Principal Autenticado `(app)/`

> **Shell autenticado único ≠ dashboard central.**
> Dashboard é uma **página** dentro do shell. O shell é a **experiência** autenticada inteira.
> Sidebar, topbar e breadcrumbs pertencem ao shell — não ao dashboard.

### Layout do shell `(app)/layout.tsx`

```
┌───────────────────────────────────────────────────────┐
│  Sidebar (fixed 288px)        │  Topbar               │
│                               ├───────────────────────│
│  [Logo]                       │  Breadcrumbs          │
│  [Nome do Grupo — clicável]   │                       │
│                               │                       │
│  ─────────────────────────    │   [page content]      │
│  Principal                    │                       │
│    Dashboard                  │                       │
│    Grupos                     │                       │
│                               │                       │
│  ─────────────────────────    │                       │
│  Operacional                  │                       │
│    Eventos  ▾                 │                       │
│      · Todos                  │                       │
│      · Treinos                │                       │
│      · Jogos                  │                       │
│    Financeiro                 │                       │
│    Atletas                    │                       │
│                               │                       │
│  ─────────────────────────    │                       │
│  Análise                      │                       │
│    Rankings                   │                       │
│    Frequência                 │                       │
│                               │                       │
│  ─────────────────────────    │                       │
│  Ferramentas (colapsável)     │                       │
│    Tabelinha Tática           │                       │
│    Configurações              │                       │
│                               │                       │
│  ─────────────── (rodapé)     │                       │
│  [Avatar] Nome do Atleta →    │                       │
└───────────────────────────────────────────────────────┘
```

### Diferenças em relação ao sidebar atual

| Item atual | No alvo | Motivo |
|------------|---------|--------|
| "Modalidades" em Principal | move para Ferramentas | não é ação diária |
| "Treinos" em Gestão | vira subitem de Eventos | treino é tipo de evento |
| "Jogos Oficiais" em Gestão | vira subitem de Eventos | jogo é tipo de evento |
| "Créditos" no rodapé | remove na Fase 1 | vai para Configurações na Fase 4 |
| Badge "PENDENTE" de créditos | remove na Fase 1 | não pertence à nav principal |
| Grupo atual (só texto) | vira link clicável para o grupo | entrada direta para o grupo |
| "Novo Evento" (botão fixo) | remove do sidebar fixo | move para CTA contextual (Parte 5) |
| Perfil no rodapé | adicionar: avatar + nome clicável | identidade visível |

### O que DirectMode se torna

**DirectMode é eliminado como conceito de layout.**

O layout é determinado pela **rota**, não por toggle de runtime. Cada tipo de experiência tem seu route group:

| Experiência | Route group | Shell |
|-------------|-------------|-------|
| App principal | `(app)/` | sidebar + topbar + breadcrumbs |
| Autenticação | `(auth)/` | mínimo público |
| Onboarding | `onboarding/` | sem sidebar, com topbar mínimo |
| Compartilhamento | `events/` | preview público |

---

## Parte 5 — Fase 0 como Ponte Tática

> **A Fase 0 é uma ponte de estabilização, não a arquitetura final.**
> O `groups/layout.tsx` criado é temporário — parar a quebra de contexto imediatamente enquanto a Fase 1 faz a migração completa.

```
Estado atual:            Ponte (Fase 0):              Final (Fase 1):
src/app/groups/          src/app/groups/layout.tsx    src/app/(app)/grupos/
  [groupId]/page.tsx       ← adiciona sidebar           [groupId]/page.tsx
  (sem sidebar)            (visual correto, temp.)      (shell definitivo)
```

A Fase 0 resolve o sintoma. A Fase 1 resolve a causa.

---

## Parte 6 — Página do Grupo (landing contextual)

A página do grupo é a **landing contextual do grupo** dentro do shell principal.

Ela responde: quem é esse grupo, próximos eventos, atletas ativos, ranking do tenant, ações admin.

### O que ela não é

- Não tem shell próprio — usa o `(app)/layout.tsx`
- Não tem header próprio — usa o Topbar do shell
- Não tem hero com navegação própria — usa breadcrumbs
- Não tem "← Voltar para o dashboard" hardcoded

### Estrutura de conteúdo

```
[Breadcrumb: Grupos > Nome do Grupo]

Nome do Grupo                        [Criar Evento]  [Configurações]
Descrição

┌──────────────────────────────────────────────────────────────┐
│  Próximos Eventos                              ver todos →    │
│  [EventCard] [EventCard] [EventCard]                         │
└──────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│  Minhas Stats   │  │  Top Artilheiros│  │  Frequência      │
└─────────────────┘  └─────────────────┘  └──────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Jogos Recentes                                              │
└──────────────────────────────────────────────────────────────┘
```

### Criação de evento — caminho canônico

**Evento nasce do grupo**, não do hub de eventos.

- **Caminho principal:** botão "Criar Evento" na página do grupo → `/events/new?groupId=[id]` (tech atual) → `/eventos/novo` com grupo pré-selecionado (estado alvo)
- **Caminho alternativo:** admin em `/eventos` → botão "Novo Evento" → seletor de grupo obrigatório
- **Após criar:** redireciona para `/events/[eventId]` (tech atual) / `/eventos/[eventId]` (alvo)
- **Nunca:** criação de evento que quebre o shell

---

## Parte 7 — Hub de Eventos

### A rota `/eventos` (alvo) / `/treinos` + `/jogos` (atual)

```
/eventos

  Tabs: [Todos]  [Treinos]  [Jogos]

  [EventCard — treino]
  [EventCard — jogo]
  [EventCard — treino]
  ...

  Filtros:
  - Grupo (se atleta é membro de múltiplos)
  - Período
  - Status (agendado | ao vivo | finalizado)
```

### A rota `/eventos/[eventId]`

```
[Breadcrumb: Eventos > Nome do Evento]

Nome do Evento                       [RSVP] [Editar] [Resultado]
Data · Horário · Local
Grupo: [Nome do Grupo →]

┌──────────────────────────────────────────────────────────────┐
│  Confirmados (12/20)                                         │
│  [Avatar][Avatar]...                                         │
└──────────────────────────────────────────────────────────────┘

[conteúdo condicional por event_type]
→ training: lista de confirmados, frequência
→ match: escalação, times, resultado, gols, cartões
```

---

## Parte 8 — Rota Pública `/events/[eventId]`

### O que mostra

- Nome do evento, data, horário, local
- Grupo organizador (nome, sem link interno para o app)
- Número de confirmados / vagas totais
- CTA: "Entrar no app para participar"

### O que não mostra

- Ações administrativas
- Dados financeiros
- Lista completa de membros
- Resultado interno do jogo

### Fluxo pós-CTA (atleta vem de link público)

```
Link público → /events/[eventId] (preview)
  ↓ clica "Entrar no app para participar"
  ↓
  Não autenticado:
    → /auth/signup (ou signin)
    → onboarding (se novo)
    → redirect de volta para /events/[eventId] autenticado

  Já autenticado:
    → redirect direto para /events/[eventId] autenticado
    → (se não é membro do grupo: mostra opção de solicitar entrada)
```

**Regra:** o atleta que veio de um link público de evento nunca cai no dashboard geral — volta para o evento que o trouxe.

---

## Parte 9 — Rankings por Tenant

### Tenant = grupo ativo

O tenant é sempre determinado pelo **grupo ativo** no `group-context`, não por seleção manual na URL.

```
Grupo ativo = "Futsal SP"   → /rankings mostra ranking do Futsal SP
Grupo ativo = "Atlética SP" → /rankings mostra ranking consolidado da Atlética SP
Grupo ativo = "Pelada Firma"→ /rankings mostra ranking da Pelada da Firma
```

### Hierarquia de ranking

```
Atlética SP (tenant raiz)
  ├── Futsal SP     → ranking próprio do subgrupo
  ├── Society SP    → ranking próprio do subgrupo
  └── Atlética SP   → ranking consolidado (todos os subgrupos)

Pelada da Firma (standalone)
  └── ranking próprio, sem hierarquia acima
```

### Quem pode ver o quê

| Atleta | Grupo ativo | Ranking exibido |
|--------|-------------|-----------------|
| Membro do Futsal SP | Futsal SP | Ranking do Futsal SP |
| Admin com Atlética SP ativa | Atlética SP | Ranking consolidado |
| Admin alternando para Futsal | Futsal SP | Ranking do Futsal SP |
| Membro standalone | Pelada da Firma | Ranking da Pelada |

**Não existe ranking entre grupos ou atléticas diferentes. Cada tenant é isolado.**

---

## Parte 10 — Onboarding Obrigatório

### Gate de pertencimento

Nenhum atleta novo acessa o shell principal sem ter:
1. Um grupo ativo definido (criado ou entrado)
2. Pelo menos uma modalidade de interesse selecionada

### Fluxo

```
/auth/signup
  ↓ POST /api/auth/signup → onboarding_completed = false
  ↓ redirect automático do middleware

onboarding/ (shell próprio, sem sidebar)
  Step 1: Boas-vindas — o que é o app (< 30s)
  Step 2: Criar grupo ou entrar em um?
    ├── Criar → formulário simplificado de grupo
    └── Entrar → código de convite ou busca
  Step 3: Qual modalidade você pratica?
  Step 4: Pronto → [Ir para o Grupo]
  ↓
/groups/[groupId]  ← primeira tela com contexto real
```

### Regras do gate no middleware

- Verifica: `user.onboarding_completed === false`
- Se incompleto: redireciona para `/onboarding`
- Exceções: rotas de auth, `/api/*`, `/events/[id]` público
- Atletas existentes antes do onboarding: backfill `onboarding_completed = true`

### Estado "sem grupo" (atletas antigos sem grupo)

```
┌──────────────────────────────────────────────┐
│  Você ainda não está em nenhum grupo.        │
│                                              │
│  [Criar meu grupo]   [Entrar com código]     │
└──────────────────────────────────────────────┘
```

Sem métricas vazias. Sem sidebar com itens sem sentido.

### O que precisa ser definido antes da Fase 3

Mesmo que a implementação venha depois, definir agora:
- Copy e fluxo final do wizard
- O que "sem grupo ativo" significa em cada tela do shell
- A regra de gate exata no middleware (especialmente casos limite: evento público, link de convite)

---

## Parte 11 — Créditos → Quota de Plataforma (rebaixamento em duas etapas)

### Problema

O atleta não consegue distinguir:
- **Quota de plataforma** = moeda interna da Uzz.Ai para criar grupos/eventos
- **Cobranças de evento** = valor real cobrado dos membros
- **Pagamento PIX** = transação financeira real

### Etapa 1 — Fase 1: Remover da navegação principal

- Remove "Créditos" do rodapé da sidebar
- Remove badge "PENDENTE" da sidebar
- Remove link `/groups/[id]/credits` da nav do grupo
- Créditos ficam tecnicamente funcionando, mas sem exposição na UI principal

### Etapa 2 — Fase 4: Reposicionar e renomear

- Mover acesso para `/configuracoes` (aba "Quota / Plano")
- Renomear "créditos" para "quota" ou "plano de uso" na UI
- Adicionar alert contextual apenas quando ação exige quota e não há saldo
- Documentar no CLAUDE.md: `créditos ≠ cobranças`

### Onde fica acessível (estado final)

| Quem | Onde e quando |
|------|---------------|
| Admin criando grupo | Modal de confirmação inline |
| Admin sem saldo | Alert contextual no momento da ação |
| Admin gerenciando conta | `/configuracoes` aba Quota |
| Atleta comum | **Nunca** |

---

## Parte 12 — Middleware Centralizado

### `middleware.ts` na raiz do projeto

```ts
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuthenticated = !!req.auth
  const pathname = req.nextUrl.pathname

  const publicPaths = [
    "/auth/signin",
    "/auth/signup",
    "/auth/error",
    "/events/",          // compartilhamento público
  ]

  const isPublicPath = publicPaths.some(p => pathname.startsWith(p))

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|simple-test).*)",
  ],
}
```

---

## Parte 13 — Decisão Pendente: `users` vs `profiles`

> **Status: hipótese preferencial, não dogma congelado. Não bloqueia Fases 0–4.**

### Hipótese atual

`users` parece ser a tabela operacional real. Evidências:
- `auth.ts` tenta `users` primeiro, fallback para `profiles`
- Queries de produto usam `users` diretamente
- `group_members` tem FK para `users`

### Checklist de validação (executar na Fase 5)

- [ ] `profiles` e `users` são sincronizadas? Existe trigger?
- [ ] RLS, notificações, social ou onboarding dependem de `profiles`?
- [ ] Supabase `auth.uid()` resolve para `profiles.id` ou `users.id`?

### Após validação confirmar `users`

- Remover fallback no `auth.ts:56-79`
- Documentar no CLAUDE.md: "Queries de produto usam `users`. `profiles` existe para compatibilidade com RLS do Supabase."
- Proibir `profiles` como tabela primária em novas features

---

## Parte 14 — Plano de Implementação por Fases

### Fase 0 — Ponte de Estabilização (imediato, 3-5 dias)

> **Objetivo:** parar a quebra de contexto visual agora, sem migrar arquivos ou URLs

| # | Tarefa | Arquivo técnico atual | Critério de aceite |
|---|--------|----------------------|-------------------|
| 0.1 | Criar `middleware.ts` centralizado | `/middleware.ts` (novo) | toda rota protegida sem verificação manual por página |
| 0.2 | Criar `src/app/groups/layout.tsx` com Sidebar + Topbar | `src/app/groups/layout.tsx` (novo, temporário) | sidebar não some ao entrar em `/groups/[id]` |
| 0.3 | Remover `DashboardHeader` de `groups/[groupId]/page.tsx` | `page.tsx` linha 7 e 452 | sem header duplicado |
| 0.4 | Corrigir back button: hardcoded `/dashboard` → breadcrumb | `page.tsx` linha 458 | atleta volta para contexto anterior, não para dashboard |
| 0.5 | Tornar nome do grupo no sidebar clicável para `/groups/[id]` | `sidebar.tsx` linha 150 | entrada direta para o grupo via sidebar |

**Risco:** baixo — zero mudança de domínio, rotas ou URLs

---

### Fase 1 — Shell Único Definitivo (2 sprints)

> **Objetivo:** um shell autenticado, uma experiência, zero estados paralelos ou toggles de layout

| # | Tarefa | Arquivo técnico | Critério de aceite |
|---|--------|-----------------|-------------------|
| 1.1 | Criar route group `(app)/` com `layout.tsx` definitivo | `src/app/(app)/layout.tsx` | toda rota autenticada operacional usa o mesmo shell |
| 1.2 | Mover rotas de `(dashboard)/` para `(app)/` | renomear pasta | zero quebra de funcionalidade |
| 1.3 | Mover `groups/` para `(app)/groups/` (tech) | mover arquivos | ainda usando URLs atuais (`/groups/[id]`) |
| 1.4 | Adicionar redirects `/groups/[id]` → URLs canônicas no `next.config.js` | `next.config.js` | pronto para Fase de migração de URL |
| 1.5 | Remover `DashboardHeader` de todas as páginas restantes | componente | sem headers paralelos |
| 1.6 | Eliminar `DirectModeContext` | `src/contexts/direct-mode-context.tsx` | 1 estado de layout por rota, zero toggle runtime |
| 1.7 | Atualizar sidebar: estrutura conforme Parte 4 | `src/components/layout/sidebar.tsx` | Treinos/Jogos como subitens de Eventos |
| 1.8 | Adicionar atleta (avatar + nome) no rodapé da sidebar | `sidebar.tsx` | identidade visível |
| 1.9 | **Etapa 1 de créditos:** remover "Créditos" e badge da sidebar | `sidebar.tsx` linhas 177-199 | sem quota na nav principal |

**Risco:** médio — mover arquivos e atualizar referências internas

---

### Fase 2 — Hub de Eventos (2 sprints)

> **Objetivo:** consolidar treinos e jogos em `/eventos`

| # | Tarefa | Arquivo técnico | Critério de aceite |
|---|--------|-----------------|-------------------|
| 2.1 | Criar `(app)/eventos/page.tsx` com tabs Todos/Treinos/Jogos | novo arquivo | substitui `/treinos` e `/jogos` como destinos primários |
| 2.2 | Criar `(app)/eventos/[eventId]/page.tsx` | mover + adaptar de `groups/[id]/events/[id]` | rota canônica de detalhe do evento |
| 2.3 | Criar `(app)/eventos/novo/page.tsx` com seletor de grupo | novo arquivo | criação alternativa (admin sem contexto de grupo) |
| 2.4 | Redirect `/treinos` → `/eventos?tipo=treino` | `next.config.js` | sem quebrar links antigos |
| 2.5 | Redirect `/jogos` → `/eventos?tipo=jogo` | `next.config.js` | idem |
| 2.6 | Confirmar que CTA "Criar Evento" no grupo redireciona para `/eventos/novo?groupId=...` | `groups/[id]/page.tsx` | evento nasce do grupo |
| 2.7 | Atualizar breadcrumbs para `/eventos/[eventId]` | `src/components/layout/breadcrumbs.tsx` | contexto correto |
| 2.8 | Substituir links internos para `/events/[id]` por `/eventos/[id]` (quando URLs migradas) | grep + replace | preparar para migração de URL |

**Risco:** médio — consolidar lógica de exibição por `event_type`

---

### Fase 3 — Onboarding Obrigatório (2 sprints)

> **Objetivo:** nenhum atleta novo cai em dashboard vazio

| # | Tarefa | Arquivo técnico | Critério de aceite |
|---|--------|-----------------|-------------------|
| 3.1 | Adicionar `onboarding_completed` à tabela `users` | migration | estado rastreável no banco |
| 3.2 | Gate no middleware: `onboarding_completed = false` → `/onboarding` | `middleware.ts` | redirect automático antes do shell principal |
| 3.3 | Wizard de onboarding: Step 1 (boas-vindas) | `onboarding/step/1/page.tsx` | < 30 segundos |
| 3.4 | Wizard: Step 2 (criar ou entrar em grupo) | `onboarding/step/2/page.tsx` | atleta sai com grupo ativo definido |
| 3.5 | Wizard: Step 3 (selecionar modalidade) | `onboarding/step/3/page.tsx` | preferência salva |
| 3.6 | Wizard: Step 4 (conclusão + redirect para `/groups/[id]`) | `onboarding/step/4/page.tsx` | entrada com contexto real |
| 3.7 | Backfill: `onboarding_completed = true` para atletas existentes | script/migration | sem afetar usuários antigos |
| 3.8 | Estado "sem grupo" no dashboard | `(app)/dashboard/page.tsx` | sem métricas ou cards vazios |
| 3.9 | Fluxo de retorno pós-link público: atleta volta para o evento | `middleware.ts` + `/events/[id]` | não cai no dashboard geral |

**Risco:** baixo em UX, médio em banco (migration + backfill)

---

### Fase 4 — Quota de Plataforma (1 sprint)

> **Objetivo:** quota de plataforma nunca compete com dinheiro real na percepção

| # | Tarefa | Arquivo técnico | Critério de aceite |
|---|--------|-----------------|-------------------|
| 4.1 | Mover acesso a quota para `/configuracoes` (aba Quota) | nova rota | acessível só em contexto certo |
| 4.2 | Alert contextual quando ação exige quota e não há saldo | UX inline nas ações | informação no momento certo |
| 4.3 | Renomear "créditos" para "quota" / "plano" na UI | grep + replace | sem confusão com cobrança real |
| 4.4 | Documentar no CLAUDE.md: `créditos ≠ cobranças` | `CLAUDE.md` | time alinhado |

**Risco:** baixo — só UX, sem mudança de banco

---

### Fase 5 — Limpeza de Dívida Técnica (2-3 sprints)

> **Objetivo:** banco, código e UI falam a mesma língua

| # | Tarefa | Arquivo técnico | Critério de aceite |
|---|--------|-----------------|-------------------|
| 5.1 | Executar checklist `users` vs `profiles` (Parte 13) | investigação | decisão formal documentada |
| 5.2 | Remover fallback `users → profiles` no auth após validação | `auth.ts:56-79` | auth usa uma fonte só |
| 5.3 | Resolver `wallets` com dois tipos de PK (bigint + uuid) | migration cuidadosa | um único campo de owner |
| 5.4 | Remover `DirectModeContext` (se ainda houver resíduos após Fase 1) | `src/contexts/` | sem contexto morto |
| 5.5 | Consolidar `components/group/` e `components/groups/` | mover arquivos | uma pasta para componentes de grupo |
| 5.6 | Quebrar `groups/[groupId]/page.tsx` (539 linhas) em server actions + componentes | refatoração | `page.tsx` < 150 linhas |
| 5.7 | Documentar `event_type` no CLAUDE.md | `CLAUDE.md` | `training` e `match` são os únicos valores |

**Risco:** alto para `wallets` (migration), baixo para o resto

---

### Fase 6 — Migração de URLs (sprint isolado, após Fase 1)

> **Separada das demais fases por design — não misturar reorganização com renomeação de URL.**

| # | Tarefa | Critério de aceite |
|---|--------|--------------------|
| 6.1 | `/groups/[id]` → `/grupos/[id]` com redirect 301 | links antigos não quebram |
| 6.2 | `/profile/[id]` → `/atletas/[id]` com redirect 301 | rota canônica única |
| 6.3 | `/groups/[id]/events/[id]` → `/eventos/[id]` | após Fase 2 estar completa |
| 6.4 | Atualizar todos os links internos para paths canônicos | zero links para paths antigos no código |

---

## Parte 15 — O que NÃO fazer

### Congelar até Fase 2 estar completa

- Feed social global — existe, não expandir
- Gamificação / achievements — não priorizar na UI
- Tabelinha Tática — manter colapsada em Ferramentas
- Referrals — sistema existe, não expor

### Não criar

- Mais rotas de evento além de `/eventos`
- Terceira forma de agrupar eventos (`/agenda`, `/calendario`, `/partidas`)
- Novo toggle de layout (DirectMode v2 ou similar)
- Feature nova fora do core antes da Fase 0 estar completa

### Não congelar prematuramente

- Decisão de `users` vs `profiles` — aguardar validação da Fase 5
- Migração de URL para PT-BR — aguardar shell estável (após Fase 1)

---

## Parte 16 — Critérios de Validação

### Fase 0 pronta quando

- [ ] Atleta acessa `/groups/[id]` — sidebar permanece visível
- [ ] Atleta clica em qualquer evento — sidebar permanece visível
- [ ] Sem autenticação → redirect automático para `/auth/signin`
- [ ] Não há dois headers diferentes na mesma tela

### Fase 1 pronta quando

- [ ] Toda rota autenticada operacional usa o mesmo shell
- [ ] Sidebar tem exatamente 1 estado visual — sem toggle de runtime
- [ ] Nome do grupo no sidebar é clicável e vai para o grupo
- [ ] "Novo Evento" não quebra o shell

### Fase 2 pronta quando

- [ ] `/treinos` e `/jogos` são redirects, não rotas primárias
- [ ] `/eventos` lista todos com filtro por tipo
- [ ] Criar evento permanece dentro do shell
- [ ] Breadcrumb: `Eventos > Nome do Evento`

### Métricas de sucesso do plano como um todo

| Métrica | Sinal de sucesso |
|---------|-----------------|
| % novos atletas que completam onboarding | > 80% |
| % que entram ou criam grupo no dia 1 | > 70% |
| % que fazem RSVP em pelo menos 1 evento | > 50% na semana 1 |
| Tempo até primeira ação útil após signup | < 3 minutos |
| Navegação quebrada (shell troca inesperadamente) | zero em teste manual |
| Confusão "crédito vs cobrança" em suporte | redução observável |

---

## Parte 17 — Teste Real de Fluxo

### Novo atleta

```
1. Acessa / → vai para /auth/signup
2. Cria conta → redireciona para /onboarding (shell próprio, sem sidebar)
3. Cria ou entra em grupo (Step 2)
4. Seleciona modalidade (Step 3)
5. Redireciona para /groups/[id] — sidebar visível
6. Clica em um evento — sidebar permanece
7. Confirma RSVP — fica na mesma tela
8. Volta via breadcrumb — vai para /eventos
✅ Zero quebra de contexto. Zero dashboard vazio.
```

### Atleta via link público de evento

```
1. Recebe link para /events/[eventId]
2. Vê preview público (sem auth): nome, data, vagas
3. Clica "Entrar no app para participar"
4. → /auth/signup (novo) ou /auth/signin (existente)
5. → /onboarding se novo
6. → volta para /events/[eventId] autenticado
✅ Não cai no dashboard. Volta para o que o trouxe.
```

### Admin criando evento

```
1. Está em /groups/[id] — sidebar visível
2. Clica "Criar Evento" → vai para /events/new?groupId=[id] — sidebar visível
3. Preenche formulário, salva
4. Redireciona para /events/[eventId] — sidebar visível
5. Registra resultado — permanece no evento
6. Vai para financeiro via sidebar
✅ Todo o fluxo dentro do shell. Evento nasce do grupo.
```

### Ranking por tenant

```
Admin da Atlética SP (grupo ativo = Atlética SP):
  → Acessa /rankings → vê ranking consolidado da Atlética SP
  → Alterna grupo ativo para "Futsal SP" via group switcher
  → Acessa /rankings → vê ranking do Futsal SP

Atleta da Pelada da Firma (standalone):
  → Acessa /rankings → vê ranking da Pelada da Firma
  → Não vê dados de outros grupos
✅ Ranking sempre via grupo ativo. Nunca global.
```

---

## Resumo em uma linha por fase

| Fase | Em uma linha | Risco | Quando |
|------|-------------|-------|--------|
| **0** | Para de quebrar o shell agora, sem migrar nada | baixo | imediato |
| **1** | Um shell autenticado, zero estados paralelos | médio | Sprint 1-2 |
| **2** | Treino e jogo são eventos — sempre | médio | Sprint 3-4 |
| **3** | Nenhum atleta novo entra sem contexto | médio | Sprint 5-6 |
| **4** | Quota de plataforma não é dinheiro do atleta | baixo | Sprint 7 |
| **5** | Banco, código e UI falam a mesma língua | alto (wallets) | Sprint 8-10 |
| **6** | URLs técnicas viram URLs canônicas | baixo | após Fase 1 |

---

**Versão:** 1.2 — contradições resolvidas, aprovado para GO
**Última atualização:** 2026-03-11
**Próximo passo imediato:** Fase 0, itens 0.1 a 0.5
**Decisões abertas:** `users` vs `profiles` (Fase 5), migração de URL PT-BR (Fase 6)
**Decisões congeladas:** shell único, eventos como hub, atleta como nome canônico, ranking por tenant via grupo ativo, quota fora da nav, onboarding obrigatório
