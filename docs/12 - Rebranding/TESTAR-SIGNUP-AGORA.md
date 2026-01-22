# ✅ Testar Signup - Policies Configuradas

**Status:** Policies RLS verificadas e corretas ✅

---

## ✅ POLICIES VERIFICADAS

As 3 policies estão configuradas corretamente:

1. ✅ **"Anyone can view users"** (SELECT) - `qual: true`
2. ✅ **"Service role can insert users"** (INSERT) - `with_check: true`
3. ✅ **"Users can update own profile"** (UPDATE) - `qual: true`, `with_check: true`

---

## 🎯 TESTAR SIGNUP AGORA

### 1. Acessar Página de Signup

**URL:** `https://resenhapp.uzzai.com.br/auth/signup`

### 2. Preencher Formulário

- **Nome completo:** (ex: "João Silva")
- **Email:** (ex: "joao@example.com")
- **Senha:** (mínimo 6 caracteres)
- **Confirmar senha:** (mesma senha)

### 3. Clicar em "Criar conta grátis"

### 4. Resultado Esperado

✅ **Sucesso:**
- Redirecionamento para `/dashboard` ou `/auth/signin`
- Mensagem de sucesso
- Usuário criado no banco

❌ **Se ainda der erro:**
- Verificar logs do Vercel (próxima seção)
- Verificar se há mais detalhes no erro

---

## 🔍 SE AINDA DER ERRO

### 1. Verificar Logs do Vercel

1. Acessar: [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecionar projeto: `peladeiros-main` (ou nome do projeto)
3. Ir em: **Deployments** → Último deployment → **Functions**
4. Procurar por: `/api/auth/signup`
5. Ver erro completo (agora com mais detalhes após melhorias no código)

### 2. Verificar se Usuário Foi Criado

No Supabase SQL Editor:

```sql
-- Verificar se há usuários na tabela
SELECT 
  id,
  name,
  email,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

**Se aparecer o usuário:** O signup funcionou, mas pode ter erro no redirecionamento.

**Se não aparecer:** O erro está na inserção (verificar logs).

### 3. Testar Inserção Manual (Debug)

```sql
-- Testar inserção manual (substitua os valores)
INSERT INTO users (name, email, password_hash)
VALUES (
  'Test User',
  'test@example.com',
  '$2a$10$dummyhashfordebuggingpurposesonly'
)
RETURNING id, name, email;
```

**Se funcionar:** O problema está no código da API.

**Se não funcionar:** O problema está nas policies RLS.

---

## 📋 CHECKLIST DE DEBUG

- [ ] Policies RLS verificadas ✅
- [ ] Tabela `users` existe ✅
- [ ] Testar signup na página
- [ ] Se erro: verificar logs do Vercel
- [ ] Se erro: verificar se usuário foi criado no banco
- [ ] Se erro: testar inserção manual

---

## 🎉 PRÓXIMOS PASSOS

Após o signup funcionar:

1. ✅ Testar login
2. ✅ Criar primeiro grupo
3. ✅ Criar primeiro evento
4. ✅ Testar funcionalidades principais

---

**Documento criado:** 2026-01-27

