# 🚀 Primeiro Deploy - ResenhApp V2.0

**Guia passo a passo para fazer o primeiro deploy no Vercel**

---

## ✅ PRÉ-REQUISITOS VERIFICADOS

- [x] ✅ Domínio `resenhapp.uzzai.com.br` verificado no Vercel
- [x] ✅ Build local executado com sucesso (0 erros)
- [x] ✅ DNS configurado no Cloudflare
- [ ] ⏳ Variáveis de ambiente no Vercel (fazer antes do deploy)

---

## 📋 PASSO 1: Configurar Variáveis de Ambiente (5 min)

**⚠️ IMPORTANTE:** Fazer isso ANTES do deploy!

### 1.1 Acessar Vercel Dashboard

1. Ir em: https://vercel.com/dashboard
2. Selecionar o projeto
3. Ir em: **Settings** → **Environment Variables**

### 1.2 Adicionar Variáveis

**Adicionar uma por uma:**

#### Variável 1: `NEXT_PUBLIC_SUPABASE_URL`
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://ujrvfkkkssfdhwizjucq.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **Save**

#### Variável 2: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `sb_publishable__qrQJ5NFYQU9Lc1QNPOJ1Q_z9mEOcEa`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **Save**

#### Variável 3: `SUPABASE_SERVICE_ROLE_KEY` (Secret)
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcnZma2trc3NmZGh3aXpqdWNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA5MjgyNiwiZXhwIjoyMDg0NjY4ODI2fQ.qGYdYDRdt0EgVmnxNkrENy-jOLUqxXsk_x03fCropw8`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **⚠️ Marcar como "Encrypted" (Secret)**
- **Save**

#### Variável 4: `SUPABASE_DB_URL` (Secret)
- **Key:** `SUPABASE_DB_URL`
- **Value:** `postgresql://postgres:Uzzai2025@@db.ujrvfkkkssfdhwizjucq.supabase.co:5432/postgres`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- **⚠️ Marcar como "Encrypted" (Secret)**
- **Save**

### 1.3 Verificar

**Deve ter 4 variáveis configuradas:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (Secret)
- ✅ `SUPABASE_DB_URL` (Secret)

---

## 📋 PASSO 2: Preparar Git (2 min)

### 2.1 Verificar Status

```bash
git status
```

### 2.2 Adicionar Arquivos Modificados

```bash
# Adicionar todos os arquivos modificados
git add .

# Ou adicionar arquivos específicos
git add vercel.json
git add docs/
```

### 2.3 Commit

```bash
git commit -m "feat: preparar deploy V2.0 - build local OK, vercel.json configurado"
```

---

## 📋 PASSO 3: Fazer Deploy (3 opções)

### Opção A: Deploy via Git Push (Recomendado)

**Se o projeto já está conectado ao Vercel:**

```bash
# Verificar branch atual
git branch

# Se estiver em outra branch, criar/alternar para main ou v2-development
git checkout -b v2-development  # ou usar main

# Push para o repositório
git push origin v2-development  # ou main
```

**O Vercel fará deploy automático!**

### Opção B: Deploy Manual via Vercel CLI

**Se não estiver conectado ao Git:**

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### Opção C: Deploy via Vercel Dashboard

1. Acessar: https://vercel.com/dashboard
2. Clicar em **"Add New..."** → **"Project"**
3. Conectar repositório Git (GitHub/GitLab/Bitbucket)
4. Configurar:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `pnpm build` (ou deixar padrão)
   - **Output Directory:** `.next` (ou deixar padrão)
5. Clicar em **"Deploy"**

---

## 📋 PASSO 4: Verificar Deploy (5 min)

### 4.1 Acompanhar Deploy

1. Ir em: https://vercel.com/dashboard → Projeto
2. Verificar seção **"Deployments"**
3. Aguardar build completar (2-5 minutos)

### 4.2 Verificar Logs

**Se houver erros:**
- Clicar no deployment
- Verificar logs de build
- Comparar com build local (que funcionou)

### 4.3 Verificar Domínio

1. Ir em: **Settings** → **Domains**
2. Verificar se `resenhapp.uzzai.com.br` está conectado
3. Status deve mudar de "No Deployment" para o deployment atual

---

## 📋 PASSO 5: Testar em Produção (10 min)

### 5.1 Acessar Site

1. Abrir: `https://resenhapp.uzzai.com.br`
2. Verificar se carrega (pode mostrar erro 404 se não houver página inicial)
3. Verificar HTTPS funcionando

### 5.2 Testar Autenticação

1. Acessar: `https://resenhapp.uzzai.com.br/auth/signup`
2. Tentar criar conta
3. Verificar se email de confirmação chega
4. Tentar fazer login

### 5.3 Verificar Console

1. Abrir DevTools (F12)
2. Verificar se há erros no console
3. Verificar se há erros de rede

---

## 🐛 TROUBLESHOOTING

### Erro: "Build failed"

**Possíveis causas:**
- Variáveis de ambiente faltando
- Dependências não instaladas
- Erro de TypeScript

**Solução:**
1. Verificar logs de build no Vercel
2. Comparar com build local (que funcionou)
3. Verificar se todas as variáveis estão configuradas

### Erro: "Module not found"

**Solução:**
1. Verificar se todas as dependências estão no `package.json`
2. Verificar se `pnpm-lock.yaml` está commitado
3. Rodar `pnpm install` localmente e verificar

### Erro: "Environment variables missing"

**Solução:**
1. Verificar se todas as 4 variáveis estão configuradas
2. Verificar se estão marcadas para Production
3. Fazer redeploy após adicionar variáveis

### Site não carrega

**Possíveis causas:**
- DNS ainda propagando
- SSL ainda sendo gerado
- Erro no código

**Solução:**
1. Aguardar 5-10 minutos
2. Verificar logs de build
3. Verificar se domínio está conectado ao deployment

---

## ✅ CHECKLIST FINAL

### Antes do Deploy
- [ ] Variáveis de ambiente configuradas (4 variáveis)
- [ ] Git commit feito
- [ ] Build local funcionando

### Durante o Deploy
- [ ] Deploy iniciado
- [ ] Build completado sem erros
- [ ] Domínio conectado ao deployment

### Após o Deploy
- [ ] Site acessível via HTTPS
- [ ] Autenticação funcionando
- [ ] Sem erros no console

---

## 🎯 PRÓXIMOS PASSOS

Após deploy bem-sucedido:

1. **Configurar Supabase URLs:**
   - Site URL: `https://resenhapp.uzzai.com.br`
   - Redirect URLs: 3 URLs de produção

2. **Testar funcionalidades:**
   - Cadastro
   - Login
   - Reset password
   - Verificar emails

3. **Monitorar:**
   - Logs de erro
   - Performance
   - Uso de recursos

---

**Documento criado:** 2026-01-27

