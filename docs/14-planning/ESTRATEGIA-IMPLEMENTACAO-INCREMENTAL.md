# 🚀 Estratégia de Implementação Incremental

> **Objetivo:** Plano detalhado de como implementar features sem quebrar o sistema atual  
> **Data:** 2026-01-27  
> **Status:** 📋 Estratégia Completa

---

## 🎯 Princípios Fundamentais

### 1. Não Quebrar o Existente
- ✅ Nenhuma tabela será removida
- ✅ Nenhuma coluna obrigatória será alterada
- ✅ Funcionalidades existentes continuam funcionando

### 2. Expansão Incremental
- ✅ Uma feature por vez
- ✅ Testar após cada migration
- ✅ Rollback possível se necessário

### 3. Integração Gradual
- ✅ Features se conectam via Foreign Keys
- ✅ Triggers atualizam dados automaticamente
- ✅ Código existente não precisa mudar imediatamente

---

## 📅 Timeline de Implementação

### Sprint 1: UI/UX Core (2 semanas)
**Status:** ⏸️ Planejado  
**Migrations:** Nenhuma  
**Foco:** Componentes base, layout, UX polish

**Não afeta database, apenas frontend.**

---

### Sprint 2: Notificações (2-3 semanas)
**Status:** ⏸️ Planejado  
**Migrations:** `20260211000001_notifications.sql`  
**Prioridade:** 🔴 ALTA

#### Passo a Passo

**1. Preparação (Dia 1)**
```bash
# Backup do database
node supabase/scripts/full-schema-backup.js

# Verificar estado atual
node supabase/scripts/check-supabase-schema.js
```

**2. Aplicar Migration (Dia 1)**
```sql
-- Via Supabase SQL Editor
-- Copiar e executar: supabase/migrations/20260211000001_notifications.sql
```

**3. Verificar Migration (Dia 1)**
```bash
# Verificar tabelas criadas
node supabase/scripts/check-supabase-schema.js

# Deve mostrar:
# - notifications ✅
# - notification_templates ✅
# - push_tokens ✅
# - email_queue ✅
# - notification_batches ✅
```

**4. Backend - Criar Funções (Dia 2-3)**
```typescript
// Criar: src/lib/notifications/create.ts
// Criar: src/lib/notifications/push.ts
// Criar: src/lib/notifications/email.ts
```

**5. Backend - Modificar Endpoints (Dia 4-5)**
```typescript
// Modificar: src/app/api/events/route.ts
// Adicionar: createEventNotifications()

// Modificar: src/app/api/events/[eventId]/rsvp/route.ts
// Adicionar: createRSVPNotification()
```

**6. Backend - Criar Novos Endpoints (Dia 6-7)**
```typescript
// Criar: src/app/api/notifications/route.ts
// Criar: src/app/api/notifications/unread-count/route.ts
```

**7. Frontend - Componentes (Dia 8-10)**
```typescript
// Criar: src/components/notifications/NotificationBell.tsx
// Criar: src/components/notifications/NotificationList.tsx
// Modificar: src/components/layout/topbar.tsx
```

**8. Testes (Dia 11-12)**
- Criar evento → verificar notificação
- Confirmar RSVP → verificar notificação
- Marcar como lida → verificar atualização
- Testar push notifications

**9. Deploy (Dia 13-14)**
- Deploy em staging
- Testes finais
- Deploy em produção

---

### Sprint 3: Analytics (2-3 semanas)
**Status:** ⏸️ Planejado  
**Migrations:** `20260218000001_analytics.sql`  
**Prioridade:** 🔴 ALTA  
**Dependências:** Nenhuma (pode rodar em paralelo com Pix)

#### Passo a Passo

**1. Preparação (Dia 1)**
```bash
# Backup do database
node supabase/scripts/full-schema-backup.js
```

**2. Aplicar Migration (Dia 1)**
```sql
-- Via Supabase SQL Editor
-- Copiar e executar: supabase/migrations/20260218000001_analytics.sql
```

**3. Verificar Migration (Dia 1)**
```bash
# Deve mostrar:
# - player_stats ✅
# - event_stats ✅
# - group_stats ✅
# - leaderboards ✅
# - activity_log ✅
```

**4. Backend - Criar Funções de Atualização (Dia 2-3)**
```typescript
// Criar: src/lib/analytics/update-stats.ts
// updatePlayerStats()
// updateEventStats()
// updateGroupStats()
```

**5. Backend - Criar Triggers SQL (Dia 4)**
```sql
-- Criar triggers que atualizam stats automaticamente
-- Quando event_actions é criado
-- Quando event_attendance muda
```

**6. Backend - Modificar Endpoints (Dia 5-6)**
```typescript
// Modificar: src/app/api/events/[eventId]/actions/route.ts
// Adicionar: updatePlayerStats(), updateEventStats()
```

**7. Backend - Criar Endpoints de Analytics (Dia 7-8)**
```typescript
// Criar: src/app/api/groups/[groupId]/analytics/route.ts
// Criar: src/app/api/groups/[groupId]/trends/route.ts
```

**8. Frontend - Componentes (Dia 9-12)**
```typescript
// Criar: src/components/analytics/StatsCards.tsx
// Criar: src/components/analytics/ActivityChart.tsx
// Criar: src/components/analytics/PlayerStats.tsx
// Criar: src/app/(dashboard)/groups/[groupId]/analytics/page.tsx
```

**9. Testes (Dia 13-14)**
- Marcar gol → verificar player_stats atualizado
- Verificar dashboard de analytics
- Testar performance de queries

**10. Deploy (Dia 15)**
- Deploy em staging
- Testes finais
- Deploy em produção

---

### Sprint 4: Split Pix (3-4 semanas)
**Status:** ⏸️ Planejado  
**Migrations:** `20260204000001_financial_system.sql`  
**Prioridade:** 🟡 MÉDIA (Premium)  
**Dependências:** Notificações (para enviar QR Code)

#### Passo a Passo

**1. Preparação (Dia 1)**
```bash
# Backup do database
node supabase/scripts/full-schema-backup.js

# Configurar gateway Pix (ex: Mercado Pago, PagSeguro, etc.)
```

**2. Aplicar Migration (Dia 1)**
```sql
-- Via Supabase SQL Editor
-- Copiar e executar: supabase/migrations/20260204000001_financial_system.sql
```

**3. Verificar Migration (Dia 1)**
```bash
# Deve mostrar:
# - group_pix_config ✅
# - pix_payments ✅
# - charge_splits ✅ (pode já existir, verificar)
```

**4. Backend - Configurar Gateway Pix (Dia 2-3)**
```typescript
// Criar: src/lib/pix/gateway.ts
// Integração com gateway escolhido
// Validação de chave Pix
```

**5. Backend - Criar Funções (Dia 4-5)**
```typescript
// Criar: src/lib/pix/generate-qr.ts
// Gerar payload EMV
// Criar QR Code image
```

**6. Backend - Criar Endpoints (Dia 6-8)**
```typescript
// Criar: src/app/api/groups/[groupId]/pix/config/route.ts
// Criar: src/app/api/events/[eventId]/pix/generate/route.ts
// Criar: src/app/api/pix/webhook/route.ts
```

**7. Backend - Modificar Endpoints (Dia 9)**
```typescript
// Modificar: src/app/api/events/[eventId]/rsvp/route.ts
// Adicionar: generatePixQRCode() se grupo tiver Pix configurado
```

**8. Frontend - Componentes (Dia 10-14)**
```typescript
// Criar: src/components/pix/pix-qr-code.tsx
// Criar: src/components/pix/pix-config-form.tsx
// Modificar: src/components/events/rsvp-button.tsx
// Criar: src/app/(dashboard)/groups/[groupId]/financial/pix/page.tsx
```

**9. Testes (Dia 15-18)**
- Configurar Pix do grupo
- Confirmar RSVP → verificar QR Code gerado
- Testar pagamento via Pix
- Verificar webhook
- Testar notificação de pagamento

**10. Deploy (Dia 19-21)**
- Deploy em staging
- Testes finais
- Deploy em produção

---

### Sprint 5: Gamificação (2-3 semanas)
**Status:** ⏸️ Planejado  
**Migrations:** `20260225000001_gamification.sql`  
**Prioridade:** 🟢 BAIXA  
**Dependências:** Notificações, Analytics

#### Passo a Passo

**1. Preparação (Dia 1)**
```bash
# Backup do database
node supabase/scripts/full-schema-backup.js
```

**2. Aplicar Migration (Dia 1)**
```sql
-- Via Supabase SQL Editor
-- Copiar e executar: supabase/migrations/20260225000001_gamification.sql
```

**3. Verificar Migration (Dia 1)**
```bash
# Deve mostrar:
# - achievement_types ✅
# - user_achievements ✅
# - badges ✅
# - user_badges ✅
# - milestones ✅
# - challenges ✅
# - challenge_participants ✅
```

**4. Backend - Popular Achievement Types (Dia 2)**
```sql
-- Inserir achievements iniciais:
-- first_goal, hat_trick, first_event, streak_5, etc.
```

**5. Backend - Criar Funções (Dia 3-4)**
```typescript
// Criar: src/lib/gamification/check-achievements.ts
// Verificar condições de achievements
// Desbloquear achievements
```

**6. Backend - Criar Triggers SQL (Dia 5)**
```sql
-- Trigger: Verificar achievements quando ação é criada
-- Trigger: Verificar achievements quando attendance muda
```

**7. Backend - Modificar Endpoints (Dia 6)**
```typescript
// Modificar: src/app/api/events/[eventId]/actions/route.ts
// Adicionar: checkAchievements()
```

**8. Backend - Criar Endpoints (Dia 7)**
```typescript
// Criar: src/app/api/achievements/[userId]/[groupId]/route.ts
```

**9. Frontend - Componentes (Dia 8-11)**
```typescript
// Criar: src/components/gamification/achievement-badge.tsx
// Criar: src/components/gamification/achievement-list.tsx
// Criar: src/app/(dashboard)/profile/achievements/page.tsx
// Modificar: src/components/profile/user-profile.tsx
```

**10. Testes (Dia 12-13)**
- Marcar primeiro gol → verificar achievement desbloqueado
- Verificar notificação de achievement
- Testar página de achievements

**11. Deploy (Dia 14)**
- Deploy em staging
- Testes finais
- Deploy em produção

---

## 🔄 Processo de Migration

### Checklist Antes de Aplicar Migration

- [ ] **Backup Completo**
  ```bash
  node supabase/scripts/full-schema-backup.js
  ```

- [ ] **Verificar Estado Atual**
  ```bash
  node supabase/scripts/check-supabase-schema.js
  ```

- [ ] **Ler Migration Completa**
  - Entender o que será criado
  - Verificar dependências
  - Identificar possíveis conflitos

- [ ] **Testar em Desenvolvimento**
  - Aplicar migration em ambiente local
  - Testar queries básicas
  - Verificar integridade

### Processo de Aplicação

**1. Via Supabase SQL Editor (Recomendado)**
```sql
-- 1. Copiar conteúdo da migration
-- 2. Colar no SQL Editor
-- 3. Executar
-- 4. Verificar resultado
```

**2. Via Supabase CLI (Alternativa)**
```bash
supabase db push
```

### Verificação Pós-Migration

```bash
# 1. Verificar tabelas criadas
node supabase/scripts/check-supabase-schema.js

# 2. Verificar foreign keys
# Via SQL Editor:
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
  AND tc.table_schema = 'public'
  AND tc.table_name = 'notifications'; -- ou outra tabela nova

# 3. Testar queries básicas
SELECT COUNT(*) FROM notifications;
SELECT COUNT(*) FROM player_stats;
SELECT COUNT(*) FROM group_pix_config;
```

---

## ⚠️ Pontos de Atenção

### 1. Compatibilidade de Tipos

**Problema Potencial:**
- V1.0 usa `UUID` para IDs
- V2.0 usa `BIGSERIAL` para algumas tabelas

**Solução:**
- Verificar migrations V2.0
- Se usar `BIGSERIAL`, criar relacionamento via `user_id UUID` que referencia `users.id UUID`
- Manter consistência

### 2. Dependências entre Migrations

**Ordem Importante:**
1. `20260127000001_initial_schema.sql` - Extensions e Enums (base)
2. `20260127000002_auth_profiles.sql` - Profiles (se usar)
3. `20260127000003_groups_and_events.sql` - Core (se usar)
4. Depois: Features (qualquer ordem)

**Nota:** Se V1.0 já tem `users`, `groups`, `events`, não precisa aplicar migrations 1-3.

### 3. Rollback Plan

**Se algo der errado:**

```sql
-- 1. Remover tabelas criadas (se necessário)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS push_tokens CASCADE;
DROP TABLE IF EXISTS email_queue CASCADE;
DROP TABLE IF EXISTS notification_batches CASCADE;

-- 2. Remover triggers (se criados)
DROP TRIGGER IF EXISTS update_player_stats_on_action ON event_actions;
DROP FUNCTION IF EXISTS update_player_stats();

-- 3. Restaurar backup se necessário
-- Via Supabase Dashboard: Settings → Database → Backups
```

---

## 📋 Checklist Geral de Implementação

### Para Cada Feature

#### Antes de Começar
- [ ] Backup do database
- [ ] Ambiente de desenvolvimento configurado
- [ ] Testes do sistema atual passando
- [ ] Branch criada para feature

#### Durante Desenvolvimento
- [ ] Aplicar migration
- [ ] Verificar migration aplicada
- [ ] Criar funções backend
- [ ] Modificar endpoints existentes
- [ ] Criar novos endpoints
- [ ] Criar componentes frontend
- [ ] Testar integração

#### Antes de Finalizar
- [ ] Testes completos
- [ ] Verificar performance
- [ ] Validar segurança
- [ ] Documentar mudanças
- [ ] Code review

#### Deploy
- [ ] Deploy em staging
- [ ] Testes em staging
- [ ] Deploy em produção
- [ ] Monitorar logs
- [ ] Validar funcionalidade

---

## 🎯 Resumo: Tudo Conectado e Pronto

### ✅ Arquitetura Completa
- Mapeamento de features → migrations → tabelas → código
- Dependências identificadas
- Fluxos documentados
- Estratégia incremental definida

### ✅ Implementação Segura
- Processo de migration documentado
- Rollback plan preparado
- Testes definidos
- Deploy strategy clara

### ✅ Pronto para Começar
- Documentação completa
- Checklist detalhado
- Timeline definida
- Dependências mapeadas

---

**Última atualização:** 2026-01-27  
**Status:** ✅ Estratégia Completa - Pronto para Implementação






