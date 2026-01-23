# Schema Setup - ResenhApp

Este documento descreve como configurar o banco de dados do zero.

## Setup Inicial

### 1. Criar Database no Supabase

1. Criar novo projeto no Supabase
2. Obter connection string do **Shared Pooler** (IPv4 compatible)
3. Formato: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-X-REGION.pooler.supabase.com:6543/postgres`

### 2. Aplicar Schema Principal

O arquivo `src/db/migrations/schema.sql` contém o schema completo e atualizado.

**Via SQL Editor do Supabase:**
- Copie todo o conteúdo de `src/db/migrations/schema.sql`
- Cole no SQL Editor do Supabase
- Execute

**Via script Node.js:**
```bash
node reset-and-apply-schema.js
```

### 3. Variáveis de Ambiente

**.env.local (desenvolvimento):**
```bash
SUPABASE_DB_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-X-REGION.pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON-KEY]
AUTH_SECRET=[GENERATE-WITH: openssl rand -base64 32]
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

**Vercel (produção):**
- Adicione as mesmas variáveis em Project Settings → Environment Variables
- Marque para aplicar em Production, Preview e Development

## Schema Atual

### Tabelas Criadas (16 tabelas)

1. **users** - Usuários do sistema
2. **groups** - Grupos de peladas
3. **group_members** - Membros dos grupos com roles
4. **venues** - Locais/quadras
5. **events** - Eventos/peladas
6. **event_attendance** - RSVP e presença
7. **teams** - Times sorteados
8. **team_members** - Jogadores em cada time
9. **event_actions** - Ações do jogo (gols, assists, etc)
10. **player_ratings** - Avaliações pós-jogo
11. **invites** - Códigos de convite
12. **wallets** - Carteiras (grupos e usuários)
13. **charges** - Cobranças
14. **draw_configs** - Configurações de sorteio
15. **event_settings** - Configurações de eventos
16. **mv_event_scoreboard** - Materialized view para placar

### Colunas Importantes

#### event_attendance
- `removed_by_self_at` - Timestamp de auto-remoção (quando usuário sai depois de confirmar)
- `preferred_position` - Posição preferida do jogador
- `secondary_position` - Posição alternativa
- `checked_in_at` - Timestamp do check-in
- `order_of_arrival` - Ordem de chegada

#### groups
- Usa UUID (não `bigint`)
- **NÃO** tem coluna `code`
- Tem `photo_url` (não `logo_url`)

#### events
- Usa UUID (não `bigint`)
- **NÃO** tem coluna `code`
- Tem `starts_at` (timestamp único, não `date` + `time` separados)

#### charges
- Usa UUID (não `bigint`)
- Tem `user_id` (obrigatório)
- Tem `amount_cents` (não `amount`)

## Migrations Adicionais (Opcionais)

Estas migrations são opcionais e podem ser aplicadas conforme necessário:

### Soft Delete (003_soft_delete.sql)
Adiciona suporte para soft delete em groups, group_members, charges e invites.

```bash
# Aplicar se quiser soft delete
psql $SUPABASE_DB_URL < src/db/migrations/003_soft_delete.sql
```

## Troubleshooting

### Erro: "column X does not exist"

Se você ver erros de coluna não existindo:

1. Verifique se o schema.sql está atualizado
2. Execute o script de verificação:
```bash
node check-supabase-schema.js
```

### Erro: "null value in column X violates not-null constraint"

Se ver erros de NOT NULL:

1. Verifique se o código está inserindo todas as colunas obrigatórias
2. Compare o schema local com o schema no Supabase

### Reset Completo

Se precisar resetar e recriar tudo do zero:

```bash
# Faz backup completo antes
node full-schema-backup.js

# Reseta e aplica schema correto
node reset-and-apply-schema.js
```

## Verificação Pós-Setup

Após aplicar o schema, verifique:

1. ✅ 16 tabelas criadas
2. ✅ `event_attendance` tem 12 colunas incluindo `removed_by_self_at`
3. ✅ `groups` usa UUID e tem `photo_url`
4. ✅ `events` usa UUID e tem `starts_at`
5. ✅ `charges` tem `user_id` e `amount_cents`

```bash
# Verificar estrutura
node check-supabase-schema.js
```

## Schema Evolution

### Histórico de Mudanças

**2026-01-23:**
- ✅ Migração de Neon para Supabase
- ✅ Reset completo do schema antigo (Stack Auth)
- ✅ Aplicação do schema correto (Neon-compatible)
- ✅ Adição de `removed_by_self_at` em `event_attendance`
- ✅ Correção de loop infinito em `PendingPaymentsCard`

### Migrations Aplicadas

1. `schema.sql` - Schema base completo (APLICADO)
2. `add_self_removal_tracking.sql` - Coluna `removed_by_self_at` (APLICADO)

## Próximos Passos

Para novas instalações:
1. Executar apenas `schema.sql` (já inclui todas as colunas necessárias)
2. Configurar variáveis de ambiente
3. Testar criação de usuário, grupo e evento

Para ambientes existentes:
1. Fazer backup com `full-schema-backup.js`
2. Aplicar migrations faltantes conforme necessário
3. Verificar com `check-supabase-schema.js`
