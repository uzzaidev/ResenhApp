# 📜 Migration History - ResenhApp Database

> Histórico completo de todas as migrações do banco de dados

## 🗓️ Timeline

### 2026-01-23, 19:05 UTC - Schema Reset e Modernização (v1.0.0)

**Versão:** 1.0.0
**Status:** ✅ Aplicado em produção
**Arquivo principal:** `src/db/migrations/schema.sql`
**Tabelas resultantes:** 17 (16 app + 1 sistema)

#### Contexto
Migração completa do Stack Auth (schema legado) para Supabase com schema limpo e moderno.

#### Mudanças Principais

**1. Reset Completo do Database**
- Removidas 37 tabelas antigas do Stack Auth
- Removidos tipos ENUM incompatíveis
- Limpeza de funções e triggers legados

**2. Schema Novo Aplicado**
- 16 tabelas da aplicação criadas
- Todas com UUID como PK
- 27 foreign keys configuradas
- 55 índices otimizados

**3. Correções Aplicadas**
- Adicionada coluna `removed_by_self_at` em `event_attendance`
- Corrigido loop infinito em `PendingPaymentsCard`
- Atualização de `DATABASE_URL` para Shared Pooler (IPv4 compatible)

#### Arquivos Envolvidos
- `src/db/migrations/schema.sql` - Schema completo
- `supabase/scripts/reset-and-apply-schema.js` - Script de reset
- `supabase/scripts/apply-missing-columns.js` - Coluna faltante

#### Comandos Executados
```bash
# 1. Backup do schema antigo
node full-schema-backup.js
# Resultado: 37 tabelas, 8.527 registros (maioria sistema)

# 2. Reset completo
node reset-and-apply-schema.js
# Resultado: 37 tabelas dropadas, schema novo aplicado

# 3. Adicionar coluna faltante
node apply-missing-columns.js
# Resultado: removed_by_self_at adicionada
```

#### Issues Resolvidos
- ✅ `column "code" of relation "groups" violates not-null` - Resolvido
- ✅ `column "user_id" does not exist` em charges - Resolvido
- ✅ `column e.starts_at does not exist` - Resolvido
- ✅ `column ea.removed_by_self_at does not exist` - Resolvido
- ✅ Loop infinito de sessão no dashboard - Resolvido

#### Verificação Pós-Migration
```bash
node check-supabase-schema.js
```
Resultado: ✅ 16 tabelas, 126 colunas, todos relacionamentos OK

---

### 2026-01-13 - Tracking de Auto-Remoção (Planejado, não aplicado antes)

**Arquivo:** `src/db/migrations/add_self_removal_tracking.sql`

**Status:** ✅ Incluído no schema 1.0.0

**Descrição:** Adiciona timestamp para tracking quando usuário sai de evento após confirmar.

```sql
ALTER TABLE event_attendance
ADD COLUMN removed_by_self_at TIMESTAMP;

CREATE INDEX idx_event_attendance_removed_by_self
ON event_attendance(removed_by_self_at)
WHERE removed_by_self_at IS NOT NULL;
```

**Uso:** Permite admins verem quem deu "bola fora" (confirmou mas saiu).

---

### 2025-XX-XX - Preferências de Posição (Planejado, não aplicado antes)

**Arquivo:** `src/db/migrations/001_add_position_preferences.sql`

**Status:** ✅ Incluído no schema 1.0.0

**Descrição:** Permite jogadores indicarem posições preferidas para sorteio.

```sql
ALTER TABLE event_attendance
ADD COLUMN preferred_position VARCHAR(20),
ADD COLUMN secondary_position VARCHAR(20);
```

**Valores:** `'gk'`, `'defender'`, `'midfielder'`, `'forward'`

---

### 2025-XX-XX - Ajuste de Posições em Team Members (Planejado)

**Arquivo:** `src/db/migrations/002_fix_team_members_position.sql`

**Status:** ✅ Incluído no schema 1.0.0

**Descrição:** Adiciona opção `'line'` para jogadores sem posição específica.

```sql
-- CHECK constraint já incluído no schema.sql
CHECK (position IN ('gk', 'defender', 'midfielder', 'forward', 'line'))
```

---

### Futuro - Soft Delete (Opcional, não aplicado)

**Arquivo:** `src/db/migrations/003_soft_delete.sql`

**Status:** ⏸️ Disponível mas não aplicado

**Descrição:** Adiciona suporte para soft delete em várias tabelas.

**Tabelas afetadas:**
- `groups` (deleted_at)
- `group_members` (deleted_at)
- `charges` (deleted_at)
- `invites` (deleted_at)

**Quando aplicar:** Quando houver necessidade de recuperar dados deletados.

**Como aplicar:**
```bash
psql $DATABASE_URL < src/db/migrations/003_soft_delete.sql
```

---

## 📊 Estatísticas de Migrations

| Métrica | Valor |
|---------|-------|
| **Tabelas em produção** | 17 (16 app + 1 sistema) |
| **Arquivos SQL na pasta** | 19 |
| **Schema principal aplicado** | 1 (`schema.sql`) |
| **Migrations incluídas no schema** | 8 (já incorporadas) |
| **Migrations pendentes** | 1 (`003_soft_delete.sql` - opcional) |
| **Arquivos legado** | 9 (não aplicar) |
| **Última migration aplicada** | 2026-01-23, 19:05 UTC |
| **Versão atual** | 1.0.0 |

⚠️ **IMPORTANTE:** Se você contar CREATE TABLE em TODOS os 19 arquivos SQL, encontrará ~40+ tabelas, mas isso seria duplicação. Apenas `schema.sql` está aplicado com 17 tabelas únicas.

Ver [MIGRATIONS_STATUS.md](docs/MIGRATIONS_STATUS.md) para breakdown completo.

---

## 🔧 Como Aplicar Migrations

### Método 1: Via Supabase SQL Editor

1. Abra o SQL Editor no Supabase Dashboard
2. Copie o conteúdo da migration
3. Execute
4. Verifique com `check-supabase-schema.js`

### Método 2: Via Script Node.js

```bash
# Verificar estado atual
node supabase/scripts/verify-schema.js

# Aplicar migration específica
psql $DATABASE_URL < src/db/migrations/003_soft_delete.sql

# Verificar novamente
node supabase/scripts/verify-schema.js
```

### Método 3: Reset Completo (USE COM CUIDADO)

```bash
# Fazer backup primeiro!
node supabase/scripts/full-schema-backup.js

# Reset e aplicar schema
node supabase/scripts/reset-and-apply-schema.js
```

---

## 🚨 Rollback

### Rollback da Migration 1.0.0

**⚠️ NÃO RECOMENDADO** - Perda de dados

Se absolutamente necessário:

1. Restaurar backup do Supabase
2. Ou usar backup JSON:
```bash
# Restaurar estrutura (dados serão perdidos)
node supabase/scripts/restore-from-backup.js supabase/docs/supabase-schema-backup-[TIMESTAMP].json
```

### Rollback de Soft Delete

```sql
-- Remover colunas deleted_at
ALTER TABLE groups DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE group_members DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE charges DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE invites DROP COLUMN IF EXISTS deleted_at;

-- Remover índices
DROP INDEX IF EXISTS idx_groups_active;
DROP INDEX IF EXISTS idx_group_members_active;
DROP INDEX IF EXISTS idx_charges_active;
DROP INDEX IF EXISTS idx_invites_active;
```

---

## 📝 Checklist de Migration

Antes de aplicar qualquer migration:

- [ ] Fazer backup do database
- [ ] Testar migration em ambiente local
- [ ] Verificar impacto em queries existentes
- [ ] Atualizar código da aplicação (se necessário)
- [ ] Rodar `full-database-audit.js` antes e depois
- [ ] Verificar com `check-supabase-schema.js`
- [ ] Testar funcionalidades afetadas
- [ ] Documentar mudanças neste arquivo

---

## 🔮 Migrations V2.0 (Planejadas - Não Aplicadas)

### Status

- **Versão:** 2.0.0-SUPABASE
- **Status:** ⏸️ Ainda não aplicadas em produção
- **Localização:** `supabase/migrations/`
- **Total de Migrations:** 10 arquivos
- **Total de Tabelas:** 40+ (vs 17 em V1.0)

### Migrations Disponíveis

#### Core Migrations (Foundation)

1. **20260127000001_initial_schema.sql**
   - Extensions: uuid-ossp, pgcrypto, pg_trgm, postgis
   - Enums: Todos os enums do sistema

2. **20260127000002_auth_profiles.sql**
   - Tabelas: `profiles`, `user_roles`
   - Sistema de autenticação completo

3. **20260127000003_groups_and_events.sql**
   - Tabelas: `groups`, `group_members`, `invites`, `venues`, `events`, `event_attendance`, `teams`, `team_members`, `event_actions`, `votes`
   - Sistema core completo

4. **20260127000004_rls_policies.sql**
   - Row Level Security para todas as tabelas
   - Políticas de acesso granulares

#### Feature Migrations

5. **20260204000001_financial_system.sql**
   - Tabelas: `wallets`, `charges`, `charge_splits`, `transactions`, `pix_payments`, `group_pix_config`
   - Sistema financeiro completo

6. **20260211000001_notifications.sql**
   - Tabelas: `notifications`, `notification_templates`, `push_tokens`, `email_queue`, `notification_batches`
   - Sistema de notificações completo

7. **20260218000001_analytics.sql**
   - Tabelas: `player_stats`, `event_stats`, `group_stats`, `leaderboards`, `activity_log`
   - Analytics e estatísticas

8. **20260225000001_gamification.sql**
   - Tabelas: `achievement_types`, `user_achievements`, `badges`, `user_badges`, `milestones`, `challenges`, `challenge_participants`
   - Sistema de gamificação completo

### Diferenças V1.0 vs V2.0

| Aspecto | V1.0 (Produção) | V2.0 (Planejado) |
|---------|-----------------|------------------|
| **Tabelas** | 17 | 40+ |
| **RLS** | ❌ Não implementado | ✅ Implementado |
| **Notificações** | ❌ Não implementado | ✅ Implementado |
| **Analytics** | ❌ Básico | ✅ Completo |
| **Gamificação** | ❌ Não implementado | ✅ Implementado |
| **Sistema Financeiro** | ✅ Básico | ✅ Avançado |

### Quando Aplicar V2.0

**Pré-requisitos:**
- [ ] Backup completo do database V1.0
- [ ] Teste em ambiente de desenvolvimento
- [ ] Validação de todas as migrations
- [ ] Plano de rollback preparado

**Processo:**
1. Aplicar migrations em ordem sequencial
2. Verificar integridade após cada migration
3. Testar funcionalidades afetadas
4. Documentar mudanças

**Documentação Completa:** Ver [migrations/README.md](migrations/README.md)

---

## 🔮 Migrations Planejadas (Ainda Não Implementadas)

**Nota:** As migrations abaixo já existem como V2.0, mas ainda não foram aplicadas. Ver seção [Migrations V2.0](#-migrations-v20-planejadas---não-aplicadas) acima.

### Já Implementadas em V2.0 (Não Aplicadas)

1. ✅ **Row Level Security (RLS)**
   - Arquivo: `20260127000004_rls_policies.sql`
   - Prioridade: 🔴 ALTA
   - Status: ⏸️ Disponível mas não aplicado

2. ✅ **Notificações**
   - Arquivo: `20260211000001_notifications.sql`
   - Prioridade: 🟢 BAIXA
   - Status: ⏸️ Disponível mas não aplicado

3. ✅ **Achievements (Gamificação)**
   - Arquivo: `20260225000001_gamification.sql`
   - Prioridade: 🟢 BAIXA
   - Status: ⏸️ Disponível mas não aplicado

### Ainda Não Implementadas

1. **Audit Trail Completo**
   - Arquivo: `005_audit_trail.sql` (a criar)
   - Prioridade: 🟡 MÉDIA
   - Descrição: Adicionar `updated_by`, `deleted_by`
   - Status: 📝 Planejado

---

## 📚 Referências

- Schema atual: `src/db/migrations/schema.sql`
- Documentação: `supabase/docs/SCHEMA.md`
- Scripts: `supabase/scripts/`
- Backups: `supabase/docs/database-audit-*.json`

---

**Última atualização:** 27 de Janeiro de 2026
**Versão atual do schema:** 1.0.0 (V2.0 planejada)
**Próxima migration planejada:** Aplicar migrations V2.0 quando decidido
