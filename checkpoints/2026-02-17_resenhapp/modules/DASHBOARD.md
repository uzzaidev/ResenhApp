# Módulo: DASHBOARD

## Visão Geral

O módulo DASHBOARD é o ponto de entrada principal após a autenticação. Exibe um resumo do grupo ativo: grupos do usuário, próximos eventos, pagamentos pendentes e métricas do grupo. Suporta dois modos de layout: o modo completo (com sidebar e topbar) e o modo DirectMode simplificado para jogadores (apenas topbar, sem sidebar).

---

## Rotas de Páginas

| Rota | Descrição |
|------|-----------|
| `/dashboard` | Dashboard principal do usuário |

O dashboard é o destino padrão após login bem-sucedido (`NEXTAUTH_URL/dashboard`).

---

## Componentes

### `dashboard-wrapper`

**Tipo:** Client Component

**Descrição:** Componente container que decide qual modo de layout renderizar com base no perfil do usuário.

**Props principais:**
- `user: User` — usuário autenticado da sessão
- `groups: Group[]` — grupos do usuário
- `upcomingEvents: Event[]` — próximos eventos
- `pendingPayments: Charge[]` — cobranças pendentes

**Lógica de decisão:**
```typescript
const isDirect = user.role === 'player' && groups.length === 1

if (isDirect) {
  return <DirectModeDashboard {...props} />
}

return <NormalDashboard {...props} />
```

---

### `direct-mode-dashboard`

**Tipo:** Client Component

**Descrição:** Layout simplificado para jogadores de um único grupo. Exibe apenas a topbar (sem sidebar) e um conjunto reduzido de informações focadas no jogador.

**Props principais:**
- `user: User`
- `group: Group`
- `upcomingEvents: Event[]`
- `pendingPayments: Charge[]`

**Conteúdo exibido no DirectMode:**
- Saudação personalizada ("Olá, João!")
- Próximo evento com botão de RSVP rápido
- Cobranças pendentes (se houver)
- Seus últimos stats (jogos, gols, assists)

**Diferença do modo normal:**
- Sem sidebar de navegação
- Sem seletor de grupo (só há um grupo)
- Interface mais limpa e focada no atleta

---

### `hero-section`

**Tipo:** Client Component

**Descrição:** Seção de boas-vindas do dashboard com saudação ao usuário e resumo rápido do grupo ativo.

**Props principais:**
- `userName: string`
- `groupName: string`
- `memberCount: number`
- `isAdmin: boolean`

**Exibição:**
- Saudação com nome do usuário
- Nome e logo do grupo ativo
- Contagem de membros
- Papel do usuário no grupo (Admin / Jogador)

---

### `metrics-overview`

**Tipo:** Client Component

**Descrição:** Grid de cards com métricas resumidas do grupo ativo.

**Props principais:**
- `metrics: GroupMetrics` — dados de métricas do grupo

**Métricas exibidas:**
- Total de eventos no mês
- Participação média (%)
- Total de atletas ativos
- Receita do mês (apenas admins)

> **TODO (Sprint 2):** Este componente usa dados mockados. A integração com dados reais via API está planejada para Sprint 2.

---

### `modalities-grid`

**Tipo:** Client Component ou Server Component

**Descrição:** Grid de cards das modalidades esportivas do grupo ativo, com contagem de atletas por modalidade.

**Props principais:**
- `modalities: Modality[]` — modalidades com `athleteCount`
- `groupId: string`

**Exibição:**
- Card por modalidade com ícone, nome e número de atletas
- Link para a página de cada modalidade

---

### `groups-card`

**Tipo:** Client Component

**Descrição:** Card que exibe os grupos do usuário com opção de trocar o grupo ativo.

**Props principais:**
- `groups: GroupWithMemberCount[]`
- `activeGroupId: string`
- `onSwitch: (groupId: string) => void`

**Exibição:**
- Lista de grupos com logo, nome e contagem de membros
- Indicador do grupo ativo
- Botão de troca de grupo (chama `POST /api/groups/switch`)
- Link "Criar novo grupo"
- Link "Entrar em um grupo"

---

### `pending-payments-card`

**Tipo:** Client Component

**Descrição:** Card de alertas de cobranças pendentes do usuário no grupo ativo.

**Props principais:**
- `charges: Charge[]` — cobranças pendentes do usuário
- `groupId: string`

**Exibição:**
- Sem cobranças: exibe mensagem "Você está em dia!"
- Com cobranças: lista de cobranças com valor e vencimento
- Botão "Ver PIX" para cada cobrança com chave PIX configurada
- Link "Ver todas" → `/(dashboard)/financeiro`

---

### `upcoming-events-card`

**Tipo:** Client Component

**Descrição:** Card com os próximos eventos do grupo ativo, ordenados por data.

**Props principais:**
- `events: UpcomingEvent[]` — próximos eventos (status: scheduled/confirmed)
- `groupId: string`
- `currentUserId: string`

**Exibição:**
- Lista dos próximos 3-5 eventos
- Para cada evento: título, data/hora, local, contagem de confirmados/vagas
- Status do RSVP do usuário atual (Confirmado / Na fila / Não confirmado)
- Botão de RSVP rápido (confirmar/cancelar)
- Link "Ver todos os eventos"

---

### `upcoming-trainings`

**Tipo:** Client Component

**Descrição:** Card com os próximos treinos recorrentes do grupo.

**Props principais:**
- `trainings: UpcomingTraining[]`

**Exibição:**
- Lista dos próximos treinos com dia da semana e horário
- Participação média de cada treino

> **TODO (Sprint 2):** Este componente usa dados mockados. A integração com dados reais via `GET /api/recurring-trainings` está planejada para Sprint 2.

---

## Dados Carregados pelo Dashboard

O dashboard é um **Server Component** que carrega os dados no servidor antes de renderizar. As queries são executadas em paralelo para minimizar o tempo de carregamento:

```typescript
const [userGroups, upcomingEvents, pendingPayments] = await Promise.all([
  fetchUserGroupsWithMemberCount(userId),
  fetchUpcomingEvents(activeGroupId, userId),
  fetchPendingPayments(activeGroupId, userId),
])
```

### `fetchUserGroupsWithMemberCount(userId)`

Retorna os grupos do usuário com contagem de membros ativos:

```sql
SELECT g.*, COUNT(gm.id) as member_count
FROM groups g
JOIN group_members gm ON g.id = gm.group_id
WHERE gm.user_id = :userId
  AND gm.status = 'active'
  AND g.is_active = true
GROUP BY g.id
ORDER BY g.name
```

### `fetchUpcomingEvents(groupId, userId)`

Retorna os próximos 5 eventos com status RSVP do usuário:

```sql
SELECT e.*, ea.status as user_rsvp_status
FROM events e
LEFT JOIN event_attendance ea ON e.id = ea.event_id AND ea.user_id = :userId
WHERE e.group_id = :groupId
  AND e.status IN ('scheduled', 'confirmed')
  AND e.scheduled_at > NOW()
ORDER BY e.scheduled_at ASC
LIMIT 5
```

### `fetchPendingPayments(groupId, userId)`

Retorna as cobranças pendentes do usuário:

```sql
SELECT * FROM charges
WHERE group_id = :groupId
  AND user_id = :userId
  AND status = 'pending'
ORDER BY due_date ASC
```

---

## Modo DirectMode vs Modo Normal

### Modo Normal

Ativado para: admins e jogadores com múltiplos grupos.

**Layout:**
```
+------------------+-------------------------+
|     Sidebar      |         Topbar          |
|  (Navegação)     +-------------------------+
|                  |                         |
|  • Dashboard     |    hero-section         |
|  • Atletas       |    metrics-overview     |
|  • Eventos       |    modalities-grid      |
|  • Treinos       |    upcoming-events-card |
|  • Modalidades   |    pending-payments-card|
|  • Financeiro    |    upcoming-trainings   |
|  • Rankings      |    groups-card          |
|  • Frequência    |                         |
+------------------+-------------------------+
```

### DirectMode

Ativado para: jogadores com exatamente 1 grupo.

**Layout:**
```
+------------------------------------------+
|              Topbar (apenas)             |
+------------------------------------------+
|                                          |
|    hero-section (simplificado)           |
|    upcoming-events-card                  |
|    pending-payments-card                 |
|    (stats pessoais — sem sidebar)        |
|                                          |
+------------------------------------------+
```

---

## GroupContext no Dashboard

O `GroupContext` é inicializado no layout do dashboard e alimenta todos os sub-componentes:

```typescript
// src/app/(dashboard)/layout.tsx
<GroupContextProvider
  initialGroupId={activeGroupId}
  groups={userGroups}
>
  {children}
</GroupContextProvider>
```

O `GroupContext` provê:
- `activeGroupId: string` — ID do grupo ativo
- `activeGroup: Group` — objeto completo do grupo ativo
- `groups: Group[]` — todos os grupos do usuário
- `isAdmin: boolean` — se o usuário é admin no grupo ativo
- `switchGroup: (groupId: string) => void` — troca o grupo ativo

---

## Sidebar

**Localização:** `src/components/layout/sidebar.tsx`

**Tipo:** Client Component

**Props principais:**
- `groupId: string` — ID do grupo ativo
- `pendingPayments: number` — contagem de cobranças pendentes (exibida no badge do menu Financeiro)

**Itens de navegação:**

| Item | Rota | Visível para |
|------|------|-------------|
| Dashboard | `/dashboard` | Todos |
| Atletas | `/(dashboard)/atletas` | Todos |
| Eventos | `/(dashboard)/eventos` | Todos |
| Treinos | `/(dashboard)/treinos` | Todos |
| Modalidades | `/(dashboard)/modalidades` | Todos |
| Financeiro | `/(dashboard)/financeiro` | Todos (badge de pendentes) |
| Rankings | `/(dashboard)/rankings` | Todos |
| Frequência | `/(dashboard)/frequencia` | Todos |
| Configurações | `/groups/[groupId]/settings` | Admin apenas |

---

## TODOs Identificados no Código

| Componente | Problema | Sprint |
|------------|---------|--------|
| `metrics-overview` | Usa dados mockados | Sprint 2 |
| `upcoming-trainings` | Usa dados mockados | Sprint 2 |

---

## Notas de Implementação

- O dashboard é um Server Component que passa dados pré-carregados para os Client Components filhos
- A decisão de DirectMode vs Normal é tomada no Server Component com base em `user.role` e `groups.length`
- O `GroupContext` é necessário para que os componentes filhos possam recarregar dados ao trocar de grupo sem reload da página
- O cookie de grupo ativo (`active_group_id`) é lido pelo middleware e pelo Server Component para determinar qual grupo carregar
- A sidebar exibe o badge de cobranças pendentes que é recalculado a cada navegação (via Server Component)
- Em caso de usuário sem nenhum grupo, o dashboard redireciona para `/groups/new`
