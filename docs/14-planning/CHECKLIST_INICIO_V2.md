# ✅ CHECKLIST DE INÍCIO - RESENHAPP V2.0 (SUPABASE)

**Guia Completo de Implementação**
**Data:** 2026-01-22
**Versão:** 2.0.0-SUPABASE
**Status:** Pronto para Execução
**Última Atualização:** 2026-01-22T23:00

---

## 📊 STATUS ATUAL DO PROJETO

### Informações do Projeto

| Item | Valor |
|------|-------|
| **Nome do Projeto** | ResenhApp (anteriormente Peladeiros) |
| **Versão** | V2.0 |
| **Status MVP** | ✅ 100% funcional |
| **Status Rebranding** | 🟡 60% completo |
| **Stack Principal** | Next.js 15 + React 19 + Supabase |
| **Database** | Supabase (PostgreSQL 15+) |
| **Deploy** | Vercel |

### Documentação Criada

- ✅ **PLANOR00.md** - Plano mestre de execução (criado hoje)
- ✅ **ARQUITETURA-COMPLETA-SISTEMA-V2.md** - Documentação técnica completa
- ✅ **DATABASE-ARCHITECTURE-SUPABASE-V2.md** - Arquitetura de BD Supabase
- ✅ **DECISOES-TECNICAS-V2.md** - Decisões de stack e padrões
- ✅ **SUMARIO-EXECUTIVO-V2.md** - Apresentação stakeholders
- ✅ **CHECKLIST-INICIO-V2.md** - Este documento

### Equipe

| Papel | Nome | Status |
|-------|------|--------|
| Product Owner |  Vitor Reis Pirolli | ✅ Ativo |
| Tech Lead | Luis Fernando Boff  Pedro Vitor Pagliarin | ✅ Ativo |
| Comercial | Vitor Reis Pirolli  Pedro Vitor Pagliarin| ✅ Ativo |
| Branding | Arthur Brandalise | ✅ Ativo |

---

## 📚 DOCUMENTAÇÃO DISPONÍVEL

Antes de começar, você tem acesso a toda documentação necessária:

### Documentos Principais

| Documento | Descrição | Link | Status |
|-----------|-----------|------|--------|
| **PLANOR00.md** | Plano mestre de execução | [Abrir](./PLANOR00.md) | ✅ Criado |
| **PLANEJAMENTO-V2-INDEX.md** | Índice completo de documentação | [Abrir](./PLANEJAMENTO-V2-INDEX.md) | ✅ Completo |
| **SUMARIO-EXECUTIVO-V2.md** | Apresentação stakeholders | [Abrir](./SUMARIO-EXECUTIVO-V2.md) | ✅ Completo |
| **ARQUITETURA-COMPLETA-SISTEMA-V2.md** | Documentação técnica completa | [Abrir](./ARQUITETURA-COMPLETA-SISTEMA-V2.md) | ✅ Completo |
| **DECISOES-TECNICAS-V2.md** | Decisões de stack e padrões | [Abrir](./DECISOES-TECNICAS-V2.md) | ✅ Completo |
| **DATABASE-ARCHITECTURE-SUPABASE-V2.md** | Arquitetura de BD completa | [Abrir](./DATABASE-ARCHITECTURE-SUPABASE-V2.md) | ✅ Completo |
| **SUPABASE-MIGRATION-SUMMARY.md** | Resumo da migração Supabase | [Abrir](./SUPABASE-MIGRATION-SUMMARY.md) | ✅ Completo |

### Migrations SQL (Supabase)

| # | Migration | Descrição | Arquivo |
|---|-----------|-----------|---------|
| 1 | Initial Schema | Extensions + Enums | [supabase/migrations/20260127000001_initial_schema.sql](./supabase/migrations/20260127000001_initial_schema.sql) |
| 2 | Auth & Profiles | User Types + Multi-Groups | [supabase/migrations/20260127000002_auth_profiles.sql](./supabase/migrations/20260127000002_auth_profiles.sql) |
| 3 | Groups & Events | Core System (11 tabelas) | [supabase/migrations/20260127000003_groups_and_events.sql](./supabase/migrations/20260127000003_groups_and_events.sql) |
| 4 | RLS Policies | Row Level Security | [supabase/migrations/20260127000004_rls_policies.sql](./supabase/migrations/20260127000004_rls_policies.sql) |
| 5 | Financial | Pix + Wallets (6 tabelas) | [supabase/migrations/20260204000001_financial_system.sql](./supabase/migrations/20260204000001_financial_system.sql) |
| 6 | Notifications | Push + Email (5 tabelas) | [supabase/migrations/20260211000001_notifications.sql](./supabase/migrations/20260211000001_notifications.sql) |
| 7 | Analytics | Stats + Leaderboards (5 tabelas) | [supabase/migrations/20260218000001_analytics.sql](./supabase/migrations/20260218000001_analytics.sql) |
| 8 | Gamification | Achievements + Badges (7 tabelas) | [supabase/migrations/20260225000001_gamification.sql](./supabase/migrations/20260225000001_gamification.sql) |

**Guia de Migrations:** [supabase/migrations/README.md](./supabase/migrations/README.md)
**Seed Data:** [supabase/seed.sql](./supabase/seed.sql)

---

## 📋 FASE 1: APROVAÇÃO E DECISÕES (ESTA SEMANA)

### 🎯 Reunião de Aprovação (30min)

**Participantes obrigatórios:**
- [ ] Pedro Vitor Pagliarin (Product Owner)
- [ ] Luis Fernando Boff (Tech Lead)
- [ ] Vitor Reis Pirolli (Comercial)
- [ ] Arthur Brandalise (Branding)

**Agenda:**
1. [ ] Apresentar [SUMARIO-EXECUTIVO-V2.md](./SUMARIO-EXECUTIVO-V2.md) (10min)
2. [ ] Discutir dúvidas técnicas (5min)
3. [ ] Decidir pricing (5min)
4. [ ] Decidir sobre WhatsApp API (5min)
5. [ ] Confirmar pilotos e cronograma (5min)

**Resultado esperado:**
- [ ] ✅ Roadmap aprovado (8 sprints, 14-16 semanas)
- [ ] ✅ Pricing definido: R$ ______ /mês (opções: 30, 40 ou 50)
  - ⭐ **Recomendação:** R$ 40/mês (balanceado)
- [ ] ✅ Decisão WhatsApp: [ ] Agora | [ ] Q2 2026
  - ⭐ **Recomendação:** Postergar para Q2 (validar ROI primeiro)
- [ ] ✅ Pilotos confirmados: __________, __________, __________
  - **Grupos identificados:** Grupo do Vitor, Engenharia (atlética)
- [ ] ✅ Data de início Sprint 1: ____/____/2026
  - **Estimativa:** 27/01/2026 (segunda-feira)

---

### 💰 Decisão de Pricing

**Opções:**

- [ ] **R$ 30/mês** - Agressivo, competitivo
  - ✅ Vantagem: 70% mais barato que concorrente (R$ 100/mês)
  - ⚠️ Risco: Baixo ticket pode desvalorizar produto

- [ ] **R$ 40/mês** - Balanceado (⭐ RECOMENDADO)
  - ✅ Vantagem: 60% mais barato, ainda muito competitivo
  - ✅ Vantagem: Ticket mais saudável para escala
  - ✅ LTV estimado: R$ 600 (12 meses)

- [ ] **R$ 50/mês** - Premium
  - ✅ Vantagem: 50% mais barato, ticket alto
  - ⚠️ Risco: Pode ser caro para alguns grupos

**✅ Decisão final:** R$ _______ /mês

---

### 📱 Decisão WhatsApp Business API

- [ ] **Investir agora** (Sprint 8)
  - Custo: ~R$ 500/mês para 1000 mensagens
  - Benefício: Diferencial competitivo forte
  - Risco: Custo fixo antes de validação

- [ ] **Postergar para Q2** (⭐ RECOMENDADO)
  - Validar primeiro com push notifications + email
  - Avaliar demanda real dos pilotos
  - Implementar apenas se ROI positivo

**✅ Decisão final:** [ ] Agora | [ ] Q2 2026

---

## 🗄️ FASE 2: SETUP SUPABASE (DIA 1)

### 1. Criar Projeto no Supabase

**1.1. Criar conta e projeto:**
- [x] ✅ Acessar [Supabase Dashboard](https://app.supabase.com)
- [x] ✅ Criar conta (se não tiver)
- [x] ✅ Clicar em "New Project"
- [x] ✅ Preencher:
  - Name: `ResenhApp` (MICRO)
  - Database Password: (gerar senha forte e SALVAR)
  - Region: `South America (São Paulo)`
  - Pricing Plan: `Free` (inicialmente)
- [x] ✅ Clicar em "Create new project"
- [x] ✅ **Aguardar ~2 minutos** (provisioning do banco)

**1.2. Copiar credenciais:**

Ir em `Project Settings` → `API`:

- [x] ✅ Copiar `Project URL`: `https://ujrvfkkkssfdhwizjucq.supabase.co`
- [x] ✅ Copiar `anon public` key: `sb_publishable__qrQJ5NFYQU9Lc1QNPOJ1Q_z9mEOcEa`
- [ ] ⚠️ **IMPORTANTE:** Copiar `service_role` key (NUNCA expor no frontend!)
  - **Onde encontrar:** `Project Settings` → `API` → Role `service_role`
  - **Ação:** Clique em "Reveal" ao lado da service_role key e copie

Ir em `Project Settings` → `Database`:

- [ ] Copiar `Connection string` (para CLI)
- [ ] Anotar `Project ID` (ref)

**1.3. Salvar credenciais:**

✅ **Credenciais já obtidas:**
- Project URL: `https://ujrvfkkkssfdhwizjucq.supabase.co`
- Anon Key: `sb_publishable__qrQJ5NFYQU9Lc1QNPOJ1Q_z9mEOcEa`
- Service Role Key: ✅ Já configurado no `.env local`
- Database Connection String: ✅ Já configurado no `.env local`

**🔐 Configuração com Doppler:**

O projeto usa **Doppler** para gerenciar secrets. Configure as variáveis no Doppler:

**Opção A: Configurar no Doppler (RECOMENDADO - fonte da verdade)**
1. Acesse [Doppler Dashboard](https://dashboard.doppler.com/)
2. Selecione projeto: `peladeiros-main`
3. Selecione config: `dev` (ou `staging`/`prod`)
4. Adicione as variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ujrvfkkkssfdhwizjucq.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable__qrQJ5NFYQU9Lc1QNPOJ1Q_z9mEOcEa`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJ...` (marcar como **Secret**)
   - `SUPABASE_DB_URL` = `postgresql://...` (marcar como **Secret`)

**Opção B: Manter .env.local como fallback**
- ✅ `.env local` já está criado e configurado
- Use como fallback para desenvolvimento local
- Sincronize do Doppler quando necessário: `doppler secrets download --no-file --format env > .env.local`

**📋 Guia completo Doppler:** [SETUP-DOPPLER.md](./SETUP-DOPPLER.md)

**✅ Checklist:**
- [x] ✅ Projeto Supabase criado
- [x] ✅ Project URL copiado
- [x] ✅ Anon Key copiado
- [x] ✅ Service Role Key copiado e configurado
- [x] ✅ Database Connection String copiado e configurado
- [x] ✅ `.env local` criado e configurado (fallback local)
- [x] ✅ **Variáveis adicionadas no Doppler Dashboard** (COMPLETO)
- [x] ✅ `.env.local` já está no `.gitignore` (verificado)

---

### 2. Instalar Supabase CLI

**📋 Guia completo:** [APLICAR-MIGRATIONS-SUPABASE.md](./APLICAR-MIGRATIONS-SUPABASE.md)

```bash
# Instalar Supabase CLI globalmente
npm install -g supabase

# Verificar instalação
supabase --version

# Login no Supabase
supabase login

# Inicializar Supabase no projeto
supabase init

# Link com projeto remoto (Project ID: ujrvfkkkssfdhwizjucq)
supabase link --project-ref ujrvfkkkssfdhwizjucq
```

**✅ Checklist:**
- [x] ✅ Supabase CLI instalado (`supabase --version` funcionando)
- [x] ✅ Login realizado (`supabase login`)
- [x] ✅ `supabase init` executado
- [x] ✅ Link com projeto remoto feito (`supabase link --project-ref ujrvfkkkssfdhwizjucq`)
- [x] ✅ Pasta `supabase/` já existe (com 8 migrations)
- [x] ✅ **Status migrations:** 2/8 aplicadas (initial_schema + auth_profiles)
  - ⏳ **Pendentes:** 6 migrations restantes

---

### 3. Aplicar Migrations SQL

**📋 Guia completo:** [APLICAR-MIGRATIONS-SUPABASE.md](./APLICAR-MIGRATIONS-SUPABASE.md)

**Opção A: Via Supabase CLI (RECOMENDADO)**

```bash
# Aplicar todas as migrations de uma vez
supabase db push

# Verificar status
supabase migration list

# Deve mostrar 8 migrations aplicadas:
# 1. 20260127000001_initial_schema.sql
# 2. 20260127000002_auth_profiles.sql
# 3. 20260127000003_groups_and_events.sql
# 4. 20260127000004_rls_policies.sql
# 5. 20260204000001_financial_system.sql
# 6. 20260211000001_notifications.sql
# 7. 20260218000001_analytics.sql
# 8. 20260225000001_gamification.sql
```

**Opção B: Via Supabase Dashboard (Manual) - ⭐ RECOMENDADO AGORA**

**📋 Guia completo:** [APLICAR-MIGRATIONS-RESTANTES.md](./APLICAR-MIGRATIONS-RESTANTES.md)

**Status atual:** ✅ **8/8 migrations aplicadas com sucesso!** 🎉  
**Todas as migrations foram aplicadas via Supabase Dashboard SQL Editor**

**Migrations aplicadas:**

1. [x] ✅ Acessar [Supabase Dashboard SQL Editor](https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/sql/new)
2. [x] ✅ Aplicar migration 3: `20260127000003_groups_and_events.sql`
3. [x] ✅ Aplicar migration 4: `20260127000004_rls_policies.sql`
4. [x] ✅ Aplicar migration 5: `20260204000001_financial_system.sql`
5. [x] ✅ Aplicar migration 6: `20260211000001_notifications.sql`
6. [x] ✅ Aplicar migration 7: `20260218000001_analytics.sql`
7. [x] ✅ Aplicar migration 8: `20260225000001_gamification.sql`
8. [x] ✅ Executar verificação final (SQL queries)

**Ordem das migrations:**
```
1. 20260127000001_initial_schema.sql      (Extensions + Enums)
2. 20260127000002_auth_profiles.sql       (Auth + User Types)
3. 20260127000003_groups_and_events.sql   (Core System)
4. 20260127000004_rls_policies.sql        (RLS Policies)
5. 20260204000001_financial_system.sql    (Financeiro)
6. 20260211000001_notifications.sql       (Notificações)
7. 20260218000001_analytics.sql           (Analytics)
8. 20260225000001_gamification.sql        (Gamificação)
```

**Verificar sucesso:**

**Opção A: Script completo de verificação (RECOMENDADO)**

1. Acessar [Supabase Dashboard SQL Editor](https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/sql/new)
2. Abrir o arquivo `supabase/verify_migrations.sql`
3. Copiar todo o conteúdo e colar no SQL Editor
4. Executar (Run)
5. Verificar os resultados de cada seção

**Opção B: Queries rápidas individuais**

```sql
-- 1. Verificar tabelas criadas (deve retornar ~40 tabelas)
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Verificar enums
SELECT t.typname AS enum_name, e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%_type'
ORDER BY t.typname, e.enumsortorder;
```

**📋 Script de verificação completo:** [supabase/verify_migrations.sql](../supabase/verify_migrations.sql)

**✅ Checklist:**
- [x] ✅ 8 migrations aplicadas com sucesso
- [x] ✅ ~40 tabelas criadas (verificado)
- [x] ✅ RLS habilitado em todas as tabelas
- [x] ✅ Enums criados
- [x] ✅ Triggers e functions funcionando
- [x] ✅ Verificação executada - todas as tabelas confirmadas

---

### 4. Aplicar Seed Data (Opcional)

**Para desenvolvimento e testes:**

```bash
# Via CLI
supabase db execute --file supabase/seed.sql

# Ou via SQL Editor
# Copiar conteúdo de supabase/seed.sql e executar
```

**Seed data inclui:**
- 18 achievement types (conquistas padrão)
- 8 badges (distintivos visuais)
- 8 notification templates (templates de notificação)

**✅ Checklist:**
- [ ] Seed data aplicado (se desejado)
- [ ] Achievements criados
- [ ] Badges criados
- [ ] Templates criados

---

### 5. Configurar Auth Providers

**📋 Guia completo:** [SETUP-AUTH-PROVIDERS.md](./SETUP-AUTH-PROVIDERS.md)

**Método Rápido:**

1. **Acessar Supabase Dashboard:**
   - Ir em: `Authentication` → `Providers`
   - Verificar se Email está habilitado (já vem habilitado por padrão)

2. **Configurar Email Templates:**
   - Ir em: `Authentication` → `Email Templates`
   - Configurar 4 templates principais:
     - ✅ Confirm Signup
     - ✅ Magic Link
     - ✅ Change Email Address
     - ✅ Reset Password
   - Templates prontos disponíveis no guia

3. **Configurar URLs:**
   - Ir em: `Authentication` → `URL Configuration`
   - Site URL: `http://localhost:3000`
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password`
     - `http://localhost:3000/auth/verify-email`

4. **Testar Localmente:**
   - Abrir arquivo `test-auth.html` no navegador
   - Testar cadastro, login e reset password

**5.2. OAuth Providers (futuro):**
- [ ] Google (postergar para Sprint 3-4)
- [ ] Apple (postergar para Sprint 3-4)

**✅ Checklist:**
- [ ] Email/Password habilitado
- [ ] Email templates configurados (4 templates)
- [ ] Site URL configurado (`http://localhost:3000`)
- [ ] Redirect URLs configuradas (3 URLs)
- [ ] Teste local executado com sucesso

---

### 6. Configurar Storage Buckets

**📋 Guia completo:** [SETUP-STORAGE-REALTIME.md](./SETUP-STORAGE-REALTIME.md)

**Método Rápido (Recomendado):**
1. Acessar [Supabase SQL Editor](https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/sql/new)
2. Abrir arquivo `supabase/setup_storage_and_realtime.sql`
3. Copiar e executar todo o script
4. Verificar resultados (queries de verificação no final do script)

**Método Manual:**

**6.1. Criar buckets:**
- [ ] Ir em `Storage`
- [ ] Clicar em `Create a new bucket`

Criar os seguintes buckets:

| Bucket | Nome | Public | File Size Limit |
|--------|------|--------|-----------------|
| 1 | `avatars` | ✅ Public | 2 MB |
| 2 | `group-photos` | ✅ Public | 5 MB |
| 3 | `venue-photos` | ✅ Public | 5 MB |
| 4 | `receipts` | ❌ Private | 10 MB |

**6.2. Configurar políticas de Storage:**

Para cada bucket, ir em `Policies` e adicionar:

**avatars:**
```sql
-- Users can upload own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- Users can view all avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

**group-photos:**
```sql
-- Group admins can upload group photos
CREATE POLICY "Group admins can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'group-photos' AND
  EXISTS (
    SELECT 1 FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'admin')
    AND g.code = (storage.foldername(name))[1]
  )
);
```

**receipts:**
```sql
-- Users can upload own receipts
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- Users can only view own receipts
CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);
```

**✅ Checklist:**
- [x] ✅ 4 buckets criados
- [x] ✅ Políticas de acesso configuradas
- [ ] Testar upload (via dashboard - opcional)

---

### 7. Habilitar Realtime

**📋 Guia completo:** [SETUP-STORAGE-REALTIME.md](./SETUP-STORAGE-REALTIME.md)

**Método Rápido (Recomendado):**
- ✅ Já incluído no script `supabase/setup_storage_and_realtime.sql` (seção 6)

**Método Manual:**

**No Supabase Dashboard:**

- [ ] Ir em `Database` → `Replication`
- [ ] Habilitar realtime para as seguintes tabelas:
  - [ ] `events`
  - [ ] `event_attendance`
  - [ ] `event_actions`
  - [ ] `notifications`
  - [ ] `teams`

**Para cada tabela:**
1. Clicar na tabela
2. Marcar `Enable Realtime`
3. Salvar

**✅ Checklist:**
- [x] ✅ Realtime habilitado para 6 tabelas
  - ✅ `events`
  - ✅ `event_attendance`
  - ✅ `event_actions`
  - ✅ `notifications`
  - ✅ `teams`
  - ✅ `team_members`
- [x] ✅ Broadcast e Presence configurados (padrão)

---

### 8. Configurar Edge Functions (Opcional - Sprint 4)

**Postergar para Sprint 4 (Pix):**

```bash
# Criar function
supabase functions new generate-pix-qr

# Deploy quando pronto
supabase functions deploy generate-pix-qr
```

**Edge Functions planejadas:**
1. `generate-pix-qr` - Gera QR codes Pix (Sprint 4)
2. `send-notification` - Envia notificações (Sprint 2)
3. `calculate-metrics` - Calcula métricas (Sprint 3)

**✅ Checklist:**
- [ ] Estrutura de Edge Functions entendida
- [ ] Postergar implementação para sprints futuros

---

## 💻 FASE 3: SETUP DO PROJETO (DIA 2)

### 1. Configurar Repositório

```bash
# 1. Criar branch de desenvolvimento
git checkout -b v2-development

# 2. Criar estrutura de pastas
mkdir -p src/lib/supabase
mkdir -p src/hooks

# 3. Commit inicial
git add .
git commit -m "chore: setup v2 development branch (Supabase)"
git push origin v2-development
```

**✅ Checklist:**
- [ ] Branch `v2-development` criada
- [ ] Estrutura de pastas criada
- [ ] Push inicial feito

---

### 2. Instalar Dependências

```bash
# Supabase
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs

# Gráficos
pnpm add recharts

# Pix
pnpm add qrcode-pix qrcode

# Firebase (Push Notifications)
pnpm add firebase firebase-admin

# Types
pnpm add -D @types/qrcode

# Verificar instalação
pnpm list @supabase/supabase-js recharts qrcode-pix firebase
```

**✅ Checklist:**
- [ ] `@supabase/supabase-js` instalado
- [ ] `@supabase/auth-helpers-nextjs` instalado
- [ ] `recharts` instalado
- [ ] `qrcode-pix` instalado
- [ ] `firebase` instalado
- [ ] Types instalados

---

### 3. Criar Cliente Supabase

**3.1. Cliente Server-side:**

Criar `src/lib/supabase/server.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component - ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component - ignore
          }
        },
      },
    }
  )
}
```

**3.2. Cliente Client-side:**

Criar `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**3.3. Helper de Auth:**

Criar `src/lib/supabase/auth-helpers.ts`:

```typescript
import { createClient } from './server'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Buscar profile completo
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  return user
}
```

**✅ Checklist:**
- [ ] `src/lib/supabase/server.ts` criado
- [ ] `src/lib/supabase/client.ts` criado
- [ ] `src/lib/supabase/auth-helpers.ts` criado
- [ ] Imports testados (sem erros)

---

### 4. Configurar Middleware

**Atualizar `src/middleware.ts`:**

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Criar `src/lib/supabase/middleware.ts`:**

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rotas públicas
  const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/error']
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // Redirecionar para login se não autenticado
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Redirecionar para dashboard se já autenticado e tentando acessar auth
  if (user && request.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
```

**✅ Checklist:**
- [ ] Middleware atualizado
- [ ] Rotas públicas configuradas
- [ ] Redirecionamento funcionando

---

### 5. Configurar Firebase (Push Notifications)

**5.1. Criar Projeto Firebase:**
- [ ] Acessar [Firebase Console](https://console.firebase.google.com/)
- [ ] Criar novo projeto "ResenhApp V2" ou "ResenhApp"
- [ ] Habilitar Google Analytics (opcional)

**5.2. Adicionar App Web:**
- [ ] Clicar em "Add app" → Web
- [ ] Registrar app com nome "ResenhApp Web"
- [ ] Copiar configuração (firebaseConfig)

**5.3. Habilitar Cloud Messaging:**
- [ ] Ir em "Project Settings" → "Cloud Messaging"
- [ ] Clicar em "Cloud Messaging API" → Enable
- [ ] Gerar Web Push certificate (VAPID key)
- [ ] Copiar Server Key

**5.4. Criar Service Account:**
- [ ] Ir em "Project Settings" → "Service Accounts"
- [ ] Clicar em "Generate new private key"
- [ ] Salvar JSON (NUNCA commitar no Git!)

**5.5. Adicionar variáveis de ambiente:**

Adicionar no `.env.local`:

```env
# Firebase (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=resenhapp-v2.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=resenhapp-v2
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BM...

# Firebase Admin (server-side)
FIREBASE_ADMIN_PROJECT_ID=resenhapp-v2
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-...@resenhapp-v2.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**✅ Checklist:**
- [ ] Projeto Firebase criado
- [ ] App Web adicionado
- [ ] Cloud Messaging habilitado
- [ ] VAPID key gerado
- [ ] Service Account criado
- [ ] Variáveis adicionadas no `.env.local`

---

### 6. Configurar Vercel

**6.1. Adicionar variáveis de ambiente:**

No Vercel Dashboard:
- [ ] Ir em Project Settings → Environment Variables
- [ ] Adicionar TODAS as variáveis de `.env.local`
- [ ] Marcar para todos os ambientes (Production, Preview, Development)

**Variáveis obrigatórias:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
```

**6.2. Configurar Cron Jobs:**

Criar `vercel.json`:

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

Gerar `CRON_SECRET`:

```bash
openssl rand -base64 32
```

Adicionar em `.env.local` e Vercel:
```env
CRON_SECRET=<valor_gerado>
```

**6.3. Configurar Branch Deployments:**
- [ ] Ir em Project Settings → Git
- [ ] Habilitar "Automatic Deployments" para `v2-development`
- [ ] Configurar "Deploy Previews" para pull requests

**✅ Checklist:**
- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] `vercel.json` criado
- [ ] `CRON_SECRET` gerado e adicionado
- [ ] Branch deployments configurados
- [ ] Deploy automático testado

---

## 🎨 FASE 4: COMPONENTES BASE (DIA 3-4)

### 1. Design System UzzAI

**1.1. Atualizar `tailwind.config.ts`:**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  // ... config existente
  theme: {
    extend: {
      colors: {
        // UzzAI Brand Colors
        'uzzai': {
          'mint': '#4FFFB0',      // Verde menta vibrante
          'silver': '#95A5B8',     // Prata suave
          'charcoal': '#1a1f26',   // Carvão escuro
          'slate': '#2a3142',      // Ardósia
          'midnight': '#0f1419',   // Meia-noite
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-uzzai': 'linear-gradient(135deg, #1a1f26 0%, #0f1419 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(79, 255, 176, 0.1) 0%, rgba(42, 49, 66, 0.05) 100%)',
      },
    },
  },
}

export default config
```

**✅ Checklist:**
- [ ] Cores UzzAI adicionadas
- [ ] Gradientes configurados
- [ ] Fontes definidas

---

### 2. Componente Sidebar

**Criar `src/components/layout/sidebar.tsx`:**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  Calendar,
  BarChart3,
  Trophy,
  Wallet,
  Settings,
  Bell,
  Award,
} from 'lucide-react'

const navigation = [
  {
    section: 'PRINCIPAL',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Notificações', href: '/notifications', icon: Bell, badge: 0 },
    ],
  },
  {
    section: 'GESTÃO',
    items: [
      { name: 'Meus Grupos', href: '/groups', icon: Users },
      { name: 'Eventos', href: '/events', icon: Calendar },
      { name: 'Financeiro', href: '/finances', icon: Wallet },
    ],
  },
  {
    section: 'ANÁLISE',
    items: [
      { name: 'Estatísticas', href: '/stats', icon: BarChart3 },
      { name: 'Rankings', href: '/rankings', icon: Trophy },
      { name: 'Conquistas', href: '/achievements', icon: Award },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-gradient-to-b from-uzzai-charcoal to-uzzai-midnight">
      {/* Logo */}
      <div className="border-b border-white/5 p-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-uzzai-mint to-emerald-400" />
          <div>
            <h1 className="text-lg font-bold text-white">ResenhApp</h1>
            <p className="text-xs text-uzzai-silver">by UzzAI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {navigation.map((section) => (
          <div key={section.section}>
            <div className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-uzzai-silver">
              {section.section}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-uzzai-mint/15 text-uzzai-mint border-l-2 border-uzzai-mint'
                        : 'text-gray-400 hover:bg-uzzai-mint/10 hover:text-uzzai-mint'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-uzzai-mint/10 hover:text-uzzai-mint"
        >
          <Settings className="h-5 w-5" />
          <span>Configurações</span>
        </Link>
      </div>
    </aside>
  )
}
```

**✅ Checklist:**
- [ ] Arquivo `sidebar.tsx` criado
- [ ] Ícones importados (lucide-react)
- [ ] Navegação configurada
- [ ] Cores UzzAI aplicadas

---

### 3. Componente Topbar

**Criar `src/components/layout/topbar.tsx`:**

```tsx
'use client'

import { Bell, Search, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  const [notificationCount, setNotificationCount] = useState(3)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-uzzai-charcoal/80 backdrop-blur-xl px-8">
      {/* Left: Title */}
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-uzzai-silver">{subtitle}</p>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-uzzai-silver" />
          <Input
            placeholder="Buscar..."
            className="w-80 bg-white/5 pl-10 border-white/10 focus:border-uzzai-mint"
          />
        </div>

        {/* Custom Actions */}
        {actions}

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-white/10"
        >
          <Bell className="h-5 w-5 text-uzzai-silver" />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {notificationCount}
            </span>
          )}
        </Button>

        {/* User Profile */}
        <Button
          variant="ghost"
          className="gap-2 hover:bg-white/10"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-uzzai-mint to-emerald-400" />
          <span className="hidden text-sm font-medium text-white md:block">
            Pedro Silva
          </span>
          <ChevronDown className="h-4 w-4 text-uzzai-silver" />
        </Button>
      </div>
    </header>
  )
}
```

**✅ Checklist:**
- [ ] Arquivo `topbar.tsx` criado
- [ ] Search implementado
- [ ] Notificações com badge
- [ ] User profile dropdown

---

### 4. Layout Base

**Criar `src/app/(dashboard)/layout.tsx`:**

```tsx
import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-uzzai-midnight via-uzzai-charcoal to-uzzai-midnight">
      <Sidebar />
      <main className="ml-64 flex-1">
        {children}
      </main>
    </div>
  )
}
```

**✅ Checklist:**
- [ ] Layout criado
- [ ] Sidebar integrada
- [ ] Responsividade configurada

---

## 📊 FASE 5: PRIMEIRA PÁGINA (DIA 5-6)

### 1. Dashboard Principal

**Criar `src/app/(dashboard)/dashboard/page.tsx`:**

```tsx
import { requireAuth } from '@/lib/supabase/auth-helpers'
import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { MetricCard } from '@/components/dashboard/metric-card'
import { QuickAction } from '@/components/dashboard/quick-action'
import { RecentEvents } from '@/components/dashboard/recent-events'

export default async function DashboardPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Buscar estatísticas
  const { data: groups } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const groupIds = groups?.map(g => g.group_id) || []

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .in('group_id', groupIds)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .limit(5)

  const { data: attendance } = await supabase
    .from('event_attendance')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'yes')

  return (
    <div className="space-y-8 p-8">
      <Topbar
        title="Dashboard"
        subtitle={`Bem-vindo de volta, ${user.full_name || user.display_name}!`}
      />

      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard
          title="Meus Grupos"
          value={groups?.length || 0}
          trend="+12%"
          icon="users"
          color="mint"
        />
        <MetricCard
          title="Próximos Eventos"
          value={events?.length || 0}
          trend="+5%"
          icon="calendar"
          color="blue"
        />
        <MetricCard
          title="Confirmações"
          value={attendance?.length || 0}
          trend="+8%"
          icon="check"
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          title="Criar Grupo"
          description="Comece um novo grupo"
          href="/groups/new"
          icon="plus"
        />
        <QuickAction
          title="Ver Calendário"
          description="Próximos eventos"
          href="/calendar"
          icon="calendar"
        />
        <QuickAction
          title="Estatísticas"
          description="Veja seu desempenho"
          href="/stats"
          icon="chart"
        />
        <QuickAction
          title="Rankings"
          description="Veja os rankings"
          href="/rankings"
          icon="trophy"
        />
      </div>

      {/* Recent Events */}
      <RecentEvents events={events || []} />
    </div>
  )
}
```

**✅ Checklist:**
- [ ] Página criada
- [ ] Dados carregando do Supabase
- [ ] Métricas exibindo
- [ ] Quick actions funcionando

---

### 2. Componentes de Dashboard

**Criar `src/components/dashboard/metric-card.tsx`:**

```tsx
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface MetricCardProps {
  title: string
  value: number | string
  trend?: string
  icon: string
  color?: 'mint' | 'blue' | 'green' | 'red'
}

export function MetricCard({
  title,
  value,
  trend,
  icon,
  color = 'mint'
}: MetricCardProps) {
  const isPositive = trend?.startsWith('+')

  return (
    <Card className="border-white/10 bg-gradient-card p-6 backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-uzzai-silver">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                {trend}
              </span>
              <span className="text-uzzai-silver">vs. mês passado</span>
            </div>
          )}
        </div>
        <div className={`rounded-lg bg-${color}-500/10 p-3`}>
          {/* Icon dynamically based on prop */}
        </div>
      </div>
    </Card>
  )
}
```

**✅ Checklist:**
- [ ] MetricCard criado
- [ ] Trends funcionando
- [ ] Cores UzzAI aplicadas

---

## ✅ CHECKLIST FINAL DE INÍCIO

### Fase 1: Aprovação ⏳
- [ ] Reunião de aprovação realizada
  - **Status:** ⏳ Aguardando agendamento
  - **Próximo passo:** Agendar reunião 30min esta semana
- [ ] Pricing definido: R$ _____ /mês
  - **Recomendação:** R$ 40/mês (balanceado)
  - **Opções:** R$ 30 (agressivo) | R$ 40 (recomendado) | R$ 50 (premium)
- [ ] Decisão WhatsApp: [ ] Agora | [ ] Q2
  - **Recomendação:** Postergar para Q2 (validar ROI primeiro)
- [ ] Pilotos confirmados: _____, _____, _____
  - **Grupos identificados:** Grupo do Vitor, Engenharia (atlética)
  - **Estratégia:** 2-3 pilotos iniciais (não muitos)
- [ ] Data início Sprint 1: ___/___/2026
  - **Estimativa:** 27/01/2026 (segunda-feira)

### Fase 2: Supabase 🟡
- [x] ✅ Projeto Supabase criado
  - **Status:** ✅ Completo
  - **URL:** `https://ujrvfkkkssfdhwizjucq.supabase.co`
- [ ] Variáveis configuradas no Doppler
  - **Status:** ⏳ Pendente
  - **Próximo passo:** Adicionar variáveis no [Doppler Dashboard](https://dashboard.doppler.com/)
  - **Guia:** [SETUP-DOPPLER.md](./SETUP-DOPPLER.md)
- [x] ✅ 8 migrations aplicadas (40+ tabelas)
  - **Status:** ✅ **COMPLETO** (8/8 aplicadas)
  - **Aplicadas:** 
    - ✅ 20260127000001_initial_schema.sql (Extensions + Enums)
    - ✅ 20260127000002_auth_profiles.sql (Auth + User Types)
    - ✅ 20260127000003_groups_and_events.sql (Core System - 11 tabelas)
    - ✅ 20260127000004_rls_policies.sql (Row Level Security)
    - ✅ 20260204000001_financial_system.sql (Financeiro + Pix - 6 tabelas)
    - ✅ 20260211000001_notifications.sql (Notificações - 5 tabelas)
    - ✅ 20260218000001_analytics.sql (Analytics + Stats - 5 tabelas)
    - ✅ 20260225000001_gamification.sql (Gamificação - 7 tabelas)
  - **Próximo passo:** Verificar tabelas criadas e configurar Storage buckets
- [ ] RLS habilitado e testado
  - **Status:** ⏳ Pendente
  - **Migration:** `20260127000004_rls_policies.sql`
- [ ] Auth providers configurados
  - **Status:** ⏳ Em progresso
  - **Próximo passo:** Configurar URLs de produção no Supabase
  - **Guia:** [SETUP-AUTH-PROVIDERS.md](./SETUP-AUTH-PROVIDERS.md)
- [x] ✅ 4 Storage buckets criados
  - **Status:** ✅ **COMPLETO**
  - **Buckets criados:** avatars, group-photos, venue-photos, receipts
  - **Políticas configuradas:** 10+ políticas de acesso
- [x] ✅ Realtime habilitado (6 tabelas)
  - **Status:** ✅ **COMPLETO**
  - **Tabelas habilitadas:** events, event_attendance, event_actions, notifications, teams, team_members
- [ ] Seed data aplicado
  - **Status:** ⏳ Opcional (para desenvolvimento)

### Fase 3: Projeto ⏳
- [ ] Branch `v2-development` criada
  - **Status:** ⏳ Pendente
  - **Comando:** `git checkout -b v2-development`
- [ ] Dependências instaladas (Supabase, Recharts, Pix, Firebase)
  - **Status:** ⏳ Pendente
  - **Comando:** `pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs recharts qrcode-pix qrcode firebase firebase-admin`
- [ ] Cliente Supabase configurado (server + client)
  - **Status:** ⏳ Pendente
  - **Arquivos a criar:** `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/auth-helpers.ts`
- [ ] Middleware de auth funcionando
  - **Status:** ⏳ Pendente
  - **Arquivos a criar:** `src/middleware.ts`, `src/lib/supabase/middleware.ts`
- [ ] Firebase configurado (Cloud Messaging)
  - **Status:** ⏳ Pendente
  - **Próximo passo:** Criar projeto no [Firebase Console](https://console.firebase.google.com/)
- [ ] Vercel configurado (env vars + cron)
  - **Status:** ⏳ Pendente
  - **Próximo passo:** Adicionar variáveis de ambiente no Vercel Dashboard

### Fase 4: Componentes ⏳
- [ ] Design System UzzAI aplicado (Tailwind)
  - **Status:** ✅ Parcial (60% - cores e fonts configuradas)
  - **Pendente:** Completar aplicação em todas as páginas
- [ ] Sidebar criada e funcionando
  - **Status:** ⏳ Pendente (Sprint 1)
  - **Arquivo:** `src/components/layout/sidebar.tsx`
- [ ] Topbar criada e funcionando
  - **Status:** ⏳ Pendente (Sprint 1)
  - **Arquivo:** `src/components/layout/topbar.tsx`
- [ ] Layout base configurado
  - **Status:** ⏳ Pendente (Sprint 1)
  - **Arquivo:** `src/app/(dashboard)/layout.tsx`

### Fase 5: Dashboard ⏳
- [ ] Dashboard page criada
  - **Status:** ⏳ Pendente (Sprint 1)
  - **Arquivo:** `src/app/(dashboard)/dashboard/page.tsx`
- [ ] Dados carregando do Supabase
  - **Status:** ⏳ Pendente (após setup Supabase)
- [ ] MetricCard component criado
  - **Status:** ⏳ Pendente (Sprint 1)
  - **Arquivo:** `src/components/dashboard/metric-card.tsx`
- [ ] QuickAction component criado
  - **Status:** ⏳ Pendente (Sprint 1)
  - **Arquivo:** `src/components/dashboard/quick-action.tsx`
- [ ] Preview deployment testado
  - **Status:** ⏳ Pendente (após implementação)

---

## 🎯 QUANDO TUDO ESTIVER ✅

**Você está pronto para Sprint 1! 🎉**

### Próximos Passos:

1. **Consultar roadmap detalhado:**
   - Abrir [PLANOR00.md](./PLANOR00.md) - Plano mestre de execução
   - Abrir [ARQUITETURA-COMPLETA-SISTEMA-V2.md](./ARQUITETURA-COMPLETA-SISTEMA-V2.md)
   - Ir para Seção 8 - Roadmap
   - Seguir Sprint 1 (UI/UX Core)

2. **Referências técnicas:**
   - [DATABASE-ARCHITECTURE-SUPABASE-V2.md](./DATABASE-ARCHITECTURE-SUPABASE-V2.md) - Schema completo
   - [DECISOES-TECNICAS-V2.md](./DECISOES-TECNICAS-V2.md) - Padrões de código
   - [supabase/migrations/README.md](./supabase/migrations/README.md) - Guia de migrations

3. **Comunicação:**
   - Daily standups (15min)
   - Demo semanal com stakeholders
   - Retrospectiva ao final de cada sprint

---

## 📞 SUPORTE E DÚVIDAS

**Equipe Técnica:**
- Tech Lead: Luis Fernando Boff
- Product Owner: Pedro Vitor Pagliarin

**Documentação:**
- [Índice Completo](./PLANEJAMENTO-V2-INDEX.md)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js 15 Docs](https://nextjs.org/docs)

**Comunidade:**
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

---

**Criado em:** 2026-01-22
**Atualizado em:** 2026-01-22T23:00
**Responsável:** Tech Lead (Luis Fernando Boff)
**Versão:** 2.0.0-SUPABASE
**Status:** ✅ Pronto para Execução

**Próximas Ações Imediatas:**
1. ⏳ Agendar reunião de aprovação (30min)
2. ⏳ Criar projeto Supabase
3. ⏳ Aplicar migrations
4. ⏳ Setup ambiente de desenvolvimento

🚀 **Bora codar!**
