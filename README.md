# ResenhApp V2.0

App para gestão de peladas de futebol - criação de grupos, organização de partidas, sorteio de times, estatísticas e rankings.

> **🔄 Rebranding:** Este projeto foi migrado de "Peladeiros" para **ResenhApp V2.0** com infraestrutura atualizada para Supabase.

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 16.1.1 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Auth**: Supabase Auth + NextAuth v5 (Auth.js) com credenciais
- **UI Components**: shadcn/ui + Radix UI
- **Deploy**: Vercel
- **DNS/CDN**: Cloudflare
- **Storage**: Supabase Storage (avatars, fotos, recibos)

## 📋 Setup Rápido

> **📚 Documentação Completa**: Veja [docs/12 - Rebranding/](./docs/12%20-%20Rebranding/) para guias detalhados

### 1. Instalar dependências

```bash
pnpm install
# ou
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SUPABASE_DB_URL=postgresql://postgres:senha@db.seu-projeto.supabase.co:5432/postgres

# NextAuth (opcional - para compatibilidade)
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=gerar-com-openssl-rand-base64-32
```

**📖 Guia completo:** [SETUP-SUPABASE-PASSO-A-PASSO.md](./docs/12%20-%20Rebranding/SETUP-SUPABASE-PASSO-A-PASSO.md)

### 3. Aplicar Migrations

As migrations estão em `supabase/migrations/`. Aplique via Supabase Dashboard ou CLI:

```bash
# Via Supabase CLI
supabase db push

# Ou manualmente via SQL Editor no Supabase Dashboard
```

**📖 Guia completo:** [APLICAR-MIGRATIONS-SUPABASE.md](./docs/12%20-%20Rebranding/APLICAR-MIGRATIONS-SUPABASE.md)

### 4. Configurar Storage e Realtime

Execute o script `supabase/setup_storage_and_realtime.sql` no SQL Editor do Supabase.

**📖 Guia completo:** [SETUP-STORAGE-REALTIME.md](./docs/12%20-%20Rebranding/SETUP-STORAGE-REALTIME.md)

### 5. Desenvolvimento

```bash
pnpm run dev
# ou
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

### 6. Build de Produção

```bash
pnpm run build
pnpm run start
```

## 📁 Estrutura do Projeto

```
peladeiros-main/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes (30+ endpoints)
│   │   │   ├── auth/          # Auth API (signup, NextAuth)
│   │   │   ├── events/        # Eventos API
│   │   │   ├── groups/        # Grupos API
│   │   │   └── users/         # Usuários API
│   │   ├── auth/              # Auth pages (signin, signup, error)
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── events/            # Páginas de eventos
│   │   └── groups/            # Páginas de grupos
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components (19 componentes)
│   │   ├── layout/           # Layout components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── events/           # Event components (18 componentes)
│   │   ├── groups/           # Group components (7 componentes)
│   │   └── payments/         # Payment components
│   ├── db/                    # Database (legado - Neon)
│   │   ├── client.ts         # Supabase client (lazy initialization)
│   │   └── migrations/       # Migrations antigas
│   ├── lib/                   # Utilities
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── auth-helpers.ts   # Auth helpers
│   │   ├── logger.ts         # Logging (Pino)
│   │   ├── rate-limit.ts     # Rate limiting
│   │   └── stores/           # Zustand stores
│   └── types/                 # TypeScript types
├── supabase/                  # Supabase configuration
│   ├── migrations/           # SQL migrations (8 migrations)
│   │   ├── 20260127000001_initial_schema.sql
│   │   ├── 20260127000002_auth_profiles.sql
│   │   ├── 20260127000003_groups_and_events.sql
│   │   ├── 20260127000004_rls_policies.sql
│   │   ├── 20260204000001_financial_system.sql
│   │   ├── 20260211000001_notifications.sql
│   │   ├── 20260218000001_analytics.sql
│   │   └── 20260225000001_gamification.sql
│   ├── setup_storage_and_realtime.sql
│   └── verify_migrations_simple.sql
├── docs/                      # Documentação
│   └── 12 - Rebranding/      # Documentação V2.0
│       ├── PLANOR00.md       # Plano mestre
│       ├── CHECKLIST-INICIO-V2.md
│       ├── SETUP-SUPABASE-PASSO-A-PASSO.md
│       ├── SETUP-PRODUCAO.md
│       └── ... (20+ documentos)
└── public/                    # Arquivos estáticos
```

## 🗄️ Arquitetura do Banco de Dados

### Tabelas Principais (~40 tabelas)

**Core System:**
- `groups` - Grupos/peladas
- `group_members` - Membros dos grupos
- `events` - Eventos/partidas
- `event_attendance` - Confirmação de presença
- `teams` - Times sorteados
- `team_members` - Jogadores dos times
- `event_actions` - Ações da partida (gols, assistências)
- `venues` - Locais de jogo

**Financial System:**
- `wallets` - Carteiras dos usuários
- `charges` - Cobranças
- `charge_splits` - Divisão de cobranças
- `transactions` - Transações financeiras
- `pix_payments` - Pagamentos Pix

**Notifications:**
- `notifications` - Notificações
- `notification_templates` - Templates
- `push_tokens` - Tokens FCM
- `email_queue` - Fila de emails

**Analytics & Gamification:**
- `player_stats` - Estatísticas de jogadores
- `group_stats` - Estatísticas de grupos
- `achievements` - Conquistas
- `badges` - Badges
- `leaderboards` - Rankings

**📖 Documentação completa:** [DATABASE-ARCHITECTURE-COMPLETE-V2.md](./docs/12%20-%20Rebranding/DATABASE-ARCHITECTURE-COMPLETE-V2.md)

## 🚀 Deploy

### Produção

**Domínio:** `https://resenhapp.uzzai.com.br`

**Configuração:**
- **Vercel**: Hosting e deploy automático
- **Cloudflare**: DNS, SSL/TLS, CDN
- **Supabase**: Database, Auth, Storage, Realtime

**📖 Guia completo:** [SETUP-PRODUCAO.md](./docs/12%20-%20Rebranding/SETUP-PRODUCAO.md)

### Variáveis de Ambiente (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY (Secret)
SUPABASE_DB_URL (Secret)
```

## 📚 Documentação

### Guias Principais

- **[PLANOR00.md](./docs/12%20-%20Rebranding/PLANOR00.md)** - Plano mestre do projeto
- **[CHECKLIST-INICIO-V2.md](./docs/12%20-%20Rebranding/CHECKLIST-INICIO-V2.md)** - Checklist completo
- **[RESUMO-GERAL-PROJETO.md](./docs/12%20-%20Rebranding/RESUMO-GERAL-PROJETO.md)** - Resumo do status atual

### Setup

- **[SETUP-SUPABASE-PASSO-A-PASSO.md](./docs/12%20-%20Rebranding/SETUP-SUPABASE-PASSO-A-PASSO.md)** - Setup inicial Supabase
- **[SETUP-STORAGE-REALTIME.md](./docs/12%20-%20Rebranding/SETUP-STORAGE-REALTIME.md)** - Configurar Storage e Realtime
- **[SETUP-AUTH-PROVIDERS.md](./docs/12%20-%20Rebranding/SETUP-AUTH-PROVIDERS.md)** - Configurar autenticação
- **[SETUP-PRODUCAO.md](./docs/12%20-%20Rebranding/SETUP-PRODUCAO.md)** - Deploy em produção

### Arquitetura

- **[ARQUITETURA-COMPLETA-SISTEMA-V2.md](./docs/12%20-%20Rebranding/ARQUITETURA-COMPLETA-SISTEMA-V2.md)** - Arquitetura completa
- **[DATABASE-ARCHITECTURE-COMPLETE-V2.md](./docs/12%20-%20Rebranding/DATABASE-ARCHITECTURE-COMPLETE-V2.md)** - Schema do banco
- **[DECISOES-TECNICAS-V2.md](./docs/12%20-%20Rebranding/DECISOES-TECNICAS-V2.md)** - Decisões técnicas

## 🎯 Status do Projeto

### ✅ Completo (80%)

- ✅ Supabase setup completo
- ✅ 8 migrations aplicadas (~40 tabelas)
- ✅ Storage buckets configurados (4 buckets)
- ✅ Realtime habilitado (6 tabelas)
- ✅ DNS Cloudflare configurado
- ✅ Domínio verificado no Vercel
- ✅ Build local funcionando
- ✅ Correções de TypeScript aplicadas

### ⏳ Em Progresso (15%)

- ⏳ Variáveis de ambiente no Vercel
- ⏳ Deploy em produção
- ⏳ Testes em produção

### 📅 Próximos Passos (5%)

- 📅 Configurar Supabase URLs de produção
- 📅 Testar autenticação em produção
- 📅 Migrar branding completo

## 🔄 Migração do Neon para Supabase

Este projeto foi migrado do **Neon PostgreSQL** para **Supabase**. Principais mudanças:

- ✅ Database: Neon → Supabase PostgreSQL
- ✅ Auth: NextAuth standalone → Supabase Auth + NextAuth
- ✅ Storage: Sem storage → Supabase Storage (4 buckets)
- ✅ Realtime: Sem realtime → Supabase Realtime (6 tabelas)
- ✅ RLS: Manual → Supabase Row Level Security nativo

**📖 Detalhes:** [SUPABASE-MIGRATION-SUMMARY.md](./docs/12%20-%20Rebranding/SUPABASE-MIGRATION-SUMMARY.md)

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run dev          # Inicia servidor de desenvolvimento

# Build
pnpm run build        # Build de produção
pnpm run start        # Inicia servidor de produção

# Lint
pnpm run lint         # Executa ESLint
```

## 📝 Licença

Este projeto é privado e proprietário da UzzAI.

## 🤝 Contribuindo

Este é um projeto interno. Para contribuições, entre em contato com a equipe de desenvolvimento.

---

**Última atualização:** 2026-01-27  
**Versão:** 2.0.0  
**Status:** 🟡 Em desenvolvimento (80% completo)
