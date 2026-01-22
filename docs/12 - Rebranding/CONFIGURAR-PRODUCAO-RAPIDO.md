# ⚡ Configuração Rápida de Produção - ResenhApp

**Guia Rápido para Configurar `resenhapp.uzzai.com.br`**

---

## 🎯 DOMÍNIO DE PRODUÇÃO

**Subdomínio:** `resenhapp.uzzai.com.br`

---

## 📋 CHECKLIST RÁPIDO

### 1. Cloudflare (5 min)

**Acessar:** https://dash.cloudflare.com/ → Selecionar `uzzai.com.br` → DNS → Records

**Adicionar novo registro:**
- **Type:** `CNAME`
- **Name:** `resenhapp`
- **Content:** `cname.vercel-dns.com` (ou o CNAME fornecido pelo Vercel)
- **Proxy status:** ✅ **Proxied** (nuvem laranja)
- **TTL:** Auto

**✅ Resultado:** `resenhapp.uzzai.com.br` apontando para Vercel

---

### 2. Supabase (3 min)

**Acessar:** https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/auth/url-configuration

**Site URL:**
```
https://resenhapp.uzzai.com.br
```

**Redirect URLs (adicionar uma por linha):**
```
https://resenhapp.uzzai.com.br/auth/callback
https://resenhapp.uzzai.com.br/auth/reset-password
https://resenhapp.uzzai.com.br/auth/verify-email
```

**✅ Resultado:** Auth configurado para produção

---

### 3. Vercel (5 min)

**Acessar:** https://vercel.com/dashboard → Projeto → Settings → Domains

**Adicionar domínio:**
```
resenhapp.uzzai.com.br
```

**Vercel fornecerá um CNAME:**
- Copiar o CNAME fornecido
- Usar no passo 1 (Cloudflare)

**Configurar variáveis de ambiente:**
- Ir em: Settings → Environment Variables
- Adicionar todas as variáveis (Supabase, Firebase, etc.)
- Marcar para **Production**

**✅ Resultado:** Deploy configurado

---

## ✅ VERIFICAÇÃO

Após configurar tudo:

1. **Aguardar propagação DNS (5-10 min)**
2. **Acessar:** https://resenhapp.uzzai.com.br
3. **Testar:** Cadastro, Login, Reset Password

---

## 🐛 TROUBLESHOOTING

### DNS não resolve

**Solução:**
- Verificar se CNAME está correto no Cloudflare
- Verificar se Proxy está ativado (nuvem laranja)
- Aguardar propagação (pode levar até 24h, mas geralmente 5-10 min)

### SSL não funciona

**Solução:**
- Verificar se Proxy está ativado no Cloudflare
- SSL é automático quando Proxy está ativo
- Aguardar alguns minutos para certificado ser gerado

### "Invalid redirect URL" no Supabase

**Solução:**
- Verificar se adicionou todas as 3 URLs
- Verificar se está usando `https://` e não `http://`
- Verificar se não tem barra no final

---

## 📝 RESUMO DAS URLs

**Produção:**
- Site: `https://resenhapp.uzzai.com.br`
- Auth Callback: `https://resenhapp.uzzai.com.br/auth/callback`
- Reset Password: `https://resenhapp.uzzai.com.br/auth/reset-password`
- Verify Email: `https://resenhapp.uzzai.com.br/auth/verify-email`

**Desenvolvimento (manter também):**
- Site: `http://localhost:3000`
- Auth Callback: `http://localhost:3000/auth/callback`
- Reset Password: `http://localhost:3000/auth/reset-password`
- Verify Email: `http://localhost:3000/auth/verify-email`

**⚠️ IMPORTANTE:**
- Você pode ter AMBAS configuradas ao mesmo tempo
- Supabase aceita múltiplas URLs
- Use localhost para dev, resenhapp.uzzai.com.br para prod

---

**Documento criado:** 2026-01-27

