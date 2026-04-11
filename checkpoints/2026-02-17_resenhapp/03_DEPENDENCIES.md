# ResenhApp V2.0 — Dependências
> FATO (do código) — package.json

## Dependências de Produção

| Pacote | Versão | Propósito | Notas |
|--------|--------|-----------|-------|
| next | 16.1.1 | Framework principal | App Router |
| react | ^19.2.0 | UI library | React 19 (canary features) |
| react-dom | ^19.2.0 | DOM renderer | |
| typescript | ^5 | Tipagem | Strict mode ativo |
| next-auth | ^5.0.0-beta.25 | Autenticação | **BETA** — instável |
| @auth/pg-adapter | ^1.7.4 | Adapter NextAuth → PostgreSQL | |
| postgres | ^3.4.8 | Client PostgreSQL | Usado em src/db/client.ts |
| zod | ^3.24.1 | Validação de schemas | Usado em todas as API routes |
| zustand | ^5.0.8 | State management | auth-store |
| bcryptjs | ^2.4.3 | Hash de senhas | Signup e credential auth |
| @sentry/nextjs | ^10.36.0 | Error tracking | Client + Server + Edge |
| pino | ^9.5.0 | Logging estruturado | |
| sonner | ^1.7.0 | Toast notifications | Usado em undo.ts e geral |
| date-fns | ^4.1.0 | Manipulação de datas | |
| qrcode | ^1.5.4 | Geração de QR Code | PIX QR codes |
| jspdf | ^3.0.4 | Geração de PDF | Export financeiro |
| jspdf-autotable | ^5.0.2 | Tabelas em PDF | |
| @tanstack/react-table | ^8.21.3 | Tabelas de dados | |
| tailwindcss | ^3.4.1 | CSS utility-first | |
| tailwind-merge | ^2.5.5 | Merge de classes Tailwind | |
| tailwindcss-animate | ^1.0.7 | Animações Tailwind | |
| clsx | ^2.1.1 | Merge de classnames | |
| class-variance-authority | ^0.7.1 | Variants de componentes | |
| cmdk | ^1.1.1 | Command palette | |
| lucide-react | ^0.462.0 | Ícones | |
| @radix-ui/react-* | ^1-2.x | Componentes UI acessíveis | 11 pacotes |

## Dependências de Desenvolvimento

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| vitest | ^4.0.18 | Test runner (unit/integration) |
| @vitest/coverage-v8 | ^4.0.18 | Coverage V8 |
| @vitest/ui | ^4.0.18 | UI para testes |
| @playwright/test | ^1.58.0 | Testes E2E |
| @testing-library/react | ^16.3.2 | Testes de componentes |
| @testing-library/jest-dom | ^6.9.1 | Matchers DOM |
| @testing-library/user-event | ^14.6.1 | Simulação de eventos |
| jsdom | ^27.4.0 | DOM simulado para testes |
| happy-dom | ^20.3.7 | DOM alternativo mais rápido |
| @vitejs/plugin-react | ^5.1.2 | Plugin React para Vitest |
| pino-pretty | ^13.0.0 | Logs legíveis em desenvolvimento |
| eslint | ^9 | Linting |
| eslint-config-next | 16.1.1 | Config ESLint Next.js |

## Riscos de Dependências
1. **next-auth@beta**: v5.0.0-beta.25 — versão beta, API pode mudar antes do release estável
2. **React 19**: Versão canary com features experimentais (Server Actions)
3. **pnpm 10.18.1**: Versão recente, garantir compatibilidade com CI/CD
