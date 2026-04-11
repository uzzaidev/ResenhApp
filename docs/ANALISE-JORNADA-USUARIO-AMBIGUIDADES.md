# 🗺️ Análise da Jornada do Usuário - ResenhApp
## Identificação de Ambiguidades e Proposta de Modelo Mental Claro

> **Data:** 2026-02-23
> **Objetivo:** Mapear a jornada do usuário, identificar ambiguidades no modelo atual e propor padronização
> **Status:** 🔍 Análise Completa

---

## 📊 Sumário Executivo

O ResenhApp atualmente apresenta **ambiguidades conceituais** que confundem o usuário sobre o que é cada entidade e como navegá-las. A análise identificou **4 áreas críticas de ambiguidade** que precisam ser resolvidas para melhorar a experiência do usuário.

### Principais Problemas Identificados

1. **Grupo vs Modalidade** - dois conceitos competindo pelo mesmo papel
2. **Athletic vs Pelada vs Grupo** - hierarquia confusa
3. **Evento vs Treino vs Jogo vs Pelada** - mesmo conceito com nomes diferentes
4. **Navegação duplicada** - duas formas de acessar a mesma informação

---

## 🎯 Modelo Mental Ideal (Proposta)

```
PLATAFORMA: ResenhApp
│
├─ ATLÉTICA (opcional)
│  ├─ É uma organização mãe
│  ├─ Gerencia vários grupos
│  └─ Pode delegar administração
│
├─ GRUPO (unidade base)
│  ├─ Pode pertencer a uma atlética (ou ser independente)
│  ├─ Tem UMA modalidade esportiva (futsal, vôlei, etc.)
│  ├─ Tem membros (atletas)
│  ├─ Cria eventos
│  └─ Gerencia finanças
│
├─ MODALIDADE
│  ├─ É uma classificação esportiva (futsal, vôlei, basquete)
│  ├─ Define posições disponíveis (goleiro, fixo, ala, pivô)
│  └─ Configurada por grupo
│
└─ EVENTO
   ├─ Ocorrência com data/hora
   ├─ Tipos: Treino, Jogo Oficial, Amistoso, Pelada
   ├─ Tem confirmação de presença (RSVP)
   ├─ Pode ter cobrança
   └─ Pode ter sorteio de times
```

---

## ❌ Ambiguidade 1: Grupo vs Modalidade

### Problema Atual

O sistema tem dois conceitos que parecem competir:

**Tabela `groups`:**
```sql
groups
  ├── sport_modality: ENUM('futsal', 'futebol', 'society', 'beach_soccer')
  ├── group_type: ENUM('athletic', 'pelada')
  └── parent_group_id: FK → groups(id)
```

**Tabela `sport_modalities`:**
```sql
sport_modalities
  ├── group_id: FK → groups(id)
  ├── name: VARCHAR ('Futsal', 'Vôlei', etc.)
  ├── icon: VARCHAR
  ├── color: VARCHAR
  └── default_positions: JSONB
```

**Por que confunde:**
- `groups.sport_modality` sugere que o grupo TEM uma modalidade fixa
- `sport_modalities` é configurável e pode ter várias por grupo
- Usuário não entende: "Meu grupo é de futsal OU tenho várias modalidades?"

### Modelo Mental Confuso do Usuário

```
"Criei um grupo de Futsal. Por que preciso configurar modalidades?"
"Se eu tenho múltiplas modalidades, meu grupo é de qual esporte?"
"Athletic e Pelada são modalidades ou tipos de grupo?"
```

### Proposta de Solução

**Definir claramente:**

1. **Grupo = Organização de pessoas**
   - Um grupo pode ter UMA modalidade principal OU ser multi-esporte
   - Campo: `primary_modality_id` (FK → sport_modalities)

2. **Modalidade = Classificação esportiva**
   - Define as regras do esporte (posições, formações, etc.)
   - É cadastrada uma vez e reutilizada
   - Cada evento pode especificar qual modalidade usa

**Exemplo de hierarquia clara:**
```
Grupo: "Futsal Paulistana"
├── primary_modality: Futsal
├── Evento 1: Treino de Futsal (modalidade: Futsal)
├── Evento 2: Racha de Vôlei (modalidade: Vôlei)
└── Evento 3: Jogo de Futsal (modalidade: Futsal)
```

---

## ❌ Ambiguidade 2: Athletic vs Pelada vs Grupo

### Problema Atual

O sistema usa três termos que não têm distinção clara na UI:

**No banco de dados:**
```sql
groups.group_type = 'athletic' | 'pelada'
groups.parent_group_id = UUID (para hierarquia)
```

**No código:**
```typescript
// Módulo GROUPS documenta:
- Athletic (tipo: athletic)
- Pelada (tipo: pelada, parent_group_id = athletic.id)

// Mas a visão V2 propõe:
- Atlética = tenant/multi-tenant
- Grupo de Modalidade = dentro ou fora de atlética
```

**Por que confunde:**
- "Pelada" é um termo brasileiro coloquial que significa "jogo informal"
- "Athletic" (Atlética) é uma organização universitária/esportiva
- Usuário casual não entende a diferença
- Interface não deixa clara a hierarquia

### Modelo Mental Confuso do Usuário

```
"Criei uma pelada, posso ter sub-grupos?"
"Atlética é um tipo de grupo ou uma organização maior?"
"Se meu grupo tem parent_group_id, o que isso significa na prática?"
```

### Proposta de Solução

**Renomear e esclarecer:**

1. **Atlética** → **Organização** (termo mais claro)
   - É a unidade máxima
   - Gerencia vários grupos
   - Termo na UI: "Atlética/Organização"

2. **Pelada/Grupo** → **Grupo** (termo único)
   - Pode ser independente ou pertencer a uma organização
   - Termo na UI: "Grupo"

3. **Hierarquia clara na UI:**

```
┌─────────────────────────────────────────┐
│ 🏛️ Atlética Paulistana (Organização)    │
├─────────────────────────────────────────┤
│ ⚽ Futsal Masculino (Grupo)             │
│ 🏐 Vôlei Feminino (Grupo)               │
│ 🏀 Basquete (Grupo)                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⚽ Pelada do João (Grupo Independente)  │
└─────────────────────────────────────────┘
```

**Fluxo de criação:**

```
1. Usuário clica "Criar Grupo"

2. Sistema pergunta:
   ☐ Grupo independente (pelada avulsa)
   ☐ Parte de uma organização/atlética

3. Se "Parte de organização":
   → Selecionar organização existente
   → OU criar nova organização

4. Preencher dados do grupo:
   - Nome
   - Modalidade principal
   - Privacidade
```

---

## ❌ Ambiguidade 3: Evento vs Treino vs Jogo vs Pelada

### Problema Atual

O sistema tem um modelo de dados unificado mas apresenta como se fossem entidades diferentes:

**No banco de dados:**
```sql
events.event_type = 'training' | 'official_game' | 'friendly'
```

**Na navegação (sidebar):**
```
/treinos  → Lista eventos WHERE event_type = 'training'
/jogos    → Lista eventos WHERE event_type = 'official_game'
```

**Na documentação:**
- CONCEPT_V2_VISION.md menciona "pelada" como tipo de evento
- EVENTS.md lista 3 tipos: training, official_game, friendly
- Não há tipo "pelada" no banco

**Por que confunde:**
- Usuário vê "Treinos" e "Jogos" como seções separadas
- "Pelada" aparece no nome do produto mas não é tipo de evento
- Interface sugere que são entidades diferentes

### Modelo Mental Confuso do Usuário

```
"Qual a diferença entre treino e pelada?"
"Jogo oficial é diferente de amistoso?"
"Por que preciso ir em 'Treinos' para ver minhas peladas?"
```

### Proposta de Solução

**Padronizar nomenclatura:**

| Termo Técnico (DB) | Termo na UI | Descrição |
|-------------------|-------------|-----------|
| `events` | **Eventos** | Termo genérico para qualquer ocorrência |
| `event_type: 'training'` | **Treino** | Prática/treinamento organizado |
| `event_type: 'official_game'` | **Jogo Oficial** | Partida com placar registrado |
| `event_type: 'friendly'` | **Amistoso** | Jogo casual sem competição |
| (conceito) | **Pelada** | Sinônimo coloquial de "Amistoso" ou "Treino casual" |

**Navegação proposta:**

```
Sidebar:
├── 📅 Eventos (todos)
│   ├── Filtro: Treinos
│   ├── Filtro: Jogos Oficiais
│   ├── Filtro: Amistosos
│   └── Filtro: Próximos / Passados
│
└── (Remover páginas separadas de /treinos e /jogos)
```

**Fluxo de criação unificado:**

```
1. Usuário clica "Criar Evento"

2. Sistema pergunta tipo:
   ⚽ Treino (prática)
   🏆 Jogo Oficial (com placar)
   🤝 Amistoso (pelada casual)

3. Restante do formulário é igual para todos
```

---

## ❌ Ambiguidade 4: Navegação Duplicada

### Problema Atual

O sistema tem duas estruturas de navegação que se sobrepõem:

**Estrutura 1 (Dashboard):**
```
/dashboard                  → Overview geral
/modalidades                → Configuração de esportes
/atletas                    → Membros do grupo
/treinos                    → Eventos tipo training
/jogos                      → Eventos tipo official_game
/financeiro                 → Cobranças
/frequencia                 → Attendance
/rankings                   → Estatísticas
/settings                   → (não implementado)
/tabelinha                  → (não implementado)
```

**Estrutura 2 (Grupos):**
```
/groups/[groupId]           → Overview do grupo
/groups/[groupId]/events    → Eventos do grupo
/groups/[groupId]/payments  → Cobranças do grupo
/groups/[groupId]/settings  → Configurações do grupo
/groups/[groupId]/credits   → Créditos do grupo
```

**Por que confunde:**
- Mesmo conteúdo em URLs diferentes
- `/dashboard` e `/groups/[groupId]` são similares
- `/financeiro` e `/groups/[groupId]/payments` mostram mesma coisa
- Usuário não sabe qual usar

### Modelo Mental Confuso do Usuário

```
"Vou em Dashboard ou em Groups?"
"Configurações do grupo estão em Settings ou em /groups/[id]/settings?"
"Por que tenho dois caminhos para ver cobranças?"
```

### Proposta de Solução

**Consolidar em uma estrutura única:**

```
Navegação Principal (Sidebar):

┌─────────────────────────────────────┐
│ [Group Switcher: Futsal Paulistana ▼]
├─────────────────────────────────────┤
│ 🏠 Dashboard                        │  → /dashboard
│ 📅 Eventos                          │  → /eventos
│ 👥 Membros                          │  → /membros
│ ⚽ Modalidades                      │  → /modalidades
│ 💰 Financeiro                       │  → /financeiro
│ 📊 Estatísticas                     │  → /estatisticas
│ 🏆 Rankings                         │  → /rankings
│ ✅ Frequência                       │  → /frequencia
│ ⚙️ Configurações                    │  → /configuracoes
└─────────────────────────────────────┘
```

**Mapeamento de rotas consolidadas:**

| Funcionalidade | Rota Nova (Única) | Rotas Antigas (Remover) |
|---------------|------------------|------------------------|
| Overview do grupo | `/dashboard` | `/groups/[groupId]` |
| Eventos | `/eventos` | `/treinos`, `/jogos`, `/groups/[groupId]/events` |
| Membros | `/membros` | `/atletas` |
| Financeiro | `/financeiro` | `/groups/[groupId]/payments` |
| Configurações | `/configuracoes` | `/settings`, `/groups/[groupId]/settings` |
| Créditos | `/creditos` | `/groups/[groupId]/credits` |

**Group Context (mantido):**
- `GroupContext` define o grupo ativo
- `GroupSwitcher` no topo permite trocar de grupo
- Todas as páginas filtram por `activeGroupId`

---

## 🧭 Jornada do Usuário Proposta (Clara)

### 1️⃣ Onboarding

```
1. Usuário se cadastra
   → POST /api/auth/signup
   → Página: /auth/signup

2. Usuário completa perfil
   → PATCH /api/users/[userId]
   → Página: /onboarding

3. Usuário escolhe:
   ☐ Criar grupo novo
   ☐ Entrar em grupo existente

4a. Se "Criar grupo":
    → POST /api/groups
    → Página: /criar-grupo
    → Define: nome, modalidade, tipo (independente ou organização)

4b. Se "Entrar em grupo":
    → POST /api/groups/join
    → Página: /entrar-grupo
    → Digita código de convite

5. Usuário é redirecionado para /dashboard
```

### 2️⃣ Uso Diário (Jogador)

```
1. Usuário abre app
   → Vê /dashboard com:
   - Próximos eventos
   - Estatísticas pessoais
   - Notificações

2. Vê treino marcado
   → Clica em "Confirmar presença"
   → POST /api/eventos/[eventId]/rsvp
   → Status atualizado

3. Recebe notificação de pagamento
   → Clica na notificação
   → Vai para /financeiro
   → Vê cobrança pendente
   → Paga via PIX

4. Dia do evento
   → Admin faz check-in
   → Usuário joga
   → Admin registra ações (gols, assists)

5. Após evento
   → Vota no MVP
   → Vê estatísticas atualizadas
   → Ganha achievements
```

### 3️⃣ Gestão (Admin)

```
1. Admin acessa /dashboard
   → Vê overview do grupo

2. Cria evento
   → /eventos/novo
   → Preenche: tipo, data, local, vagas, preço
   → POST /api/eventos
   → Evento criado

3. Gerencia confirmações
   → /eventos/[eventId]
   → Vê lista de confirmados e waitlist
   → Pode adicionar/remover manualmente

4. Dia do evento
   → Faz check-in dos presentes
   → Sorteia times (se necessário)
   → Registra placar ao vivo
   → Finaliza evento

5. Gestão financeira
   → /financeiro
   → Vê cobranças pendentes
   → Marca pagamentos como confirmados
   → Gera relatórios

6. Configurações
   → /configuracoes
   → Edita informações do grupo
   → Gerencia membros
   → Configura PIX
   → Ajusta permissões
```

---

## 🎨 Wireframe Conceitual (Proposta)

### Topbar
```
┌────────────────────────────────────────────────────────────────┐
│ [Logo] [Futsal Paulistana ▼] | [Busca] | [🔔 3] [👤 João]   │
└────────────────────────────────────────────────────────────────┘
```

### Sidebar + Conteúdo
```
┌───────────────┬──────────────────────────────────────────────┐
│ 🏠 Dashboard  │  📊 Dashboard - Futsal Paulistana           │
│ 📅 Eventos    │  ┌────────────────────────────────────────┐  │
│ 👥 Membros    │  │ Próximos Eventos (3)                   │  │
│ ⚽ Modalidades │  │ • Treino - 24/02 às 20h (15/20 vagas) │  │
│ 💰 Financeiro │  │ • Jogo - 26/02 às 19h (20/20 vagas)   │  │
│ 📊 Estatísticas│  └────────────────────────────────────────┘  │
│ 🏆 Rankings   │  ┌────────────────────────────────────────┐  │
│ ✅ Frequência │  │ Suas Estatísticas                      │  │
│ ⚙️ Config     │  │ • 12 jogos participados                │  │
│               │  │ • 8 gols marcados                      │  │
│               │  │ • 5 assistências                       │  │
│               │  └────────────────────────────────────────┘  │
└───────────────┴──────────────────────────────────────────────┘
```

---

## 📋 Checklist de Padronização

### Nomenclatura no Banco de Dados

- [ ] Manter `groups.group_type = 'athletic' | 'pelada'`
- [ ] Manter `events.event_type = 'training' | 'official_game' | 'friendly'`
- [ ] Adicionar coluna `groups.primary_modality_id` (opcional)
- [ ] Documentar claramente o mapeamento de termos

### Nomenclatura na UI

- [ ] "Grupo" → termo único para athletic e pelada
- [ ] "Organização/Atlética" → termo para athletic
- [ ] "Evento" → termo genérico
- [ ] "Treino" → event_type: training
- [ ] "Jogo Oficial" → event_type: official_game
- [ ] "Amistoso/Pelada" → event_type: friendly

### Navegação

- [ ] Consolidar rotas em estrutura única
- [ ] Remover duplicação `/groups/[id]/*`
- [ ] Manter apenas rotas `/dashboard`, `/eventos`, `/membros`, etc.
- [ ] GroupSwitcher para trocar de grupo ativo
- [ ] Breadcrumbs claros em todas as páginas

### Documentação

- [ ] Criar glossário de termos (técnico vs UI)
- [ ] Atualizar CLAUDE.md com modelo mental claro
- [ ] Documentar hierarquia: Organização → Grupo → Evento
- [ ] Criar diagrama visual da jornada do usuário

### Código

- [ ] Renomear componentes confusos
- [ ] Consolidar páginas duplicadas
- [ ] Atualizar rotas no middleware
- [ ] Garantir GroupContext funciona em todas as páginas

---

## 🎯 Glossário de Termos

### Termo Técnico → Termo na UI

| Banco de Dados | Código | UI (Usuário) | Descrição |
|---------------|--------|--------------|-----------|
| `groups` (table) | `Group` | **Grupo** | Unidade base de organização |
| `groups.group_type = 'athletic'` | `GroupType.Athletic` | **Organização/Atlética** | Grupo pai que gerencia outros |
| `groups.group_type = 'pelada'` | `GroupType.Pelada` | **Grupo** | Grupo simples (com ou sem organização pai) |
| `sport_modalities` | `SportModality` | **Modalidade** | Esporte praticado (futsal, vôlei, etc.) |
| `events` | `Event` | **Evento** | Qualquer ocorrência com data/hora |
| `events.event_type = 'training'` | `EventType.Training` | **Treino** | Prática/treinamento |
| `events.event_type = 'official_game'` | `EventType.OfficialGame` | **Jogo Oficial** | Partida competitiva |
| `events.event_type = 'friendly'` | `EventType.Friendly` | **Amistoso / Pelada** | Jogo casual |
| `group_members` | `GroupMember` | **Membro / Atleta** | Participante do grupo |
| `event_attendance` | `EventAttendance` | **Confirmação / RSVP** | Presença em evento |
| `teams` | `Team` | **Time** | Equipe sorteada em evento |
| `charges` | `Charge` | **Cobrança / Mensalidade** | Pagamento pendente |

---

## ✅ Conclusão

O ResenhApp tem uma arquitetura técnica sólida, mas sofre de **ambiguidades conceituais** que confundem o usuário. As principais ações recomendadas:

### Ações Críticas (Alta Prioridade)

1. **Consolidar navegação** - Remover rotas duplicadas
2. **Padronizar nomenclatura** - Criar glossário técnico vs UI
3. **Simplificar hierarquia** - Esclarecer Organização → Grupo → Evento
4. **Unificar tipos de evento** - Página única de eventos com filtros

### Ações Recomendadas (Média Prioridade)

5. **Melhorar onboarding** - Guiar usuário na criação/entrada em grupos
6. **Adicionar breadcrumbs** - Contextualizar onde o usuário está
7. **Criar ajuda contextual** - Tooltips explicando conceitos
8. **Documentar modelo mental** - Guia visual para desenvolvedores

### Resultado Esperado

✅ Usuário entende claramente o que é cada conceito
✅ Navegação intuitiva sem duplicação
✅ Jornada fluida do cadastro ao uso diário
✅ Desenvolvedores têm referência clara para manter consistência

---

**Próximos Passos:**

1. Revisar esta análise com a equipe
2. Priorizar ações de padronização
3. Criar sprint de refatoração de nomenclatura e navegação
4. Atualizar documentação e código incrementalmente
5. Testar com usuários reais para validar melhorias
