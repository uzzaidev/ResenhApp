# 📋 FASE 1: Core - Modalidades e Atletas

> **Duração:** Semana 3-4 (2 semanas)
> **Status:** 🟢 Pronto para iniciar
> **Prioridade:** 🔴 Alta
> **Depende de:** ✅ Fase 0 (100% concluída)
> **Data de início sugerida:** 2026-01-27

---

## 🎯 OBJETIVO DA FASE

Implementar gestão completa de múltiplas modalidades esportivas e permitir que atletas participem de múltiplas modalidades simultaneamente, com posições e ratings específicos por modalidade.

### Valor de Negócio
- ✅ Atléticas podem gerenciar várias modalidades (futebol, vôlei, basquete, etc.)
- ✅ Atletas podem jogar em múltiplas modalidades
- ✅ Posições e ratings específicos por modalidade
- ✅ Base para rankings, estatísticas e convocações futuras

---

## 📊 CONTEXTO E DEPENDÊNCIAS

### Pré-requisitos (✅ Concluídos)
- ✅ **Fase 0 concluída** (migrations aplicadas)
- ✅ **Tabelas criadas:**
  - `sport_modalities` (modalidades esportivas)
  - `athlete_modalities` (atletas por modalidade)
- ✅ **Design System** base criado
- ✅ **Sistema de créditos** funcionando
- ✅ **Hierarquia de grupos** implementada

### O que esta fase habilita
1. **Gestão de Modalidades:**
   - CRUD completo de modalidades
   - Configuração de posições por modalidade
   - Estatísticas de modalidades

2. **Atletas Multi-Modalidades:**
   - Vincular atletas a múltiplas modalidades
   - Posições preferidas por modalidade
   - Rating/nível por modalidade
   - Soft delete (is_active)

3. **Features Futuras:**
   - Rankings por modalidade (Fase 2)
   - Treinos específicos por modalidade
   - Convocações com posições obrigatórias
   - Estatísticas segmentadas

---

## 🗂️ ESTRUTURA DA FASE

### Backend
```
src/app/api/
├── modalities/
│   ├── route.ts                      # GET, POST
│   ├── [id]/
│   │   ├── route.ts                  # GET, PATCH, DELETE
│   │   └── positions/
│   │       └── route.ts              # GET, POST, DELETE
│   └── athletes/
│       └── route.ts                  # GET atletas por modalidade
└── athletes/
    └── [userId]/
        └── modalities/
            ├── route.ts              # GET, POST
            └── [modalityId]/
                └── route.ts          # PATCH, DELETE
```

### Frontend
```
src/app/(dashboard)/
├── modalidades/
│   ├── page.tsx                      # Lista de modalidades
│   ├── [id]/
│   │   ├── page.tsx                  # Detalhes da modalidade
│   │   └── components/
│   │       ├── ModalityStats.tsx     # Estatísticas
│   │       └── AthletesList.tsx      # Atletas da modalidade
│   └── components/
│       ├── ModalityCard.tsx          # Card com estatísticas
│       ├── ModalityForm.tsx          # Form criar/editar
│       └── PositionsConfig.tsx       # Configurar posições
└── atletas/
    ├── page.tsx                      # Lista (melhorada)
    └── components/
        ├── AthletesTable.tsx         # Tabela com filtros
        ├── AthleteFilters.tsx        # Componente de filtros
        ├── AthleteRow.tsx            # Linha da tabela
        └── EditAthleteModal.tsx      # Modal editar modalidades
```

### Components
```
src/components/
├── modalities/
│   ├── modality-card.tsx             # Card de modalidade
│   ├── modality-form.tsx             # Formulário
│   ├── positions-config.tsx          # Configurar posições
│   └── modality-icon.tsx             # Ícone por tipo
└── athletes/
    ├── athlete-modalities-badge.tsx  # Badges de modalidades
    ├── add-modality-modal.tsx        # Adicionar modalidade
    └── edit-rating-modal.tsx         # Editar rating/posição
```

---

## 📝 TAREFAS DETALHADAS

### 🔧 Backend - Modalidades (8 tarefas)

#### Tarefa 1.1: API de Modalidades (CRUD)
**Arquivo:** `src/app/api/modalities/route.ts`

**GET /api/modalities**
- Query params: `group_id` (obrigatório)
- Retornar: Lista de modalidades do grupo
- Include: Contagem de atletas, treinos/semana

**POST /api/modalities**
- Body: `{ groupId, name, icon, color, trainingsPerWeek, description? }`
- Validação: Zod schema
- Permissão: Apenas admin do grupo
- Retornar: Modalidade criada

**Checklist:**
- [ ] Implementar GET
- [ ] Implementar POST
- [ ] Validação com Zod
- [ ] Verificar permissões (admin only)
- [ ] Testes de integração

---

#### Tarefa 1.2: API de Modalidade Individual
**Arquivo:** `src/app/api/modalities/[id]/route.ts`

**GET /api/modalities/[id]**
- Retornar: Detalhes completos da modalidade
- Include: Atletas, posições configuradas, estatísticas

**PATCH /api/modalities/[id]**
- Body: Campos editáveis
- Permissão: Apenas admin
- Retornar: Modalidade atualizada

**DELETE /api/modalities/[id]**
- Soft delete (is_active = false)
- Permissão: Apenas admin
- Verificar: Sem eventos futuros vinculados

**Checklist:**
- [ ] Implementar GET
- [ ] Implementar PATCH
- [ ] Implementar DELETE (soft delete)
- [ ] Validações
- [ ] Testes

---

#### Tarefa 1.3: API de Posições por Modalidade
**Arquivo:** `src/app/api/modalities/[id]/positions/route.ts`

**GET /api/modalities/[id]/positions**
- Retornar: Lista de posições da modalidade

**POST /api/modalities/[id]/positions**
- Body: `{ positions: string[] }`
- Salvar: Como JSONB no campo `positions`
- Permissão: Apenas admin

**Checklist:**
- [ ] Implementar GET
- [ ] Implementar POST
- [ ] Validar array de posições
- [ ] Testes

---

#### Tarefa 1.4: API de Atletas por Modalidade
**Arquivo:** `src/app/api/athletes/[userId]/modalities/route.ts`

**GET /api/athletes/[userId]/modalities**
- Query: `group_id?` (opcional)
- Retornar: Modalidades do atleta com rating e posições

**POST /api/athletes/[userId]/modalities**
- Body: `{ modalityId, rating?, positions?, isActive }`
- Criar: Relacionamento atleta-modalidade
- Permissão: Admin ou próprio atleta

**Checklist:**
- [ ] Implementar GET
- [ ] Implementar POST
- [ ] Validações
- [ ] Testes

---

#### Tarefa 1.5: API de Modalidade de Atleta Individual
**Arquivo:** `src/app/api/athletes/[userId]/modalities/[modalityId]/route.ts`

**PATCH /api/athletes/[userId]/modalities/[modalityId]**
- Body: `{ rating?, positions?, isActive? }`
- Atualizar: Rating, posições, status
- Permissão: Admin ou próprio atleta

**DELETE /api/athletes/[userId]/modalities/[modalityId]**
- Soft delete: `is_active = false`
- Permissão: Admin ou próprio atleta

**Checklist:**
- [ ] Implementar PATCH
- [ ] Implementar DELETE
- [ ] Validações
- [ ] Testes

---

#### Tarefa 1.6: Schemas de Validação
**Arquivo:** `src/lib/validations.ts` (atualizar)

**Schemas a criar:**
```typescript
// Modalidade
export const createModalitySchema = z.object({
  groupId: z.string().uuid(),
  name: z.string().min(1).max(50),
  icon: z.string().optional(),
  color: z.string().optional(),
  trainingsPerWeek: z.number().int().min(0).max(7).optional(),
  description: z.string().max(500).optional(),
});

// Atleta-Modalidade
export const athleteModalitySchema = z.object({
  modalityId: z.string().uuid(),
  rating: z.number().int().min(1).max(10).optional(),
  positions: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});
```

**Checklist:**
- [ ] Criar schemas
- [ ] Exportar schemas
- [ ] Documentar
- [ ] Testar validações

---

#### Tarefa 1.7: Helpers e Utils
**Arquivo:** `src/lib/modalities.ts` (criar)

**Funções a implementar:**
```typescript
// Obter modalidades do grupo com estatísticas
export async function getGroupModalities(groupId: string)

// Obter atletas de uma modalidade
export async function getModalityAthletes(modalityId: string)

// Verificar se atleta está em modalidade
export async function isAthleteInModality(userId: string, modalityId: string)

// Obter posições disponíveis
export async function getAvailablePositions(modalityId: string)
```

**Checklist:**
- [ ] Criar arquivo
- [ ] Implementar funções
- [ ] Adicionar tipagens
- [ ] Documentar
- [ ] Testes unitários

---

#### Tarefa 1.8: Integração com Sistema de Créditos (Opcional)
**Decisão:** Modalidades são features básicas, **não consomem créditos**.

**Checklist:**
- [x] Confirmar que modalidades são gratuitas
- [ ] Documentar decisão

---

### 🎨 Frontend - Modalidades (10 tarefas)

#### Tarefa 2.1: Página Lista de Modalidades
**Arquivo:** `src/app/(dashboard)/modalidades/page.tsx`

**Layout:**
- Header: "Modalidades" + botão "Nova Modalidade"
- Grid de cards (3 colunas desktop, 1 coluna mobile)
- Empty state: "Nenhuma modalidade criada"

**Funcionalidades:**
- Listar modalidades do grupo
- Loading state
- Error handling
- Criar nova modalidade (modal)

**Checklist:**
- [ ] Criar página
- [ ] Implementar layout
- [ ] Integrar com API
- [ ] Loading/error states
- [ ] Responsive design
- [ ] Testes

---

#### Tarefa 2.2: Componente ModalityCard
**Arquivo:** `src/components/modalities/modality-card.tsx`

**Design:**
```
┌─────────────────────────────┐
│ 🏀  Basquete           [...]│
│                             │
│ 12 atletas                  │
│ 3 treinos/semana            │
│ 85% de frequência           │
│                             │
│ [Ver Detalhes]              │
└─────────────────────────────┘
```

**Props:**
```typescript
interface ModalityCardProps {
  modality: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    athletesCount: number;
    trainingsPerWeek?: number;
    averageAttendance?: number;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}
```

**Checklist:**
- [ ] Criar componente
- [ ] Aplicar Design System
- [ ] Ícone customizado
- [ ] Menu de ações (...)
- [ ] Hover effects
- [ ] Testes

---

#### Tarefa 2.3: Componente ModalityForm
**Arquivo:** `src/components/modalities/modality-form.tsx`

**Campos:**
- Nome (obrigatório)
- Ícone (seletor de emoji/ícone)
- Cor (color picker)
- Treinos por semana (número 0-7)
- Descrição (textarea)

**Validação:**
- Zod schema no frontend
- Feedback em tempo real

**Checklist:**
- [ ] Criar formulário
- [ ] Validação com Zod
- [ ] Seletor de ícone
- [ ] Color picker
- [ ] Submit handler
- [ ] Loading states
- [ ] Testes

---

#### Tarefa 2.4: Modal de Criar/Editar Modalidade
**Arquivo:** `src/components/modalities/modality-modal.tsx`

**Funcionalidades:**
- Modo criar vs editar
- Integração com ModalityForm
- Submit para API
- Toast de sucesso/erro
- Fechar ao criar

**Checklist:**
- [ ] Criar modal
- [ ] Integrar com Dialog (shadcn)
- [ ] Modo create/edit
- [ ] Submit handler
- [ ] Toasts
- [ ] Testes

---

#### Tarefa 2.5: Página Detalhes da Modalidade
**Arquivo:** `src/app/(dashboard)/modalidades/[id]/page.tsx`

**Seções:**
1. Header com nome, ícone, botão editar
2. Estatísticas (cards):
   - Total de atletas
   - Treinos/semana
   - Frequência média
   - Próximo treino
3. Lista de atletas da modalidade
4. Botão "Adicionar Atleta"

**Checklist:**
- [ ] Criar página
- [ ] Implementar layout
- [ ] Seção de estatísticas
- [ ] Lista de atletas
- [ ] Integrar com API
- [ ] Testes

---

#### Tarefa 2.6: Componente PositionsConfig
**Arquivo:** `src/components/modalities/positions-config.tsx`

**Funcionalidades:**
- Lista de posições atuais
- Adicionar nova posição
- Remover posição
- Salvar configuração
- Posições padrão por tipo (futebol, vôlei, etc.)

**Layout:**
```
Posições desta modalidade:
[x] Goleiro
[x] Zagueiro
[x] Meio-campo
[x] Atacante

[+ Adicionar posição]

[Carregar posições padrão ▼] [Salvar]
```

**Checklist:**
- [ ] Criar componente
- [ ] Lista editável
- [ ] Adicionar/remover
- [ ] Posições padrão
- [ ] Submit para API
- [ ] Testes

---

#### Tarefa 2.7: Componente AthletesList (Modalidade)
**Arquivo:** `src/app/(dashboard)/modalidades/[id]/components/athletes-list.tsx`

**Colunas:**
- Avatar + Nome
- Posições preferidas (badges)
- Rating (1-10, estrelas)
- Status (badge: ativo/inativo)
- Ações (editar, remover)

**Funcionalidades:**
- Ordenar por nome, rating
- Filtrar por status
- Modal editar atleta

**Checklist:**
- [ ] Criar componente
- [ ] Tabela responsiva
- [ ] Ordenação
- [ ] Filtros
- [ ] Modal editar
- [ ] Testes

---

#### Tarefa 2.8: Ícones de Modalidades
**Arquivo:** `src/components/modalities/modality-icon.tsx`

**Ícones padrão:**
- ⚽ Futebol
- 🏀 Basquete
- 🏐 Vôlei
- 🎾 Tênis
- 🏓 Tênis de Mesa
- ⚾ Beisebol
- etc.

**Props:**
```typescript
interface ModalityIconProps {
  type?: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}
```

**Checklist:**
- [ ] Criar componente
- [ ] Mapear ícones padrão
- [ ] Suporte a custom icon
- [ ] Tamanhos responsivos
- [ ] Cor customizável
- [ ] Testes

---

### 🎨 Frontend - Atletas (8 tarefas)

#### Tarefa 3.1: Melhorar Página de Atletas
**Arquivo:** `src/app/(dashboard)/atletas/page.tsx` (atualizar)

**Melhorias:**
- Header com filtros
- Contador de atletas
- Botão "Adicionar Atleta"
- Paginação (se > 50 atletas)

**Checklist:**
- [ ] Atualizar layout
- [ ] Adicionar filtros
- [ ] Contador
- [ ] Paginação
- [ ] Testes

---

#### Tarefa 3.2: Componente AthletesTable
**Arquivo:** `src/components/athletes/athletes-table.tsx`

**Colunas:**
- Avatar + Nome + Email
- Modalidades (badges coloridos)
- Status (Ouro, Ativo, Treinador)
- Frequência (com cor: verde > 80%, amarelo 50-80%, vermelho < 50%)
- Ações (editar)

**Funcionalidades:**
- Ordenar por nome, frequência
- Clique na linha abre modal
- Responsive (collapse em mobile)

**Checklist:**
- [ ] Criar tabela
- [ ] Colunas responsivas
- [ ] Ordenação
- [ ] Clique na linha
- [ ] Loading skeleton
- [ ] Testes

---

#### Tarefa 3.3: Componente AthleteFilters
**Arquivo:** `src/components/athletes/athlete-filters.tsx`

**Filtros:**
- Busca (nome/email)
- Modalidade (dropdown multi-select)
- Status (Ouro, Ativo, Treinador, Todos)
- Ordenação (Nome, Frequência, Mais Recentes)

**Layout:**
```
┌─────────────────────────────────────────┐
│ [🔍 Buscar...]  [Modalidade ▼]  [Status ▼]  [Ordenar ▼] │
└─────────────────────────────────────────┘
```

**Checklist:**
- [ ] Criar componente
- [ ] Input de busca (debounced)
- [ ] Dropdowns
- [ ] Aplicar filtros
- [ ] Reset filtros
- [ ] Testes

---

#### Tarefa 3.4: Modal Editar Atleta
**Arquivo:** `src/components/athletes/edit-athlete-modal.tsx`

**Seções:**
1. **Informações Básicas** (readonly):
   - Nome, Email, Avatar

2. **Modalidades:**
   - Lista de modalidades do atleta
   - Botão "Adicionar Modalidade"
   - Editar posições/rating
   - Remover modalidade

3. **Ações:**
   - Salvar
   - Cancelar

**Checklist:**
- [ ] Criar modal
- [ ] Seções
- [ ] Lista de modalidades
- [ ] Adicionar modalidade
- [ ] Editar inline
- [ ] Submit
- [ ] Testes

---

#### Tarefa 3.5: Componente ModalityBadge
**Arquivo:** `src/components/athletes/modality-badge.tsx`

**Design:**
```
[⚽ Futebol] [🏀 Basquete] [+2]
```

**Props:**
```typescript
interface ModalityBadgeProps {
  modalities: Array<{
    id: string;
    name: string;
    icon?: string;
    color?: string;
  }>;
  maxVisible?: number; // Default: 3
  onBadgeClick?: (modalityId: string) => void;
}
```

**Checklist:**
- [ ] Criar componente
- [ ] Suporte a cores
- [ ] Limite de badges visíveis
- [ ] Tooltip com todas
- [ ] Click handler
- [ ] Testes

---

#### Tarefa 3.6: Modal Adicionar Modalidade
**Arquivo:** `src/components/athletes/add-modality-modal.tsx`

**Campos:**
- Modalidade (dropdown)
- Posições (multi-select com posições da modalidade)
- Rating (slider 1-10)
- Status (ativo/inativo)

**Validação:**
- Modalidade obrigatória
- Rating opcional
- Não permitir duplicatas

**Checklist:**
- [ ] Criar modal
- [ ] Dropdown de modalidades
- [ ] Multi-select posições
- [ ] Rating slider
- [ ] Validação
- [ ] Submit
- [ ] Testes

---

#### Tarefa 3.7: Modal Editar Rating/Posição
**Arquivo:** `src/components/athletes/edit-rating-modal.tsx`

**Campos:**
- Posições (multi-select)
- Rating (slider)
- Status (toggle)

**Funcionalidades:**
- Carregar valores atuais
- Salvar alterações
- Feedback visual

**Checklist:**
- [ ] Criar modal
- [ ] Carregar dados
- [ ] Editar campos
- [ ] Submit
- [ ] Toasts
- [ ] Testes

---

#### Tarefa 3.8: Página Detalhes do Atleta (Melhorada)
**Arquivo:** `src/app/(dashboard)/atletas/[id]/page.tsx` (atualizar)

**Nova seção: Modalidades**
- Cards por modalidade
- Posições preferidas
- Rating
- Estatísticas (treinos, gols, etc.)

**Checklist:**
- [ ] Adicionar seção
- [ ] Cards de modalidades
- [ ] Estatísticas
- [ ] Integrar com API
- [ ] Testes

---

## ✅ CHECKLIST COMPLETO

### Backend (19 tarefas)
- [ ] **Modalidades - CRUD**
  - [ ] GET /api/modalities
  - [ ] POST /api/modalities
  - [ ] GET /api/modalities/[id]
  - [ ] PATCH /api/modalities/[id]
  - [ ] DELETE /api/modalities/[id] (soft)
  - [ ] GET /api/modalities/[id]/positions
  - [ ] POST /api/modalities/[id]/positions

- [ ] **Atletas - Modalidades**
  - [ ] GET /api/athletes/[userId]/modalities
  - [ ] POST /api/athletes/[userId]/modalities
  - [ ] PATCH /api/athletes/[userId]/modalities/[modalityId]
  - [ ] DELETE /api/athletes/[userId]/modalities/[modalityId]

- [ ] **Validações e Helpers**
  - [ ] Schemas Zod (createModalitySchema, athleteModalitySchema)
  - [ ] Helpers (getGroupModalities, getModalityAthletes, etc.)
  - [ ] Permissões (verificações em todas as rotas)

- [ ] **Testes**
  - [ ] Testes unitários (helpers)
  - [ ] Testes de integração (APIs)
  - [ ] Validação de permissões

### Frontend (26 tarefas)
- [ ] **Páginas**
  - [ ] /modalidades (lista)
  - [ ] /modalidades/[id] (detalhes)
  - [ ] /atletas (melhorada)
  - [ ] /atletas/[id] (melhorada)

- [ ] **Componentes - Modalidades**
  - [ ] ModalityCard
  - [ ] ModalityForm
  - [ ] ModalityModal (create/edit)
  - [ ] PositionsConfig
  - [ ] ModalityIcon
  - [ ] AthletesList (por modalidade)

- [ ] **Componentes - Atletas**
  - [ ] AthletesTable
  - [ ] AthleteFilters
  - [ ] EditAthleteModal
  - [ ] ModalityBadge
  - [ ] AddModalityModal
  - [ ] EditRatingModal

- [ ] **Integrações**
  - [ ] Integrar todas as APIs
  - [ ] Loading states
  - [ ] Error handling
  - [ ] Toasts de sucesso/erro

- [ ] **Testes Frontend**
  - [ ] Testes de componentes
  - [ ] Testes E2E (fluxos críticos)

### Documentação (5 tarefas)
- [ ] Atualizar `docs/02-architecture/SYSTEM_V2.md`
- [ ] Documentar APIs no README
- [ ] Criar guia de uso (modalidades)
- [ ] Atualizar `MIGRATIONS_STATUS.md`
- [ ] Screenshots/GIFs de UI

---

## 📦 ENTREGÁVEIS

### Backend
1. ✅ **7 rotas API** funcionando (modalidades)
2. ✅ **4 rotas API** funcionando (atletas-modalidades)
3. ✅ **Schemas de validação** completos
4. ✅ **Helpers** testados
5. ✅ **Permissões** verificadas

### Frontend
1. ✅ **4 páginas** completas
2. ✅ **12 componentes** criados
3. ✅ **UI conforme Design System**
4. ✅ **Filtros e busca** funcionando
5. ✅ **Integrações** completas

### Qualidade
1. ✅ **Testes** executados e passando
2. ✅ **Documentação** atualizada
3. ✅ **Code review** aprovado
4. ✅ **TypeScript** sem erros
5. ✅ **Performance** validada

---

## 🚀 CRITÉRIOS DE SUCESSO

### Funcionalidades
- [ ] Admin pode criar modalidades
- [ ] Admin pode configurar posições
- [ ] Atletas podem ser vinculados a múltiplas modalidades
- [ ] Posições e ratings funcionando
- [ ] Soft delete implementado
- [ ] Filtros e busca funcionando

### Qualidade de Código
- [ ] TypeScript sem erros
- [ ] Padrões consistentes
- [ ] Error handling completo
- [ ] Validações implementadas
- [ ] Testes passando (>80% cobertura)

### UX/UI
- [ ] Design System aplicado
- [ ] Responsivo (mobile/desktop)
- [ ] Loading states
- [ ] Empty states
- [ ] Error feedback
- [ ] Toasts de sucesso

---

## 🎯 PRÓXIMOS PASSOS (Após Fase 1)

### Fase 2: Treinos Avançados
**Dependências cumpridas:**
- ✅ Modalidades implementadas
- ✅ Atletas com modalidades
- ✅ Posições configuradas

**Próximas features:**
- Treinos específicos por modalidade
- Convocações com posições obrigatórias
- Escalações táticas
- Check-in por QR Code

---

**Última atualização:** 2026-01-24
**Status:** 🟢 Pronto para iniciar
**Responsável:** Equipe ResenhApp
**Prazo:** 2 semanas (2026-01-27 a 2026-02-10)
