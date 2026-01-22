# 🚀 SETUP SUPABASE - PASSO A PASSO

**Projeto:** ResenhApp  
**Data:** 2026-01-22  
**Status:** Em andamento

---

## ✅ PASSO 1: Projeto Criado

**Credenciais já obtidas:**
- ✅ Project URL: `https://ujrvfkkkssfdhwizjucq.supabase.co`
- ✅ Anon Key: `sb_publishable__qrQJ5NFYQU9Lc1QNPOJ1Q_z9mEOcEa`

---

## ⚠️ PASSO 2: Obter Service Role Key

**IMPORTANTE:** Esta chave é secreta e NUNCA deve ser exposta no frontend!

1. No Supabase Dashboard, vá em: **Project Settings** → **API**
2. Role para baixo até encontrar a seção **Project API keys**
3. Encontre a key com role `service_role`
4. Clique em **"Reveal"** (revelar)
5. **Copie a chave completa** (começa com `eyJ...`)

**Anote aqui (temporariamente):**
```
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## ⚠️ PASSO 3: Obter Database Connection String

1. No Supabase Dashboard, vá em: **Project Settings** → **Database**
2. Role para baixo até **Connection string**
3. Selecione a aba **URI**
4. **Copie a connection string** (formato: `postgresql://postgres:[PASSWORD]@db.ujrvfkkkssfdhwizjucq.supabase.co:5432/postgres`)
5. **Substitua `[PASSWORD]` pela senha do banco** (a que você definiu ao criar o projeto)

**Anote aqui (temporariamente):**
```
SUPABASE_DB_URL=postgresql://postgres:SUA_SENHA@db.ujrvfkkkssfdhwizjucq.supabase.co:5432/postgres
```

---

## 📝 PASSO 4: Criar arquivo .env.local

**No diretório raiz do projeto**, crie o arquivo `.env.local`:

```bash
# No terminal, na raiz do projeto:
touch .env.local
```

**Ou crie manualmente** o arquivo `.env.local` na raiz do projeto com este conteúdo:

```env
# ============================================
# SUPABASE CONFIGURATION
# ============================================

# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://ujrvfkkkssfdhwizjucq.supabase.co

# Supabase Anon/Public Key (seguro para usar no frontend com RLS)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable__qrQJ5NFYQU9Lc1QNPOJ1Q_z9mEOcEa

# Supabase Service Role Key (NUNCA expor no frontend! Apenas server-side)
# Cole aqui a service_role key que você copiou no Passo 2
SUPABASE_SERVICE_ROLE_KEY=cole_a_service_role_key_aqui

# Supabase Database Connection String (para CLI e migrations)
# Cole aqui a connection string do Passo 3 (com a senha substituída)
SUPABASE_DB_URL=postgresql://postgres:SUA_SENHA@db.ujrvfkkkssfdhwizjucq.supabase.co:5432/postgres

# ============================================
# FIREBASE (Push Notifications - configurar depois)
# ============================================
# NEXT_PUBLIC_FIREBASE_API_KEY=
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=
# NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
# NEXT_PUBLIC_FIREBASE_APP_ID=
# NEXT_PUBLIC_FIREBASE_VAPID_KEY=
# FIREBASE_ADMIN_PROJECT_ID=
# FIREBASE_ADMIN_CLIENT_EMAIL=
# FIREBASE_ADMIN_PRIVATE_KEY=

# ============================================
# CRON JOBS (Vercel - configurar depois)
# ============================================
# CRON_SECRET=
```

**⚠️ IMPORTANTE:**
- O arquivo `.env.local` já está no `.gitignore` (não será commitado)
- **NUNCA** commite este arquivo no Git!
- Substitua `cole_a_service_role_key_aqui` pela chave real
- Substitua `SUA_SENHA` pela senha do banco de dados

---

## ✅ PASSO 5: Verificar .env.local

Após criar o arquivo, verifique se está correto:

```bash
# Verificar se o arquivo existe
ls -la .env.local

# Verificar conteúdo (sem mostrar valores sensíveis)
cat .env.local | grep -E "^[A-Z_]+=" | cut -d'=' -f1
```

**Deve mostrar:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

---

## 🎯 PRÓXIMOS PASSOS

Após completar os passos acima:

1. **Instalar Supabase CLI** (Próximo passo)
2. **Aplicar migrations** (8 arquivos SQL)
3. **Configurar Storage buckets**
4. **Habilitar Realtime**

**Consulte:** [CHECKLIST-INICIO-V2.md](./CHECKLIST-INICIO-V2.md) - Seção "FASE 2: SETUP SUPABASE"

---

**Criado em:** 2026-01-22  
**Última atualização:** 2026-01-22T23:30

