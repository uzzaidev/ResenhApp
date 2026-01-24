# 🔐 SETUP DOPPLER - RESENHAPP V2.0

**Gerenciamento de Secrets com Doppler**
**Data:** 2026-01-22

---

## 📋 VISÃO GERAL

O projeto usa **Doppler** para gerenciar variáveis de ambiente de forma segura. As variáveis são sincronizadas entre:
- **Doppler Dashboard** (fonte da verdade)
- **Ambiente Local** (via `doppler run` ou `.env.local` como fallback)
- **Vercel** (via integração Doppler)

---

## ✅ VARIÁVEIS SUPABASE PARA CONFIGURAR NO DOPPLER

### 1. Acessar Doppler Dashboard

1. Acesse [Doppler Dashboard](https://dashboard.doppler.com/)
2. Selecione o projeto **peladeiros-main** (ou crie se não existir)
3. Selecione o config apropriado (ex: `dev`, `staging`, `prod`)

### 2. Adicionar Variáveis Supabase

Adicione as seguintes variáveis no Doppler:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ujrvfkkkssfdhwizjucq.supabase.co` | URL pública do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable__qrQJ5NFYQU9Lc1QNPOJ1Q_z9mEOcEa` | Chave pública (segura para frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Chave secreta (server-side apenas) |
| `SUPABASE_DB_URL` | `postgresql://postgres:Uzzai2025@@db.ujrvfkkkssfdhwizjucq.supabase.co:5432/postgres` | Connection string do banco |

**⚠️ IMPORTANTE:**
- `SUPABASE_SERVICE_ROLE_KEY` é **SECRETA** - marque como "Secret" no Doppler
- `SUPABASE_DB_URL` contém senha - marque como "Secret" no Doppler
- `NEXT_PUBLIC_*` são públicas e podem ser expostas no frontend

### 3. Comandos Doppler CLI

**Instalar Doppler CLI (se ainda não tiver):**
```bash
# Windows (PowerShell)
iwr https://cli.doppler.com/install.ps1 -useb | iex

# Ou via Chocolatey
choco install doppler

# Ou via npm
npm install -g doppler
```

**Login no Doppler:**
```bash
doppler login
```

**Configurar projeto:**
```bash
# Na raiz do projeto
doppler setup
# Selecione: peladeiros-main
# Selecione o config: dev (ou staging/prod)
```

**Sincronizar variáveis localmente:**
```bash
# Opção 1: Rodar comandos com Doppler
doppler run -- npm run dev

# Opção 2: Gerar .env.local a partir do Doppler
doppler secrets download --no-file --format env > .env.local
```

---

## 🔄 WORKFLOW RECOMENDADO

### Desenvolvimento Local

**Opção A: Usar Doppler diretamente (RECOMENDADO)**
```bash
# Rodar dev server com variáveis do Doppler
doppler run -- npm run dev
```

**Opção B: Sincronizar .env.local do Doppler**
```bash
# Atualizar .env.local a partir do Doppler
doppler secrets download --no-file --format env > .env.local

# Depois rodar normalmente
npm run dev
```

### Produção (Vercel)

**Integração Doppler + Vercel:**
1. No Vercel Dashboard → Project Settings → Environment Variables
2. Instalar integração Doppler (se disponível)
3. Ou sincronizar manualmente via Doppler CLI:
   ```bash
   doppler secrets download --no-file --format env | vercel env add
   ```

---

## 📝 CHECKLIST DOPPLER

- [ ] Doppler CLI instalado
- [ ] Login realizado (`doppler login`)
- [ ] Projeto configurado (`doppler setup`)
- [ ] Variáveis Supabase adicionadas no Doppler Dashboard:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (marcada como Secret)
  - [ ] `SUPABASE_DB_URL` (marcada como Secret)
- [ ] Testado sincronização local (`doppler run -- npm run dev`)
- [ ] `.env.local` atualizado (se usar como fallback)

---

## ⚠️ NOTAS IMPORTANTES

1. **`.env.local` como fallback:**
   - Pode manter o `.env.local` para desenvolvimento rápido
   - Mas a fonte da verdade é o Doppler
   - `.env.local` não deve ser commitado (já está no .gitignore)

2. **Secrets no Doppler:**
   - Marque variáveis sensíveis como "Secret" no Doppler
   - Isso oculta os valores no dashboard (mas ainda permite editar)

3. **Sincronização:**
   - Sempre sincronize `.env.local` do Doppler antes de commitar
   - Use `doppler secrets download` para atualizar localmente

---

**Criado em:** 2026-01-22  
**Última atualização:** 2026-01-22T23:45

