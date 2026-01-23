# 📜 Migration History - ResenhApp Database

> Histórico completo de todas as migrações do banco de dados

## 🗓️ Timeline

### 2026-01-23 - Schema Reset e Modernização

**Versão:** 1.0.0
**Status:** ✅ Aplicado em produção

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
| Total de migrations aplicadas | 1 (reset completo) |
| Total de migrations disponíveis | 4 |
| Migrations pendentes | 1 (soft delete) |
| Última migration | 2026-01-23 |

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
- [ ] Verificar com `verify-schema.js`
- [ ] Testar funcionalidades afetadas
- [ ] Documentar mudanças neste arquivo

---

## 🔮 Migrations Planejadas

### Q1 2026

**1. Row Level Security (RLS)**
- Arquivo: `004_enable_rls.sql` (a criar)
- Prioridade: 🔴 ALTA
- Descrição: Habilitar RLS em todas as tabelas

**2. Audit Trail Completo**
- Arquivo: `005_audit_trail.sql` (a criar)
- Prioridade: 🟡 MÉDIA
- Descrição: Adicionar `updated_by`, `deleted_by`

### Q2 2026

**3. Notificações**
- Arquivo: `006_notifications.sql` (a criar)
- Prioridade: 🟢 BAIXA
- Tabelas: `notifications`, `push_tokens`

**4. Achievements**
- Arquivo: `007_achievements.sql` (a criar)
- Prioridade: 🟢 BAIXA
- Tabelas: `achievements`, `user_achievements`

---

## 📚 Referências

- Schema atual: `src/db/migrations/schema.sql`
- Documentação: `supabase/docs/SCHEMA.md`
- Scripts: `supabase/scripts/`
- Backups: `supabase/docs/database-audit-*.json`

---

**Última atualização:** 23 de Janeiro de 2026
**Versão atual do schema:** 1.0.0
**Próxima migration planejada:** 004_enable_rls.sql
