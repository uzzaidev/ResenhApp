# 🧪 Guia de Teste das Migrations V2.0

> **Como testar se as migrations estão funcionando corretamente**

---

## 📋 Método 1: Teste Manual no Supabase SQL Editor (Recomendado)

### Passo 1: Acessar Supabase Dashboard

1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor**

### Passo 2: Testar Migration por Migration

Execute cada migration uma por uma e verifique se não há erros:

#### Migration 1: Sport Modalities
```sql
-- Copiar conteúdo de: supabase/migrations/20260227000001_sport_modalities.sql
-- Colar no SQL Editor
-- Clicar em "Run"
```

**Verificar:**
```sql
-- Verificar se tabela foi criada
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'sport_modalities';

-- Verificar se função foi criada
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'get_group_modalities';
```

#### Migration 2: Athlete Modalities
```sql
-- Copiar conteúdo de: supabase/migrations/20260227000002_athlete_modalities.sql
```

**Verificar:**
```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'athlete_modalities';
```

#### Migration 3: Recurring Trainings
```sql
-- Copiar conteúdo de: supabase/migrations/20260227000003_recurring_trainings.sql
```

**Verificar:**
```sql
-- Verificar se colunas foram adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
  AND column_name IN ('is_recurring', 'recurrence_pattern', 'event_type', 'modality_id');
```

#### Migration 4: Game Convocations
```sql
-- Copiar conteúdo de: supabase/migrations/20260227000004_game_convocations.sql
```

**Verificar:**
```sql
SELECT table_name FROM information_schema.tables WHERE table_name IN ('game_convocations', 'convocation_responses');
```

#### Migration 5: Check-in QR Codes
```sql
-- Copiar conteúdo de: supabase/migrations/20260227000005_checkin_qrcodes.sql
```

**Verificar:**
```sql
SELECT table_name FROM information_schema.tables WHERE table_name IN ('checkin_qrcodes', 'checkins');
```

#### Migration 6: Saved Tactics
```sql
-- Copiar conteúdo de: supabase/migrations/20260227000006_saved_tactics.sql
```

**Verificar:**
```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'saved_tactics';
```

#### Migration 7: Financial by Training
```sql
-- Copiar conteúdo de: supabase/migrations/20260227000007_financial_by_training.sql
```

**Verificar:**
```sql
-- Verificar se coluna foi adicionada
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'charges' AND column_name = 'event_id';

-- Verificar se views foram criadas
SELECT table_name FROM information_schema.views 
WHERE table_name IN ('v_training_payments', 'v_training_payment_details');
```

#### Migration 8: Hierarchy and Credits
```sql
-- Copiar conteúdo de: supabase/migrations/20260227000008_hierarchy_and_credits.sql
```

**Verificar:**
```sql
-- Verificar se colunas foram adicionadas em groups
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'groups' 
  AND column_name IN ('parent_group_id', 'group_type', 'pix_code', 'credits_balance');

-- Verificar se tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('credit_transactions', 'credit_packages');
```

---

## 📋 Método 2: Validação Completa (Após Aplicar Todas)

Execute este script para verificar se tudo foi aplicado corretamente:

```sql
-- =====================================================
-- VALIDAÇÃO COMPLETA DAS MIGRATIONS V2.0
-- =====================================================

DO $$
DECLARE
  missing_tables TEXT[] := ARRAY[]::TEXT[];
  missing_columns TEXT[] := ARRAY[]::TEXT[];
  missing_functions TEXT[] := ARRAY[]::TEXT[];
  missing_views TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Verificar tabelas novas
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sport_modalities') THEN
    missing_tables := array_append(missing_tables, 'sport_modalities');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'athlete_modalities') THEN
    missing_tables := array_append(missing_tables, 'athlete_modalities');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_convocations') THEN
    missing_tables := array_append(missing_tables, 'game_convocations');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'convocation_responses') THEN
    missing_tables := array_append(missing_tables, 'convocation_responses');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'checkin_qrcodes') THEN
    missing_tables := array_append(missing_tables, 'checkin_qrcodes');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'checkins') THEN
    missing_tables := array_append(missing_tables, 'checkins');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_tactics') THEN
    missing_tables := array_append(missing_tables, 'saved_tactics');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_transactions') THEN
    missing_tables := array_append(missing_tables, 'credit_transactions');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credit_packages') THEN
    missing_tables := array_append(missing_tables, 'credit_packages');
  END IF;
  
  -- Verificar colunas em groups
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'groups' AND column_name = 'parent_group_id') THEN
    missing_columns := array_append(missing_columns, 'groups.parent_group_id');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'groups' AND column_name = 'group_type') THEN
    missing_columns := array_append(missing_columns, 'groups.group_type');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'groups' AND column_name = 'credits_balance') THEN
    missing_columns := array_append(missing_columns, 'groups.credits_balance');
  END IF;
  
  -- Verificar colunas em events
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'events' AND column_name = 'is_recurring') THEN
    missing_columns := array_append(missing_columns, 'events.is_recurring');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'events' AND column_name = 'event_type') THEN
    missing_columns := array_append(missing_columns, 'events.event_type');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'events' AND column_name = 'modality_id') THEN
    missing_columns := array_append(missing_columns, 'events.modality_id');
  END IF;
  
  -- Verificar coluna em charges
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'charges' AND column_name = 'event_id') THEN
    missing_columns := array_append(missing_columns, 'charges.event_id');
  END IF;
  
  -- Verificar views
  IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'v_training_payments') THEN
    missing_views := array_append(missing_views, 'v_training_payments');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'v_training_payment_details') THEN
    missing_views := array_append(missing_views, 'v_training_payment_details');
  END IF;
  
  -- Verificar funções críticas
  IF NOT EXISTS (SELECT 1 FROM information_schema.routines 
                 WHERE routine_name = 'consume_credits') THEN
    missing_functions := array_append(missing_functions, 'consume_credits');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.routines 
                 WHERE routine_name = 'add_credits') THEN
    missing_functions := array_append(missing_functions, 'add_credits');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.routines 
                 WHERE routine_name = 'get_pix_code_for_group') THEN
    missing_functions := array_append(missing_functions, 'get_pix_code_for_group');
  END IF;
  
  -- Exibir resultados
  RAISE NOTICE '';
  RAISE NOTICE '=' || repeat('=', 60);
  RAISE NOTICE '📊 RESULTADO DA VALIDAÇÃO';
  RAISE NOTICE '=' || repeat('=', 60);
  
  IF array_length(missing_tables, 1) IS NULL AND 
     array_length(missing_columns, 1) IS NULL AND
     array_length(missing_functions, 1) IS NULL AND
     array_length(missing_views, 1) IS NULL THEN
    RAISE NOTICE '✅ TODAS AS VALIDAÇÕES PASSARAM!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Todas as 9 tabelas foram criadas';
    RAISE NOTICE '✅ Todas as colunas foram adicionadas';
    RAISE NOTICE '✅ Todas as views foram criadas';
    RAISE NOTICE '✅ Todas as funções foram criadas';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Migrations V2.0 aplicadas com sucesso!';
  ELSE
    RAISE NOTICE '❌ PROBLEMAS ENCONTRADOS:';
    RAISE NOTICE '';
    
    IF array_length(missing_tables, 1) > 0 THEN
      RAISE NOTICE 'Tabelas faltando: %', array_to_string(missing_tables, ', ');
    END IF;
    
    IF array_length(missing_columns, 1) > 0 THEN
      RAISE NOTICE 'Colunas faltando: %', array_to_string(missing_columns, ', ');
    END IF;
    
    IF array_length(missing_functions, 1) > 0 THEN
      RAISE NOTICE 'Funções faltando: %', array_to_string(missing_functions, ', ');
    END IF;
    
    IF array_length(missing_views, 1) > 0 THEN
      RAISE NOTICE 'Views faltando: %', array_to_string(missing_views, ', ');
    END IF;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '=' || repeat('=', 60);
END $$;
```

---

## 📋 Método 3: Teste de Sintaxe (Sem Aplicar)

Execute este script para verificar apenas a sintaxe SQL:

```sql
-- Copiar e colar o conteúdo de cada migration aqui
-- Se não houver erros de sintaxe, está OK
```

---

## ✅ Checklist de Validação

Após aplicar todas as migrations, verifique:

- [ ] **9 novas tabelas criadas:**
  - [ ] `sport_modalities`
  - [ ] `athlete_modalities`
  - [ ] `game_convocations`
  - [ ] `convocation_responses`
  - [ ] `checkin_qrcodes`
  - [ ] `checkins`
  - [ ] `saved_tactics`
  - [ ] `credit_transactions`
  - [ ] `credit_packages`

- [ ] **Colunas adicionadas em `groups`:**
  - [ ] `parent_group_id`
  - [ ] `group_type`
  - [ ] `pix_code`
  - [ ] `credits_balance`
  - [ ] `credits_purchased`
  - [ ] `credits_consumed`

- [ ] **Colunas adicionadas em `events`:**
  - [ ] `is_recurring`
  - [ ] `recurrence_pattern`
  - [ ] `event_type`
  - [ ] `parent_event_id`
  - [ ] `modality_id`

- [ ] **Coluna adicionada em `charges`:**
  - [ ] `event_id`

- [ ] **2 views criadas:**
  - [ ] `v_training_payments`
  - [ ] `v_training_payment_details`

- [ ] **Funções críticas criadas:**
  - [ ] `consume_credits()`
  - [ ] `add_credits()`
  - [ ] `get_pix_code_for_group()`
  - [ ] `can_manage_group()`

---

## 🐛 Problemas Comuns

### Erro: "relation does not exist"
- **Causa:** Migration anterior não foi aplicada
- **Solução:** Aplicar migrations em ordem (1 → 8)

### Erro: "column already exists"
- **Causa:** Migration já foi aplicada parcialmente
- **Solução:** Usar `ADD COLUMN IF NOT EXISTS` (já implementado)

### Erro: "type mismatch"
- **Causa:** Tipo de dados incorreto
- **Solução:** Verificar se está usando `BIGINT` para `groups.id` e `events.id`, `UUID` para `profiles.id`

---

**Última atualização:** 2026-02-27






