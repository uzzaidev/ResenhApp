# 🚀 APLICAR MIGRATIONS SUPABASE - PASSO A PASSO

**Projeto:** ResenhApp  
**Data:** 2026-01-22  
**Status:** Pronto para executar

---

## ✅ PRÉ-REQUISITOS COMPLETOS

- [x] ✅ Projeto Supabase criado
- [x] ✅ Credenciais configuradas no Doppler
- [x] ✅ `.env local` configurado (fallback)
- [x] ✅ 8 migrations SQL prontas em `supabase/migrations/`

---

## 📦 PASSO 1: Instalar Supabase CLI

**Windows (PowerShell):**
```powershell
# Opção A: Via npm (recomendado)
npm install -g supabase

# Opção B: Via Chocolatey
choco install supabase

# Opção C: Via Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Verificar instalação:**
```bash
supabase --version
# Deve mostrar: supabase version X.X.X
```

---

## 🔐 PASSO 2: Login no Supabase

```bash
supabase login
```

Isso abrirá o navegador para autenticação. Faça login com sua conta Supabase.

**Verificar login:**
```bash
supabase projects list
# Deve listar seus projetos Supabase
```

---

## 🔗 PASSO 3: Inicializar Supabase no Projeto

**Na raiz do projeto:**
```bash
supabase init
```

Isso criará/atualizará a estrutura do Supabase no projeto.

**Verificar estrutura:**
```bash
# Deve existir a pasta supabase/ com:
# - supabase/config.toml
# - supabase/migrations/ (já existe com 8 arquivos)
```

---

## 🔗 PASSO 4: Linkar com Projeto Remoto

**Obter Project Reference ID:**
- No Supabase Dashboard → Project Settings → General
- Copie o **Reference ID** (ex: `ujrvfkkkssfdhwizjucq`)

**Linkar:**
```bash
supabase link --project-ref ujrvfkkkssfdhwizjucq
```

**Ou use o comando interativo:**
```bash
supabase link
# Selecione o projeto "ResenhApp" quando perguntado
```

**Verificar link:**
```bash
supabase status
# Deve mostrar informações do projeto linkado
```

---

## 📤 PASSO 5: Aplicar Migrations

**Opção A: Via CLI (RECOMENDADO - aplica todas de uma vez)**

```bash
# Aplicar todas as migrations
supabase db push

# Ou especificar migrations individuais
supabase migration up
```

**Verificar migrations aplicadas:**
```bash
supabase migration list
# Deve mostrar todas as 8 migrations com status "Applied"
```

**Opção B: Via Dashboard (Manual - se CLI não funcionar)**

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor**
3. Aplique cada migration **NA ORDEM**:

```
1. supabase/migrations/20260127000001_initial_schema.sql
2. supabase/migrations/20260127000002_auth_profiles.sql
3. supabase/migrations/20260127000003_groups_and_events.sql
4. supabase/migrations/20260127000004_rls_policies.sql
5. supabase/migrations/20260204000001_financial_system.sql
6. supabase/migrations/20260211000001_notifications.sql
7. supabase/migrations/20260218000001_analytics.sql
8. supabase/migrations/20260225000001_gamification.sql
```

Para cada uma:
- Copie todo o conteúdo do arquivo
- Cole no SQL Editor
- Clique em **Run**
- Verifique sucesso (mensagem verde)

---

## ✅ PASSO 6: Verificar Migrations Aplicadas

**No SQL Editor do Supabase Dashboard, execute:**

```sql
-- 1. Verificar tabelas criadas (deve retornar ~40 tabelas)
SELECT tablename 
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Verificar enums criados
SELECT t.typname AS enum_name, e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%_type'
ORDER BY t.typname, e.enumsortorder;

-- 4. Contar migrations aplicadas
SELECT COUNT(*) as total_migrations
FROM supabase_migrations.schema_migrations;
```

**Resultados esperados:**
- ✅ ~40 tabelas criadas
- ✅ RLS habilitado em todas as tabelas principais
- ✅ Enums criados (user_type, group_role, event_status, etc.)
- ✅ 8 migrations registradas

---

## 🌱 PASSO 7: Aplicar Seed Data (Opcional)

**Para desenvolvimento e testes:**

```bash
# Via CLI
supabase db execute --file supabase/seed.sql

# Ou via SQL Editor
# Copiar conteúdo de supabase/seed.sql e executar
```

**Seed data inclui:**
- 18 achievement types (conquistas padrão)
- 8 badges (distintivos visuais)
- 8 notification templates (templates de notificação)

---

## 🎯 CHECKLIST FINAL

- [ ] Supabase CLI instalado (`supabase --version`)
- [ ] Login realizado (`supabase login`)
- [ ] Projeto inicializado (`supabase init`)
- [ ] Link com projeto remoto (`supabase link`)
- [ ] 8 migrations aplicadas (`supabase db push`)
- [ ] Migrations verificadas (`supabase migration list`)
- [ ] Tabelas verificadas (SQL Editor)
- [ ] RLS habilitado (SQL Editor)
- [ ] Seed data aplicado (opcional)

---

## ⚠️ TROUBLESHOOTING

### Erro: "Project not found"
- Verifique se o Project Reference ID está correto
- Confirme que você tem acesso ao projeto no Supabase Dashboard

### Erro: "Migration already applied"
- Normal se você já aplicou manualmente
- Use `supabase migration list` para verificar status

### Erro: "Permission denied"
- Verifique se você está logado (`supabase login`)
- Confirme que tem permissões de admin no projeto

### Erro: "Connection refused"
- Verifique se `SUPABASE_DB_URL` está correto no Doppler/.env.local
- Confirme que a senha do banco está correta

---

## 📚 PRÓXIMOS PASSOS

Após aplicar as migrations:

1. **Configurar Storage Buckets** (Próximo passo)
2. **Habilitar Realtime** (Próximo passo)
3. **Configurar Auth Providers** (Próximo passo)
4. **Criar cliente Supabase no código** (Sprint 1)

**Consulte:** [CHECKLIST-INICIO-V2.md](./CHECKLIST-INICIO-V2.md) - Seção "FASE 2: SETUP SUPABASE"

---

**Criado em:** 2026-01-22  
**Última atualização:** 2026-01-22T23:50

