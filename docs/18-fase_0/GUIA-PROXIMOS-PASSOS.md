# 📋 Guia: Próximos Passos - Fase 0

> **Como executar os próximos passos da Fase 0**  
> **Data:** 2026-02-27  
> **Status:** ⏸️ Aguardando execução

---

## 📊 RESUMO DOS PRÓXIMOS PASSOS

1. ✅ **Testar migrations localmente** - Validar SQL antes de aplicar
2. ✅ **Aplicar em ambiente de desenvolvimento** - Aplicar migrations no Supabase
3. ✅ **Validar integridade referencial** - Verificar foreign keys e constraints
4. ✅ **Documentar no MIGRATIONS_STATUS.md** - Atualizar documentação

---

## 1. TESTAR MIGRATIONS LOCALMENTE

### 1.1 Objetivo

Validar que todas as migrations SQL estão sintaticamente corretas e não têm erros antes de aplicar no banco de dados.

### 1.2 Métodos de Teste

#### Método 1: Supabase CLI (Recomendado)

**Pré-requisitos:**
```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Ou via Homebrew (macOS)
brew install supabase/tap/supabase
```

**Passos:**

1. **Inicializar Supabase localmente (se ainda não fez):**
```bash
cd supabase
supabase init
```

2. **Iniciar Supabase local:**
```bash
supabase start
```

Isso vai:
- Criar um container Docker com PostgreSQL
- Criar um banco de dados local
- Expor na porta 54322

3. **Aplicar migrations uma por uma para testar:**
```bash
# Testar Migration 1
supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres
psql postgresql://postgres:postgres@localhost:54322/postgres < migrations/20260227000001_sport_modalities.sql

# Testar Migration 2
psql postgresql://postgres:postgres@localhost:54322/postgres < migrations/20260227000002_athlete_modalities.sql

# ... e assim por diante
```

4. **Ou aplicar todas de uma vez:**
```bash
# Aplicar todas as migrations em ordem
for file in migrations/20260227*.sql; do
  echo "Aplicando $file..."
  psql postgresql://postgres:postgres@localhost:54322/postgres < "$file"
done
```

5. **Verificar se aplicou corretamente:**
```bash
# Conectar ao banco local
psql postgresql://postgres:postgres@localhost:54322/postgres

# Verificar tabelas criadas
\dt

# Verificar se as novas tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'sport_modalities',
    'athlete_modalities',
    'credit_transactions',
    'credit_packages',
    'game_convocations',
    'convocation_responses',
    'checkin_qrcodes',
    'checkins',
    'saved_tactics'
  );
```

**Resultado esperado:** Todas as 9 novas tabelas devem aparecer.

---

#### Método 2: Validação SQL Sintática

**Usar um validador SQL online ou local:**

1. **PostgreSQL Syntax Checker:**
```bash
# Usar psql com --dry-run (se disponível)
psql --dry-run -f migrations/20260227000001_sport_modalities.sql
```

2. **Ou usar um validador online:**
- https://www.pgformatter.org/
- https://sqlformat.org/

3. **Verificar manualmente:**
- Abrir cada arquivo SQL
- Verificar se não há erros de sintaxe
- Verificar se todas as referências estão corretas

---

#### Método 3: Script de Validação Customizado

**Criar script Node.js para validar:**

```javascript
// scripts/validate-migrations.js
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const migrations = [
  '20260227000001_sport_modalities.sql',
  '20260227000002_athlete_modalities.sql',
  '20260227000003_recurring_trainings.sql',
  '20260227000004_game_convocations.sql',
  '20260227000005_checkin_qrcodes.sql',
  '20260227000006_saved_tactics.sql',
  '20260227000007_financial_by_training.sql',
  '20260227000008_hierarchy_and_credits.sql'
];

async function validateMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres'
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');

    for (const migration of migrations) {
      const filePath = path.join(__dirname, '..', 'supabase', 'migrations', migration);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`📄 Validando: ${migration}...`);
      
      try {
        // Tentar fazer parse (não executar)
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('ROLLBACK');
        console.log(`   ✅ ${migration} - OK\n`);
      } catch (error) {
        console.error(`   ❌ ${migration} - ERRO: ${error.message}\n`);
        throw error;
      }
    }

    console.log('✅ Todas as migrations são válidas!');
  } catch (error) {
    console.error('❌ Erro na validação:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

validateMigrations();
```

**Executar:**
```bash
node scripts/validate-migrations.js
```

---

### 1.3 Checklist de Validação

- [ ] Todas as migrations abrem sem erros de sintaxe
- [ ] Não há referências a tabelas que não existem
- [ ] Todas as foreign keys referenciam tabelas existentes
- [ ] Não há conflitos de nomes (tabelas, índices, funções)
- [ ] Todas as migrations podem ser aplicadas em ordem
- [ ] Rollback funciona (se necessário)

---

## 2. APLICAR EM AMBIENTE DE DESENVOLVIMENTO

### 2.1 Objetivo

Aplicar as migrations no banco de dados de desenvolvimento do Supabase.

### 2.2 Pré-requisitos

1. **Acesso ao Supabase:**
   - Conta no Supabase (https://app.supabase.com)
   - Projeto de desenvolvimento criado
   - Connection string do projeto

2. **Variáveis de Ambiente:**
```bash
# .env.local ou .env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
```

### 2.3 Métodos de Aplicação

#### Método 1: Via Supabase SQL Editor (Recomendado para Primeira Vez)

**Passos:**

1. **Acessar Supabase Dashboard:**
   - Ir para https://app.supabase.com
   - Selecionar projeto de desenvolvimento
   - Ir em "SQL Editor"

2. **Aplicar migrations uma por uma:**

   **Migration 1:**
   - Abrir `supabase/migrations/20260227000001_sport_modalities.sql`
   - Copiar todo o conteúdo
   - Colar no SQL Editor
   - Clicar em "Run"
   - Verificar se não há erros

   **Migration 2:**
   - Repetir o processo para `20260227000002_athlete_modalities.sql`
   - E assim por diante...

3. **Verificar aplicação:**
```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'sport_modalities',
    'athlete_modalities',
    'credit_transactions',
    'credit_packages',
    'game_convocations',
    'convocation_responses',
    'checkin_qrcodes',
    'checkins',
    'saved_tactics'
  )
ORDER BY table_name;
```

**Vantagens:**
- ✅ Visual e fácil de debugar
- ✅ Pode ver erros imediatamente
- ✅ Pode executar queries de verificação entre migrations

**Desvantagens:**
- ⚠️ Manual (tem que copiar/colar cada uma)
- ⚠️ Pode esquecer de aplicar alguma

---

#### Método 2: Via Supabase CLI

**Passos:**

1. **Linkar projeto Supabase:**
```bash
cd supabase
supabase link --project-ref [PROJECT_ID]
```

2. **Aplicar migrations:**
```bash
# Aplicar todas as migrations pendentes
supabase db push

# Ou aplicar migration específica
supabase migration up 20260227000001
```

**Vantagens:**
- ✅ Automático
- ✅ Rastreia quais migrations foram aplicadas
- ✅ Pode fazer rollback

**Desvantagens:**
- ⚠️ Precisa configurar CLI corretamente
- ⚠️ Pode ter problemas de permissão

---

#### Método 3: Via Script Node.js

**Criar script para aplicar todas:**

```javascript
// scripts/apply-v2-migrations.js
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const migrations = [
  '20260227000001_sport_modalities.sql',
  '20260227000002_athlete_modalities.sql',
  '20260227000003_recurring_trainings.sql',
  '20260227000004_game_convocations.sql',
  '20260227000005_checkin_qrcodes.sql',
  '20260227000006_saved_tactics.sql',
  '20260227000007_financial_by_training.sql',
  '20260227000008_hierarchy_and_credits.sql'
];

async function applyMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');

    // Verificar quais migrations já foram aplicadas
    const appliedMigrations = await getAppliedMigrations(client);
    console.log(`📊 Migrations já aplicadas: ${appliedMigrations.length}\n`);

    for (const migration of migrations) {
      if (appliedMigrations.includes(migration)) {
        console.log(`⏭️  ${migration} - Já aplicada, pulando...\n`);
        continue;
      }

      const filePath = path.join(__dirname, '..', 'supabase', 'migrations', migration);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`📄 Aplicando: ${migration}...`);
      
      try {
        await client.query(sql);
        
        // Registrar migration aplicada
        await registerMigration(client, migration);
        
        console.log(`   ✅ ${migration} - Aplicada com sucesso!\n`);
      } catch (error) {
        console.error(`   ❌ ${migration} - ERRO: ${error.message}\n`);
        throw error;
      }
    }

    console.log('✅ Todas as migrations foram aplicadas!');
  } catch (error) {
    console.error('❌ Erro ao aplicar migrations:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function getAppliedMigrations(client) {
  // Criar tabela de controle se não existir
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const result = await client.query('SELECT version FROM schema_migrations');
  return result.rows.map(row => row.version);
}

async function registerMigration(client, migration) {
  await client.query(
    'INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING',
    [migration]
  );
}

applyMigrations();
```

**Executar:**
```bash
node scripts/apply-v2-migrations.js
```

---

#### Método 4: Via psql (Linha de Comando)

**Passos:**

1. **Aplicar migrations uma por uma:**
```bash
# Migration 1
psql $DATABASE_URL < supabase/migrations/20260227000001_sport_modalities.sql

# Migration 2
psql $DATABASE_URL < supabase/migrations/20260227000002_athlete_modalities.sql

# ... e assim por diante
```

2. **Ou aplicar todas de uma vez:**
```bash
# Criar script temporário
cat supabase/migrations/20260227*.sql > /tmp/all_migrations.sql

# Aplicar tudo
psql $DATABASE_URL < /tmp/all_migrations.sql
```

---

### 2.4 Checklist de Aplicação

- [ ] Backup do banco de dados feito antes
- [ ] Todas as 8 migrations aplicadas em ordem
- [ ] Nenhum erro durante a aplicação
- [ ] Todas as tabelas criadas corretamente
- [ ] Todas as funções criadas corretamente
- [ ] Todas as views criadas corretamente
- [ ] Índices criados corretamente

---

## 3. VALIDAR INTEGRIDADE REFERENCIAL

### 3.1 Objetivo

Verificar se todas as foreign keys, constraints e relacionamentos estão funcionando corretamente.

### 3.2 Validações a Fazer

#### 3.2.1 Verificar Foreign Keys

```sql
-- Verificar todas as foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

**Verificar:**
- ✅ Todas as foreign keys apontam para tabelas existentes
- ✅ Todas as foreign keys apontam para colunas existentes
- ✅ Não há foreign keys órfãs

---

#### 3.2.2 Verificar Constraints

```sql
-- Verificar todas as constraints CHECK
SELECT
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints AS tc
JOIN information_schema.check_constraints AS cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

**Verificar:**
- ✅ Constraints estão corretas
- ✅ Valores padrão estão corretos

---

#### 3.2.3 Verificar Índices

```sql
-- Verificar todos os índices
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Verificar:**
- ✅ Índices foram criados
- ✅ Índices estão nas colunas corretas
- ✅ Não há índices duplicados

---

#### 3.2.4 Verificar Tabelas Criadas

```sql
-- Listar todas as tabelas novas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'sport_modalities',
    'athlete_modalities',
    'credit_transactions',
    'credit_packages',
    'game_convocations',
    'convocation_responses',
    'checkin_qrcodes',
    'checkins',
    'saved_tactics'
  )
ORDER BY table_name;
```

**Resultado esperado:** 9 tabelas

---

#### 3.2.5 Verificar Colunas Adicionadas

```sql
-- Verificar colunas adicionadas em groups
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'groups'
  AND column_name IN (
    'parent_group_id',
    'group_type',
    'pix_code',
    'credits_balance',
    'credits_purchased',
    'credits_consumed'
  )
ORDER BY column_name;
```

**Resultado esperado:** 6 colunas

---

#### 3.2.6 Verificar Colunas Adicionadas em events

```sql
-- Verificar colunas adicionadas em events
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'events'
  AND column_name IN (
    'is_recurring',
    'recurrence_pattern',
    'event_type',
    'parent_event_id',
    'modality_id'
  )
ORDER BY column_name;
```

**Resultado esperado:** 5 colunas

---

#### 3.2.7 Verificar Colunas Adicionadas em charges

```sql
-- Verificar coluna event_id em charges
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'charges'
  AND column_name = 'event_id';
```

**Resultado esperado:** 1 coluna (event_id)

---

#### 3.2.8 Verificar Funções Criadas

```sql
-- Verificar funções criadas
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'consume_credits',
    'add_credits',
    'get_pix_code_for_group',
    'can_manage_group',
    'generate_recurring_events',
    'get_next_recurrence_date',
    'get_convocation_stats',
    'is_convocation_complete',
    'process_qrcode_checkin',
    'create_event_qrcode',
    'get_event_checkins',
    'get_training_payment_summary',
    'get_training_pending_payments',
    'create_training_charge'
  )
ORDER BY routine_name;
```

**Resultado esperado:** 14 funções

---

#### 3.2.9 Verificar Views Criadas

```sql
-- Verificar views criadas
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'v_training_payments',
    'v_training_payment_details'
  )
ORDER BY table_name;
```

**Resultado esperado:** 2 views

---

#### 3.2.10 Testar Relacionamentos

```sql
-- Testar relacionamento sport_modalities -> groups
SELECT COUNT(*) 
FROM sport_modalities sm
INNER JOIN groups g ON sm.group_id = g.id;

-- Testar relacionamento athlete_modalities -> sport_modalities
SELECT COUNT(*) 
FROM athlete_modalities am
INNER JOIN sport_modalities sm ON am.modality_id = sm.id;

-- Testar relacionamento credit_transactions -> groups
SELECT COUNT(*) 
FROM credit_transactions ct
INNER JOIN groups g ON ct.group_id = g.id;
```

**Verificar:**
- ✅ JOINs funcionam sem erros
- ✅ Não há dados órfãos

---

### 3.3 Script de Validação Completo

**Criar script para validar tudo:**

```javascript
// scripts/validate-integrity.js
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function validateIntegrity() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('🔍 Validando integridade referencial...\n');

    // 1. Verificar tabelas
    console.log('1. Verificando tabelas...');
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'sport_modalities',
          'athlete_modalities',
          'credit_transactions',
          'credit_packages',
          'game_convocations',
          'convocation_responses',
          'checkin_qrcodes',
          'checkins',
          'saved_tactics'
        )
      ORDER BY table_name
    `);
    console.log(`   ✅ ${tables.rows.length}/9 tabelas encontradas\n`);

    // 2. Verificar foreign keys
    console.log('2. Verificando foreign keys...');
    const fks = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
        AND table_schema = 'public'
    `);
    console.log(`   ✅ ${fks.rows[0].count} foreign keys encontradas\n`);

    // 3. Verificar funções
    console.log('3. Verificando funções...');
    const functions = await client.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name IN (
          'consume_credits',
          'add_credits',
          'get_pix_code_for_group',
          'can_manage_group'
        )
    `);
    console.log(`   ✅ ${functions.rows.length} funções críticas encontradas\n`);

    // 4. Verificar views
    console.log('4. Verificando views...');
    const views = await client.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
        AND table_name IN (
          'v_training_payments',
          'v_training_payment_details'
        )
    `);
    console.log(`   ✅ ${views.rows.length}/2 views encontradas\n`);

    // 5. Testar relacionamentos
    console.log('5. Testando relacionamentos...');
    const relationships = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM sport_modalities) as sport_modalities,
        (SELECT COUNT(*) FROM athlete_modalities) as athlete_modalities,
        (SELECT COUNT(*) FROM credit_transactions) as credit_transactions
    `);
    console.log(`   ✅ Relacionamentos OK\n`);

    console.log('✅ Validação completa! Tudo OK!');
  } catch (error) {
    console.error('❌ Erro na validação:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

validateIntegrity();
```

**Executar:**
```bash
node scripts/validate-integrity.js
```

---

### 3.4 Checklist de Validação

- [ ] Todas as 9 tabelas foram criadas
- [ ] Todas as foreign keys estão corretas
- [ ] Todas as constraints estão funcionando
- [ ] Todos os índices foram criados
- [ ] Todas as funções foram criadas
- [ ] Todas as views foram criadas
- [ ] Colunas adicionadas em groups (6)
- [ ] Colunas adicionadas em events (5)
- [ ] Coluna adicionada em charges (1)
- [ ] Relacionamentos funcionam corretamente
- [ ] Não há dados órfãos

---

## 4. DOCUMENTAR NO MIGRATIONS_STATUS.md

### 4.1 Objetivo

Atualizar a documentação oficial com as novas migrations aplicadas.

### 4.2 O que Documentar

1. **Status de cada migration:**
   - Nome do arquivo
   - Data de aplicação
   - Tabelas criadas
   - Funções criadas
   - Views criadas
   - Colunas adicionadas

2. **Estatísticas atualizadas:**
   - Total de tabelas
   - Total de colunas
   - Total de foreign keys
   - Total de índices

3. **Notas importantes:**
   - Dependências entre migrations
   - Ordem de aplicação
   - Rollback (se necessário)

### 4.3 Template de Documentação

**Adicionar ao `supabase/docs/MIGRATIONS_STATUS.md`:**

```markdown
## 📋 Migrations V2.0 (2026-02-27)

### Migration 1: Sport Modalities
- **Arquivo:** `20260227000001_sport_modalities.sql`
- **Data de Aplicação:** 2026-02-27
- **Status:** ✅ Aplicada
- **Tabelas Criadas:**
  - `sport_modalities`
- **Funções Criadas:**
  - `get_group_modalities(BIGINT)`
- **Índices:** 3
- **Descrição:** Sistema de modalidades esportivas por grupo

### Migration 2: Athlete Modalities
- **Arquivo:** `20260227000002_athlete_modalities.sql`
- **Data de Aplicação:** 2026-02-27
- **Status:** ✅ Aplicada
- **Tabelas Criadas:**
  - `athlete_modalities`
- **Funções Criadas:**
  - `get_athlete_modalities(UUID)`
  - `get_modality_athletes(BIGINT)`
- **Índices:** 4
- **Descrição:** Relacionamento Many-to-Many entre atletas e modalidades

[... continuar para todas as 8 migrations ...]
```

### 4.4 Atualizar Estatísticas

**Atualizar seção de estatísticas:**

```markdown
## 📊 Estatísticas Atualizadas

| Métrica | Antes | Depois | Mudança |
|---------|-------|--------|---------|
| **Tabelas** | 17 | 26 | +9 |
| **Colunas** | 126 | ~180 | +54 |
| **Foreign Keys** | 27 | ~35 | +8 |
| **Índices** | 55 | ~75 | +20 |
| **Funções** | ~10 | ~24 | +14 |
| **Views** | 1 | 3 | +2 |
```

### 4.5 Checklist de Documentação

- [ ] Todas as 8 migrations documentadas
- [ ] Data de aplicação registrada
- [ ] Tabelas listadas
- [ ] Funções listadas
- [ ] Views listadas
- [ ] Estatísticas atualizadas
- [ ] Notas importantes adicionadas
- [ ] Ordem de aplicação documentada

---

## 🎯 RESUMO EXECUTIVO

### Ordem de Execução Recomendada

1. **Testar localmente** (30-60 min)
   - Usar Supabase CLI ou validador SQL
   - Verificar sintaxe e referências

2. **Aplicar em desenvolvimento** (30-60 min)
   - Via Supabase SQL Editor (primeira vez)
   - Ou via script Node.js (automação)

3. **Validar integridade** (15-30 min)
   - Executar queries de validação
   - Verificar relacionamentos

4. **Documentar** (15-30 min)
   - Atualizar MIGRATIONS_STATUS.md
   - Atualizar estatísticas

**Tempo total estimado:** 1.5 - 3 horas

---

## ⚠️ AVISOS IMPORTANTES

1. **SEMPRE fazer backup antes de aplicar migrations**
2. **Aplicar migrations em ordem (1 → 8)**
3. **Testar localmente primeiro**
4. **Validar integridade após aplicar**
5. **Documentar imediatamente após aplicar**

---

**Última atualização:** 2026-02-27  
**Status:** ⏸️ Aguardando execução

