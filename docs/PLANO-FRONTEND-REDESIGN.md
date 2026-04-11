# Plano de Redesign Frontend — ResenhApp
## Principal Product Designer + Staff Frontend Engineer

> **Data:** 2026-03-11
> **Versão:** 1.0
> **Escopo:** Design system, jornadas, telas core, contratos de API, execução em 90 dias
> **Base:** Arquitetura backend concluída (Fases 0–6). Frontend a consolidar.

---

## 1. North Star do Produto

### Proposta de valor central

> **ResenhApp é o único lugar onde a atlética opera de verdade — do grupo ao placar, da presença ao pix, sem precisar de planiha ou grupo de WhatsApp.**

### 3 princípios de UX inegociáveis

| # | Princípio | O que significa na prática |
|---|---|---|
| 1 | **Zero fricção na operação diária** | Criar evento, confirmar presença e cobrar: máximo 3 taps a partir do dashboard |
| 2 | **Contexto sempre visível** | O usuário nunca deve ter que lembrar em qual grupo está, qual evento está aberto, ou quanto deve |
| 3 | **Feedback imediato e honesto** | Toda ação tem resposta visual em < 300ms; erros são explicados com ação corretiva, não código |

### Hierarquia Core / Suporte / Futuro

```
CORE (sem isso o produto não existe)
  ├── Dashboard contextual por grupo
  ├── Criar e gerenciar eventos (treinos + jogos)
  ├── RSVP / confirmação de presença
  ├── Cobrança e pagamento PIX
  └── Onboarding (entrar/criar grupo)

SUPORTE (amplifica o core)
  ├── Rankings por modalidade
  ├── Frequência e histórico
  ├── Configurações de grupo (posições, regras, membros)
  └── Perfil do atleta

FUTURO (não bloquear, não construir agora)
  ├── Feed social
  ├── Tabelinha tática
  ├── Referral / indicação
  └── Conquistas / gamificação
```

---

## 2. Personas + Jobs To Be Done

### Persona A — Admin de Atlética (Maria, 22 anos)

| Dimensão | Detalhe |
|---|---|
| **Papel** | Diretora de esportes, responsável por 4+ modalidades |
| **Contexto de uso** | Celular, 10–15 min antes ou depois do treino, ambiente barulhento |
| **Objetivo principal** | Saber o status de cada modalidade sem precisar perguntar para ninguém |
| **Dores reais** | "Todo mundo me pergunta se o treino vai acontecer" / "Não sei quem pagou" |
| **Decisões frequentes** | Cancelar treino, cobrar mensalidade, adicionar membro, ver quem faltou |
| **Job To Be Done** | *Quando há um treino hoje, quero saber em 10 segundos se tem quórum e quem ainda deve, para decidir se cancelo ou não* |

### Persona B — Organizador de Modalidade (João, 21 anos)

| Dimensão | Detalhe |
|---|---|
| **Papel** | Capitão do time de futsal, cria eventos e cobra o grupo |
| **Contexto de uso** | Celular, horários irregulares, usa o app enquanto conversa |
| **Objetivo principal** | Criar o evento, saber quem vai, cobrar quem confirmou |
| **Dores reais** | "Preciso de 3 apps pra fazer o que deveria ser 1" / "Mando no grupo de whats porque o app não notifica" |
| **Decisões frequentes** | Criar treino, sortear times, registrar placar, fechar presença |
| **Job To Be Done** | *Quando crio um evento, quero ver quem confirmou e gerar cobranças em um clique, para não precisar controlar no caderno* |

### Persona C — Atleta (Lucas, 20 anos)

| Dimensão | Detalhe |
|---|---|
| **Papel** | Membro do grupo, participa de 1–2 modalidades |
| **Contexto de uso** | Celular, rápido, acessa para confirmar presença ou ver se tem jogo |
| **Objetivo principal** | Saber o que tem essa semana e confirmar presença sem fricção |
| **Dores reais** | "Não sei se tenho que pagar" / "Não consigo ver se meu nome tá na lista" |
| **Decisões frequentes** | Confirmar/cancelar RSVP, pagar cobrança, ver ranking, ver próximos eventos |
| **Job To Be Done** | *Quando abro o app, quero ver o próximo evento do meu grupo e confirmar presença em 1 tap, para saber se preciso ir.* |

---

## 3. Jornadas Ponta a Ponta

### As-Is vs To-Be

---

#### Jornada A — Onboarding (entrar/criar grupo)

| Etapa | Intenção do usuário | Fricção atual | Melhoria proposta |
|---|---|---|---|
| 1. Criar conta | Entrar rápido | Formulário padrão sem contexto | Mostrar "você foi convidado para [grupo X]" logo no topo do signup se vier de convite |
| 2. Login pós-signup | Não ser bloqueado | Redireciona para signin novamente após signup (dois formulários) | Auto-login após signup bem-sucedido |
| 3. Onboarding step 1 | Entender o app | Texto genérico "Etapa 1/4" | Header com progresso visual + explicação do que está por vir |
| 4. Entrar com convite | Usar código | Campo solto, sem validação visual | Validar código em tempo real, mostrar nome do grupo ao digitar |
| 5. Escolher modalidade | Associar interesse | Lista básica de botões | Mostrar ícone + número de membros por modalidade |
| 6. Conclusão | Saber o que fazer agora | Redireciona para /dashboard genérico | CTA contextual: "Seu primeiro treino é [data]" com link direto |

**Trade-off:** Auto-login requer ajuste em `api/auth/signup` + JWT imediato. Ganho: elimina uma tela do funil de ativação.

---

#### Jornada B — Criar evento

| Etapa | Intenção | Fricção atual | Melhoria |
|---|---|---|---|
| 1. Iniciar criação | Criar rápido | "Novo Evento" estava no sidebar e saía do shell — corrigido, mas form ainda é longo | Form em modal ou drawer, não página separada |
| 2. Preencher dados | Definir o evento | Campos de data/hora nativos sem formatação | DatePicker + TimePicker unificado, formato BR |
| 3. Definir preço | Cobrar participantes | Campo de valor sem máscara de moeda | Máscara R$ em tempo real, valor zero = gratuito (explicit toggle) |
| 4. Salvar | Confirmar | Redirect para página do grupo | Toast de confirmação + link direto "Ver evento criado" |
| 5. Compartilhar | Avisar membros | Não há botão de compartilhamento | Botão "Compartilhar link" após criação |

**Rota canônica:** `POST /api/events` com `groupId`, `event_type`, `starts_at`, `price_per_player`, `max_players`, `venue_name`.

---

#### Jornada C — Confirmar presença (RSVP)

| Etapa | Intenção | Fricção atual | Melhoria |
|---|---|---|---|
| 1. Ver evento | Entender o que é | Card com informações básicas | Card com: data, local, confirmados/total, status do RSVP do user, preço |
| 2. Confirmar | 1 tap | Botão existe mas sem estado intermediário | Botão com estado (vazio → loading → confirmado); sem reload de página |
| 3. Feedback pós-RSVP | Saber o que acontece | Sem feedback se gerou cobrança | "Presença confirmada! Cobrança de R$X gerada." inline abaixo do botão |
| 4. Cancelar | Desconfirmar | Ação não clara na UI | Botão "Cancelar presença" com cor distinta + confirmação se já gerou cobrança |

**Contrato API:** `POST /api/events/[eventId]/rsvp` → `{ status: "confirmed" | "declined" }` → resposta inclui `chargeCreated: boolean, chargeAmount: number`.

---

#### Jornada D — Cobrança e pagamento PIX

| Etapa | Intenção | Fricção atual | Melhoria |
|---|---|---|---|
| 1. Ver pendências | Saber o que deve | Card de cobranças pendentes no dashboard existe mas é genérico | Card com valor total, data de vencimento mais próxima, 1 CTA "Pagar agora" |
| 2. Abrir cobrança | Ver detalhes | Página de detalhe tem layout legado | Página de cobrança: evento de origem, valor, QR Code, botão copiar chave PIX |
| 3. Gerar QR Code | Pagar | Geração pode ter latência sem feedback | Skeleton enquanto gera + timeout de 10s com retry |
| 4. Confirmar pagamento | Fechar a dívida | Admin precisa confirmar manualmente | Botão "Já paguei" para atleta + notificação para admin confirmar |
| 5. Undo | Desfazer erro | Undo existe mas não é óbvio na UI | Toast com "Desfazer" nos primeiros 5s após confirmação |

---

#### Jornada E — Acompanhamento (fechamento)

| Etapa | Intenção | Fricção atual | Melhoria |
|---|---|---|---|
| 1. Ver frequência | Quem foi/faltou | Página de frequência separada | Tab "Frequência" dentro do detalhe do evento |
| 2. Registrar placar | Fechar jogo | Fluxo existe mas é opaco | Dentro do evento: campo placar com validação numérica simples |
| 3. Ver rankings | Comparar desempenho | Rankings carregam tudo sem filtro | Rankings com filtro de período (mês/temporada) + destaque da posição do user logado |
| 4. Dashboard executivo | Admin ver tudo | Dashboard atual tem muitos cards sem hierarquia | Dashboard com KPIs no topo (eventos mês, % presença, receita pendente) + listagem abaixo |

---

## 4. Arquitetura de Informação + Rotas

### Navegação ideal — Sidebar

```
PRINCIPAL
  ├── Dashboard              /dashboard
  └── Grupos                 /grupos/[id]   ← grupo ativo, clicável

EVENTOS (collapsible, open por default)
  ├── Todos                  /eventos
  ├── Treinos                /eventos?tipo=treino
  └── Jogos                  /eventos?tipo=jogo

OPERACIONAL
  ├── Financeiro             /financeiro     (badge: N pendentes)
  └── Atletas                /atletas

ANÁLISE (collapsible, closed)
  ├── Rankings               /rankings
  └── Frequência             /frequencia

FERRAMENTAS (collapsible, closed)
  ├── Modalidades            /modalidades
  └── Configurações          /configuracoes
```

### Tabela de rotas canônicas

| Rota | Objetivo | Permissão | Origem de dados | Ações primárias |
|---|---|---|---|---|
| `/dashboard` | Visão geral personalizada | Autenticado | `groups`, `events`, `charges` | — (read-only) |
| `/eventos` | Hub de todos os eventos do grupo | Autenticado | `events` WHERE group = ativo | Criar evento, filtrar tipo |
| `/eventos/[eventId]` | Detalhe + RSVP + frequência | Autenticado | `event`, `rsvp`, `charges` | Confirmar/cancelar presença, registrar placar (admin) |
| `/eventos/novo` | Criar evento | Admin | — | Salvar, cancelar |
| `/grupos/[groupId]` | Landing contextual do grupo | Membro | `group`, `events`, `ranking`, `stats` | Criar evento, ver membros |
| `/grupos/[groupId]/configuracoes` | Gerenciar grupo | Admin | `group`, `modalities`, `invites` | Editar, convidar, remover |
| `/grupos/[groupId]/pagamentos` | Cobranças do grupo | Admin | `charges` | Criar cobrança manual, exportar |
| `/grupos/new` | Criar grupo | Autenticado | — | Salvar |
| `/grupos/join` | Entrar com convite | Autenticado | `invite_codes` | Usar código |
| `/atletas` | Lista de membros | Autenticado | `users`, `group_members` | Ver perfil |
| `/atletas/[id]` | Perfil do atleta | Autenticado | `user`, `stats`, `events` | — |
| `/financeiro` | Cobranças do usuário logado | Autenticado | `charges` WHERE user = me | Pagar PIX |
| `/financeiro/charges/[id]` | Detalhe + QR Code | Autenticado | `charge`, `pix` | Gerar/copiar QR Code |
| `/rankings` | Rankings do grupo ativo | Autenticado | `stats` GROUP BY user | Filtrar período |
| `/frequencia` | Histórico de presença | Autenticado | `event_actions` | — |
| `/configuracoes` | Hub de settings | Autenticado | — | Navegar para perfil/grupo/quota |
| `/onboarding/step/[n]` | Wizard de entrada | Autenticado sem grupo | — | Avançar, voltar |
| `/events/[eventId]` | Preview público | Público | `event` (limitado) | Login/Signup |

### Fluxos que ficam fora do shell principal

| Fluxo | Por quê fora | Rota |
|---|---|---|
| Onboarding | Experiência linear sem navegação lateral | `/onboarding/*` |
| Preview público de evento | Usuário não autenticado | `/events/[id]` |
| Auth (signin/signup/error) | Sem usuário logado | `/auth/*` |

---

## 5. Blueprint Frontend + Backend por tela

### 5.1 Dashboard

**Componentes necessários:**
- `DashboardKPIStrip` — 3 KPIs horizontais: eventos este mês, % de presença média, cobranças pendentes
- `UpcomingEventsCard` — próximos 3 eventos com status de RSVP do user
- `PendingPaymentsCard` — total em aberto + link para /financeiro
- `GroupsCard` — grupos do user com role badge
- `QuickActions` — botões: "Criar evento", "Ver financeiro", "Ver atletas"

**Estados obrigatórios por componente:**

| Componente | loading | empty | error | success |
|---|---|---|---|---|
| KPIStrip | 3 skeletons 80px | "—" em cada métrica | Omitir (degradar silencioso) | Valores reais |
| UpcomingEventsCard | 3 card skeletons | "Nenhum evento próximo. [Criar evento →]" | Card com mensagem + retry | Lista de eventos |
| PendingPaymentsCard | Skeleton | Ocultar card | Omitir | Valor + CTA |

**Chamadas API:**
```
GET /api/groups/managed
  → { groups: Group[] }

GET /api/events?groupId=:activeGroupId&status=scheduled&limit=3
  → { events: EventItem[] }
  ⚠️ GAPS: resposta atual não inclui event_type, confirmed_count, price — ver seção 5.6

GET /api/groups/:activeGroupId/charges?status=pending&userId=:me
  → { charges: Charge[] }
```

**Telemetria:**
```
dashboard_viewed { userId, groupId, hasEvents, hasPendingCharges }
dashboard_cta_clicked { cta: "create_event"|"financeiro"|"atletas" }
```

---

### 5.2 Hub de Eventos (`/eventos`)

**Componentes necessários:**
- `EventFilterTabs` — "Todos | Treinos | Jogos" com contagem por tab
- `EventCard` — tipo, data/hora, local, confirmados/total, status RSVP do user, preço
- `EventsEmptyState` — diferente por filtro: "Nenhum treino marcado" vs "Nenhum jogo agendado"
- `CreateEventFAB` — botão flutuante para admin (mobile) ou botão no header (desktop)

**Estados de `EventCard`:**
```
status: scheduled | ongoing | finished | cancelled
rsvp_status: confirmed | declined | pending (não respondeu)
```

**Cores por estado de RSVP:**
- `confirmed` → badge verde
- `declined` → badge vermelho
- `pending` → badge cinza (user nunca respondeu)

**Chamada API:**
```
GET /api/events?groupId=:activeGroupId&status=scheduled&limit=20
  → { events: EventItem[] }

⚠️ NÃO EXISTE: filtro por tipo (treino/jogo) no backend atual.
  Filtro de tipo deve ser feito no frontend após receber todos os eventos.
  Futuramente: adicionar ?event_type=training|match ao endpoint.
```

**Contrato real atual de EventItem** (resposta de `GET /api/events`):
```typescript
{
  id: string
  starts_at: string        // ISO 8601
  status: string           // "scheduled" | "ongoing" | "finished" | "cancelled"
  max_players: number
  venue_name: string | null
}
```

**Contrato necessário para o frontend funcionar** (campos faltantes no backend):
```typescript
{
  // ✅ já retornados
  id: string
  starts_at: string
  status: string
  max_players: number
  venue_name: string | null

  // ❌ FALTAM — precisam ser adicionados ao SELECT em /api/events
  event_type: "training" | "match"   // coluna `event_type` da tabela events
  confirmed_count: number            // COUNT de rsvp WHERE status = 'yes' (enum real atual)
  price: number | null               // coluna `price` da tabela events
  opponent: string | null            // coluna `opponent` (só matches)
  our_score: number | null           // coluna `our_score`
  opponent_score: number | null      // coluna `opponent_score`
}
```

**⚠️ Gap de API — ação necessária antes de construir EventCard:**
O `SELECT` em `GET /api/events` ([src/app/api/events/route.ts:43-55](src/app/api/events/route.ts#L43)) retorna apenas 5 campos.
Antes de implementar o `EventCard` com tipo/placar/preço, adicionar esses campos ao query do endpoint.

**Filtro de tipo no frontend (interim):**
```typescript
const filtered = events.filter(e => {
  if (tipo === "treino") return normalizeEventType(e.event_type) === "training"
  if (tipo === "jogo")   return normalizeEventType(e.event_type) === "match"
  return true
})
```

---

### 5.3 Detalhe do Evento (`/eventos/[eventId]`)

**Componentes necessários:**
- `EventHeader` — tipo, status, data/hora, local + badge de status
- `RSVPButton` — estado: pendente / confirmado / cancelado + loading state
- `RSVPProgress` — progress bar confirmados/total
- `ConfirmedAthletes` — avatares dos confirmados (máx 12 + overflow)
- `EventChargeInfo` — "Cobrança gerada: R$X" após RSVP (condional)
- `ScoreRecorder` — admin only, quando status = ongoing/finished
- `AttendanceTab` — lista de presentes/ausentes (admin only)

**Fluxo de RSVP — estados do botão:**
```
idle →[click]→ loading →[api ok]→ confirmed
                        →[api error]→ idle + toast de erro
confirmed →[click]→ loading →[api ok]→ declined
```

**Chamadas API:**
```
GET  /api/events/[eventId]              → evento completo
POST /api/events/[eventId]/rsvp         → { status: "confirmed"|"declined" }
GET  /api/events/[eventId]/rsvp         → { userStatus, chargeCreated, chargeId }
```

**Política de erro:**
- 409 (já confirmado) → ignorar, atualizar estado local
- 402 (quota insuficiente) → mostrar modal "Você não tem quota" com link para /configuracoes?tab=quota
- 403 (evento fechado) → desabilitar botão com tooltip "Inscrições encerradas"

---

### 5.4 Financeiro (`/financeiro`)

**Componentes necessários:**
- `ChargeSummaryBanner` — valor total pendente em destaque (banner topo)
- `ChargesDataTable` — tabela com: evento, valor, vencimento, status + ação
- `StatusBadge` — pending / paid / overdue / cancelled
- `ChargeDetailSheet` — drawer lateral com QR Code (não nova página, a menos que mobile)

**Estado de `ChargeDetailSheet`:**
```
initial → [gerar QR]→ loading (skeleton) → qr_ready → [copiar] → copied (2s) → qr_ready
                                          → error (10s timeout) → retry
```

**Chamadas API:**
```
GET  /api/groups/:activeGroupId/charges?status=pending&userId=:me
  → { charges: Charge[] }
  ⚠️ Não existe /api/charges global. Endpoint é sempre escopado por grupo.
  Para "minhas cobranças" o frontend precisa do activeGroupId do contexto.

POST /api/charges/[chargeId]/pix        → { qrCode, pixKey, expiresAt }
POST /api/charges/[chargeId]/confirm    → { status: "paid" }
```

**Fallback de schema:**
- Se coluna `amount_cents` não existir → tentar `amount` × 100
- Se coluna `user_id` não existir → tentar `created_by`

---

### 5.5 Grupo — Landing (`/grupos/[groupId]`)

**Componentes necessários:**
- `GroupPageHeader` — nome, descrição, role badge, ações de admin (criar evento, ir para config)
- `UpcomingEventsCard` — próximos eventos do grupo (reaproveitado do dashboard)
- `MyStatsCard` — gols, assistências, presenças do user logado neste grupo
- `RankingsCard` — ranking do grupo com tabs por modalidade
- `RecentMatchesCard` — últimos 5 jogos com placar

**Remover da página:**
- ~~Hero gradient~~ — já removido (Fase 0)
- ~~DashboardHeader~~ — já removido (Fase 0)
- ~~Back button hardcoded~~ — já removido (Fase 0)

**O que substituir o hero:**
- `GroupPageHeader` simples: `h1` com nome do grupo + badges + botões de ação alinhados à direita
- Padding/spacing padrão do `brand-panel` do `AuthenticatedShell`

---

### 5.6 Gaps de API — o que precisa ser corrigido antes do frontend

Esta seção documenta divergências entre o que o frontend precisa e o que os endpoints retornam hoje. **Estas correções são pré-requisito para as tarefas de Fase 2.**

| Gap | Endpoint afetado | Campos faltantes | Ação necessária |
|---|---|---|---|
| EventCard incompleto | `GET /api/events` ([route.ts:43](src/app/api/events/route.ts#L43)) | `event_type`, `confirmed_count`, `price`, `opponent`, `our_score`, `opponent_score` | Adicionar ao SELECT + LEFT JOIN rsvp count |
| Filtro de tipo inexistente | `GET /api/events` | query param `event_type` | Adicionar `WHERE event_type = $param` opcional |
| Cobranças sem endpoint global | N/A | — | Design decision: sempre escopar por grupo. Dashboard usa activeGroupId do contexto. |
| RSVP map ausente na listagem | `GET /api/events` | `user_rsvp_status` por evento | Adicionar LEFT JOIN para rsvp WHERE user_id = $me |

**Ordem de resolução recomendada:**
1. `GET /api/events` — ampliar SELECT (impacta EventCard, Hub, Dashboard)
2. Filtro `event_type` no GET (impacta tabs de Treinos/Jogos)
3. `user_rsvp_status` na listagem (impacta badge de RSVP no EventCard)

---

## 6. Design System

### 6.1 Tokens

**Cores (já definidas em tailwind.config.ts)**

| Token | Valor | Uso |
|---|---|---|
| `uzzai-mint` | `#1ABC9C` | CTAs primários, estados ativos, highlights |
| `uzzai-black` | `#1C1C1C` | Sidebar, fundos escuros, texto primário dark |
| `uzzai-silver` | `#B0B0B0` | Texto secundário, bordas, separadores |
| `uzzai-blue` | `#2E86AB` | Elementos de confiança, links, info states |
| `uzzai-gold` | `#FFD700` | Premium, destaques especiais, conquistas |
| `destructive` | CSS var | Erros, exclusões, estados críticos |
| `muted` | CSS var | Placeholders, labels desabilitados |

**Tipografia**

| Token | Fonte | Uso |
|---|---|---|
| `font-poppins` | Poppins | Headings H1–H3, nome do app |
| `font-inter` | Inter | Corpo de texto, labels, tabelas |
| `font-exo2` | Exo 2 | Badges, counters, números |

**Tamanhos de texto padronizados:**

| Nível | Classe | Uso |
|---|---|---|
| Page title | `text-3xl font-bold font-poppins` | H1 de cada página |
| Section title | `text-xl font-semibold` | Títulos de cards/seções |
| Body | `text-sm` | Conteúdo padrão |
| Label | `text-xs font-medium uppercase tracking-wide` | Labels de formulário, categorias |
| Caption | `text-xs text-muted-foreground` | Metadados, datas, secundário |

**Spacing scale:** Usar escala Tailwind padrão (4px base). Padrões de padding:
- Card interno: `p-4 md:p-6`
- Page wrapper: `px-4 pb-8 md:px-6 lg:px-8` (já no AuthenticatedShell)
- Entre seções: `gap-6` ou `space-y-6`

---

### 6.2 Padrões de feedback

**Toasts (Sonner):**

| Tipo | Quando | Copy |
|---|---|---|
| Success | Ação concluída | "[Entidade] [ação com sucesso]" — ex: "Presença confirmada!" |
| Error | Falha de API | "Erro ao [ação]. Tente novamente." + botão retry se aplicável |
| Info | Informação neutra | "[Informação relevante]" sem alarmismo |
| Undo | Ação reversível | "[Ação feita]. Desfazer" — desaparece em 5s |

**Confirmações (AlertDialog):**
- Usar apenas para ações destrutivas: deletar evento, remover membro, cancelar cobrança
- Texto do botão de confirmação: verbo destrutivo em vermelho ("Deletar", "Remover", "Cancelar")
- Nunca usar para ações reversíveis — para essas, usar toast com undo

**Loading states:**
- < 200ms: sem indicação (evitar flash)
- 200ms–1s: spinner no botão ou skeleton no card
- > 1s: skeleton completo + mensagem opcional "Carregando eventos..."

---

### 6.3 Padrões de formulário

**Regras gerais:**
- Validação: Zod no frontend + mesma validação no backend
- Erro inline: abaixo do campo, `text-xs text-destructive`, aparece ao blur + submit
- Campos obrigatórios: label com `*` (não texto "obrigatório")
- Placeholder: exemplo de valor real, nunca descrição do campo
- Máscara de moeda: `R$ 0,00` em tempo real via `Intl.NumberFormat`
- DatePicker: mostrar dia da semana + data + horário juntos

**Componentes de formulário existentes para unificar:**
- `FormField` em `src/components/ui/form-field.tsx` — usar sempre
- `ButtonWithLoading` em `src/components/ui/button-with-loading.tsx` — usar em todos os submits
- `Input`, `Select`, `Textarea` — já do shadcn/ui, não criar variações

---

### 6.4 Componentes reutilizáveis por domínio

| Domínio | Componente | Localização atual | Status |
|---|---|---|---|
| Layout | `AuthenticatedShell` | `components/layout/authenticated-shell.tsx` | ✅ Pronto |
| Layout | `Sidebar` | `components/layout/sidebar.tsx` | ✅ Pronto |
| Layout | `Topbar` | `components/layout/topbar.tsx` | ✅ Pronto |
| Layout | `Breadcrumbs` | `components/layout/breadcrumbs.tsx` | ✅ Pronto |
| UI Base | `Button`, `Card`, `Badge`, `Input` | `components/ui/*` | ✅ shadcn |
| UI Base | `Skeleton`, `LoadingSkeleton` | `components/ui/*` | ✅ Pronto |
| UI Base | `EmptyStateServer` | `components/ui/empty-state-server.tsx` | ✅ Pronto |
| UI Base | `MetricCard`, `MetricGrid` | `components/ui/metric-card.tsx` | ✅ Pronto |
| UI Base | `StatusBadge` | `components/ui/status-badge.tsx` | ✅ Pronto |
| UI Base | `ProgressBar` | `components/ui/progress-bar.tsx` | ✅ Pronto |
| Dashboard | `HeroSection`, `MetricsOverview` | `components/dashboard/*` | ⚠️ Refatorar |
| Dashboard | `UpcomingEventsCard` | `components/dashboard/` | ✅ Manter |
| Dashboard | `PendingPaymentsCard` | `components/dashboard/` | ✅ Manter |
| Eventos | `RSVPButton` (com estados) | NÃO EXISTE | ❌ Criar |
| Eventos | `RSVPProgress` | `components/trainings/rsvp-progress.tsx` | ⚠️ Mover para eventos/ |
| Eventos | `ConfirmedAvatars` | `components/trainings/confirmed-avatars.tsx` | ⚠️ Mover para eventos/ |
| Financeiro | `ChargeQRCode` | `components/financial/pix-payment-card.tsx` | ⚠️ Refatorar |
| Grupos | `GroupPageHeader` | NÃO EXISTE (era o hero gradient) | ❌ Criar |
| Grupos | `RankingsCard` | `components/group/rankings-card.tsx` | ✅ Manter |
| Grupos | `MyStatsCard` | `components/group/my-stats-card.tsx` | ✅ Manter |

---

### 6.5 Acessibilidade mínima

| Critério | Regra | Implementação |
|---|---|---|
| Contraste | AA mínimo (4.5:1 texto, 3:1 UI) | Mint (#1ABC9C) em fundo branco = 2.5:1 — **ATENÇÃO: usar fundo escuro ou aumentar peso** |
| Foco | Outline visível em todos os interativos | `focus-visible:ring-2 focus-visible:ring-uzzai-mint` |
| ARIA | Botões de ação com label descritivo | `aria-label="Confirmar presença em [nome do evento]"` |
| Loading | Anunciar para leitores de tela | `aria-live="polite"` em regiões de loading |
| Formulários | Label conectado ao input | `htmlFor` + `id` matching — sempre |
| Erros | Associados ao campo | `aria-describedby` no input apontando para o erro |

**Alerta de contraste:** `uzzai-mint` (#1ABC9C) sobre fundo branco tem contraste 2.5:1, abaixo do AA. Soluções:
- Usar mint como cor de fundo com texto branco (passa AA)
- Usar mint como border/accent, não como texto em fundo claro
- Para texto interativo em fundo claro: usar `uzzai-blue` (#2E86AB) = 4.6:1 ✅

---

## 7. Plano de execução em 90 dias

### Fase 1 — Quick wins (Dias 1–30)

**Escopo:** Corrigir as maiores inconsistências sem tocar na arquitetura. Zero risco de regressão de rota/backend.

| # | Tarefa | Componente alvo | Critério de pronto |
|---|---|---|---|
| 1 | Criar `GroupPageHeader` e substituir hero gradient em `/grupos/[groupId]` | `(app)/grupos/[groupId]/page.tsx` | Página sem gradient, header simples, tsc passa |
| 2 | Unificar `RSVPButton` com estados (idle/loading/confirmed/declined) | Novo `components/eventos/rsvp-button.tsx` | Storybook ou snapshot, E2E RSVP passa |
| 3 | Padronizar `EmptyState` por domínio (eventos, atletas, financeiro) | `components/ui/empty-state-server.tsx` | 4 variações com ícone + copy específico por domínio |
| 4 | Corrigir contraste mint — usar blue para texto de link/hover em fundo claro | `globals.css` + componentes | WCAG AA em todos os elementos interativos principais |
| 5 | Padronizar loading.tsx de todas as páginas (app) | `(app)/*/loading.tsx` | Skeleton coerente com layout final de cada página |
| 6 | Fechar `ChargeDetailSheet` como drawer (não nova página) em desktop | `components/financial/*` | QR Code abre inline, URL não muda |
| 7 | Mover `RSVPProgress` e `ConfirmedAvatars` de `trainings/` para `eventos/` | `components/eventos/*` | Sem referências de `trainings` em páginas de eventos |

**Critério de pronto Fase 1:** `tsc --noEmit` ✅ + Playwright onboarding-smoke ✅ + nenhum h1 faltando em páginas core.

**KPI esperado:** Redução de inconsistências visuais visíveis para um usuário novo (auditada com Lighthouse + inspeção manual).

**Risco:** Baixo. Apenas componentes visuais, sem toque em rotas ou API.

---

### Fase 2 — Consolidação estrutural (Dias 31–60)

**Escopo:** Padronizar as páginas core no mesmo padrão visual e de interação. Criar os componentes que faltam.

| # | Tarefa | Rota alvo | Critério de pronto |
|---|---|---|---|
| 1 | Refatorar dashboard: KPI strip + hierarquia visual clara | `/dashboard` | 3 KPIs no topo, cards abaixo, sem redundância |
| 2 | Refatorar hub de eventos: filtros tab, contadores, FAB de criação | `/eventos` | Tab com count, empty state por tipo, FAB admin |
| 3 | Construir detalhe de evento com RSVP completo | `/eventos/[eventId]` | RSVP + progress + avatares + placar admin |
| 4 | Refatorar onboarding visual (progress bar, copy, validação de convite real-time) | `/onboarding/step/[n]` | Validação de código em tempo real, % progresso visível |
| 5 | Padronizar formulário de criação de evento (drawer/modal, não página separada em desktop) | `/eventos/novo` | Form abre como drawer em desktop, página em mobile |
| 6 | Construir perfil do atleta com stats e histórico | `/atletas/[id]` | Stats do grupo ativo, eventos recentes, posição no ranking |
| 7 | Unificar `HeroSection` do dashboard para usar `brand-panel` padrão | `components/dashboard/hero-section.tsx` | Sem gradientes próprios, usa tokens do design system |

**Critério de pronto Fase 2:** E2E cobrindo RSVP + pagamento + onboarding passando ✅. Performance Lighthouse > 80 em mobile.

**KPI esperado:** Tempo médio para criar evento < 60s. Taxa de RSVP por evento > 70%.

**Risco:** Médio — refatoração de componentes usados em múltiplas páginas. Mitigação: criar variação nova, deprecar antiga, remover depois.

---

### Fase 3 — Excelência operacional (Dias 61–90)

**Escopo:** Polimento, acessibilidade, telemetria e preparação para escala.

| # | Tarefa | Alvo | Critério de pronto |
|---|---|---|---|
| 1 | Implementar analytics em fluxos críticos | RSVP, criar evento, pagamento | Eventos disparando no dashboard de analytics |
| 2 | Acessibilidade: audit + correções de foco, ARIA, contraste | Global | WCAG AA em todas as páginas core |
| 3 | Refinar financeiro: export, filtros, histórico | `/financeiro` | Filtro por período, export CSV básico |
| 4 | Rankings: filtro de período + destaque do user logado | `/rankings` | Filtro mês/temporada, posição do usuário em destaque |
| 5 | Notificações: centro de notificações no topbar | `Topbar` + `/api/notifications` | Badge count + lista de últimas 10 |
| 6 | PWA: manifest + service worker básico | `next.config` + `public/` | Instalável em Android/iOS, funciona offline para leitura |
| 7 | Testes de componente (Vitest) nos componentes críticos | `RSVPButton`, `EventCard`, `ChargeSheet` | Coverage > 80% nos componentes novos |

**Critério de pronto Fase 3:** Lighthouse PWA score > 90. Zero erros de console em produção. Analytics com dados de pelo menos 1 semana de uso real.

**KPI esperado:** Retenção D7 > 40%. NPS > 7.

**Risco:** Baixo — é tudo aditivo. Mitigação: feature flags para notificações e PWA.

---

## 8. Métricas e sucesso de produto

### KPI primário

> **Taxa de ativação**: % de usuários que criam ou participam de um evento nos primeiros 7 dias após onboarding.
> Meta: > 60%

### KPIs secundários

| KPI | Meta | Como medir |
|---|---|---|
| Tempo para criar 1º evento (novo admin) | < 3 minutos | Funil: onboarding_completed → event_created |
| Taxa de RSVP respondido por evento | > 70% | confirmed + declined / total_members |
| Taxa de cobrança paga em 48h | > 50% | charge_paid_at - charge_created_at |
| Taxa de onboarding completo | > 80% | step_1_started / step_final_completed |
| Erro de UI (JS errors em prod) | < 0.1% de sessões | Sentry error rate |

### Métricas por funil

**Funil de ativação:**
```
Signup → Onboarding completo → Primeiro grupo → Primeiro evento visto → Primeiro RSVP → Primeiro pagamento
```

| Etapa | Evento de analytics | Drop-off esperado |
|---|---|---|
| Signup | `signup_completed` | — |
| Onboarding completo | `onboarding_completed` | < 20% |
| Primeiro grupo | `group_joined_or_created` | < 5% |
| Primeiro RSVP | `rsvp_confirmed_first` | < 30% |
| Primeiro pagamento | `charge_paid_first` | < 40% |

**Funil de evento:**
```
event_viewed → rsvp_started → rsvp_confirmed → charge_generated → charge_paid
```

**Funil de pagamento:**
```
charge_viewed → pix_qrcode_generated → pix_copied → charge_paid (manual confirm)
```

### Indicadores de qualidade técnica

| Indicador | Meta | Ferramenta |
|---|---|---|
| Latência P95 do middleware | < 50ms | Vercel Analytics |
| Latência P95 de páginas core | < 800ms (TTFB) | Lighthouse CI |
| Erros JS em produção | < 0.1% de page views | Sentry |
| Cobertura E2E (fluxos críticos) | > 90% fluxos core | Playwright |
| TypeScript sem erros | 100% | `tsc --noEmit` no CI |

### Como instrumentar semanalmente

1. **Segunda-feira:** revisar Sentry — novos erros da semana anterior, janela de 7 dias
2. **Quarta-feira:** revisar funil de onboarding — % de usuários novos chegando no primeiro RSVP
3. **Sexta-feira:** revisar cobranças — total gerado vs total pago na semana
4. **Sprint review:** Lighthouse CI do PR de produção — score não pode cair > 5 pontos

---

## Top 10 decisões executáveis amanhã

| # | Decisão | Impacto | Esforço | Arquivo alvo |
|---|---|---|---|---|
| 1 | Ampliar `GET /api/events` para retornar `event_type`, `confirmed_count`, `price`, `opponent`, scores | Desbloqueia EventCard, Hub, Dashboard — sem isso nenhuma tela de evento funciona completa | 2h | `src/app/api/events/route.ts:43` |
| 2 | Adicionar `user_rsvp_status` ao SELECT do mesmo endpoint (por usuário autenticado) | Desbloqueia badge/estado RSVP no EventCard | 1h | `src/app/api/events/route.ts` |
| 3 | Criar `components/eventos/rsvp-button.tsx` com estados idle/loading/confirmed/declined + `aria-label` dinâmico | Interação RSVP com feedback correto | 2h | novo arquivo |
| 4 | Criar `GroupPageHeader` (simples: h1, badge de role, botões de ação) e usá-lo em `/grupos/[groupId]` | Header contextual consistente com o resto do shell | 1h | `(app)/grupos/[groupId]/page.tsx` |
| 5 | Corrigir uso de `uzzai-mint` como texto em fundo claro → `uzzai-blue` (#2E86AB = 4.6:1 ✅) | Contraste WCAG AA — mint (#1ABC9C) em fundo branco = 2.5:1, reprova | 2h | `globals.css` + `sidebar.tsx` |
| 6 | Padronizar todos os `loading.tsx` de páginas sem skeleton para usar `LoadingSkeleton` existente | UX de carregamento consistente | 1h | `(app)/*/loading.tsx` |
| 7 | Mover `RSVPProgress` e `ConfirmedAvatars` de `components/trainings/` para `components/eventos/` | Nomenclatura coerente com rotas PT-BR | 30min | mover arquivos + atualizar imports |
| 8 | Criar `EmptyState` específico para `/eventos` com variantes `treino` e `jogo` | UX de estado vazio contextual com copy diferente por tipo | 1h | `components/ui/empty-state-server.tsx` |
| 9 | Adicionar `focus-visible:ring-2 focus-visible:ring-uzzai-mint` como padrão no `button.tsx` e `input.tsx` | Acessibilidade de teclado — foco atualmente invisível | 30min | `components/ui/button.tsx` |
| 10 | Criar Playwright spec `event-creation-flow.spec.ts`: login → criar evento → RSVP → ver cobrança | Garantia de não-regressão nos fluxos core — atualmente sem cobertura desse caminho | 3h | `tests/e2e/event-creation-flow.spec.ts` |

---

> **Gerado em:** 2026-03-11 | **Revisado em:** 2026-03-12 (v1.1)
> **Changelog v1.1:** corrigidos contratos de API das seções 5.1/5.2/5.4 para refletir endpoints reais; adicionada seção 5.6 (gaps de API); Top 10 reordenado — #1 agora é corrigir GET /api/events; Persona C JTBD corrigida.
> **Próximo documento:** após Fase 1 concluída, gerar `AUDITORIA-FRONTEND-FASE1.md` com evidências de conformidade
