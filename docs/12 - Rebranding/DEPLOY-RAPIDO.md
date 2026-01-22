# ⚡ Deploy Rápido - 3 Passos

**Guia ultra-rápido para fazer o primeiro deploy**

---

## ✅ STATUS ATUAL

- [x] ✅ Domínio verificado no Vercel
- [x] ✅ Build local OK (0 erros)
- [x] ✅ Git configurado
- [ ] ⏳ Variáveis de ambiente (fazer ANTES)

---

## 🚀 3 PASSOS PARA DEPLOY

### PASSO 1: Variáveis de Ambiente (5 min) ⚠️ OBRIGATÓRIO

**Acessar:** https://vercel.com/dashboard → Projeto → Settings → Environment Variables

**Adicionar 4 variáveis:**

1. `NEXT_PUBLIC_SUPABASE_URL` = `https://ujrvfkkkssfdhwizjucq.supabase.co`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable__qrQJ5NFYQU9Lc1QNPOJ1Q_z9mEOcEa`
3. `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (marcar como Secret)
4. `SUPABASE_DB_URL` = `postgresql://postgres:Uzzai2025@@db...` (marcar como Secret)

**Todas para:** Production, Preview, Development

---

### PASSO 2: Commit e Push (2 min)

```bash
# Adicionar arquivos
git add vercel.json docs/

# Commit
git commit -m "feat: preparar deploy V2.0 - build OK, vercel.json configurado"

# Push
git push origin main
```

**O Vercel fará deploy automático!**

---

### PASSO 3: Verificar (3 min)

1. **Acompanhar deploy:**
   - https://vercel.com/dashboard → Projeto → Deployments
   - Aguardar build completar (2-5 min)

2. **Testar site:**
   - Acessar: `https://resenhapp.uzzai.com.br`
   - Verificar se carrega

3. **Verificar domínio:**
   - Settings → Domains
   - Status deve mudar de "No Deployment" para deployment atual

---

## ✅ PRONTO!

**Se tudo deu certo:**
- ✅ Site acessível
- ✅ HTTPS funcionando
- ✅ Deploy automático configurado

**Próximo passo:** Configurar Supabase URLs de produção

---

**Documento criado:** 2026-01-27

