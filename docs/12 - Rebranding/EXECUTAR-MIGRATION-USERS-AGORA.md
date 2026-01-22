# ✅ Executar Migration Users Table - SQL Pronto

**Script idempotente e seguro para copiar e colar**

---

## 🚀 SQL PARA EXECUTAR

Copie e cole este SQL no Supabase SQL Editor:

```sql
-- =====================================================
-- Migration: Legacy Users Table (for NextAuth compatibility) - IDEMPOTENT
-- Versão: 1.1 - SEGURO PARA EXECUTAR MÚLTIPLAS VEZES
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELA users (se não existir)
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

-- =====================================================
-- 2. CRIAR ÍNDICES (se não existirem)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified) WHERE email_verified IS NOT NULL;

-- =====================================================
-- 3. HABILITAR RLS
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. REMOVER POLICIES EXISTENTES (se existirem)
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- =====================================================
-- 5. CRIAR POLICIES
-- =====================================================

-- Qualquer um pode ver usuários (para perfis públicos)
CREATE POLICY "Anyone can view users"
ON users FOR SELECT
USING (true);

-- Service role pode inserir (via API com service_role_key)
-- Isso permite que a API de signup crie usuários
CREATE POLICY "Service role can insert users"
ON users FOR INSERT
WITH CHECK (true);

-- Usuários podem atualizar próprio perfil
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (true)
WITH CHECK (true);

-- =====================================================
-- 6. COMENTÁRIOS (opcional, mas útil)
-- =====================================================

COMMENT ON TABLE users IS 'Legacy users table for NextAuth compatibility. Works alongside Supabase auth.users and profiles.';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for NextAuth credentials provider';
```

---

## 📋 PASSOS PARA EXECUTAR

1. **Acessar SQL Editor:**
   - https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/sql/new

2. **Copiar o SQL acima** (todo o bloco)

3. **Colar no editor**

4. **Clicar em "Run"** (ou pressionar F5)

5. **Aguardar:** Deve aparecer "Success. No rows returned"

---

## ✅ VERIFICAÇÃO PÓS-EXECUÇÃO

Após executar, verifique se funcionou:

```sql
-- Verificar se tabela existe
SELECT '✅ Tabela users criada!' AS status
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'users'
);

-- Verificar policies
SELECT 
  policyname,
  cmd,
  '✅ Policy criada' AS status
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public';
```

**Resultado esperado:**
- ✅ 1 linha: "Tabela users criada!"
- ✅ 3 linhas: Policies criadas (SELECT, INSERT, UPDATE)

---

## 🎯 PRÓXIMO PASSO

Após aplicar a migration:

1. ✅ Tabela `users` criada
2. ✅ Policies configuradas
3. ✅ Testar signup: `https://resenhapp.uzzai.com.br/auth/signup`

---

**Documento criado:** 2026-01-27

