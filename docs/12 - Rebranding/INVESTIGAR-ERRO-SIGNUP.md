# 🔍 Investigação: Erro ao Criar Conta

**Estratégia sistemática para identificar o problema**

---

## 🎯 OBJETIVO

Identificar exatamente por que o signup está falhando com "Erro ao criar conta. Tente novamente."

---

## 📋 CHECKLIST DE INVESTIGAÇÃO

### 1. Verificar Logs do Vercel (PRIORIDADE ALTA)

**Onde:**
- https://vercel.com/dashboard → Projeto → Deployments → Último deployment → Functions

**O que procurar:**
- Erros relacionados a `users` table
- Erros de RLS (Row Level Security)
- Erros de conexão com banco
- Stack trace completo

**Como:**
1. Acessar último deployment
2. Clicar em "Functions"
3. Procurar por `/api/auth/signup`
4. Ver logs de erro

---

### 2. Verificar se Tabela `users` Existe

**No Supabase SQL Editor:**

```sql
-- Verificar se tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- Se não existir, retornará vazio
-- Se existir, retornará: users
```

**Se não existir:**
- Aplicar migration: `supabase/migrations/20260127000000_legacy_users_table.sql`

---

### 3. Verificar Estrutura da Tabela `users`

```sql
-- Ver estrutura completa
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Verificar se tem:**
- ✅ `id` (UUID)
- ✅ `name` (VARCHAR)
- ✅ `email` (VARCHAR, UNIQUE)
- ✅ `password_hash` (TEXT)
- ✅ `created_at` (TIMESTAMPTZ)

---

### 4. Verificar RLS Policies

```sql
-- Ver todas as políticas RLS da tabela users
SELECT 
  policyname,
  cmd, -- SELECT, INSERT, UPDATE, DELETE
  qual, -- USING clause
  with_check -- WITH CHECK clause
FROM pg_policies
WHERE tablename = 'users';
```

**Verificar se tem:**
- ✅ Policy para SELECT (qualquer um pode ler)
- ✅ Policy para INSERT (API pode inserir)
- ✅ Policy para UPDATE (usuários podem atualizar)

**Se não tiver INSERT policy:**
- A migration não foi aplicada corretamente

---

### 5. Testar Inserção Manual

**No Supabase SQL Editor (usando Service Role):**

```sql
-- Testar inserção direta (simula o que a API faz)
INSERT INTO users (name, email, password_hash)
VALUES (
  'Test User',
  'test@example.com',
  '$2a$10$dummyhashhere'
)
RETURNING id, name, email;
```

**Resultados possíveis:**
- ✅ **Sucesso:** Tabela existe e RLS permite inserção
- ❌ **Erro "relation does not exist":** Tabela não existe
- ❌ **Erro RLS:** Política bloqueando inserção
- ❌ **Erro constraint:** Problema com dados

---

### 6. Verificar Conexão com Banco

**No código da API (`src/app/api/auth/signup/route.ts`):**

O código usa `sql` do `@/db/client`. Verificar:

1. **Variável de ambiente:**
   ```env
   SUPABASE_DB_URL=postgresql://postgres:senha@db.ujrvfkkkssfdhwizjucq.supabase.co:5432/postgres
   ```

2. **Testar conexão:**
   ```sql
   -- No Supabase SQL Editor
   SELECT version();
   ```

---

### 7. Verificar Logs da API (Local)

**Adicionar logs temporários no código:**

```typescript
// src/app/api/auth/signup/route.ts
export async function POST(request: NextRequest) {
  try {
    console.log('=== SIGNUP DEBUG ===');
    console.log('1. Request recebido');
    
    const body = await request.json();
    console.log('2. Body:', body);
    
    // ... resto do código
    
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;
    console.log('3. Existing user check:', existingUser);
    
    // ... resto do código
    
    const newUser = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email.toLowerCase()}, ${passwordHash})
      RETURNING id, name, email
    `;
    console.log('4. New user created:', newUser);
    
  } catch (error) {
    console.error('=== SIGNUP ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    // ... resto do código
  }
}
```

**Ver logs:**
- Local: Terminal onde roda `pnpm run dev`
- Vercel: Functions logs

---

### 8. Testar Endpoint Diretamente

**Via curl ou Postman:**

```bash
curl -X POST https://resenhapp.uzzai.com.br/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "senha123"
  }'
```

**Verificar resposta:**
- Status code
- Mensagem de erro
- Stack trace (se houver)

---

### 9. Verificar Variáveis de Ambiente no Vercel

**No Vercel Dashboard:**
- Settings → Environment Variables

**Verificar se tem:**
- ✅ `SUPABASE_DB_URL` (com senha correta)
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `AUTH_SECRET`

**Testar conexão:**
- Se `SUPABASE_DB_URL` estiver errado, não consegue conectar

---

### 10. Verificar Erros Específicos

#### Erro: "relation 'users' does not exist"
**Causa:** Tabela não existe
**Solução:** Aplicar migration

#### Erro: "permission denied for table users"
**Causa:** RLS bloqueando
**Solução:** Verificar/ajustar policies

#### Erro: "duplicate key value violates unique constraint"
**Causa:** Email já existe
**Solução:** Usar email diferente ou verificar se usuário já existe

#### Erro: "connection refused" ou "timeout"
**Causa:** `SUPABASE_DB_URL` incorreto
**Solução:** Verificar variável de ambiente

---

## 🔧 FERRAMENTAS DE DEBUG

### Script SQL de Diagnóstico

```sql
-- =====================================================
-- DIAGNÓSTICO COMPLETO - Tabela Users
-- =====================================================

-- 1. Verificar se tabela existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    ) 
    THEN '✅ Tabela users EXISTE'
    ELSE '❌ Tabela users NÃO EXISTE'
  END AS tabela_status;

-- 2. Verificar estrutura
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. Verificar RLS
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'users' 
      AND rowsecurity = true
    )
    THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS DESABILITADO'
  END AS rls_status;

-- 4. Verificar policies
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ Tem USING'
    ELSE '❌ Sem USING'
  END AS using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ Tem WITH CHECK'
    ELSE '❌ Sem WITH CHECK'
  END AS with_check_clause
FROM pg_policies
WHERE tablename = 'users';

-- 5. Contar usuários existentes
SELECT COUNT(*) as total_usuarios FROM users;

-- 6. Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'users';
```

---

## 📊 ORDEM DE PRIORIDADE

1. **🔥 URGENTE:** Verificar logs do Vercel
2. **🔥 URGENTE:** Verificar se tabela `users` existe
3. **⚡ IMPORTANTE:** Verificar RLS policies
4. **⚡ IMPORTANTE:** Testar inserção manual
5. **📋 ÚTIL:** Verificar variáveis de ambiente
6. **📋 ÚTIL:** Adicionar logs de debug

---

## ✅ RESULTADO ESPERADO

Após investigação, você deve saber:
- ✅ Se a tabela existe
- ✅ Se RLS está configurado corretamente
- ✅ Qual é o erro exato (dos logs)
- ✅ Onde está o problema (banco, API, ou RLS)

---

**Documento criado:** 2026-01-27

