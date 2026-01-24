# ⚡ Ação Imediata: Resolver Erro de Signup

**Baseado nos logs do Vercel: 3 erros 500 em `/api/auth/signup`**

---

## 🎯 PROBLEMA IDENTIFICADO

**Logs mostram:**
- ✅ Requisição chega na API
- ✅ API tenta criar usuário
- ❌ Falha com erro 500
- ❌ Mensagem: "Erro ao criar usuário"
- ⚠️ Campo `error: {}` vazio (erro não capturado)

**Causa mais provável:** Tabela `users` não existe no Supabase

---

## ✅ SOLUÇÃO RÁPIDA (3 minutos)

### PASSO 1: Aplicar Migration no Supabase

1. **Acessar SQL Editor:**
   - https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/sql/new

2. **Copiar e Colar este SQL:**

```sql
-- =====================================================
-- Migration: Legacy Users Table (for NextAuth compatibility)
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

3. **Executar:**
   - Clicar em **Run** (ou F5)
   - Aguardar "Success"

---

### PASSO 2: Verificar se Funcionou

**Executar no SQL Editor:**

```sql
-- Verificar se tabela existe
SELECT '✅ Tabela users criada!' AS status
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'users'
);
```

**Se retornar:** `✅ Tabela users criada!` → **Sucesso!**

---

### PASSO 3: Testar Signup Novamente

1. Acessar: `https://resenhapp.uzzai.com.br/auth/signup`
2. Preencher formulário
3. Clicar em "Criar conta grátis"
4. **Deve funcionar agora!** ✅

---

## 🔍 SE AINDA NÃO FUNCIONAR

### Verificar Logs Melhorados

Após o próximo deploy (automático), os logs terão mais detalhes:

1. Acessar: Vercel → Deployments → Último deployment → Functions
2. Procurar por `/api/auth/signup`
3. Ver erro completo com:
   - Nome do erro
   - Mensagem
   - Stack trace
   - Código SQL (se for erro de banco)

### Executar Script de Diagnóstico

1. Executar: `supabase/debug_signup.sql`
2. Verificar cada seção
3. Compartilhar resultados

---

## 📋 CHECKLIST

- [ ] Migration aplicada no Supabase
- [ ] Tabela `users` verificada (existe)
- [ ] RLS policies verificadas (3 policies)
- [ ] Signup testado novamente
- [ ] Se ainda falhar: verificar logs melhorados

---

## ⚠️ IMPORTANTE

**A migration foi melhorada:**
- ✅ Logging de erros melhorado (commit enviado)
- ✅ Próximo deploy terá logs mais detalhados
- ✅ Isso ajudará a identificar problemas futuros

**Mas o problema principal é:**
- ❌ Tabela `users` provavelmente não existe
- ✅ Aplicar migration resolve

---

**Documento criado:** 2026-01-27

