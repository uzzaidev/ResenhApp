# 🗄️ Migrations Necessárias - Sistema Atléticas V2.0

> **SQL migrations para novas funcionalidades**  
> **Baseado em:** Análise do sistema de referência HTML

---

## 📋 ÍNDICE

1. [Modalidades](#1-modalidades)
2. [Atletas por Modalidade](#2-atletas-por-modalidade)
3. [Treinos Recorrentes](#3-treinos-recorrentes)
4. [Jogos Oficiais e Convocações](#4-jogos-oficiais-e-convocações)
5. [Check-in QR Code](#5-check-in-qr-code)
6. [Táticas Salvas](#6-táticas-salvadas)
7. [Financeiro por Treino](#7-financeiro-por-treino)

---

## 1. MODALIDADES

### 1.1 Tabela `sport_modalities`

```sql
-- Migration: 20260227000001_sport_modalities.sql

CREATE TABLE IF NOT EXISTS sport_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- 'Futsal', 'Vôlei', 'Basquete', etc.
  icon VARCHAR(50), -- Nome do ícone (Font Awesome)
  color VARCHAR(7), -- Cor hex (#1ABC9C)
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  positions JSONB DEFAULT '[]'::jsonb, -- Array de posições: [{"name": "Goleiro", "icon": "fa-futbol"}]
  trainings_per_week INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, name)
);

-- Índices
CREATE INDEX idx_sport_modalities_group_id ON sport_modalities(group_id);
CREATE INDEX idx_sport_modalities_name ON sport_modalities(name);

-- Trigger para updated_at
CREATE TRIGGER update_sport_modalities_updated_at
  BEFORE UPDATE ON sport_modalities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 1.2 Comentários

```sql
COMMENT ON TABLE sport_modalities IS 'Modalidades esportivas por grupo (Futsal, Vôlei, etc.)';
COMMENT ON COLUMN sport_modalities.positions IS 'Array de posições específicas da modalidade';
COMMENT ON COLUMN sport_modalities.trainings_per_week IS 'Quantidade de treinos por semana padrão';
```

---

## 2. ATLETAS POR MODALIDADE

### 2.1 Tabela `athlete_modalities`

```sql
-- Migration: 20260227000002_athlete_modalities.sql

CREATE TABLE IF NOT EXISTS athlete_modalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  modality_id UUID NOT NULL REFERENCES sport_modalities(id) ON DELETE CASCADE,
  preferred_position VARCHAR(50), -- Posição preferida do atleta
  secondary_position VARCHAR(50), -- Posição secundária
  base_rating INTEGER DEFAULT 5 CHECK (base_rating >= 1 AND base_rating <= 10),
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, modality_id)
);

-- Índices
CREATE INDEX idx_athlete_modalities_user_id ON athlete_modalities(user_id);
CREATE INDEX idx_athlete_modalities_modality_id ON athlete_modalities(modality_id);
CREATE INDEX idx_athlete_modalities_active ON athlete_modalities(is_active) WHERE is_active = TRUE;

-- Trigger para updated_at
CREATE TRIGGER update_athlete_modalities_updated_at
  BEFORE UPDATE ON athlete_modalities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 Comentários

```sql
COMMENT ON TABLE athlete_modalities IS 'Relação Many-to-Many entre atletas e modalidades';
COMMENT ON COLUMN athlete_modalities.base_rating IS 'Rating base do atleta na modalidade (1-10)';
```

---

## 3. TREINOS RECORRENTES

### 3.1 Alterações em `events`

```sql
-- Migration: 20260227000003_recurring_trainings.sql

-- Adicionar colunas para treinos recorrentes
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB,
  ADD COLUMN IF NOT EXISTS event_type VARCHAR(20) DEFAULT 'training' CHECK (event_type IN ('training', 'official_game', 'friendly'));

-- Índices
CREATE INDEX IF NOT EXISTS idx_events_is_recurring ON events(is_recurring) WHERE is_recurring = TRUE;
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_recurrence ON events(recurrence_pattern) WHERE is_recurring = TRUE;
```

### 3.2 Comentários

```sql
COMMENT ON COLUMN events.is_recurring IS 'Indica se o evento é recorrente';
COMMENT ON COLUMN events.recurrence_pattern IS 'Padrão de recorrência: {"type": "weekly", "day": "thursday", "interval": 1}';
COMMENT ON COLUMN events.event_type IS 'Tipo de evento: training, official_game, friendly';
```

### 3.3 Exemplo de `recurrence_pattern`:

```json
{
  "type": "weekly",        // weekly, biweekly, monthly
  "day": "thursday",       // monday, tuesday, ..., sunday
  "interval": 1,           // A cada X semanas/meses
  "endDate": "2026-12-31", // Data de término (opcional)
  "count": 10              // Número de ocorrências (opcional)
}
```

---

## 4. JOGOS OFICIAIS E CONVOCAÇÕES

### 4.1 Tabela `game_convocations`

```sql
-- Migration: 20260227000004_game_convocations.sql

CREATE TABLE IF NOT EXISTS game_convocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  required_positions JSONB NOT NULL DEFAULT '{}'::jsonb, -- {"goalkeeper": 2, "fixed": 3, "wing": 5, "pivot": 8}
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id)
);

-- Índices
CREATE INDEX idx_game_convocations_event_id ON game_convocations(event_id);
CREATE INDEX idx_game_convocations_status ON game_convocations(status);
CREATE INDEX idx_game_convocations_created_by ON game_convocations(created_by);

-- Trigger para updated_at
CREATE TRIGGER update_game_convocations_updated_at
  BEFORE UPDATE ON game_convocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 Tabela `convocation_responses`

```sql
CREATE TABLE IF NOT EXISTS convocation_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  convocation_id UUID NOT NULL REFERENCES game_convocations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  response VARCHAR(20) DEFAULT 'pending' CHECK (response IN ('confirmed', 'declined', 'pending')),
  position VARCHAR(50), -- Posição na qual foi convocado
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(convocation_id, user_id)
);

-- Índices
CREATE INDEX idx_convocation_responses_convocation_id ON convocation_responses(convocation_id);
CREATE INDEX idx_convocation_responses_user_id ON convocation_responses(user_id);
CREATE INDEX idx_convocation_responses_response ON convocation_responses(response);

-- Trigger para updated_at
CREATE TRIGGER update_convocation_responses_updated_at
  BEFORE UPDATE ON convocation_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para responded_at
CREATE OR REPLACE FUNCTION set_responded_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.response != 'pending' AND OLD.response = 'pending' THEN
    NEW.responded_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_convocation_responded_at
  BEFORE UPDATE ON convocation_responses
  FOR EACH ROW
  EXECUTE FUNCTION set_responded_at();
```

### 4.3 Comentários

```sql
COMMENT ON TABLE game_convocations IS 'Convocações para jogos oficiais';
COMMENT ON COLUMN game_convocations.required_positions IS 'Posições requeridas: {"goalkeeper": 2, "fixed": 3, ...}';
COMMENT ON TABLE convocation_responses IS 'Respostas dos atletas às convocações';
```

---

## 5. CHECK-IN QR CODE

### 5.1 Tabela `checkin_qrcodes`

```sql
-- Migration: 20260227000005_checkin_qrcodes.sql

CREATE TABLE IF NOT EXISTS checkin_qrcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  qr_code_data TEXT NOT NULL, -- Dados do QR Code (UUID ou token)
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_checkin_qrcodes_event_id ON checkin_qrcodes(event_id);
CREATE INDEX idx_checkin_qrcodes_active ON checkin_qrcodes(is_active, expires_at) WHERE is_active = TRUE;
CREATE INDEX idx_checkin_qrcodes_data ON checkin_qrcodes(qr_code_data);
```

### 5.2 Tabela `checkins`

```sql
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkin_method VARCHAR(20) NOT NULL CHECK (checkin_method IN ('qrcode', 'manual')),
  qr_code_id UUID REFERENCES checkin_qrcodes(id), -- Se foi via QR Code
  checked_in_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id) -- Um check-in por atleta por evento
);

-- Índices
CREATE INDEX idx_checkins_event_id ON checkins(event_id);
CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_checked_in_at ON checkins(checked_in_at);
CREATE INDEX idx_checkins_method ON checkins(checkin_method);
```

### 5.3 Comentários

```sql
COMMENT ON TABLE checkin_qrcodes IS 'QR Codes gerados para check-in de eventos';
COMMENT ON COLUMN checkin_qrcodes.qr_code_data IS 'Dados únicos do QR Code (geralmente UUID)';
COMMENT ON TABLE checkins IS 'Registros de check-in de atletas em eventos';
```

---

## 6. TÁTICAS SALVADAS

### 6.1 Tabela `saved_tactics`

```sql
-- Migration: 20260227000006_saved_tactics.sql

CREATE TABLE IF NOT EXISTS saved_tactics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  modality_id UUID NOT NULL REFERENCES sport_modalities(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  formation VARCHAR(20), -- '2-2', '1-2-1', '3-1', etc.
  field_data JSONB NOT NULL, -- Dados do campo: posições, desenhos, etc.
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_saved_tactics_group_id ON saved_tactics(group_id);
CREATE INDEX idx_saved_tactics_modality_id ON saved_tactics(modality_id);
CREATE INDEX idx_saved_tactics_created_by ON saved_tactics(created_by);

-- Trigger para updated_at
CREATE TRIGGER update_saved_tactics_updated_at
  BEFORE UPDATE ON saved_tactics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 6.2 Estrutura de `field_data`:

```json
{
  "teamA": [
    {
      "playerId": "uuid",
      "position": {"x": 10, "y": 48},
      "label": "GK"
    }
  ],
  "teamB": [...],
  "drawings": [
    {
      "type": "line",
      "points": [[x1, y1], [x2, y2]],
      "color": "#1ABC9C"
    }
  ]
}
```

### 6.3 Comentários

```sql
COMMENT ON TABLE saved_tactics IS 'Táticas salvas para uso em jogos e treinos';
COMMENT ON COLUMN saved_tactics.field_data IS 'Dados completos do campo: posições dos jogadores, desenhos, etc.';
```

---

## 7. FINANCEIRO POR TREINO

### 7.1 Alterações em `charges`

```sql
-- Migration: 20260227000007_financial_by_training.sql

-- Adicionar relação com eventos
ALTER TABLE charges
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE SET NULL;

-- Índice
CREATE INDEX IF NOT EXISTS idx_charges_event_id ON charges(event_id);
```

### 7.2 View para Pagamentos por Treino

```sql
-- View: Pagamentos por Treino
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

COMMENT ON VIEW v_training_payments IS 'View agregada de pagamentos por treino';
```

### 7.3 Comentários

```sql
COMMENT ON COLUMN charges.event_id IS 'Evento associado à cobrança (para pagamentos por treino)';
```

---

## 8. FUNÇÕES AUXILIARES

### 8.1 Função `update_updated_at_column()`

```sql
-- Função genérica para updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 8. SISTEMA DE CRÉDITOS E HIERARQUIA

### 8.1 Alterações em `groups` (Hierarquia e Créditos)

```sql
-- Migration: 20260227000008_hierarchy_and_credits.sql

-- Adicionar hierarquia, tipo de grupo, Pix e créditos
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS parent_group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS group_type VARCHAR(20) DEFAULT 'pelada' CHECK (group_type IN ('athletic', 'pelada')),
  ADD COLUMN IF NOT EXISTS pix_code TEXT, -- Código Pix próprio
  ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_purchased INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS credits_consumed INTEGER DEFAULT 0;

-- Índices
CREATE INDEX IF NOT EXISTS idx_groups_parent_group_id ON groups(parent_group_id);
CREATE INDEX IF NOT EXISTS idx_groups_group_type ON groups(group_type);
CREATE INDEX IF NOT EXISTS idx_groups_credits ON groups(credits_balance) WHERE credits_balance > 0;
```

### 8.2 Tabela `credit_transactions`

```sql
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'consumption', 'refund')),
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
```

### 8.3 Tabela `credit_packages`

```sql
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  credits_amount INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pacotes padrão
INSERT INTO credit_packages (name, credits_amount, price_cents) VALUES
  ('Básico', 100, 2000),
  ('Intermediário', 300, 5000),
  ('Premium', 700, 10000),
  ('Mensal', 200, 3000);
```

### 8.4 Funções de Créditos

```sql
-- Consumir créditos
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
  SELECT credits_balance INTO current_balance FROM groups WHERE id = p_group_id;
  
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
    p_group_id, 'consumption', p_amount, 'Créditos consumidos para: ' || p_feature, p_feature, p_event_id, p_user_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Adicionar créditos
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

-- Obter código Pix para grupo (prioridade: atlética > grupo)
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

---

## 9. ORDEM DE APLICAÇÃO

Aplicar as migrations na seguinte ordem:

1. ✅ `20260227000001_sport_modalities.sql`
2. ✅ `20260227000002_athlete_modalities.sql`
3. ✅ `20260227000003_recurring_trainings.sql`
4. ✅ `20260227000004_game_convocations.sql`
5. ✅ `20260227000005_checkin_qrcodes.sql`
6. ✅ `20260227000006_saved_tactics.sql`
7. ✅ `20260227000007_financial_by_training.sql`
8. ✅ `20260227000008_hierarchy_and_credits.sql` ⭐ **NOVO**

---

## 10. ROLLBACK (Se Necessário)

```sql
-- Ordem reversa para rollback
DROP VIEW IF EXISTS v_training_payments;
ALTER TABLE charges DROP COLUMN IF EXISTS event_id;
DROP TABLE IF EXISTS saved_tactics;
DROP TABLE IF EXISTS checkins;
DROP TABLE IF EXISTS checkin_qrcodes;
DROP TABLE IF EXISTS convocation_responses;
DROP TABLE IF EXISTS game_convocations;
ALTER TABLE events DROP COLUMN IF EXISTS is_recurring;
ALTER TABLE events DROP COLUMN IF EXISTS recurrence_pattern;
ALTER TABLE events DROP COLUMN IF EXISTS event_type;
DROP TABLE IF EXISTS athlete_modalities;
DROP TABLE IF EXISTS sport_modalities;
```

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Migrations Prontas para Aplicação

