# ResenhApp V2.0 — Build & Runbook
> FATO (do código) — extraído de package.json, .env.example, next.config.ts, playwright.config.ts

## Pré-requisitos
- Node.js >= 18.17.0
- pnpm 10.18.1
- PostgreSQL (via Supabase ou Neon)

## Variáveis de Ambiente
### Obrigatórias (de .env.example)
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| DATABASE_URL | PostgreSQL (Neon legacy) | postgresql://user:pass@host/db?sslmode=require |
| SUPABASE_DB_URL | PostgreSQL (Supabase — preferido) | postgresql://... |
| AUTH_SECRET | NextAuth secret (openssl rand -base64 32) | ... |
| NEXTAUTH_URL | URL base do app | http://localhost:3000 |

### Opcionais
| Variável | Descrição |
|----------|-----------|
| NEXT_PUBLIC_SENTRY_DSN | Sentry client error tracking |
| SENTRY_DSN | Sentry server error tracking |
| LOG_LEVEL | Nível de log Pino (default: info) |
| PLAYWRIGHT_TEST_BASE_URL | URL para testes E2E (default: http://localhost:3000) |

### Depreciadas (NÃO usar)
- NEXT_PUBLIC_STACK_PROJECT_ID (era Stack Auth, migrado para NextAuth)
- STACK_SECRET_SERVER_KEY

## Instalação e Execução Local
```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# 3. Rodar em desenvolvimento
pnpm run dev
# Servidor em http://localhost:3000
# Modo: Next.js com webpack (não Turbopack)
```

## Scripts Disponíveis
```bash
pnpm run dev          # Dev server (webpack)
pnpm run build        # Build de produção
pnpm run start        # Servidor de produção
pnpm run lint         # ESLint
pnpm run test         # Vitest em modo watch
pnpm run test:run     # Vitest uma execução
pnpm run test:ui      # Vitest com UI
pnpm run test:coverage # Cobertura V8
pnpm run test:e2e     # Playwright E2E
pnpm run test:e2e:ui  # Playwright com UI
pnpm run test:e2e:headed # Playwright visível
```

## Banco de Dados
```bash
# Aplicar migrations via Supabase CLI
supabase db push

# Validar migrations aplicadas
psql $DATABASE_URL -f scripts/validar-migrations-aplicadas.sql

# Seed de dados de demonstração
psql $DATABASE_URL -f supabase/seed.sql

# Setup de Storage e Realtime
psql $DATABASE_URL -f supabase/setup_storage_and_realtime.sql
```

## Deploy (Vercel)
- Push para branch `main` dispara deploy automático
- Vercel detecta Next.js automaticamente
- Variáveis de ambiente configuradas no painel Vercel
- Domain: resenhapp.uzzai.com.br (Cloudflare DNS)

## Cron Jobs (Vercel)
Configurados em vercel.json:
| Path | Schedule | Descrição |
|------|----------|-----------|
| /api/cron/send-reminders | 0 10 * * * | Lembretes diários às 10h UTC |
| /api/cron/calculate-metrics | 0 2 * * * | Métricas diárias às 2h UTC |
| /api/cron/cleanup-notifications | 0 3 * * 0 | Limpeza semanal (domingos 3h UTC) |

NOTA: Os routes desses crons NÃO FORAM ENCONTRADOS em src/app/api/. São mencionados no vercel.json mas não existem no código. RISCO CRÍTICO: crons podem falhar com 404.

## Configurações Next.js (next.config.ts)
- Server Actions habilitadas com limite de 2MB
- Import optimization: lucide-react, @radix-ui/react-dialog, @radix-ui/react-dropdown-menu
- Console removido em produção (exceto console.error e console.warn)
- React Strict Mode: ativo
