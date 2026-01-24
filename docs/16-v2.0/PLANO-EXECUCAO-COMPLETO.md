# 🚀 Plano de Execução Completo - ResenhApp V2.0 (Sistema Atléticas)

> **Objetivo:** Transformar o ResenhApp em um sistema completo de gestão esportiva para atléticas universitárias  
> **Data:** 2026-02-27  
> **Status:** 📋 Planejamento Detalhado  
> **Baseado em:** `ATLETICAS-SISTEMA-COMPLETO-V1.html`

---

## 📋 ÍNDICE

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Análise do Sistema de Referência](#2-análise-do-sistema-de-referência)
3. [Mapeamento Features HTML → ResenhApp](#3-mapeamento-features-html--resenhapp)
4. [Plano de Execução por Fases](#4-plano-de-execução-por-fases)
5. [Detalhamento Técnico por Feature](#5-detalhamento-técnico-por-feature)
6. [Cronograma e Sprints](#6-cronograma-e-sprints)
7. [Checklist de Implementação](#7-checklist-de-implementação)

---

## 1. VISÃO GERAL DO PROJETO

### 1.1 Objetivo Principal

Transformar o **ResenhApp** em um **sistema completo de gestão esportiva** que atende **dois nichos distintos**:

1. **Atléticas Universitárias:** Sistema completo com múltiplas modalidades, treinos, jogos oficiais, convocações
2. **Peladas:** Grupos simples de pessoas para jogos (horário, mensal, semanal) - nicho original

O sistema opera com **hierarquia de usuários** (Atlética → Grupos → Usuários) e **sistema de créditos** para features premium.

### 1.2 Escopo do Projeto

**Sistema de Referência:** `ATLETICAS-SISTEMA-COMPLETO-V1.html` (3122 linhas)

**Funcionalidades Principais Identificadas:**
1. **Dashboard** - Métricas gerais, modalidades ativas, próximos treinos
2. **Modalidades** - Gestão de múltiplas modalidades esportivas
3. **Atletas** - Gestão completa de atletas com múltiplas modalidades
4. **Treinos** - Sistema de treinos com RSVP, recorrentes, pagamentos
5. **Jogos Oficiais** - Competições, convocações, resultados
6. **Financeiro** - Pagamentos por treino, histórico, pendências
7. **Frequência** - Check-in QR Code, rankings de frequência
8. **Rankings** - Artilharia, assistências, MVP por modalidade
9. **Tabelinha Tática** - Campo visual interativo para planejamento tático

### 1.3 Princípios de Implementação

1. **Modularidade:** Cada feature deve ser independente e reutilizável
2. **Incremental:** Implementar em sprints de 2 semanas
3. **Reutilização:** Aproveitar código existente do ResenhApp
4. **Design System:** Aplicar identidade visual UzzAI consistentemente
5. **Performance:** Otimizar para mobile-first
6. **Hierarquia:** Sistema de permissões baseado em níveis (Atlética → Grupo → Usuário)
7. **Créditos:** Features premium requerem créditos (sistema financeiro interno)
8. **Multi-nicho:** Suportar atléticas (completo) e peladas (simples)

---

## 2. ANÁLISE DO SISTEMA DE REFERÊNCIA

### 2.1 Estrutura de Navegação (HTML)

```
Sidebar Navigation:
├── Principal
│   ├── Dashboard
│   ├── Modalidades (5 modalidades)
│   └── Atletas
├── Gestão
│   ├── Treinos
│   ├── Jogos Oficiais
│   └── Financeiro
├── Análise
│   ├── Frequência
│   └── Rankings
└── Ferramentas
    ├── Tabelinha Tática (NOVO)
    └── Configurações
```

### 2.2 Features Detalhadas por View

#### 2.2.1 Dashboard
- **Métricas Principais:**
  - Atletas Ativos (127) com tendência (+12%)
  - Treinos Esta Semana (8)
  - Frequência Média (72%) com tendência (+5%)
  - Caixa do Mês (R$ 3.450) com pendências (R$ 850)
- **Modalidades Ativas:** Cards com estatísticas (atletas, frequência, treinos/semana)
- **Próximos Treinos:** Lista com data, modalidade, local, confirmados, valor

#### 2.2.2 Modalidades
- **Gestão por Modalidade:**
  - Futsal, Vôlei, Basquete, Handebol, Futebol Campo
  - Posições cadastradas por modalidade
  - Estatísticas: atletas, treinos/semana, frequência
  - Configurações específicas por modalidade

#### 2.2.3 Atletas
- **Gestão Completa:**
  - Tabela com filtros (modalidade, status, ordenação)
  - Status: Atleta de Ouro, Ativo, Treinador, Tesoureiro
  - Múltiplas modalidades por atleta
  - Frequência individual
  - Ações: Editar

#### 2.2.4 Treinos
- **Sistema Avançado:**
  - Treinos únicos e recorrentes
  - RSVP com progresso visual (23/30 confirmados - 77%)
  - Lista de confirmados com avatares
  - Integração financeira (valor por atleta)
  - Status: Confirmado, Pendente
  - Filtros: Hoje, Esta Semana, Pendentes RSVP, Taxa Confirmação

#### 2.2.5 Jogos Oficiais
- **Gestão de Competições:**
  - Jogos marcados com métricas (7 próximos 30 dias)
  - Vitórias, Taxa de Vitórias (65%)
  - Convocações ativas (3)
  - Convocação oficial com:
    - Status de respostas (Confirmados, Pendentes, Recusaram)
    - Posições convocadas (Goleiro, Fixo, Ala, Pivô)
  - Placar e resultados
  - Competições inscritas com histórico (V/E/D)

#### 2.2.6 Financeiro
- **Sistema Completo:**
  - Resumo: Total Arrecadado, Pendente, Despesas, Saldo Disponível
  - Pagamentos por Treino:
    - Lista de treinos com valor esperado vs. recebido
    - Atletas pendentes com botão "Cobrar"
    - Status: 100% Pago, Parcial
  - Histórico de Transações:
    - Receitas (pagamentos de treinos)
    - Despesas (aluguel, equipamentos)
    - Filtro por período

#### 2.2.7 Frequência
- **Controle Avançado:**
  - Métricas: Taxa Geral, Check-ins Hoje, Atletas Assíduos, Faltas
  - Ranking Top 10 com frequência e progress bar
  - Check-in por QR Code:
    - QR Code gerado para treino atual
    - Check-in manual com busca
    - Lista de check-ins realizados com horário
  - Filtros por período (Janeiro, Dezembro, Semestre)

#### 2.2.8 Rankings
- **Estatísticas Detalhadas:**
  - Top 5 Artilheiros
  - Top 5 Assistências
  - Top 5 MVP
  - Tabela completa: Jogos, Gols, Assistências, MVP
  - Filtro por modalidade

#### 2.2.9 Tabelinha Tática
- **Campo Visual Interativo:**
  - Seletor de modalidade (Futsal, Vôlei, Basquete, Campo)
  - Formações pré-definidas (2-2, 1-2-1, 3-1)
  - Campo SVG com linhas e áreas
  - Jogadores arrastáveis (drag & drop)
  - Dois times (Time A e Time B)
  - Ferramentas de desenho:
    - Desenhar Jogada
    - Movimento
    - Trajeto Bola
    - Limpar
  - Lista de jogadores disponíveis por time
  - Táticas salvas (carregar, visualizar)

---

## 3. MAPEAMENTO FEATURES HTML → RESENHAPP

### 3.1 Tabela de Correspondência

| Feature HTML | Status ResenhApp | Ação Necessária | Prioridade |
|--------------|------------------|-----------------|------------|
| **Dashboard com Métricas** | ⚠️ Parcial | Adicionar métricas de modalidades, tendências | 🔴 Alta |
| **Múltiplas Modalidades** | ❌ Não existe | Criar sistema de modalidades | 🔴 Alta |
| **Gestão de Atletas** | ✅ Básico | Expandir para múltiplas modalidades | 🟡 Média |
| **Treinos com RSVP** | ✅ Existe | Melhorar UI, adicionar recorrentes | 🟡 Média |
| **Jogos Oficiais** | ⚠️ Parcial | Adicionar convocações, competições | 🟡 Média |
| **Financeiro por Treino** | ✅ Básico | Adicionar pagamentos por treino, cobrança | 🔴 Alta |
| **Check-in QR Code** | ❌ Não existe | Criar sistema completo | 🟡 Média |
| **Rankings por Modalidade** | ✅ Existe | Adicionar filtros por modalidade | 🟢 Baixa |
| **Tabelinha Tática** | ❌ Não existe | Criar campo visual interativo | 🟢 Baixa |

### 3.2 Novas Tabelas Necessárias (Database)

```sql
-- Modalidades
CREATE TABLE sport_modalities (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL, -- 'Futsal', 'Vôlei', etc.
  icon VARCHAR(50),
  positions JSONB, -- Array de posições específicas
  group_id UUID REFERENCES groups(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Atletas por Modalidade (Many-to-Many)
CREATE TABLE athlete_modalities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  modality_id UUID REFERENCES sport_modalities(id),
  preferred_position VARCHAR(50),
  secondary_position VARCHAR(50),
  base_rating INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Treinos Recorrentes
ALTER TABLE events ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN recurrence_pattern JSONB; -- {type: 'weekly', day: 'thursday'}

-- Convocações para Jogos Oficiais
CREATE TABLE game_convocations (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  required_positions JSONB, -- {goalkeeper: 2, fixed: 3, ...}
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE convocation_responses (
  id UUID PRIMARY KEY,
  convocation_id UUID REFERENCES game_convocations(id),
  user_id UUID REFERENCES users(id),
  response VARCHAR(20), -- confirmed, declined, pending
  position VARCHAR(50),
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Check-in QR Codes
CREATE TABLE checkin_qrcodes (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  qr_code_data TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE checkins (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES users(id),
  checkin_method VARCHAR(20), -- qrcode, manual
  checked_in_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Táticas Salvas
CREATE TABLE saved_tactics (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES groups(id),
  modality_id UUID REFERENCES sport_modalities(id),
  name VARCHAR(100) NOT NULL,
  formation VARCHAR(20), -- '2-2', '1-2-1', etc.
  field_data JSONB NOT NULL, -- Posições dos jogadores, desenhos
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. PLANO DE EXECUÇÃO POR FASES

### FASE 0: Preparação e Fundação (Semana 1-2)

**Objetivo:** Preparar ambiente e estrutura base

#### Tarefas:
- [ ] **1.1** Criar migrations para novas tabelas
  - [ ] `sport_modalities`
  - [ ] `athlete_modalities`
  - [ ] `game_convocations` + `convocation_responses`
  - [ ] `checkin_qrcodes` + `checkins`
  - [ ] `saved_tactics`
  - [ ] Alterações em `events` (recurrence)
  - [ ] **Sistema de Créditos:**
    - [ ] `credit_transactions`
    - [ ] `credit_packages`
    - [ ] Alterações em `groups` (hierarquia, créditos, tipo, pix_code)

- [ ] **1.2** Atualizar schema V2.0
  - [ ] Adicionar novas tabelas ao `SYSTEM_V2.md`
  - [ ] Documentar relacionamentos
  - [ ] Atualizar `INTEGRACAO-FEATURES-SISTEMA.md`

- [ ] **1.3** Setup Design System
  - [ ] Criar componentes base UzzAI (se não existir)
  - [ ] Sidebar navigation component
  - [ ] Metric cards com tendências
  - [ ] Status badges
  - [ ] Progress bars

- [ ] **1.4** Sistema de Créditos (Base)
  - [ ] Implementar funções SQL (consume_credits, add_credits)
  - [ ] Criar API de créditos (`/api/credits`)
  - [ ] Criar componente `CreditsBalance`
  - [ ] Criar modal de compra de créditos
  - [ ] Integrar verificação de créditos em features premium

- [ ] **1.5** Hierarquia e Permissões
  - [ ] Implementar lógica de `parent_group_id`
  - [ ] Implementar `group_type` (athletic vs pelada)
  - [ ] Criar funções de permissão hierárquica
  - [ ] Atualizar middleware de autenticação

**Entregáveis:**
- ✅ Migrations aplicadas
- ✅ Documentação atualizada
- ✅ Componentes base criados
- ✅ Sistema de créditos funcional
- ✅ Hierarquia de grupos implementada

---

### FASE 1: Core - Modalidades e Atletas (Semana 3-4)

**Objetivo:** Implementar gestão de múltiplas modalidades e atletas

#### Tarefas:
- [ ] **2.1** Backend - Modalidades
  - [ ] API: `GET /api/modalities` - Listar modalidades do grupo
  - [ ] API: `POST /api/modalities` - Criar modalidade
  - [ ] API: `PATCH /api/modalities/[id]` - Atualizar modalidade
  - [ ] API: `DELETE /api/modalities/[id]` - Deletar modalidade
  - [ ] API: `GET /api/modalities/[id]/positions` - Posições da modalidade

- [ ] **2.2** Backend - Atletas por Modalidade
  - [ ] API: `POST /api/athletes/[userId]/modalities` - Adicionar modalidade ao atleta
  - [ ] API: `DELETE /api/athletes/[userId]/modalities/[modalityId]` - Remover
  - [ ] API: `PATCH /api/athletes/[userId]/modalities/[modalityId]` - Atualizar posições/rating

- [ ] **2.3** Frontend - Página Modalidades
  - [ ] Lista de modalidades com cards
  - [ ] Modal criar/editar modalidade
  - [ ] Configuração de posições por modalidade
  - [ ] Estatísticas por modalidade (atletas, frequência, treinos/semana)

- [ ] **2.4** Frontend - Página Atletas (Melhorada)
  - [ ] Tabela com filtros (modalidade, status, ordenação)
  - [ ] Badges de modalidades por atleta
  - [ ] Status badges (Ouro, Ativo, Treinador)
  - [ ] Modal editar atleta (adicionar/remover modalidades)

**Entregáveis:**
- ✅ CRUD completo de modalidades
- ✅ Atletas com múltiplas modalidades
- ✅ UI conforme design HTML

---

### FASE 2: Treinos Avançados (Semana 5-6)

**Objetivo:** Melhorar sistema de treinos com RSVP avançado e recorrentes

#### Tarefas:
- [ ] **3.1** Backend - Treinos Recorrentes
  - [ ] API: `POST /api/events/recurring` - Criar treino recorrente
  - [ ] Job agendado: Gerar eventos recorrentes
  - [ ] Lógica de recorrência (semanal, quinzenal, mensal)

- [ ] **3.2** Backend - RSVP Avançado
  - [ ] API: `GET /api/events/[id]/rsvp-stats` - Estatísticas de RSVP
  - [ ] API: `GET /api/events/[id]/confirmed` - Lista de confirmados
  - [ ] Melhorar `event_attendance` com mais dados

- [ ] **3.3** Frontend - Página Treinos (Melhorada)
  - [ ] Cards de métricas (Hoje, Esta Semana, Pendentes, Taxa)
  - [ ] Lista de treinos com RSVP expandido:
    - Progress bar de confirmação
    - Lista de confirmados com avatares
    - Badge de status (Confirmado, Pendente)
    - Badge "RECORRENTE" para treinos recorrentes
  - [ ] Modal criar treino (único ou recorrente)
  - [ ] Filtros por modalidade

**Entregáveis:**
- ✅ Treinos recorrentes funcionando
- ✅ RSVP com UI avançada
- ✅ Métricas de treinos

---

### FASE 3: Financeiro por Treino (Semana 7-8)

**Objetivo:** Implementar sistema de pagamentos por treino

#### Tarefas:
- [ ] **4.1** Backend - Pagamentos por Treino
  - [ ] API: `GET /api/events/[id]/payments` - Pagamentos do treino
  - [ ] API: `POST /api/events/[id]/charge` - Criar cobrança para treino
  - [ ] API: `POST /api/payments/[id]/mark-paid` - Marcar como pago
  - [ ] API: `POST /api/payments/[id]/remind` - Enviar lembrete de cobrança
  - [ ] Lógica: Associar `charges` a `events`

- [ ] **4.2** Frontend - Página Financeiro (Melhorada)
  - [ ] Cards de resumo (Arrecadado, Pendente, Despesas, Saldo)
  - [ ] Seção "Pagamentos por Treino":
    - Lista de treinos com valor esperado vs. recebido
    - Progress de pagamento (21/23 pagos - 91%)
    - Lista de atletas pendentes com botão "Cobrar"
    - Badge "100% PAGO" quando completo
  - [ ] Histórico de transações (melhorado)
  - [ ] Filtro por período

**Entregáveis:**
- ✅ Pagamentos vinculados a treinos
- ✅ UI de cobrança e pendências
- ✅ Histórico completo

---

### FASE 4: Jogos Oficiais e Convocações (Semana 9-10)

**Objetivo:** Implementar sistema de jogos oficiais com convocações

#### Tarefas:
- [ ] **5.1** Backend - Convocações
  - [ ] API: `POST /api/events/[id]/convocation` - Criar convocação
  - [ ] API: `GET /api/events/[id]/convocation` - Obter convocação
  - [ ] API: `POST /api/convocations/[id]/respond` - Responder convocação
  - [ ] API: `GET /api/convocations/[id]/stats` - Estatísticas de respostas
  - [ ] Lógica: Posições requeridas, status de respostas

- [ ] **5.2** Frontend - Página Jogos Oficiais
  - [ ] Cards de métricas (Jogos Marcados, Vitórias, Taxa, Convocações)
  - [ ] Lista de jogos com:
    - Badge "OFICIAL"
    - Placar/Adversário
    - Convocação oficial expandida:
      - Status de respostas (Confirmados, Pendentes, Recusaram)
      - Posições convocadas com contadores
    - Botão "Ver Convocação"
  - [ ] Modal criar/editar jogo oficial
  - [ ] Modal criar convocação (selecionar atletas por posição)
  - [ ] Seção "Competições Inscritas" com histórico V/E/D

**Entregáveis:**
- ✅ Sistema de convocações completo
- ✅ UI de jogos oficiais
- ✅ Competições com histórico

---

### FASE 5: Frequência e Check-in QR Code (Semana 11-12)

**Objetivo:** Implementar sistema de frequência com QR Code

#### Tarefas:
- [ ] **6.1** Backend - QR Code Check-in
  - [ ] API: `POST /api/events/[id]/qrcode` - Gerar QR Code
  - [ ] API: `POST /api/checkin/qrcode` - Validar e fazer check-in via QR
  - [ ] API: `POST /api/checkin/manual` - Check-in manual
  - [ ] API: `GET /api/events/[id]/checkins` - Lista de check-ins
  - [ ] Lógica: QR Code com expiração, validação única

- [ ] **6.2** Backend - Estatísticas de Frequência
  - [ ] API: `GET /api/frequency/stats` - Estatísticas gerais
  - [ ] API: `GET /api/frequency/ranking` - Ranking de frequência
  - [ ] Cálculo: Taxa geral, atletas assíduos, faltas

- [ ] **6.3** Frontend - Página Frequência
  - [ ] Cards de métricas (Taxa Geral, Check-ins Hoje, Assíduos, Faltas)
  - [ ] Ranking Top 10 com progress bars
  - [ ] Seção "Check-in Treino Atual":
    - QR Code visual (componente)
    - Botão "Gerar Novo QR"
    - Check-in manual com busca
    - Lista de check-ins realizados com horário
  - [ ] Filtros por período

**Entregáveis:**
- ✅ QR Code check-in funcionando
- ✅ Ranking de frequência
- ✅ UI completa de frequência

---

### FASE 6: Rankings Melhorados (Semana 13-14)

**Objetivo:** Melhorar rankings com filtros por modalidade

#### Tarefas:
- [ ] **7.1** Backend - Rankings por Modalidade
  - [ ] API: `GET /api/rankings/artillery?modality=[id]` - Artilharia
  - [ ] API: `GET /api/rankings/assists?modality=[id]` - Assistências
  - [ ] API: `GET /api/rankings/mvp?modality=[id]` - MVP
  - [ ] Atualizar queries existentes para filtrar por modalidade

- [ ] **7.2** Frontend - Página Rankings (Melhorada)
  - [ ] Filtro por modalidade (dropdown)
  - [ ] Cards Top 5 (Artilheiros, Assistências, MVP)
  - [ ] Tabela completa com todas as estatísticas
  - [ ] Badges de modalidade nos rankings

**Entregáveis:**
- ✅ Rankings filtrados por modalidade
- ✅ UI melhorada conforme HTML

---

### FASE 7: Tabelinha Tática (Semana 15-16)

**Objetivo:** Implementar campo visual interativo para táticas

#### Tarefas:
- [ ] **8.1** Backend - Táticas Salvas
  - [ ] API: `POST /api/tactics` - Salvar tática
  - [ ] API: `GET /api/tactics` - Listar táticas do grupo
  - [ ] API: `GET /api/tactics/[id]` - Obter tática
  - [ ] API: `DELETE /api/tactics/[id]` - Deletar tática

- [ ] **8.2** Frontend - Campo Tático
  - [ ] Componente SVG de campo (Futsal, Vôlei, Basquete, Campo)
  - [ ] Seletor de modalidade (muda o campo)
  - [ ] Seletor de formação (2-2, 1-2-1, etc.)
  - [ ] Jogadores arrastáveis (drag & drop) - usar `react-draggable` ou `@dnd-kit/core`
  - [ ] Dois times (Time A e Time B) com cores diferentes
  - [ ] Lista de jogadores disponíveis (sidebar)
  - [ ] Ferramentas de desenho (simplificado inicialmente):
    - [ ] Desenhar linhas (jogadas)
    - [ ] Limpar desenho
  - [ ] Salvar tática (modal com nome)
  - [ ] Lista de táticas salvas (carregar, visualizar)

**Entregáveis:**
- ✅ Campo tático interativo
- ✅ Salvar/carregar táticas
- ✅ UI conforme HTML

---

### FASE 8: Dashboard Completo (Semana 17-18)

**Objetivo:** Implementar dashboard com todas as métricas

#### Tarefas:
- [ ] **9.1** Backend - Métricas do Dashboard
  - [ ] API: `GET /api/dashboard/metrics` - Todas as métricas
  - [ ] Cálculos:
    - Atletas ativos (com tendência)
    - Treinos esta semana
    - Frequência média (com tendência)
    - Caixa do mês (com pendências)

- [ ] **9.2** Frontend - Dashboard (Melhorado)
  - [ ] Cards de métricas com tendências (↑↓)
  - [ ] Seção "Modalidades Ativas" com cards
  - [ ] Seção "Próximos Treinos" com lista
  - [ ] Gráficos (opcional - usar Recharts):
    - [ ] Gráfico de frequência (semanal)
    - [ ] Gráfico de arrecadação (mensal)

**Entregáveis:**
- ✅ Dashboard completo conforme HTML
- ✅ Métricas em tempo real

---

## 5. DETALHAMENTO TÉCNICO POR FEATURE

### 5.1 Sistema de Modalidades

**Arquivos a Criar:**
```
src/app/api/modalities/
  ├── route.ts                    # GET, POST
  └── [id]/
      ├── route.ts               # GET, PATCH, DELETE
      └── positions/route.ts     # GET, POST, DELETE posições

src/app/(dashboard)/modalidades/
  ├── page.tsx                   # Lista de modalidades
  ├── [id]/page.tsx             # Detalhes da modalidade
  └── components/
      ├── ModalityCard.tsx
      ├── ModalityForm.tsx
      └── PositionsConfig.tsx
```

**Componentes Necessários:**
- `ModalityCard` - Card com estatísticas
- `ModalityForm` - Form criar/editar
- `PositionsConfig` - Configurar posições

---

### 5.2 Sistema de Check-in QR Code

**Arquivos a Criar:**
```
src/app/api/checkin/
  ├── qrcode/route.ts           # POST - Validar QR e fazer check-in
  └── manual/route.ts           # POST - Check-in manual

src/app/api/events/[id]/
  └── qrcode/route.ts           # POST - Gerar QR Code

src/components/checkin/
  ├── QRCodeDisplay.tsx         # Exibir QR Code
  ├── QRCodeGenerator.tsx       # Gerar QR Code
  ├── ManualCheckin.tsx         # Check-in manual
  └── CheckinList.tsx           # Lista de check-ins
```

**Bibliotecas:**
- `qrcode.react` - Gerar QR Code
- `qrcode-reader` ou `html5-qrcode` - Ler QR Code (mobile)

---

### 5.3 Tabelinha Tática

**Arquivos a Criar:**
```
src/app/(dashboard)/tabelinha/
  ├── page.tsx                  # Página principal
  └── components/
      ├── TacticalField.tsx     # Campo SVG
      ├── PlayerMarker.tsx      # Marcador de jogador
      ├── PlayerList.tsx        # Lista de jogadores
      ├── FormationSelector.tsx # Seletor de formação
      ├── DrawingTools.tsx     # Ferramentas de desenho
      └── SavedTacticsList.tsx  # Lista de táticas salvas
```

**Bibliotecas:**
- `@dnd-kit/core` + `@dnd-kit/sortable` - Drag and drop
- `react-svg` ou SVG inline - Campo visual
- `fabric` ou `konva` (opcional) - Desenho avançado

---

## 6. CRONOGRAMA E SPRINTS

### Sprint 1 (Semana 1-2): Preparação
- Migrations
- Documentação
- Componentes base

### Sprint 2 (Semana 3-4): Modalidades e Atletas
- CRUD modalidades
- Atletas com múltiplas modalidades

### Sprint 3 (Semana 5-6): Treinos Avançados
- Treinos recorrentes
- RSVP melhorado

### Sprint 4 (Semana 7-8): Financeiro
- Pagamentos por treino
- Cobranças

### Sprint 5 (Semana 9-10): Jogos Oficiais
- Convocações
- Competições

### Sprint 6 (Semana 11-12): Frequência
- QR Code check-in
- Rankings de frequência

### Sprint 7 (Semana 13-14): Rankings
- Rankings por modalidade

### Sprint 8 (Semana 15-16): Tabelinha Tática
- Campo visual interativo

### Sprint 9 (Semana 17-18): Dashboard
- Dashboard completo
- Métricas e gráficos

**Total: 18 semanas (4.5 meses)**

---

## 7. CHECKLIST DE IMPLEMENTAÇÃO

### Setup Inicial
- [ ] Criar pasta `docs/16-v2.0/`
- [ ] Criar migrations para novas tabelas
- [ ] Atualizar documentação de arquitetura
- [ ] Setup componentes base UzzAI

### Features Core
- [ ] Sistema de modalidades (CRUD)
- [ ] Atletas com múltiplas modalidades
- [ ] Treinos recorrentes
- [ ] RSVP avançado
- [ ] Pagamentos por treino
- [ ] Convocações
- [ ] QR Code check-in
- [ ] Rankings por modalidade
- [ ] Tabelinha tática
- [ ] Dashboard completo

### Testes
- [ ] Testes unitários (backend)
- [ ] Testes de integração (API)
- [ ] Testes E2E (frontend crítico)
- [ ] Testes de performance

### Deploy
- [ ] Deploy migrations
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Validação em staging
- [ ] Deploy produção

---

**Última atualização:** 2026-02-27  
**Autor:** AI Assistant  
**Status:** ✅ Plano Completo Criado

