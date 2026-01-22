# 🚀 Configuração de Produção - ResenhApp V2.0

**Guia Completo para Configurar Produção (Cloudflare + Supabase + Vercel)**

---

## 📋 PRÉ-REQUISITOS

- ✅ Projeto Supabase criado e configurado
- ✅ Migrations aplicadas
- ✅ Storage e Realtime configurados
- ✅ Domínio `uzzai.com.br` já configurado no Cloudflare
- ✅ Subdomínios existentes (ex: `uzzapp.uzzai.com.br`)

---

## 🎯 OBJETIVO

Configurar:
1. **Cloudflare** (Adicionar subdomínio `resenhapp.uzzai.com.br`)
2. **Supabase** (URLs de produção)
3. **Vercel** (Deploy e variáveis de ambiente)
4. **Integração completa** (tudo funcionando)

---

## 🌐 DOMÍNIO DE PRODUÇÃO

**Subdomínio a ser usado:**
```
resenhapp.uzzai.com.br
```

**URLs completas:**
- Site principal: `https://resenhapp.uzzai.com.br`
- Auth callback: `https://resenhapp.uzzai.com.br/auth/callback`
- Reset password: `https://resenhapp.uzzai.com.br/auth/reset-password`
- Verify email: `https://resenhapp.uzzai.com.br/auth/verify-email`

---

## 🌐 PASSO 1: CONFIGURAR CLOUDFLARE

### 1.1 Acessar DNS do Domínio Existente

1. **Acessar Cloudflare Dashboard:**
   - Ir em: https://dash.cloudflare.com/
   - Selecionar domínio: `uzzai.com.br`

2. **Ir em DNS Records:**
   - Clicar em `DNS` → `Records`
   - Você já deve ver registros existentes (ex: `uzzapp.uzzai.com.br`)

### 1.2 Adicionar Subdomínio para ResenhApp

**Adicionar novo registro CNAME:**

1. **Clicar em "Add record"**

2. **Preencher:**
   - **Type:** `CNAME`
   - **Name:** `resenhapp`
   - **Content:** `cname.vercel-dns.com` (ou o CNAME fornecido pelo Vercel)
   - **Proxy status:** ✅ **Proxied** (nuvem laranja)
   - **TTL:** Auto

3. **Salvar**

**⚠️ IMPORTANTE:**
- Usar "Proxied" (ícone de nuvem laranja) para SSL automático
- O Vercel fornecerá o CNAME correto após primeiro deploy
- Se já tiver outros subdomínios funcionando, seguir o mesmo padrão

### 1.3 Configurar SSL/TLS

1. **Ir em:** `SSL/TLS` → `Overview`
2. **Modo SSL/TLS:** `Full (strict)`
3. **Always Use HTTPS:** Habilitado
4. **Automatic HTTPS Rewrites:** Habilitado

### 1.4 Configurar Page Rules (Opcional)

**Para forçar HTTPS:**
- URL Pattern: `http://*resenhapp.com/*`
- Settings: Always Use HTTPS

---

## 🔐 PASSO 2: CONFIGURAR SUPABASE PARA PRODUÇÃO

### 2.1 Acessar URL Configuration

**Ir em:** `Authentication` → `URL Configuration`

### 2.2 Site URL (Produção)

```
https://resenhapp.uzzai.com.br
```

### 2.3 Redirect URLs (Produção)

**Adicionar estas URLs (uma por linha):**
```
https://resenhapp.uzzai.com.br/auth/callback
https://resenhapp.uzzai.com.br/auth/reset-password
https://resenhapp.uzzai.com.br/auth/verify-email
```

**⚠️ IMPORTANTE:**
- Como é subdomínio, não precisa de variação com `www`
- Adicionar apenas as 3 URLs principais

**⚠️ IMPORTANTE:**
- Adicionar URLs com e sem `www`
- Adicionar todas as variações que você vai usar
- O Supabase aceita múltiplas URLs

### 2.4 Configurar Email Templates (Produção)

**Atualizar templates para usar URLs de produção:**

**Confirm Signup - Subject:**
```
Confirme seu email - ResenhApp
```

**Confirm Signup - Body:**
```html
<h2>Bem-vindo ao ResenhApp! 🎉</h2>

<p>Olá!</p>

<p>Obrigado por se cadastrar no ResenhApp. Para começar a usar a plataforma, confirme seu email clicando no link abaixo:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #1ABC9C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
    Confirmar Email
  </a>
</p>

<p>Ou copie e cole este link no navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p>Este link expira em 24 horas.</p>

<p>Se você não se cadastrou, pode ignorar este email.</p>

<p>Até logo!<br>Equipe ResenhApp</p>
```

**Reset Password - Subject:**
```
Redefinir sua senha - ResenhApp
```

**Reset Password - Body:**
```html
<h2>Redefinição de Senha</h2>

<p>Olá!</p>

<p>Você solicitou redefinir sua senha no ResenhApp.</p>

<p>Clique no botão abaixo para criar uma nova senha:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #1ABC9C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
    Redefinir Senha
  </a>
</p>

<p>Ou copie e cole este link no navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p>Este link expira em 1 hora.</p>

<p>Se você não solicitou esta redefinição, ignore este email. Sua senha permanecerá a mesma.</p>

<p>Até logo!<br>Equipe ResenhApp</p>
```

---

## 🚀 PASSO 3: CONFIGURAR VERCEL

### 3.1 Conectar Projeto

1. **Acessar Vercel Dashboard:**
   - Ir em: https://vercel.com/dashboard

2. **Importar Projeto:**
   - Clicar em "Add New" → "Project"
   - Conectar repositório GitHub
   - Selecionar projeto `peladeiros-main`

### 3.2 Configurar Domínio

1. **Ir em:** Project Settings → Domains
2. **Adicionar domínio:**
   - `resenhapp.uzzai.com.br`
3. **⚠️ VERIFICAÇÃO NECESSÁRIA:**
   - O Vercel mostrará "Verification Needed"
   - Isso acontece porque o domínio pode estar linkado a outra conta Vercel
   - **Solução:** Adicionar registro TXT para verificar propriedade

4. **Configurar DNS no Cloudflare:**

   **PASSO 1: Adicionar TXT para Verificação (OBRIGATÓRIO)**
   
   - **Type:** `TXT`
   - **Name:** `_vercel`
   - **Content:** `vc-domain-verify=resenhapp.uzzai.com.br,b8bd4ba63defff40fd92`
     - ⚠️ **IMPORTANTE:** Use o valor exato fornecido pelo Vercel (pode variar)
   - **Proxy status:** ❌ **DNS only** (nuvem cinza - desabilitar proxy)
   - **TTL:** Auto
   
   **PASSO 2: Adicionar CNAME para o Subdomínio**
   
   - **Type:** `CNAME`
   - **Name:** `resenhapp`
   - **Content:** `26835d59d72f3832.vercel-dns-017.com.`
     - ⚠️ **IMPORTANTE:** Use o valor exato fornecido pelo Vercel (pode variar)
   - **Proxy status:** ❌ **DNS only** (inicialmente, para verificação)
   - **TTL:** Auto

5. **Aguardar Verificação:**
   - Aguardar 5-10 minutos para propagação DNS
   - Voltar no Vercel e clicar em "Refresh"
   - Após verificação, você pode ativar Proxy no Cloudflare (nuvem laranja)

6. **Após Verificação (Opcional - Melhor Performance):**
   - Voltar no Cloudflare
   - Editar o registro CNAME `resenhapp`
   - Ativar **Proxy** (nuvem laranja) para SSL automático e CDN
   - O registro TXT pode ser removido após verificação completa

### 3.3 Configurar Variáveis de Ambiente

**Ir em:** Project Settings → Environment Variables

**Adicionar TODAS as variáveis:**

**Supabase:**
```
NEXT_PUBLIC_SUPABASE_URL=https://ujrvfkkkssfdhwizjucq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable__qrQJ5NFYQU9Lc1QNPOJ1Q_z9mEOcEa
SUPABASE_SERVICE_ROLE_KEY=eyJ... (marcar como Secret)
SUPABASE_DB_URL=postgresql://... (marcar como Secret)
```

**Firebase (quando configurar):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...
```

**Cron Jobs:**
```
CRON_SECRET=<gerar com: openssl rand -base64 32>
```

**⚠️ IMPORTANTE:**
- Marcar variáveis sensíveis como **Secret**
- Configurar para **Production**, **Preview** e **Development**
- Usar valores de produção (não usar valores de dev)

### 3.4 Configurar Build Settings

**Ir em:** Project Settings → General

**Build Command:**
```bash
pnpm build
```

**Install Command:**
```bash
pnpm install --frozen-lockfile
```

**Output Directory:**
```
.next
```

**Node.js Version:**
```
20.x
```

### 3.5 Configurar Cron Jobs

**Criar/Atualizar `vercel.json`:**

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron/calculate-metrics",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/cleanup-notifications",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

**⚠️ IMPORTANTE:**
- Cron jobs só funcionam em produção (não em preview)
- Adicionar autenticação nos endpoints de cron
- Usar `CRON_SECRET` para validar requisições

---

## ✅ PASSO 4: VERIFICAÇÃO FINAL

### 4.1 Checklist Cloudflare

- [ ] Domínio adicionado e ativo
- [ ] DNS configurado corretamente
- [ ] SSL/TLS em modo "Full (strict)"
- [ ] Always Use HTTPS habilitado
- [ ] Proxy ativado (nuvem laranja)

### 4.2 Checklist Supabase

- [ ] Site URL: `https://resenhapp.com`
- [ ] Redirect URLs adicionadas (6 URLs)
- [ ] Email templates atualizados
- [ ] Email Confirmations habilitado
- [ ] Rate limiting configurado

### 4.3 Checklist Vercel

- [ ] Projeto conectado ao GitHub
- [ ] Domínio configurado
- [ ] Variáveis de ambiente adicionadas
- [ ] Build settings configurados
- [ ] Cron jobs configurados
- [ ] Deploy de produção funcionando

### 4.4 Testes de Produção

**Testar:**
- [ ] Acessar `https://resenhapp.uzzai.com.br` (deve carregar)
- [ ] HTTPS funcionando (sem avisos)
- [ ] Cadastro de usuário funcionando
- [ ] Email de confirmação chegando
- [ ] Login funcionando
- [ ] Reset password funcionando
- [ ] Redirects funcionando corretamente

---

## 🔍 TROUBLESHOOTING PRODUÇÃO

### Erro: "Invalid redirect URL"

**Causa:** URL não está na lista de Redirect URLs

**Solução:**
- Verificar se adicionou todas as variações (com/sem www)
- Verificar se está usando `https://` e não `http://`
- Verificar se não tem barra no final

### SSL não funciona

**Causa:** Cloudflare SSL não configurado corretamente

**Solução:**
- Verificar se modo SSL está em "Full (strict)"
- Verificar se Always Use HTTPS está habilitado
- Aguardar propagação DNS (pode levar até 24h)

### Deploy falha no Vercel

**Causa:** Variáveis de ambiente faltando ou build errors

**Solução:**
- Verificar logs de build no Vercel
- Verificar se todas as variáveis estão configuradas
- Verificar se `package.json` está correto

### Emails não chegam em produção

**Causa:** Rate limiting ou configuração incorreta

**Solução:**
- Verificar logs em `Authentication` → `Logs`
- Verificar rate limits em Settings
- Verificar se templates estão corretos

---

## 📚 PRÓXIMOS PASSOS

Após configurar produção:

1. **Monitorar:**
   - Vercel Analytics
   - Supabase Dashboard (usage, errors)
   - Cloudflare Analytics

2. **Otimizar:**
   - CDN cache (Cloudflare)
   - Image optimization (Vercel)
   - Database queries (Supabase)

3. **Segurança:**
   - Rate limiting
   - CORS configurado
   - Security headers (Cloudflare)

---

## 🎯 RESUMO RÁPIDO

### URLs de Produção para Configurar

**Supabase:**
- Site URL: `https://resenhapp.uzzai.com.br`
- Redirect URLs:
  - `https://resenhapp.uzzai.com.br/auth/callback`
  - `https://resenhapp.uzzai.com.br/auth/reset-password`
  - `https://resenhapp.uzzai.com.br/auth/verify-email`

**Vercel:**
- Domínio: `resenhapp.uzzai.com.br`
- Variáveis de ambiente: Todas configuradas

**Cloudflare:**
- Domínio: `uzzai.com.br` (já configurado)
- Novo registro: CNAME `resenhapp` → Vercel
- SSL: Full (strict) - já configurado
- Always Use HTTPS: Habilitado - já configurado
- Proxy: ✅ Proxied (nuvem laranja)

---

**Documento criado:** 2026-01-27
**Última atualização:** 2026-01-27

