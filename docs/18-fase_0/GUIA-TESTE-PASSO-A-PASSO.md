# 🧪 Guia de Teste Passo a Passo - Migrations V2.0

> **Como testar cada migration individualmente no Supabase**

---

## 📋 PRÉ-REQUISITOS

- [x] Acesso ao Supabase Dashboard
- [x] Projeto de desenvolvimento configurado
- [x] Backup do banco de dados feito
- [x] Todas as migrations corrigidas e validadas

---

## 🎯 PASSO 1: Fazer Backup

### 1.1 Via Supabase Dashboard

1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Database** → **Backups**
4. Clique em **Create Backup** ou use o backup automático

### 1.2 Via SQL (Backup Manual)

```sql
-- Executar no SQL Editor
-- Isso cria um backup das tabelas críticas

-- Exportar estrutura (opcional)
pg_dump --schema-only -h [HOST] -U postgres -d postgres > backup_structure.sql
```

**✅ Checklist:**
- [ ] Backup criado com sucesso
- [ ] Data/hora do backup anotada

---

## 🎯 PASSO 2: Testar Migration 1 - Sport Modalities

### 2.1 Aplicar Migration

1. Abrir `supabase/migrations/20260227000001_sport_modalities.sql`
2. Copiar todo o conteúdo
3. Colar no Supabase SQL Editor
4. Clicar em **Run**

### 2.2 Verificar Aplicação

Execute no SQL Editor:

```sql
-- Verificar se tabela foi criada
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'sport_modalities') as column_count
FROM information_schema.tables 
WHERE table_name = 'sport_modalities';

-- Verificar se função foi criada
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name = 'get_group_modalities';

-- Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'sport_modalities';
```

**✅ Resultado Esperado:**
- Tabela `sport_modalities` existe
- Função `get_group_modalities` existe
- 3 índices criados

**✅ Checklist:**
- [ ] Migration aplicada sem erros
- [ ] Tabela criada
- [ ] Função criada
- [ ] Índices criados

---

## 🎯 PASSO 3: Testar Migration 2 - Athlete Modalities

### 3.1 Aplicar Migration

1. Abrir `supabase/migrations/20260227000002_athlete_modalities.sql`
2. Copiar e colar no SQL Editor
3. Executar

### 3.2 Verificar Aplicação

```sql
-- Verificar tabela
SELECT table_name FROM information_schema.tables WHERE table_name = 'athlete_modalities';

-- Verificar foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'athlete_modalities';

-- Testar inserção (opcional)
INSERT INTO athlete_modalities (user_id, modality_id, base_rating)
SELECT 
  (SELECT id FROM profiles LIMIT 1),
  (SELECT id FROM sport_modalities LIMIT 1),
  5
WHERE EXISTS (SELECT 1 FROM profiles)
  AND EXISTS (SELECT 1 FROM sport_modalities);
```

**✅ Checklist:**
- [ ] Migration aplicada sem erros
- [ ] Tabela criada
- [ ] Foreign keys corretas (profiles, sport_modalities)
- [ ] Funções criadas

---

## 🎯 PASSO 4: Testar Migration 3 - Recurring Trainings

### 4.1 Aplicar Migration

1. Abrir `supabase/migrations/20260227000003_recurring_trainings.sql`
2. Copiar e colar no SQL Editor
3. Executar

### 4.2 Verificar Aplicação

```sql
-- Verificar colunas adicionadas em events
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
  AND column_name IN ('is_recurring', 'recurrence_pattern', 'event_type', 'parent_event_id', 'modality_id')
ORDER BY column_name;

-- Verificar índices
SELECT indexname FROM pg_indexes 
WHERE tablename = 'events' 
  AND indexname LIKE 'idx_events_%recur%' OR indexname LIKE 'idx_events_%event_type%';

-- Verificar funções
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('generate_recurring_events', 'get_next_recurrence_date');
```

**✅ Checklist:**
- [ ] 5 colunas adicionadas em `events`
- [ ] Índices criados
- [ ] 2 funções criadas

---

## 🎯 PASSO 5: Testar Migration 4 - Game Convocations

### 5.1 Aplicar Migration

1. Abrir `supabase/migrations/20260227000004_game_convocations.sql`
2. Copiar e colar no SQL Editor
3. Executar

### 5.2 Verificar Aplicação

```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('game_convocations', 'convocation_responses');

-- Verificar funções
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('get_convocation_stats', 'is_convocation_complete');
```

**✅ Checklist:**
- [ ] 2 tabelas criadas
- [ ] 2 funções criadas
- [ ] Triggers criados

---

## 🎯 PASSO 6: Testar Migration 5 - Check-in QR Codes

### 6.1 Aplicar Migration

1. Abrir `supabase/migrations/20260227000005_checkin_qrcodes.sql`
2. Copiar e colar no SQL Editor
3. Executar

### 6.2 Verificar Aplicação

```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('checkin_qrcodes', 'checkins');

-- Verificar funções
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('process_qrcode_checkin', 'create_event_qrcode', 'get_event_checkins');
```

**✅ Checklist:**
- [ ] 2 tabelas criadas
- [ ] 3 funções criadas

---

## 🎯 PASSO 7: Testar Migration 6 - Saved Tactics

### 7.1 Aplicar Migration

1. Abrir `supabase/migrations/20260227000006_saved_tactics.sql`
2. Copiar e colar no SQL Editor
3. Executar

### 7.2 Verificar Aplicação

```sql
-- Verificar tabela
SELECT table_name FROM information_schema.tables WHERE table_name = 'saved_tactics';

-- Verificar funções
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('get_group_tactics', 'get_public_tactics');
```

**✅ Checklist:**
- [ ] Tabela criada
- [ ] 2 funções criadas

---

## 🎯 PASSO 8: Testar Migration 7 - Financial by Training

### 8.1 Aplicar Migration

1. Abrir `supabase/migrations/20260227000007_financial_by_training.sql`
2. Copiar e colar no SQL Editor
3. Executar

### 8.2 Verificar Aplicação

```sql
-- Verificar coluna em charges
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'charges' AND column_name = 'event_id';

-- Verificar views
SELECT table_name FROM information_schema.views 
WHERE table_name IN ('v_training_payments', 'v_training_payment_details');

-- Verificar funções
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('get_training_payment_summary', 'get_training_pending_payments', 'create_training_charge');

-- Testar view (se houver dados)
SELECT * FROM v_training_payments LIMIT 5;
```

**✅ Checklist:**
- [ ] Coluna `event_id` adicionada em `charges`
- [ ] 2 views criadas
- [ ] 3 funções criadas
- [ ] Views executam sem erros

---

## 🎯 PASSO 9: Testar Migration 8 - Hierarchy and Credits ⭐ CRÍTICO

### 9.1 Aplicar Migration

1. Abrir `supabase/migrations/20260227000008_hierarchy_and_credits.sql`
2. Copiar e colar no SQL Editor
3. Executar

### 9.2 Verificar Aplicação

```sql
-- Verificar colunas em groups
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'groups' 
  AND column_name IN ('parent_group_id', 'group_type', 'pix_code', 'credits_balance', 'credits_purchased', 'credits_consumed')
ORDER BY column_name;

-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('credit_transactions', 'credit_packages');

-- Verificar funções críticas
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('consume_credits', 'add_credits', 'get_pix_code_for_group', 'can_manage_group');

-- Verificar pacotes padrão
SELECT name, credits_amount, price_cents FROM credit_packages;
```

**✅ Checklist:**
- [ ] 6 colunas adicionadas em `groups`
- [ ] 2 tabelas criadas
- [ ] 4 funções criadas
- [ ] 4 pacotes padrão inseridos

---

## 🎯 PASSO 10: Validação Final Completa

### 10.1 Executar Script de Validação

Execute o script completo de validação (ver `docs/18-fase_0/TESTE-MIGRATIONS.md`):

```sql
-- Copiar e executar o script de validação completa
-- Verifica todas as tabelas, colunas, funções e views
```

### 10.2 Testar Funcionalidades Críticas

```sql
-- Teste 1: Sistema de Créditos
-- Adicionar créditos a um grupo
SELECT add_credits(
  (SELECT id FROM groups LIMIT 1)::BIGINT,
  100,
  NULL,
  (SELECT id FROM profiles LIMIT 1)
);

-- Verificar saldo
SELECT id, name, credits_balance FROM groups WHERE credits_balance > 0;

-- Teste 2: Hierarquia
-- Verificar se parent_group_id funciona
SELECT id, name, parent_group_id, group_type FROM groups LIMIT 5;

-- Teste 3: Views de Pagamentos
SELECT * FROM v_training_payments LIMIT 3;
```

**✅ Checklist:**
- [ ] Script de validação passou
- [ ] Sistema de créditos funciona
- [ ] Hierarquia funciona
- [ ] Views funcionam

---

## 📊 RESUMO DO TESTE

Após completar todos os passos, você deve ter:

- ✅ **9 novas tabelas** criadas
- ✅ **6 colunas** adicionadas em `groups`
- ✅ **5 colunas** adicionadas em `events`
- ✅ **1 coluna** adicionada em `charges`
- ✅ **2 views** criadas
- ✅ **14+ funções** criadas
- ✅ **Nenhum erro** durante a aplicação

---

## 🐛 Se Encontrar Erros

### Erro: "relation does not exist"
- **Causa:** Migration anterior não aplicada
- **Solução:** Aplicar migrations em ordem (1 → 8)

### Erro: "column already exists"
- **Causa:** Migration já aplicada parcialmente
- **Solução:** Usar `IF NOT EXISTS` (já implementado nas migrations)

### Erro: "type mismatch"
- **Causa:** Tipo de dados incorreto
- **Solução:** Verificar se está usando tipos corretos (BIGINT para groups/events, UUID para profiles)

---

**Próximo passo após validação:** Documentar no `MIGRATIONS_STATUS.md`

