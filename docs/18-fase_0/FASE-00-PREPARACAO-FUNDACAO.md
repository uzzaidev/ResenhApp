# 📋 FASE 0: Preparação e Fundação

> **Duração:** Semana 1-2 (2 semanas)  
> **Status:** ⏸️ Planejado  
> **Prioridade:** 🔴 Crítica (Base para todas as outras fases)

---

## 🎯 OBJETIVO DA FASE

Preparar o ambiente e estrutura base para todas as features V2.0, incluindo:
- Migrations de database para novas tabelas
- Sistema de créditos (compra e consumo)
- Hierarquia de grupos (Atlética → Grupos)
- Componentes base do Design System UzzAI
- Documentação atualizada

---

## 📊 CONTEXTO E DEPENDÊNCIAS

### Dependências Externas
- ✅ Supabase configurado e funcionando
- ✅ Schema V1.0 aplicado e estável
- ✅ Next.js 15 com App Router configurado
- ✅ Tailwind CSS configurado

### Dependências Internas
- ✅ Sistema de autenticação funcionando
- ✅ Tabelas base (`users`, `groups`, `group_members`, `events`) existentes

### O que esta fase habilita
- ✅ Todas as fases subsequentes (1-8)
- ✅ Sistema de créditos para monetização
- ✅ Hierarquia de grupos para atléticas
- ✅ Componentes reutilizáveis para UI

---

## 📝 TAREFAS DETALHADAS

### Tarefa 1.1: Criar Migrations para Novas Tabelas

#### 1.1.1 Migration: Modalidades

**Arquivo:** `supabase/migrations/20260227000001_sport_modalities.sql`

```sql
-- =====================================================
-- SPORT MODALITIES
-- =====================================================

CREATE TABLE IF NOT EXISTS sport_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  positions JSONB DEFAULT '[]'::jsonb,
  trainings_per_week INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, name)
);

CREATE INDEX idx_sport_modalities_group_id ON sport_modalities(group_id);
CREATE INDEX idx_sport_modalities_name ON sport_modalities(name);

CREATE TRIGGER update_sport_modalities_updated_at
  BEFORE UPDATE ON sport_modalities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE sport_modalities IS 'Modalidades esportivas por grupo';
```

**Checklist:**
- [ ] Criar arquivo SQL
- [ ] Testar migration localmente
- [ ] Validar índices e constraints
- [ ] Documentar no `MIGRATIONS_STATUS.md`

---

#### 1.1.2 Migration: Atletas por Modalidade

**Arquivo:** `supabase/migrations/20260227000002_athlete_modalities.sql`

```sql
-- =====================================================
-- ATHLETE MODALITIES (Many-to-Many)
-- =====================================================

CREATE TABLE IF NOT EXISTS athlete_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  modality_id UUID NOT NULL REFERENCES sport_modalities(id) ON DELETE CASCADE,
  preferred_position VARCHAR(50),
  secondary_position VARCHAR(50),
  base_rating INTEGER DEFAULT 5 CHECK (base_rating >= 1 AND base_rating <= 10),
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, modality_id)
);

CREATE INDEX idx_athlete_modalities_user_id ON athlete_modalities(user_id);
CREATE INDEX idx_athlete_modalities_modality_id ON athlete_modalities(modality_id);
CREATE INDEX idx_athlete_modalities_active ON athlete_modalities(is_active) WHERE is_active = TRUE;

CREATE TRIGGER update_athlete_modalities_updated_at
  BEFORE UPDATE ON athlete_modalities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Checklist:**
- [ ] Criar arquivo SQL
- [ ] Testar relacionamento Many-to-Many
- [ ] Validar constraints de rating
- [ ] Testar soft delete (is_active)

---

#### 1.1.3 Migration: Treinos Recorrentes

**Arquivo:** `supabase/migrations/20260227000003_recurring_trainings.sql`

```sql
-- =====================================================
-- RECURRING TRAININGS
-- =====================================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB,
  ADD COLUMN IF NOT EXISTS event_type VARCHAR(20) DEFAULT 'training' 
    CHECK (event_type IN ('training', 'official_game', 'friendly'));

CREATE INDEX IF NOT EXISTS idx_events_is_recurring ON events(is_recurring) WHERE is_recurring = TRUE;
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_recurrence ON events(recurrence_pattern) WHERE is_recurring = TRUE;

COMMENT ON COLUMN events.is_recurring IS 'Indica se o evento é recorrente';
COMMENT ON COLUMN events.recurrence_pattern IS 'Padrão: {"type": "weekly", "day": "thursday", "interval": 1}';
COMMENT ON COLUMN events.event_type IS 'Tipo: training, official_game, friendly';
```

**Estrutura de `recurrence_pattern`:**
```json
{
  "type": "weekly",        // weekly, biweekly, monthly
  "day": "thursday",       // monday, tuesday, ..., sunday
  "interval": 1,           // A cada X semanas/meses
  "endDate": "2026-12-31", // Data de término (opcional)
  "count": 10              // Número de ocorrências (opcional)
}
```

**Checklist:**
- [ ] Criar arquivo SQL
- [ ] Testar diferentes padrões de recorrência
- [ ] Validar JSONB structure
- [ ] Criar função helper para gerar eventos recorrentes

---

#### 1.1.4 Migration: Jogos Oficiais e Convocações

**Arquivo:** `supabase/migrations/20260227000004_game_convocations.sql`

```sql
-- =====================================================
-- GAME CONVOCATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS game_convocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  required_positions JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id)
);

CREATE TABLE IF NOT EXISTS convocation_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  convocation_id UUID NOT NULL REFERENCES game_convocations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  response VARCHAR(20) DEFAULT 'pending' CHECK (response IN ('confirmed', 'declined', 'pending')),
  position VARCHAR(50),
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(convocation_id, user_id)
);

-- Índices e triggers...
```

**Checklist:**
- [ ] Criar arquivo SQL
- [ ] Testar relacionamento com events
- [ ] Validar estrutura de required_positions
- [ ] Criar função para calcular estatísticas de convocação

---

#### 1.1.5 Migration: Check-in QR Code

**Arquivo:** `supabase/migrations/20260227000005_checkin_qrcodes.sql`

```sql
-- =====================================================
-- CHECK-IN QR CODES
-- =====================================================

CREATE TABLE IF NOT EXISTS checkin_qrcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  qr_code_data TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkin_method VARCHAR(20) NOT NULL CHECK (checkin_method IN ('qrcode', 'manual')),
  qr_code_id UUID REFERENCES checkin_qrcodes(id),
  checked_in_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Índices...
```

**Checklist:**
- [ ] Criar arquivo SQL
- [ ] Testar expiração de QR Codes
- [ ] Validar check-in único por evento
- [ ] Criar função para gerar QR Code único

---

#### 1.1.6 Migration: Táticas Salvas

**Arquivo:** `supabase/migrations/20260227000006_saved_tactics.sql`

```sql
-- =====================================================
-- SAVED TACTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS saved_tactics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  modality_id UUID NOT NULL REFERENCES sport_modalities(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  formation VARCHAR(20),
  field_data JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices e triggers...
```

**Estrutura de `field_data`:**
```json
{
  "teamA": [
    {"playerId": "uuid", "position": {"x": 10, "y": 48}, "label": "GK"}
  ],
  "teamB": [...],
  "drawings": [
    {"type": "line", "points": [[x1, y1], [x2, y2]], "color": "#1ABC9C"}
  ]
}
```

**Checklist:**
- [ ] Criar arquivo SQL
- [ ] Validar estrutura JSONB
- [ ] Testar relacionamentos

---

#### 1.1.7 Migration: Financeiro por Treino

**Arquivo:** `supabase/migrations/20260227000007_financial_by_training.sql`

```sql
-- =====================================================
-- FINANCIAL BY TRAINING
-- =====================================================

ALTER TABLE charges
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_charges_event_id ON charges(event_id);

-- View para pagamentos por treino
CREATE OR REPLACE VIEW v_training_payments AS
SELECT
  e.id AS event_id,
  e.name AS event_name,
  e.event_date,
  sm.name AS modality_name,
  COUNT(DISTINCT ea.user_id) AS confirmed_count,
  COUNT(DISTINCT CASE WHEN ea.status = 'confirmed' THEN ea.user_id END) AS confirmed_attendance,
  c.amount_per_person,
  (COUNT(DISTINCT CASE WHEN ea.status = 'confirmed' THEN ea.user_id END) * c.amount_per_person) AS expected_amount,
  COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount ELSE 0 END), 0) AS received_amount,
  CASE
    WHEN COUNT(DISTINCT CASE WHEN ea.status = 'confirmed' THEN ea.user_id END) > 0
    THEN ROUND(
      (COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount ELSE 0 END), 0)::DECIMAL /
       (COUNT(DISTINCT CASE WHEN ea.status = 'confirmed' THEN ea.user_id END) * c.amount_per_person)) * 100,
      2
    )
    ELSE 0
  END AS payment_percentage
FROM events e
LEFT JOIN sport_modalities sm ON e.modality_id = sm.id
LEFT JOIN event_attendance ea ON e.id = ea.event_id
LEFT JOIN charges c ON e.id = c.event_id
LEFT JOIN transactions t ON c.id = t.charge_id
WHERE e.event_type = 'training'
  AND c.id IS NOT NULL
GROUP BY e.id, e.name, e.event_date, sm.name, c.amount_per_person;
```

**Checklist:**
- [ ] Criar arquivo SQL
- [ ] Testar view de pagamentos
- [ ] Validar cálculos de porcentagem

---

#### 1.1.8 Migration: Hierarquia e Créditos ⭐ **CRÍTICO**

**Arquivo:** `supabase/migrations/20260227000008_hierarchy_and_credits.sql`

```sql
-- =====================================================
-- HIERARCHY AND CREDITS SYSTEM
-- =====================================================

-- Alterações em groups
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS parent_group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS group_type VARCHAR(20) DEFAULT 'pelada' 
    CHECK (group_type IN ('athletic', 'pelada')),
  ADD COLUMN IF NOT EXISTS pix_code TEXT,
  ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_purchased INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_consumed INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_groups_parent_group_id ON groups(parent_group_id);
CREATE INDEX IF NOT EXISTS idx_groups_group_type ON groups(group_type);
CREATE INDEX IF NOT EXISTS idx_groups_credits ON groups(credits_balance) WHERE credits_balance > 0;

-- Tabela de transações de créditos
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL 
    CHECK (transaction_type IN ('purchase', 'consumption', 'refund')),
  amount INTEGER NOT NULL,
  description TEXT,
  feature_used VARCHAR(50),
  event_id UUID REFERENCES events(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_group_id ON credit_transactions(group_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

-- Tabela de pacotes de créditos
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  credits_amount INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir pacotes padrão
INSERT INTO credit_packages (name, credits_amount, price_cents) VALUES
  ('Básico', 100, 2000),
  ('Intermediário', 300, 5000),
  ('Premium', 700, 10000),
  ('Mensal', 200, 3000)
ON CONFLICT DO NOTHING;

-- Função: Consumir créditos
CREATE OR REPLACE FUNCTION consume_credits(
  p_group_id UUID,
  p_amount INTEGER,
  p_feature VARCHAR(50),
  p_event_id UUID DEFAULT NULL,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT credits_balance INTO current_balance
  FROM groups
  WHERE id = p_group_id;
  
  IF current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  UPDATE groups
  SET 
    credits_balance = credits_balance - p_amount,
    credits_consumed = credits_consumed + p_amount
  WHERE id = p_group_id;
  
  INSERT INTO credit_transactions (
    group_id, transaction_type, amount, description, feature_used, event_id, created_by
  ) VALUES (
    p_group_id, 'consumption', p_amount, 
    'Créditos consumidos para: ' || p_feature, 
    p_feature, p_event_id, p_user_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função: Adicionar créditos
CREATE OR REPLACE FUNCTION add_credits(
  p_group_id UUID,
  p_amount INTEGER,
  p_package_id UUID DEFAULT NULL,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE groups
  SET 
    credits_balance = credits_balance + p_amount,
    credits_purchased = credits_purchased + p_amount
  WHERE id = p_group_id;
  
  INSERT INTO credit_transactions (
    group_id, transaction_type, amount, description, created_by
  ) VALUES (
    p_group_id, 'purchase', p_amount,
    COALESCE((SELECT name FROM credit_packages WHERE id = p_package_id), 'Compra de créditos'),
    p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Função: Obter código Pix (prioridade: atlética > grupo)
CREATE OR REPLACE FUNCTION get_pix_code_for_group(p_group_id UUID)
RETURNS TEXT AS $$
DECLARE
  athletic_pix TEXT;
  group_pix TEXT;
BEGIN
  SELECT pix_code INTO athletic_pix
  FROM groups
  WHERE id = (SELECT parent_group_id FROM groups WHERE id = p_group_id)
    AND pix_code IS NOT NULL;
  
  SELECT pix_code INTO group_pix
  FROM groups
  WHERE id = p_group_id
    AND pix_code IS NOT NULL;
  
  RETURN COALESCE(athletic_pix, group_pix);
END;
$$ LANGUAGE plpgsql;
```

**Checklist:**
- [ ] Criar arquivo SQL
- [ ] Testar funções de créditos
- [ ] Validar hierarquia (parent_group_id)
- [ ] Testar função get_pix_code_for_group
- [ ] Validar pacotes padrão inseridos

---

### Tarefa 1.2: Atualizar Schema V2.0

#### 1.2.1 Atualizar SYSTEM_V2.md

**Arquivo:** `docs/02-architecture/SYSTEM_V2.md`

**Ações:**
- [ ] Adicionar seção "Sistema de Modalidades"
- [ ] Adicionar seção "Sistema de Créditos"
- [ ] Adicionar seção "Hierarquia de Grupos"
- [ ] Documentar novas tabelas
- [ ] Atualizar diagramas de relacionamento

**Checklist:**
- [ ] Revisar estrutura atual
- [ ] Adicionar novas tabelas
- [ ] Atualizar relacionamentos
- [ ] Validar consistência

---

#### 1.2.2 Atualizar INTEGRACAO-FEATURES-SISTEMA.md

**Arquivo:** `docs/02-architecture/INTEGRACAO-FEATURES-SISTEMA.md`

**Ações:**
- [ ] Adicionar seção sobre sistema de créditos
- [ ] Documentar integração créditos → features
- [ ] Adicionar fluxo de hierarquia
- [ ] Documentar dois nichos (atléticas vs peladas)

**Checklist:**
- [ ] Revisar documento atual
- [ ] Adicionar novas integrações
- [ ] Validar fluxos

---

### Tarefa 1.3: Setup Design System

#### 1.3.1 Componentes Base UzzAI

**Verificar se existem:**
- [ ] `src/components/ui/` - Componentes shadcn/ui
- [ ] Design tokens (cores, tipografia)
- [ ] Componentes customizados UzzAI

**Criar se não existir:**

**Arquivo:** `src/components/ui/MetricCard.tsx`
```tsx
interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  color?: 'mint' | 'blue' | 'gold' | 'success' | 'warning' | 'danger';
}

export function MetricCard({ title, value, icon, trend, color = 'mint' }: MetricCardProps) {
  // Implementação...
}
```

**Arquivo:** `src/components/ui/StatusBadge.tsx`
```tsx
type StatusBadgeVariant = 'confirmed' | 'pending' | 'cancelled' | 'active' | 'inactive';

export function StatusBadge({ status, children }: { status: StatusBadgeVariant; children: React.ReactNode }) {
  // Implementação...
}
```

**Arquivo:** `src/components/ui/ProgressBar.tsx`
```tsx
export function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color?: string }) {
  // Implementação...
}
```

**Checklist:**
- [ ] Verificar componentes existentes
- [ ] Criar componentes faltantes
- [ ] Aplicar design tokens UzzAI
- [ ] Testar responsividade

---

#### 1.3.2 Sidebar Navigation Component

**Arquivo:** `src/components/layout/Sidebar.tsx`

**Estrutura:**
```tsx
interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  groupType: 'athletic' | 'pelada';
}

export function Sidebar({ currentView, onViewChange, groupType }: SidebarProps) {
  // Navegação baseada em groupType
  // Seções: Principal, Gestão, Análise, Ferramentas
}
```

**Checklist:**
- [ ] Criar componente Sidebar
- [ ] Implementar navegação hierárquica
- [ ] Adicionar badges (novo, contador)
- [ ] Testar navegação

---

### Tarefa 1.4: Sistema de Créditos (Base)

#### 1.4.1 Backend - API de Créditos

**Arquivo:** `src/app/api/credits/route.ts`
```typescript
// GET /api/credits?group_id=xxx
export async function GET(request: Request) {
  // Retornar saldo de créditos do grupo
}

// POST /api/credits/purchase
export async function POST(request: Request) {
  // Comprar créditos (integrar com gateway de pagamento)
}
```

**Arquivo:** `src/app/api/credits/check/route.ts`
```typescript
// POST /api/credits/check
export async function POST(request: Request) {
  // Verificar se grupo tem créditos suficientes
  // Retornar { hasCredits: boolean, required: number, current: number }
}
```

**Arquivo:** `src/lib/credits.ts`
```typescript
export async function checkAndConsumeCredits({
  groupId,
  amount,
  feature,
  eventId,
  userId
}: {
  groupId: string;
  amount: number;
  feature: string;
  eventId?: string;
  userId: string;
}): Promise<boolean> {
  // Chamar função SQL consume_credits()
}
```

**Checklist:**
- [ ] Criar API routes
- [ ] Implementar funções helper
- [ ] Integrar com funções SQL
- [ ] Testar consumo de créditos
- [ ] Testar compra de créditos

---

#### 1.4.2 Frontend - Componentes de Créditos

**Arquivo:** `src/components/credits/CreditsBalance.tsx`
```tsx
export function CreditsBalance({ groupId }: { groupId: string }) {
  // Exibir saldo atual
  // Botão para comprar mais
}
```

**Arquivo:** `src/components/credits/BuyCreditsModal.tsx`
```tsx
export function BuyCreditsModal({
  groupId,
  requiredAmount,
  feature
}: {
  groupId: string;
  requiredAmount?: number;
  feature?: string;
}) {
  // Listar pacotes disponíveis
  // Processar compra
}
```

**Checklist:**
- [ ] Criar componente CreditsBalance
- [ ] Criar modal de compra
- [ ] Integrar com API
- [ ] Testar UI

---

#### 1.4.3 Integração em Features Premium

**Exemplo:** Treino Recorrente

**Arquivo:** `src/app/api/events/recurring/route.ts`
```typescript
export async function POST(request: Request) {
  const { groupId, ...eventData } = await request.json();
  
  // Verificar créditos
  const hasCredits = await checkAndConsumeCredits({
    groupId,
    amount: 5,
    feature: 'recurring_training',
    userId: session.user.id
  });
  
  if (!hasCredits) {
    return Response.json(
      { error: 'Créditos insuficientes', required: 5, current: balance },
      { status: 402 }
    );
  }
  
  // Criar treino recorrente...
}
```

**Checklist:**
- [ ] Integrar verificação em todas as features premium
- [ ] Retornar erro 402 quando sem créditos
- [ ] Mostrar modal de compra quando necessário

---

### Tarefa 1.5: Hierarquia e Permissões

#### 1.5.1 Lógica de Hierarquia

**Arquivo:** `src/lib/permissions.ts`
```typescript
export async function canManageGroup(
  userId: string,
  groupId: string
): Promise<boolean> {
  // Verificar se é admin do grupo OU admin da atlética pai
}

export async function canCreateGroup(
  userId: string,
  parentGroupId?: string
): Promise<boolean> {
  // Verificar se é admin da atlética (se parentGroupId)
  // OU pode criar grupo independente
}

export async function getGroupHierarchy(groupId: string) {
  // Retornar: { group, parentGroup, isAthletic, children }
}
```

**Checklist:**
- [ ] Criar funções de permissão
- [ ] Testar hierarquia
- [ ] Validar permissões cruzadas

---

#### 1.5.2 Middleware de Autenticação

**Arquivo:** `src/middleware.ts` (atualizar)

**Ações:**
- [ ] Adicionar verificação de hierarquia
- [ ] Adicionar verificação de group_type
- [ ] Adicionar verificação de créditos (para features premium)

**Checklist:**
- [ ] Atualizar middleware
- [ ] Testar proteção de rotas
- [ ] Validar permissões

---

#### 1.5.3 UI de Criação de Grupos

**Arquivo:** `src/app/(dashboard)/groups/new/page.tsx`

**Ações:**
- [ ] Adicionar seletor de tipo (Atlética vs Pelada)
- [ ] Adicionar seletor de grupo pai (se criando grupo filho)
- [ ] Validar permissões antes de criar

**Checklist:**
- [ ] Criar/atualizar página
- [ ] Implementar formulário
- [ ] Validar permissões

---

## ✅ CHECKLIST COMPLETO DA FASE 0

### Migrations
- [ ] `20260227000001_sport_modalities.sql` criado e testado
- [ ] `20260227000002_athlete_modalities.sql` criado e testado
- [ ] `20260227000003_recurring_trainings.sql` criado e testado
- [ ] `20260227000004_game_convocations.sql` criado e testado
- [ ] `20260227000005_checkin_qrcodes.sql` criado e testado
- [ ] `20260227000006_saved_tactics.sql` criado e testado
- [ ] `20260227000007_financial_by_training.sql` criado e testado
- [ ] `20260227000008_hierarchy_and_credits.sql` criado e testado
- [ ] Todas as migrations aplicadas em ambiente de desenvolvimento
- [ ] Validação de integridade referencial

### Documentação
- [ ] `SYSTEM_V2.md` atualizado
- [ ] `INTEGRACAO-FEATURES-SISTEMA.md` atualizado
- [ ] `MIGRATIONS_STATUS.md` atualizado
- [ ] Documentação de funções SQL criada

### Design System
- [ ] Componentes base UzzAI criados
- [ ] Sidebar navigation component criado
- [ ] MetricCard criado e testado
- [ ] StatusBadge criado e testado
- [ ] ProgressBar criado e testado

### Sistema de Créditos
- [ ] Funções SQL (consume_credits, add_credits) testadas
- [ ] API `/api/credits` criada e testada
- [ ] Componente CreditsBalance criado
- [ ] Modal de compra criado
- [ ] Integração em features premium implementada

### Hierarquia e Permissões
- [ ] Lógica de `parent_group_id` implementada
- [ ] Lógica de `group_type` implementada
- [ ] Funções de permissão criadas
- [ ] Middleware atualizado
- [ ] UI de criação de grupos atualizada

---

## 🧪 TESTES NECESSÁRIOS

### Testes de Database
- [ ] Testar criação de modalidades
- [ ] Testar relacionamento atleta-modalidade
- [ ] Testar recorrência de eventos
- [ ] Testar funções de créditos
- [ ] Testar hierarquia de grupos

### Testes de API
- [ ] Testar API de créditos
- [ ] Testar verificação de créditos
- [ ] Testar permissões hierárquicas

### Testes de UI
- [ ] Testar componentes base
- [ ] Testar Sidebar
- [ ] Testar CreditsBalance
- [ ] Testar modal de compra

---

## 📦 ENTREGÁVEIS DA FASE 0

1. ✅ **8 migrations SQL** aplicadas e testadas
2. ✅ **Documentação atualizada** (SYSTEM_V2.md, INTEGRACAO-FEATURES-SISTEMA.md)
3. ✅ **Componentes base UzzAI** criados e funcionando
4. ✅ **Sistema de créditos** funcional (backend + frontend)
5. ✅ **Hierarquia de grupos** implementada
6. ✅ **Permissões hierárquicas** funcionando

---

## 🚀 PRÓXIMOS PASSOS (Após Fase 0)

1. **Iniciar Fase 1:** Modalidades e Atletas
2. **Validar:** Sistema de créditos em produção
3. **Testar:** Hierarquia com dados reais

---

## 📝 NOTAS DE DESENVOLVIMENTO

### Decisões Técnicas
- **Créditos:** Sistema interno (não integrado com gateway ainda)
- **Hierarquia:** Máximo 2 níveis (Atlética → Grupo)
- **Permissões:** Baseadas em roles + hierarquia

### Riscos Identificados
- ⚠️ Migrations podem quebrar dados existentes (fazer backup)
- ⚠️ Sistema de créditos precisa de gateway de pagamento (fase futura)
- ⚠️ Hierarquia pode ser confusa para usuários (UI clara necessária)

### Dependências Futuras
- Gateway de pagamento para compra de créditos
- Job scheduler para eventos recorrentes
- Sistema de notificações (já planejado)

---

**Última atualização:** 2026-02-27  
**Status:** ⏸️ Planejado  
**Responsável:** Equipe ResenhApp

