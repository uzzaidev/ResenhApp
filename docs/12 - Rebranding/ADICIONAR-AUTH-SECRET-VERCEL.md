# ⚡ Adicionar AUTH_SECRET no Vercel - Passo a Passo

**Tempo estimado:** 2 minutos

---

## 🎯 O QUE FAZER

Adicionar a variável `AUTH_SECRET` no Vercel para o build funcionar.

---

## 📋 PASSO A PASSO

### 1. Acessar Vercel Dashboard

1. Abrir: https://vercel.com/dashboard
2. Selecionar o projeto **ResenhApp** (ou o nome do seu projeto)
3. Clicar em **Settings** (no topo)
4. Clicar em **Environment Variables** (menu lateral)

### 2. Adicionar AUTH_SECRET

1. Clicar no botão **"Add New"** (canto superior direito)
2. Preencher:
   - **Key:** `AUTH_SECRET`
   - **Value:** `cItJZ6cHanb3d+V4WKSq+NDGo3aCXVTzQvxKrZ51tvg=`
   - **Environments:** Marcar todas as 3 opções:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - **⚠️ IMPORTANTE:** Marcar a opção **"Encrypted"** (Secret)
3. Clicar em **Save**

### 3. Adicionar NEXTAUTH_URL (Opcional mas Recomendado)

1. Clicar em **"Add New"** novamente
2. Preencher:
   - **Key:** `NEXTAUTH_URL`
   - **Value (Production):** `https://resenhapp.uzzai.com.br`
   - **Value (Preview):** (deixar vazio ou usar URL do Vercel)
   - **Value (Development):** `http://localhost:3000`
   - **Environments:** Marcar todas as 3 opções
3. Clicar em **Save**

### 4. Fazer Redeploy

**Opção A: Redeploy Manual (Mais Rápido)**
1. Ir em **Deployments** (menu lateral)
2. Clicar nos **3 pontos** (⋯) do último deployment
3. Clicar em **Redeploy**
4. Aguardar build completar (2-5 minutos)

**Opção B: Novo Push (Automático)**
- Fazer qualquer commit e push
- Vercel fará deploy automático

---

## ✅ VERIFICAÇÃO

### Checklist de Variáveis

**Deve ter estas 6 variáveis no Vercel:**

1. ✅ `NEXT_PUBLIC_SUPABASE_URL`
2. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. ✅ `SUPABASE_SERVICE_ROLE_KEY` (Secret)
4. ✅ `SUPABASE_DB_URL` (Secret)
5. ⏳ `AUTH_SECRET` (Secret) ← **ADICIONAR AGORA**
6. ⏳ `NEXTAUTH_URL` (opcional)

### Verificar Build

1. Ir em **Deployments**
2. Verificar o último deployment
3. Status deve ser **"Ready"** (verde) ✅
4. Se ainda falhar, verificar **Logs** do build

---

## 🔑 VALORES PARA COPIAR

### AUTH_SECRET
```
cItJZ6cHanb3d+V4WKSq+NDGo3aCXVTzQvxKrZ51tvg=
```

### NEXTAUTH_URL
```
Production: https://resenhapp.uzzai.com.br
Development: http://localhost:3000
```

---

## ⚠️ IMPORTANTE

1. **AUTH_SECRET é SECRET:**
   - ✅ Marcar como "Encrypted" no Vercel
   - ❌ Nunca commitar no Git
   - ✅ Usar o mesmo valor em dev/prod (ou diferentes, sua escolha)

2. **Após adicionar:**
   - Fazer redeploy para aplicar as mudanças
   - Variáveis só são aplicadas em novos deploys

3. **Se ainda falhar:**
   - Verificar se todas as variáveis estão configuradas
   - Verificar se estão marcadas para **Production**
   - Verificar logs de build no Vercel

---

## 🎯 RESULTADO ESPERADO

Após adicionar `AUTH_SECRET` e fazer redeploy:

```
✓ Compiled successfully
✓ Generating static pages
✓ Build completed successfully
```

**Deploy funcionando!** ✅

---

## 📸 ONDE ENCONTRAR NO VERCEL

```
Dashboard → Projeto → Settings → Environment Variables
```

**Ou diretamente:**
```
https://vercel.com/[seu-usuario]/[projeto]/settings/environment-variables
```

---

**Documento criado:** 2026-01-27

