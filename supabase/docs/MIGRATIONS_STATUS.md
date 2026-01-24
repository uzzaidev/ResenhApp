# 📋 Status de Migrations - ResenhApp

> **Última atualização:** 27 de Fevereiro de 2026
> **Database:** Supabase PostgreSQL

## 🎯 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Tabelas em Produção** | 17 (16 app + 1 sistema) |
| **Arquivos SQL na pasta** | 19 arquivos |
| **Migrations Aplicadas** | 1 (reset completo v1.0.0) |
| **Migrations Pendentes** | 1 (soft_delete - opcional) |
| **Migrations Legado/Exemplo** | 17 arquivos (não aplicar) |

## ✅ **Database ATUAL (Supabase)**

### Tabelas em Produção: 17

**Aplicação (16 tabelas):**
1. users
2. groups
3. group_members
4. venues
5. events
6. event_attendance
7. teams
8. team_members
9. event_actions
10. player_ratings
11. invites
12. wallets
13. charges
14. draw_configs
15. event_settings
16. mv_event_scoreboard (materialized view)

**Sistema (1 tabela):**
17. spatial_ref_sys (PostGIS)

### Colunas: 126 total
### Foreign Keys: 27 relacionamentos
### Índices: 55

---

## 📁 Arquivos SQL na Pasta `src/db/migrations/`

Total: **19 arquivos**

### ✅ **Schema Principal (APLICADO)**

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `schema.sql` | ✅ APLICADO | Schema completo v1.0.0 (17 tabelas) |

**Este é o único arquivo que contém o schema completo atual.**

---

### 📝 **Migrations Incrementais (JÁ INCLUÍDAS NO SCHEMA.SQL)**

Estes arquivos eram migrations separadas, mas **já foram incorporadas** ao `schema.sql`:

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `001_add_position_preferences.sql` | ✅ Incluído | preferred_position, secondary_position |
| `002_fix_team_members_position.sql` | ✅ Incluído | CHECK constraint com 'line' |
| `add_self_removal_tracking.sql` | ✅ Incluído | removed_by_self_at column |
| `add-image-column.sql` | ✅ Incluído | image column em users |
| `20251101165158_create_draw_configs_table.sql` | ✅ Incluído | draw_configs table |
| `20251101165436_create_update_updated_at_function.sql` | ✅ Incluído | Trigger updated_at |
| `002_performance_indexes.sql` | ✅ Incluído | Índices principais |
| `add_mvp_tiebreaker.sql` | ✅ Incluído | Tags em player_ratings |

**⚠️ Não aplicar novamente** - Causaria erro "already exists"

---

### ⏸️ **Migration Opcional (DISPONÍVEL, NÃO APLICADA)**

| Arquivo | Status | Aplicar? |
|---------|--------|----------|
| `003_soft_delete.sql` | ⏸️ PENDENTE | Opcional - quando necessário |

**Descrição:** Adiciona colunas `deleted_at` para soft delete

**Tabelas afetadas:**
- groups
- group_members
- charges
- invites

**Quando aplicar:** Se precisar recuperar dados deletados

---

### 🗄️ **Arquivos Legado (NÃO APLICAR)**

Estes são do setup antigo (Neon/Stack Auth) e **NÃO devem ser aplicados**:

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `neon-setup.sql` | ❌ LEGADO | Setup antigo Neon |
| `neon-setup-fixed.sql` | ❌ LEGADO | Correção do Neon (obsoleto) |
| `setup-database.sql` | ❌ LEGADO | Setup antigo |
| `create-users-table.sql` | ❌ LEGADO | Já em schema.sql |
| `fix-users-table.sql` | ❌ LEGADO | Correção antiga |
| `check-table-structure.sql` | ℹ️ UTILITÁRIO | Apenas para debug |
| `verify-users.sql` | ℹ️ UTILITÁRIO | Apenas para verificação |
| `seed.sql` | ℹ️ OPCIONAL | Dados de teste |
| `00000000000000_example_add_phone_to_users.sql` | ℹ️ EXEMPLO | Template de migration |

**⚠️ IMPORTANTE:** Aplicar estes arquivos causaria conflitos e duplicações!

---

## 🔄 Histórico de Aplicação

### 2026-01-23 - Migration v1.0.0 (Schema Reset)

**Ação:** Reset completo + aplicação de `schema.sql`

**Comando executado:**
```bash
node supabase/scripts/reset-and-apply-schema.js
```

**Resultado:**
- ✅ 37 tabelas antigas removidas (Stack Auth legado)
- ✅ 17 tabelas novas criadas
- ✅ 126 colunas configuradas
- ✅ 27 foreign keys criadas
- ✅ 55 índices criados

**Arquivos incorporados no schema.sql:**
- Todos os 8 arquivos de migrations incrementais
- Todas as colunas necessárias
- Todos os índices e constraints

---

## 📊 Comparação: Arquivos vs. Realidade

| Aspecto | Valor |
|---------|-------|
| **Arquivos SQL na pasta** | 19 |
| **Schema principal** | 1 (`schema.sql`) |
| **Migrations incrementais** | 8 (já incluídas) |
| **Migration opcional** | 1 (`003_soft_delete.sql`) |
| **Arquivos legado/utilitário** | 9 |
| **Tabelas em produção** | 17 |

**Por que a confusão?**
- Se contar CREATE TABLE em TODOS os arquivos = ~40+ tabelas (duplicadas)
- Mas apenas `schema.sql` está aplicado = 17 tabelas únicas

---

## ✅ Checklist de Verificação

Para confirmar que o database está correto:

```bash
# 1. Executar auditoria
node supabase/scripts/full-database-audit.js

# 2. Verificar schema
node supabase/scripts/check-supabase-schema.js

# 3. Confirmar 17 tabelas
psql $DATABASE_URL -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
```

**Resultado esperado:**
- ✅ 17 tabelas
- ✅ 126 colunas
- ✅ 27 foreign keys
- ✅ 0 erros

---

## 🚨 Avisos Importantes

### ❌ **NÃO FAZER:**

1. **Não aplicar arquivos legado** (neon-setup.sql, create-users-table.sql, etc.)
   - Causará erros "already exists"
   - Pode corromper o schema

2. **Não aplicar migrations incrementais** (001_, 002_, add_*, etc.)
   - Já estão incluídas em schema.sql
   - Causará erros de duplicação

3. **Não fazer reset sem backup**
   - Sempre executar full-schema-backup.js primeiro

### ✅ **PODE FAZER:**

1. **Aplicar 003_soft_delete.sql** (se necessário)
   ```bash
   psql $DATABASE_URL < src/db/migrations/003_soft_delete.sql
   ```

2. **Executar seed.sql** (para dados de teste)
   ```bash
   psql $DATABASE_URL < src/db/migrations/seed.sql
   ```

3. **Usar check-table-structure.sql** (para debug)
   ```bash
   psql $DATABASE_URL < src/db/migrations/check-table-structure.sql
   ```

---

## ✅ Migrations V2.0 Aplicadas (2026-02-27)

### FASE 0: Preparação e Fundação

| Migration | Arquivo | Status | Data | Descrição |
|-----------|---------|--------|------|-----------|
| 1 | `20260227000001_sport_modalities.sql` | ✅ APLICADA | 2026-02-27 | Sistema de Modalidades Esportivas |
| 2 | `20260227000002_athlete_modalities.sql` | ✅ APLICADA | 2026-02-27 | Atletas por Modalidade (Many-to-Many) |
| 3 | `20260227000003_recurring_trainings.sql` | ✅ APLICADA | 2026-02-27 | Treinos Recorrentes |
| 4 | `20260227000004_game_convocations.sql` | ✅ APLICADA | 2026-02-27 | Jogos Oficiais e Convocações |
| 5 | `20260227000005_checkin_qrcodes.sql` | ✅ APLICADA | 2026-02-27 | Check-in via QR Code |
| 6 | `20260227000006_saved_tactics.sql` | ✅ APLICADA | 2026-02-27 | Táticas Salvas |
| 7 | `20260227000007_financial_by_training.sql` | ✅ APLICADA | 2026-02-27 | Financeiro por Treino |
| 8 | `20260227000008_hierarchy_and_credits.sql` | ✅ APLICADA | 2026-02-27 | Hierarquia e Sistema de Créditos |

### Resumo das Migrations V2.0

**Tabelas Criadas:** 9
- `sport_modalities`
- `athlete_modalities`
- `checkin_qrcodes`
- `checkins`
- `game_convocations`
- `convocation_responses`
- `saved_tactics`
- `credit_transactions`
- `credit_packages`

**Colunas Adicionadas:**
- `events`: `is_recurring`, `recurrence_pattern`, `event_type`, `parent_event_id`, `modality_id`
- `groups`: `parent_group_id`, `group_type`, `pix_code`, `credits_balance`, `credits_purchased`, `credits_consumed`
- `charges`: `event_id`

**Funções Criadas:** 26
- Ver seção "Documentação de Funções SQL" abaixo

**Views Criadas:** 2
- `v_training_payments`
- `v_training_payment_details`

**Foreign Keys:** 20+ relacionamentos criados

---

## 📈 Próximas Migrations Planejadas

### Q1 2026

**004_enable_rls.sql** (a criar)
- Prioridade: 🔴 ALTA
- Descrição: Habilitar Row Level Security
- Status: Planejado

**005_audit_trail.sql** (a criar)
- Prioridade: 🟡 MÉDIA
- Descrição: Adicionar updated_by, deleted_by
- Status: Planejado

---

## 📞 Suporte

**Se houver dúvida sobre qual arquivo aplicar:**

1. ✅ **Já foi aplicado:** `schema.sql` (contém tudo)
2. ⏸️ **Opcional:** `003_soft_delete.sql`
3. ❌ **Não aplicar:** Todos os outros (legado ou já incluídos)

**Para verificar estado atual:**
```bash
node supabase/scripts/full-database-audit.js
```

---

**Última verificação:** 23 de Janeiro de 2026, 19:05 UTC
**Versão do Schema:** 1.0.0
**Próxima migration:** 003_soft_delete.sql (opcional)
