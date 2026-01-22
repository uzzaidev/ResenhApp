# 🔧 Fix: Erro AUTH_SECRET no Vercel

**Erro:** `AUTH_SECRET não está configurado. A aplicação não pode iniciar sem esta variável de ambiente.`

---

## 🐛 PROBLEMA

O build no Vercel está falhando porque a variável `AUTH_SECRET` não está configurada nas variáveis de ambiente do Vercel.

---

## ✅ SOLUÇÃO RÁPIDA (2 minutos)

### 1. Acessar Vercel Dashboard

1. Ir em: https://vercel.com/dashboard
2. Selecionar o projeto **ResenhApp**
3. Ir em: **Settings** → **Environment Variables**

### 2. Adicionar AUTH_SECRET

**Clicar em "Add New" e preencher:**

- **Key:** `AUTH_SECRET`
- **Value:** `cItJZ6cHanb3d+V4WKSq+NDGo3aCXVTzQvxKrZ51tvg=`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **⚠️ Marcar como "Encrypted" (Secret)**
- **Save**

### 3. Adicionar NEXTAUTH_URL (se não tiver)

**Clicar em "Add New" e preencher:**

- **Key:** `NEXTAUTH_URL`
- **Value (Production):** `https://resenhapp.uzzai.com.br`
- **Value (Preview):** `https://seu-projeto-*.vercel.app` (ou deixar vazio)
- **Value (Development):** `http://localhost:3000`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **Save**

### 4. Fazer Redeploy

1. Ir em: **Deployments**
2. Clicar nos **3 pontos** do último deployment
3. Clicar em **Redeploy**
4. Aguardar build completar

---

## 📋 VARIÁVEIS COMPLETAS NECESSÁRIAS

**Todas estas variáveis devem estar no Vercel:**

### Supabase (4 variáveis)
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (Secret)
- ✅ `SUPABASE_DB_URL` (Secret)

### NextAuth (2 variáveis)
- ⏳ `AUTH_SECRET` (Secret) ← **FALTANDO**
- ⏳ `NEXTAUTH_URL` (opcional, mas recomendado)

---

## 🔍 VERIFICAÇÃO

### No Vercel Dashboard

**Deve ter 6 variáveis configuradas:**
1. ✅ `NEXT_PUBLIC_SUPABASE_URL`
2. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. ✅ `SUPABASE_SERVICE_ROLE_KEY` (Secret)
4. ✅ `SUPABASE_DB_URL` (Secret)
5. ⏳ `AUTH_SECRET` (Secret) ← **ADICIONAR AGORA**
6. ⏳ `NEXTAUTH_URL` (opcional)

### Após Adicionar

1. **Fazer redeploy** (ou aguardar próximo push)
2. **Verificar logs** do build
3. **Deve compilar com sucesso** ✅

---

## 🎯 VALORES PARA COPIAR

### AUTH_SECRET (já gerado)
```
cItJZ6cHanb3d+V4WKSq+NDGo3aCXVTzQvxKrZ51tvg=
```

### NEXTAUTH_URL
```
Production: https://resenhapp.uzzai.com.br
Preview: (deixar vazio ou usar URL do Vercel)
Development: http://localhost:3000
```

---

## ⚠️ IMPORTANTE

1. **AUTH_SECRET deve ser SECRET:**
   - Marcar como "Encrypted" no Vercel
   - Nunca commitar no Git
   - Usar valores diferentes para dev/prod (opcional)

2. **Após adicionar:**
   - Fazer redeploy manual OU
   - Fazer novo push (deploy automático)

3. **Se ainda falhar:**
   - Verificar se todas as 6 variáveis estão configuradas
   - Verificar se estão marcadas para Production
   - Verificar logs de build no Vercel

---

## 📝 CHECKLIST

- [ ] Acessar Vercel Dashboard
- [ ] Ir em Settings → Environment Variables
- [ ] Adicionar `AUTH_SECRET` com valor gerado
- [ ] Marcar como Secret (Encrypted)
- [ ] Adicionar para Production, Preview, Development
- [ ] Adicionar `NEXTAUTH_URL` (opcional)
- [ ] Fazer redeploy
- [ ] Verificar se build passou

---

## ✅ RESULTADO ESPERADO

Após adicionar `AUTH_SECRET` e fazer redeploy:

```
✓ Compiled successfully
✓ Generating static pages
✓ Build completed
```

**Deploy deve funcionar!** ✅

---

**Documento criado:** 2026-01-27

