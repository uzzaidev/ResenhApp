# 🚀 APLICAR MIGRATIONS RESTANTES - GUIA RÁPIDO

**Status:** 2/8 migrations aplicadas  
**Pendentes:** 6 migrations  
**Data:** 2026-01-22

---

## ✅ MIGRATIONS JÁ APLICADAS

1. ✅ `20260127000001_initial_schema.sql` - Extensions + Enums
2. ✅ `20260127000002_auth_profiles.sql` - Auth & User Types

---

## ⏳ MIGRATIONS PENDENTES (Aplicar na ordem)

### 3. Groups & Events (Core System)

**Arquivo:** `supabase/migrations/20260127000003_groups_and_events.sql`

**Como aplicar:**
1. Acesse [Supabase Dashboard](https://app.supabase.com/project/ujrvfkkkssfdhwizjucq)
2. Vá em **SQL Editor**
3. Abra o arquivo `supabase/migrations/20260127000003_groups_and_events.sql`
4. Copie **TODO o conteúdo**
5. Cole no SQL Editor
6. Clique em **Run** (ou Ctrl+Enter)
7. Aguarde mensagem de sucesso ✅

**Tabelas criadas:**
- `groups`
- `group_members`
- `invites`
- `venues`
- `events`
- `event_attendance`
- `teams`
- `team_members`
- `event_actions`
- `votes`

---

### 4. RLS Policies (Row Level Security)

**Arquivo:** `supabase/migrations/20260127000004_rls_policies.sql`

**Como aplicar:**
1. No SQL Editor do Supabase
2. Abra `supabase/migrations/20260127000004_rls_policies.sql`
3. Copie TODO o conteúdo
4. Cole e execute
5. Verifique sucesso ✅

**O que faz:**
- Habilita RLS em todas as tabelas
- Cria políticas de segurança
- Define permissões de acesso

---

### 5. Financial System (Financeiro + Pix)

**Arquivo:** `supabase/migrations/20260204000001_financial_system.sql`

**Como aplicar:**
1. No SQL Editor
2. Abra `supabase/migrations/20260204000001_financial_system.sql`
3. Copie e execute
4. Verifique sucesso ✅

**Tabelas criadas:**
- `wallets`
- `charges`
- `charge_splits`
- `transactions`
- `pix_payments`
- `group_pix_config`

---

### 6. Notifications (Sistema de Notificações)

**Arquivo:** `supabase/migrations/20260211000001_notifications.sql`

**Como aplicar:**
1. No SQL Editor
2. Abra `supabase/migrations/20260211000001_notifications.sql`
3. Copie e execute
4. Verifique sucesso ✅

**Tabelas criadas:**
- `notifications`
- `notification_templates`
- `push_tokens`
- `email_queue`
- `notification_batches`

---

### 7. Analytics (Analytics + Stats)

**Arquivo:** `supabase/migrations/20260218000001_analytics.sql`

**Como aplicar:**
1. No SQL Editor
2. Abra `supabase/migrations/20260218000001_analytics.sql`
3. Copie e execute
4. Verifique sucesso ✅

**Tabelas criadas:**
- `player_stats`
- `event_stats`
- `group_stats`
- `leaderboards`
- `activity_log`

---

### 8. Gamification (Gamificação)

**Arquivo:** `supabase/migrations/20260225000001_gamification.sql`

**Como aplicar:**
1. No SQL Editor
2. Abra `supabase/migrations/20260225000001_gamification.sql`
3. Copie e execute
4. Verifique sucesso ✅

**Tabelas criadas:**
- `achievement_types`
- `user_achievements`
- `badges`
- `user_badges`
- `milestones`
- `challenges`
- `challenge_participants`

---

## ✅ VERIFICAÇÃO FINAL

Após aplicar todas as 6 migrations, execute no SQL Editor:

```sql
-- 1. Contar tabelas criadas (deve retornar ~40 tabelas)
SELECT COUNT(*) as total_tabelas
FROM pg_tables
WHERE schemaname = 'public';

-- 2. Listar todas as tabelas
SELECT tablename 
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. Verificar migrations aplicadas
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version;
```

**Resultados esperados:**
- ✅ ~40 tabelas criadas
- ✅ RLS habilitado em todas as tabelas principais
- ✅ 8 migrations registradas

---

## 📋 CHECKLIST

- [ ] Migration 3 aplicada (groups_and_events)
- [ ] Migration 4 aplicada (rls_policies)
- [ ] Migration 5 aplicada (financial_system)
- [ ] Migration 6 aplicada (notifications)
- [ ] Migration 7 aplicada (analytics)
- [ ] Migration 8 aplicada (gamification)
- [ ] Verificação final executada
- [ ] ~40 tabelas confirmadas

---

**Criado em:** 2026-01-22  
**Última atualização:** 2026-01-22T23:55

