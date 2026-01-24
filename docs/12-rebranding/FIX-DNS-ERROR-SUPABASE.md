# 🔧 Fix: Erro DNS ENOTFOUND - Supabase Connection

**Erro:** `getaddrinfo ENOTFOUND db.ujrvfkkkssfdhwizjucq.supabase.co`

---

## 🐛 PROBLEMA

O Vercel não consegue resolver o DNS do hostname do Supabase. Isso significa:

1. ❌ A variável `SUPABASE_DB_URL` pode estar incorreta no Vercel
2. ❌ O formato da connection string pode estar errado
3. ❌ Pode estar usando hostname incorreto

---

## ✅ SOLUÇÃO

### 1. Verificar Connection String no Supabase

1. **Acessar:** https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/settings/database

2. **Ir em:** "Connection string" → Aba "URI"

3. **Copiar a connection string completa:**
   - Formato: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - **OU** formato direto: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

4. **Verificar qual formato está disponível:**
   - **Pooler (recomendado):** `*.pooler.supabase.com:6543`
   - **Direto:** `db.*.supabase.co:5432`

---

### 2. Formato Correto da Connection String

**Opção A: Pooler (RECOMENDADO para Vercel)**
```
postgresql://postgres.ujrvfkkkssfdhwizjucq:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

**Opção B: Conexão Direta**
```
postgresql://postgres:[SENHA]@db.ujrvfkkkssfdhwizjucq.supabase.co:5432/postgres
```

**⚠️ IMPORTANTE:**
- Substitua `[SENHA]` pela senha do banco de dados
- Use o **Pooler** (porta 6543) para melhor performance no Vercel
- O Pooler suporta mais conexões simultâneas

---

### 3. Atualizar Variável no Vercel

1. **Acessar:** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Selecionar projeto:** `peladeiros-main` (ou nome do projeto)
3. **Ir em:** Settings → Environment Variables
4. **Procurar por:** `SUPABASE_DB_URL`
5. **Editar ou Criar:**
   - **Key:** `SUPABASE_DB_URL`
   - **Value:** Connection string completa (com senha)
   - **Environment:** Production, Preview, Development (marcar todos)
   - **Type:** Plaintext (ou Secret, se preferir)

6. **Salvar**

7. **Fazer novo deploy** (ou aguardar redeploy automático)

---

### 4. Verificar Variável no Vercel

Após atualizar, verificar se está correta:

1. **No Vercel Dashboard:**
   - Settings → Environment Variables
   - Verificar se `SUPABASE_DB_URL` está listada
   - Verificar se o valor começa com `postgresql://`

2. **Testar localmente (opcional):**
   ```bash
   # Verificar se a variável está no .env.local
   cat .env.local | grep SUPABASE_DB_URL
   ```

---

## 🔍 VERIFICAÇÃO ADICIONAL

### Verificar se o Hostname Está Correto

No Supabase Dashboard:
1. **Project Settings** → **Database**
2. **Connection string** → Verificar o hostname exato
3. **Copiar exatamente como aparece**

### Possíveis Problemas

1. **Hostname incorreto:**
   - ❌ `db.ujrvfkkkssfdhwizjucq.supabase.co` (pode estar errado)
   - ✅ Verificar no Supabase qual é o correto

2. **Porta incorreta:**
   - ❌ Porta 5432 (pode não funcionar no Vercel)
   - ✅ Porta 6543 (pooler - recomendado)

3. **Formato incorreto:**
   - ❌ `postgresql://postgres:senha@hostname:port/db`
   - ✅ Verificar se tem `postgres.` antes do project-ref no pooler

---

## 📋 CHECKLIST

- [ ] Acessar Supabase Dashboard → Database → Connection string
- [ ] Copiar connection string completa (com senha)
- [ ] Verificar se usa pooler (porta 6543) ou direto (5432)
- [ ] Atualizar `SUPABASE_DB_URL` no Vercel
- [ ] Verificar se variável está salva corretamente
- [ ] Aguardar novo deploy (ou fazer deploy manual)
- [ ] Testar signup novamente

---

## 🎯 PRÓXIMO PASSO

Após atualizar a variável no Vercel:

1. ✅ Aguardar novo deploy (ou fazer deploy manual)
2. ✅ Testar signup: `https://resenhapp.uzzai.com.br/auth/signup`
3. ✅ Deve funcionar agora! 🎉

---

## 💡 DICA

**Use o Pooler (porta 6543) sempre que possível:**
- ✅ Melhor performance
- ✅ Suporta mais conexões
- ✅ Otimizado para serverless (Vercel)

---

**Documento criado:** 2026-01-27

