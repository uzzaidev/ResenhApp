# 📁 Supabase - Database Documentation

> **ResenhApp (anteriormente Peladeiros)**
> Sistema de gerenciamento de peladas e grupos esportivos

## 📊 Status Atual do Database

- **Database:** PostgreSQL 15+ (Supabase)
- **Última Auditoria:** 23 de Janeiro de 2026, 19:05 UTC
- **Versão do Schema:** 1.0.0
- **Tabelas em Produção:** 17 (16 da aplicação + 1 sistema)
- **Arquivos SQL na pasta:** 19 (1 aplicado + 8 incluídos + 1 opcional + 9 legado)
- **Colunas:** 126 total
- **Relacionamentos:** 27 foreign keys
- **Índices:** 55 total
- **Saúde:** ✅ **100% Funcional**

⚠️ **Nota Importante:** Há 19 arquivos SQL em `src/db/migrations/`, mas apenas `schema.sql` está aplicado (contém as 17 tabelas). Ver [MIGRATIONS_STATUS.md](docs/MIGRATIONS_STATUS.md) para detalhes.

### ✅ Verificações de Saúde

| Item | Status | Detalhes |
|------|--------|----------|
| **Schema Integrity** | ✅ PASS | Todas as tabelas e colunas necessárias presentes |
| **Foreign Keys** | ✅ PASS | 27 relacionamentos configurados corretamente |
| **Primary Keys** | ✅ PASS | Todas as tabelas têm PK (UUID) |
| **Indexes** | ⚡ GOOD | 55 índices, 13 oportunidades de otimização |
| **Data Consistency** | ✅ PASS | Sem dados órfãos ou inconsistentes |
| **Performance** | ⚡ GOOD | Alguns FKs sem índice (não crítico) |

### ⚠️ Issues Identificados

- **0** Issues críticos 🎯
- **13** Issues de performance (FKs sem índice - baixa prioridade)
- **1** Warning (tabela spatial_ref_sys órfã - sistema PostGIS)

## 📚 Documentação

### Documentos Principais

1. **[SCHEMA.md](docs/SCHEMA.md)** - Schema completo com todas as 17 tabelas e 126 colunas
2. **[HEALTH_REPORT.md](docs/HEALTH_REPORT.md)** - Relatório detalhado de saúde (95/100)
3. **[MIGRATIONS_STATUS.md](docs/MIGRATIONS_STATUS.md)** - Status de cada arquivo SQL (aplicado/pendente/legado)
4. **[MIGRATION_HISTORY.md](MIGRATION_HISTORY.md)** - Histórico completo de migrations
5. **[migrations/README.md](migrations/README.md)** - Migrations V2.0 planejadas
6. **[database-audit-*.json](docs/)** - Auditorias completas em JSON

### Scripts Úteis

- `scripts/full-database-audit.js` - Auditoria completa do database
- `scripts/check-supabase-schema.js` - Verificar se schema está correto
- `scripts/reset-and-apply-schema.js` - Reset completo (USE COM CUIDADO)
- `scripts/apply-missing-columns.js` - Aplicar colunas faltantes
- `scripts/full-schema-backup.js` - Backup completo do schema
- `scripts/test-db-connection.js` - Testar conexão com database

## 🗂️ Estrutura de Pastas

```
supabase/
├── README.md                    # Este arquivo
├── MIGRATION_HISTORY.md         # Histórico de migrations
├── docs/                        # Documentação
│   ├── SCHEMA.md               # Schema completo
│   ├── HEALTH_REPORT.md        # Relatório de saúde
│   ├── MIGRATIONS_STATUS.md    # Status de migrations
│   └── database-audit-*.json   # Auditorias (geradas automaticamente)
├── scripts/                     # Scripts de manutenção
│   ├── full-database-audit.js  # Auditoria completa
│   ├── check-supabase-schema.js # Verificação
│   ├── reset-and-apply-schema.js # Reset completo
│   ├── apply-missing-columns.js  # Colunas faltantes
│   ├── full-schema-backup.js    # Backup completo
│   └── test-db-connection.js    # Testar conexão
└── migrations/                  # SQL migrations V2.0 (planejadas)
    ├── 20260127000001_initial_schema.sql
    ├── 20260127000002_auth_profiles.sql
    ├── 20260127000003_groups_and_events.sql
    ├── 20260127000004_rls_policies.sql
    ├── 20260204000001_financial_system.sql
    ├── 20260211000001_notifications.sql
    ├── 20260218000001_analytics.sql
    ├── 20260225000001_gamification.sql
    └── README.md                # Documentação V2.0

# Schema V1.0 (em produção)
src/db/migrations/
└── schema.sql                   # Schema completo aplicado (17 tabelas)
```

## 🚀 Quick Start

### Setup Inicial

1. **Criar projeto no Supabase**
   ```bash
   # Via Supabase Dashboard
   # Obter connection string do Shared Pooler (IPv4 compatible)
   ```

2. **Configurar variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   # Editar .env.local com suas credenciais
   ```

3. **Aplicar schema**
   ```bash
   # Via SQL Editor do Supabase:
   # Copiar e executar: src/db/migrations/schema.sql

   # Ou via script:
   node supabase/scripts/reset-and-apply-schema.js
   ```

4. **Verificar instalação**
   ```bash
   node supabase/scripts/check-supabase-schema.js
   ```

### Verificação de Saúde

```bash
# Executar auditoria completa
node supabase/scripts/full-database-audit.js

# Verificar relatório gerado
cat supabase/docs/database-audit-*.json
```

## 📈 Plano de Expansão e Rebranding

### ✅ Preparação para Rebranding

O database está **100% pronto** para o rebranding de "Peladeiros" para "ResenhApp":

**Razões:**

1. ✅ **Nomes neutros:** Tabelas e colunas usam nomes genéricos (`groups`, `events`, `users`)
2. ✅ **Schema desacoplado:** Nenhuma referência a "Peladeiros" no schema
3. ✅ **Flexível:** Suporta qualquer tipo de esporte via campos configuráveis
4. ✅ **Escalável:** UUID keys permitem sharding futuro
5. ✅ **Extensível:** Estrutura JSONB para metadata customizada

**Impacto do Rebranding no Database:** 🎯 **ZERO**

### 🔮 Recursos para Expansão Futura

O schema atual já suporta (ou está preparado para):

- ✅ **Multi-esporte:** Campo `sport_modality` em grupos (se adicionado)
- ✅ **Gamificação:** Tabelas de ratings, actions, e stats
- ✅ **Financeiro:** Wallets, charges completos
- ✅ **Social:** Invites, member roles, grupos públicos/privados
- ✅ **Analytics:** Materialized views para stats em tempo real
- ✅ **Escalabilidade:** UUID keys, índices otimizados

**Próximas Expansões Planejadas:**

1. **Notificações** - Tabela de push tokens e preferences
2. **Achievements** - Sistema de conquistas e badges
3. **Challenges** - Desafios entre grupos
4. **Rankings** - Leaderboards regionais/globais
5. **Pagamentos** - Integração com PIX/cartão

## 🔮 Migrations V2.0 (Planejadas)

O projeto possui migrations V2.0 planejadas em `supabase/migrations/`:

### Status Atual

- **Versão em Produção:** V1.0.0 (17 tabelas)
- **Versão Planejada:** V2.0.0-SUPABASE (40+ tabelas)
- **Status das Migrations V2.0:** ⏸️ Ainda não aplicadas

### Migrations V2.0 Disponíveis

| # | Migration | Descrição | Tabelas |
|---|-----------|-----------|---------|
| 1 | `20260127000001_initial_schema.sql` | Extensions + Enums | Extensions, Enums |
| 2 | `20260127000002_auth_profiles.sql` | Auth & User Types | profiles, user_roles |
| 3 | `20260127000003_groups_and_events.sql` | Core System | 10 tabelas core |
| 4 | `20260127000004_rls_policies.sql` | Row Level Security | RLS policies |
| 5 | `20260204000001_financial_system.sql` | Financeiro + Pix | 6 tabelas |
| 6 | `20260211000001_notifications.sql` | Notificações | 5 tabelas |
| 7 | `20260218000001_analytics.sql` | Analytics + Stats | 5 tabelas |
| 8 | `20260225000001_gamification.sql` | Gamificação | 7 tabelas |

### Recursos Adicionais V2.0

- ✅ **Row Level Security (RLS)** - Segurança em nível de linha
- ✅ **Sistema de Notificações** - Push, email, in-app
- ✅ **Analytics Completo** - Stats, leaderboards, activity logs
- ✅ **Gamificação** - Achievements, badges, challenges
- ✅ **Sistema Financeiro Avançado** - Wallets, charges, PIX

### Como Aplicar V2.0

⚠️ **IMPORTANTE:** Estas migrations ainda não foram aplicadas em produção.

Para aplicar (quando decidido):

1. Fazer backup completo:
   ```bash
   node supabase/scripts/full-schema-backup.js
   ```

2. Aplicar migrations em ordem:
   ```bash
   # Via Supabase CLI
   supabase db push
   
   # Ou manualmente via SQL Editor
   ```

3. Verificar aplicação:
   ```bash
   node supabase/scripts/check-supabase-schema.js
   ```

**Documentação Completa:** Ver [migrations/README.md](migrations/README.md)

## 🔐 Segurança

### Row Level Security (RLS)

**Status:** ⏸️ Planejado em V2.0 (não aplicado ainda)

**Plano:**
- [ ] Habilitar RLS em todas as tabelas (migration `20260127000004_rls_policies.sql`)
- [ ] Políticas para users acessarem apenas seus dados
- [ ] Políticas para group_members acessarem dados do grupo
- [ ] Políticas para admins gerenciarem grupos

**Nota:** RLS está implementado nas migrations V2.0, mas ainda não aplicado em produção.

### Backups

**Recomendação:**
- ✅ Supabase faz backups automáticos diários
- ✅ Usar `full-database-audit.js` antes de mudanças grandes
- ✅ Exportar schema via SQL Editor regularmente

## 📞 Suporte

Para questões sobre o database:

1. **Verificar documentação:** `supabase/docs/`
2. **Executar auditoria:** `node supabase/scripts/full-database-audit.js`
3. **Ver logs do Supabase:** Dashboard → Logs
4. **Verificar migrations:** `supabase/MIGRATION_HISTORY.md` ou `supabase/docs/MIGRATIONS_STATUS.md`

## 📝 Changelog

### 2026-01-23 - Schema Reset & Migrations

- ✅ Reset completo do database (migração Stack Auth → Supabase)
- ✅ Aplicação do schema correto
- ✅ Adição de `removed_by_self_at` column
- ✅ Correção de loop infinito em PendingPaymentsCard
- ✅ Criação de documentação completa
- ✅ Auditoria e relatório de saúde

### Histórico Anterior

Ver [MIGRATION_HISTORY.md](MIGRATION_HISTORY.md) para histórico completo.

---

**Última atualização:** 23 de Janeiro de 2026
**Versão do Schema:** 1.0.0
**Database:** PostgreSQL 15+ (Supabase)
**Status:** ✅ Production Ready
