# 🔧 Fix: RLS Policy Bloqueando Signup

**Problema:** Erro 500 ao criar conta, erro vazio nos logs

---

## 🐛 PROBLEMA IDENTIFICADO

Quando conectamos diretamente ao PostgreSQL via `SUPABASE_DB_URL` (usando `@neondatabase/serverless`), **não há contexto de autenticação**. O RLS pode estar bloqueando a inserção porque:

1. A policy "Service role can insert users" pode estar verificando `auth.uid()`
2. Em conexão direta, `auth.uid()` não existe
3. RLS bloqueia a inserção

---

## ✅ SOLUÇÃO

Ajustar a policy para permitir inserções sem contexto de autenticação.

---

## 📋 PASSO A PASSO

### 1. Executar SQL no Supabase

1. **Acessar:** https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/sql/new

2. **Copiar e Colar:**

```sql
-- =====================================================
-- FIX: Ajustar Policy para Permitir Inserção via Conexão Direta
-- =====================================================

-- Remover policy existente
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- Criar nova policy que permite inserção sem autenticação
-- (necessário para conexão direta via SUPABASE_DB_URL)
CREATE POLICY "Allow inserts without auth context"
ON users FOR INSERT
WITH CHECK (true);

-- Verificar se foi criada
SELECT 
  policyname,
  cmd,
  with_check,
  '✅ Policy atualizada' AS status
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public'
AND cmd = 'INSERT';
```

3. **Executar:** Run (F5)

4. **Verificar:** Deve retornar 1 linha com a nova policy

---

### 2. Melhorar Logging de Erros (Opcional)

O código já foi atualizado para capturar melhor os erros. Após o próximo deploy, os logs terão mais detalhes.

---

## 🔍 VERIFICAÇÃO

### Verificar Policies Atuais

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public';
```

**Deve mostrar:**
- ✅ "Anyone can view users" (SELECT)
- ✅ "Allow inserts without auth context" (INSERT) ← NOVA
- ✅ "Users can update own profile" (UPDATE)

---

## 🎯 TESTAR NOVAMENTE

Após aplicar o fix:

1. Acessar: `https://resenhapp.uzzai.com.br/auth/signup`
2. Preencher formulário
3. Clicar em "Criar conta grátis"
4. **Deve funcionar agora!** ✅

---

## 📝 EXPLICAÇÃO TÉCNICA

### Por que isso acontece?

**Conexão via Supabase API:**
- Usa `@supabase/supabase-js`
- Tem contexto de autenticação (`auth.uid()`)
- RLS funciona normalmente

**Conexão direta ao PostgreSQL:**
- Usa `@neondatabase/serverless` + `SUPABASE_DB_URL`
- **Não tem contexto de autenticação**
- RLS precisa de policies que não dependem de `auth.uid()`

### Solução

A policy `WITH CHECK (true)` permite inserções **sem verificar autenticação**, o que é necessário para conexões diretas ao banco.

---

**Documento criado:** 2026-01-27

