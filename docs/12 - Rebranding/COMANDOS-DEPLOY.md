# 🚀 Comandos para Deploy

**Execute estes comandos na ordem:**

---

## 1️⃣ ADICIONAR ARQUIVOS AO GIT

```powershell
cd "C:\Projetos Uzz.Ai\peladeiros-main"
git add vercel.json
git add "docs/12 - Rebranding/"
git status
```

---

## 2️⃣ FAZER COMMIT

```powershell
git commit -m "feat: preparar deploy V2.0 - build local OK, vercel.json configurado"
```

---

## 3️⃣ FAZER PUSH

```powershell
git push origin main
```

**O Vercel fará deploy automático após o push!**

---

## ⚠️ ANTES DO PUSH: Configurar Variáveis no Vercel

**Acessar:** https://vercel.com/dashboard → Projeto → Settings → Environment Variables

**Adicionar 4 variáveis:**

1. `NEXT_PUBLIC_SUPABASE_URL` = `https://ujrvfkkkssfdhwizjucq.supabase.co`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable__qrQJ5NFYQU9Lc1QNPOJ1Q_z9mEOcEa`
3. `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Secret)
4. `SUPABASE_DB_URL` = `postgresql://postgres:Uzzai2025@@db...` (Secret)

**Todas para:** Production, Preview, Development

---

## ✅ APÓS O PUSH

1. **Acompanhar deploy:**
   - https://vercel.com/dashboard → Projeto → Deployments
   - Aguardar build completar (2-5 min)

2. **Testar:**
   - Acessar: `https://resenhapp.uzzai.com.br`
   - Verificar se carrega

---

**Documento criado:** 2026-01-27

