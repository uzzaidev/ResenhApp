# 🔧 Fix: Erro "policy already exists"

**Erro:** `ERROR: 42710: policy "Anyone can view users" for table "users" already exists`

---

## 🐛 PROBLEMA

A migration está tentando criar policies que já existem. Isso acontece quando:
- A migration foi executada parcialmente antes
- As policies foram criadas manualmente
- A tabela já existe mas as policies também

---

## ✅ SOLUÇÃO

Usar `DROP POLICY IF EXISTS` antes de criar as policies.

---

## 📋 MIGRATION CORRIGIDA

**Arquivo:** `supabase/migrations/20260127000000_legacy_users_table_FIXED.sql`

**Mudança principal:**
```sql
-- ANTES (dava erro se já existisse):
CREATE POLICY "Anyone can view users" ...

-- DEPOIS (idempotente):
DROP POLICY IF EXISTS "Anyone can view users" ON users;
CREATE POLICY "Anyone can view users" ...
```

---

## 🚀 APLICAR MIGRATION CORRIGIDA

### Opção 1: Executar SQL Corrigido (Recomendado)

1. **Acessar:** https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/sql/new

2. **Copiar e Colar:**

```sql
-- =====================================================
-- Migration: Legacy Users Table - IDEMPOTENT
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  password_hash TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified) WHERE email_verified IS NOT NULL;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (IDEMPOTENT)
DROP POLICY IF EXISTS "Anyone can view users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create policies
CREATE POLICY "Anyone can view users"
ON users FOR SELECT
USING (true);

CREATE POLICY "Service role can insert users"
ON users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (true)
WITH CHECK (true);
```

3. **Executar:** Run (F5)

**Agora não dará erro mesmo se já existir!** ✅

---

### Opção 2: Apenas Dropar e Recriar Policies

Se a tabela já existe e só precisa ajustar as policies:

```sql
-- Dropar policies existentes
DROP POLICY IF EXISTS "Anyone can view users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Recriar policies
CREATE POLICY "Anyone can view users"
ON users FOR SELECT
USING (true);

CREATE POLICY "Service role can insert users"
ON users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (true)
WITH CHECK (true);
```

---

## ✅ VERIFICAÇÃO

### Verificar se Tudo Está OK

```sql
-- 1. Verificar se tabela existe
SELECT '✅ Tabela users existe' AS status
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'users'
);

-- 2. Verificar policies
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ Tem USING'
    ELSE '❌ Sem USING'
  END AS using_clause
FROM pg_policies
WHERE tablename = 'users';

-- 3. Testar inserção
INSERT INTO users (name, email, password_hash)
VALUES (
  'Test User',
  'test@example.com',
  '$2a$10$dummyhash'
)
RETURNING id, name, email;
```

**Resultado esperado:**
- ✅ Tabela existe
- ✅ 3 policies criadas
- ✅ Inserção funciona

---

## 🎯 PRÓXIMO PASSO

Após aplicar a migration corrigida:

1. ✅ Tabela `users` criada/verificada
2. ✅ Policies configuradas corretamente
3. ✅ Testar signup: `https://resenhapp.uzzai.com.br/auth/signup`

---

**Documento criado:** 2026-01-27

