# DECISÕES TÉCNICAS - PELADEIROS V2.0

**Documento de Decisões de Arquitetura e Stack**
**Versão:** 1.0
**Data:** 2026-01-21
**Responsável:** Luis Fernando Boff (Tech Lead)

---

## 📋 ÍNDICE

1. [Comparação de Tecnologias](#1-comparação-de-tecnologias)
2. [Decisões de Stack](#2-decisões-de-stack)
3. [Padrões de Código](#3-padrões-de-código)
4. [Performance e Otimização](#4-performance-e-otimização)
5. [Segurança](#5-segurança)
6. [DevOps e Deploy](#6-devops-e-deploy)
7. [Testes](#7-testes)
8. [Monitoramento](#8-monitoramento)

---

## 1. COMPARAÇÃO DE TECNOLOGIAS

### 1.1 Bibliotecas de Gráficos

| Critério | Recharts | Chart.js | Victory | Visx |
|----------|----------|----------|---------|------|
| **Integração React** | ✅ Nativa | ⚠️ Wrapper | ✅ Nativa | ✅ Nativa |
| **Bundle Size** | ~100KB | ~180KB | ~120KB | ~50KB |
| **Customização** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **TypeScript** | ✅ Excelente | ⚠️ Médio | ✅ Bom | ✅ Excelente |
| **Documentação** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Curva de Aprendizado** | Baixa | Baixa | Média | Alta |
| **Performance** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Responsividade** | ✅ Nativa | ⚠️ Manual | ✅ Nativa | ✅ Nativa |

**🏆 DECISÃO: Recharts**

**Justificativa:**
- Melhor balanço entre facilidade de uso e customização
- Integração nativa com React e TypeScript
- Documentação excelente com exemplos
- Responsivo out-of-the-box
- Comunidade ativa e bem mantido

**Exemplo de Uso:**
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ActivityChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="date" stroke="#B0B0B0" />
        <YAxis stroke="#B0B0B0" />
        <Tooltip
          contentStyle={{ background: '#1a1f26', border: '1px solid #1ABC9C' }}
        />
        <Line type="monotone" dataKey="attendance" stroke="#1ABC9C" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

### 1.2 Geração de QR Code Pix

| Critério | qrcode-pix | pix-utils | Implementação Própria |
|----------|------------|-----------|----------------------|
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Manutenção** | ✅ Ativa | ⚠️ Irregular | ❌ Manual |
| **TypeScript** | ✅ Sim | ⚠️ Parcial | ✅ Controlado |
| **Validação** | ✅ Completa | ✅ Completa | ⚠️ Manual |
| **Customização** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Bundle Size** | ~15KB | ~20KB | ~5KB |
| **Documentação** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |

**🏆 DECISÃO: qrcode-pix + qrcode**

**Justificativa:**
- Biblioteca especializada em Pix (segue padrão Banco Central)
- Validação automática de chaves Pix
- Geração de payload EMV correta
- Combinar com `qrcode` para gerar imagem SVG/PNG

**Stack:**
```bash
pnpm add qrcode-pix qrcode
pnpm add -D @types/qrcode
```

**Exemplo de Uso:**
```typescript
import QRCodePix from 'qrcode-pix';
import QRCode from 'qrcode';

export async function generatePixQRCode({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  description,
}: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  description: string;
}) {
  // Gerar payload EMV
  const qrCodePix = QRCodePix({
    version: '01',
    key: pixKey,
    name: merchantName,
    city: merchantCity,
    transactionId: crypto.randomUUID().slice(0, 25), // Max 25 chars
    message: description,
    value: amount,
  });

  const payload = qrCodePix.payload();

  // Gerar imagem QR Code
  const qrCodeDataURL = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 300,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return {
    payload, // EMV string para Pix Copia e Cola
    qrCodeDataURL, // Data URL da imagem
  };
}
```

---

### 1.3 Push Notifications

| Critério | Firebase FCM | OneSignal | Pusher Beams | Web Push API |
|----------|--------------|-----------|--------------|--------------|
| **Custo (Free Tier)** | Ilimitado | 10k/mês | 1k/mês | Grátis |
| **Facilidade** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Web + Mobile** | ✅ Sim | ✅ Sim | ✅ Sim | ⚠️ Web only |
| **Analytics** | ✅ Sim | ✅ Sim | ⚠️ Básico | ❌ Não |
| **Segmentação** | ✅ Sim | ✅ Sim | ✅ Sim | ⚠️ Manual |
| **Delivery Rate** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**🏆 DECISÃO: Firebase Cloud Messaging (FCM)**

**Justificativa:**
- Gratuito e ilimitado
- Suporta Web + Mobile (iOS/Android via Capacitor)
- Integração fácil com Next.js
- Analytics integrado
- Confiabilidade alta (Google)

**Setup:**
```bash
pnpm add firebase firebase-admin
```

**Configuração:**
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
```

---

### 1.4 Background Jobs (Notificações Automáticas)

| Critério | Vercel Cron | Inngest | BullMQ + Redis | Trigger.dev |
|----------|-------------|---------|----------------|-------------|
| **Custo** | Grátis | $20/mês | $10/mês | $20/mês |
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Confiabilidade** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Retry Logic** | ❌ Manual | ✅ Automático | ✅ Automático | ✅ Automático |
| **Observabilidade** | ⚠️ Básico | ✅ Dashboard | ⚠️ Manual | ✅ Dashboard |

**🏆 DECISÃO: Vercel Cron (MVP) → Inngest (Produção)**

**Justificativa:**
- **Fase MVP:** Vercel Cron é suficiente (gratuito, simples)
- **Fase Produção:** Migrar para Inngest quando escalar (retry automático, observabilidade)

**Exemplo Vercel Cron:**
```typescript
// app/api/cron/send-reminders/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/db/client';
import { sendNotification } from '@/lib/notifications';

export async function GET(request: Request) {
  // Verificar autenticação do cron (Vercel envia header)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Buscar eventos que acontecem em 2 dias
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const events = await sql`
      SELECT e.*, g.name as group_name
      FROM events e
      JOIN groups g ON e.group_id = g.id
      WHERE DATE(e.starts_at) = DATE(${twoDaysFromNow})
        AND e.reminder_sent = false
    `;

    // Enviar notificações
    for (const event of events) {
      const attendees = await sql`
        SELECT ea.user_id
        FROM event_attendance ea
        WHERE ea.event_id = ${event.id}
          AND ea.status = 'pending'
      `;

      for (const attendee of attendees) {
        await sendNotification({
          userId: attendee.user_id,
          type: 'rsvp_reminder',
          title: 'Lembrete: Pelada amanhã!',
          message: `Não esqueça de confirmar sua presença para ${event.group_name}`,
          link: `/groups/${event.group_id}/events/${event.id}`,
        });
      }

      // Marcar como enviado
      await sql`
        UPDATE events SET reminder_sent = true WHERE id = ${event.id}
      `;
    }

    return NextResponse.json({
      success: true,
      eventCount: events.length
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Configurar no Vercel:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

---

## 2. DECISÕES DE STACK

### 2.1 Stack Confirmado (V2.0)

```yaml
Frontend:
  Framework: Next.js 15 (App Router)
  UI Library: React 19
  Styling: Tailwind CSS
  UI Components: shadcn/ui (Radix UI)
  Charts: Recharts
  State Management: Zustand
  Form Validation: Zod + React Hook Form
  HTTP Client: fetch (nativo)

Backend:
  Runtime: Node.js 20
  API: Next.js API Routes
  Database: Neon PostgreSQL Serverless
  DB Client: @neondatabase/serverless (raw SQL)
  Authentication: NextAuth v5
  Password Hashing: bcrypt
  Background Jobs: Vercel Cron → Inngest (futuro)
  Logging: Pino

External Services:
  Payment QR: qrcode-pix + qrcode
  Push Notifications: Firebase Cloud Messaging
  WhatsApp (futuro): WhatsApp Business API
  Email (futuro): Resend ou SendGrid

DevOps:
  Hosting: Vercel
  Database: Neon (Vercel Integration)
  Package Manager: pnpm
  Version Control: Git + GitHub
  CI/CD: Vercel auto-deploy (GitHub integration)

Development:
  Language: TypeScript (strict mode)
  Linting: ESLint (Next.js config)
  Formatting: Prettier (integrado com ESLint)
  Git Hooks: Husky (lint-staged)
```

### 2.2 Dependências (package.json)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@radix-ui/react-*": "^1.0.0",
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",

    "@neondatabase/serverless": "^0.9.0",
    "next-auth": "^5.0.0-beta",
    "bcrypt": "^5.1.1",
    "zod": "^3.22.0",
    "zustand": "^4.5.0",

    "recharts": "^2.10.0",
    "qrcode-pix": "^1.3.0",
    "qrcode": "^1.5.3",
    "firebase": "^10.7.0",
    "firebase-admin": "^12.0.0",

    "pino": "^8.17.0",
    "pino-pretty": "^10.3.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^19.0.0",
    "@types/bcrypt": "^5.0.2",
    "@types/qrcode": "^1.5.5",
    "typescript": "^5.3.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.1.0",
    "prettier-plugin-tailwindcss": "^0.5.0"
  }
}
```

---

## 3. PADRÕES DE CÓDIGO

### 3.1 Estrutura de Componentes React

**Server Components (Default):**
```tsx
// app/groups/[groupId]/page.tsx
import { sql } from '@/db/client';
import { requireAuth } from '@/lib/auth-helpers';
import { GroupDashboard } from '@/components/groups/group-dashboard';

export default async function GroupPage({
  params
}: {
  params: { groupId: string }
}) {
  const user = await requireAuth();

  const group = await sql`
    SELECT * FROM groups WHERE id = ${params.groupId}
  `;

  return <GroupDashboard group={group} user={user} />;
}
```

**Client Components:**
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function RSVPButton({ eventId }: { eventId: number }) {
  const [loading, setLoading] = useState(false);

  const handleRSVP = async (status: 'yes' | 'no') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to RSVP');

      // Refresh or update UI
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleRSVP('yes')}
        disabled={loading}
      >
        Confirmar
      </Button>
      <Button
        variant="outline"
        onClick={() => handleRSVP('no')}
        disabled={loading}
      >
        Recusar
      </Button>
    </div>
  );
}
```

### 3.2 Padrão de API Routes

```typescript
// app/api/groups/[groupId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { sql } from '@/db/client';
import logger from '@/lib/logger';
import { z } from 'zod';

const updateGroupSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  is_private: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const user = await requireAuth();
    const groupId = parseInt(params.groupId);

    // Verificar se usuário é membro
    const membership = await sql`
      SELECT * FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;

    if (membership.length === 0) {
      return NextResponse.json(
        { error: 'Você não é membro deste grupo' },
        { status: 403 }
      );
    }

    const group = await sql`
      SELECT * FROM groups WHERE id = ${groupId}
    `;

    return NextResponse.json({ group: group[0] });
  } catch (error) {
    if (error instanceof Error && error.message === 'Não autenticado') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    logger.error(error, `Error in GET /api/groups/${params.groupId}`);
    return NextResponse.json({ error: 'Erro ao buscar grupo' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const user = await requireAuth();
    const groupId = parseInt(params.groupId);
    const body = await request.json();

    // Validar dados
    const validatedData = updateGroupSchema.parse(body);

    // Verificar se é admin
    const membership = await sql`
      SELECT role FROM group_members
      WHERE group_id = ${groupId} AND user_id = ${user.id}
    `;

    if (membership.length === 0 || membership[0].role !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas admins podem editar o grupo' },
        { status: 403 }
      );
    }

    // Atualizar grupo
    const updated = await sql`
      UPDATE groups
      SET
        name = COALESCE(${validatedData.name}, name),
        description = COALESCE(${validatedData.description}, description),
        is_private = COALESCE(${validatedData.is_private}, is_private),
        updated_at = NOW()
      WHERE id = ${groupId}
      RETURNING *
    `;

    logger.info({ groupId, userId: user.id }, 'Group updated');
    return NextResponse.json({ group: updated[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === 'Não autenticado') {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    logger.error(error, `Error in PATCH /api/groups/${params.groupId}`);
    return NextResponse.json({ error: 'Erro ao atualizar grupo' }, { status: 500 });
  }
}
```

### 3.3 Convenções de Nomenclatura

**Arquivos:**
- Components: `kebab-case.tsx` (ex: `metric-card.tsx`)
- API Routes: `route.ts`
- Types: `PascalCase.ts` (ex: `Database.ts`)
- Utilities: `kebab-case.ts` (ex: `auth-helpers.ts`)

**Código:**
- Components: `PascalCase` (ex: `MetricCard`)
- Functions: `camelCase` (ex: `generatePixQRCode`)
- Constants: `UPPER_SNAKE_CASE` (ex: `MAX_PLAYERS`)
- Types/Interfaces: `PascalCase` (ex: `User`, `GroupMember`)
- Database tables: `snake_case` (ex: `group_members`)

**Comentários:**
```typescript
// ❌ Evitar comentários óbvios
const count = users.length; // Get user count

// ✅ Comentários úteis
// Validar se evento ainda aceita confirmações (24h antes do início)
const cutoffTime = new Date(event.starts_at);
cutoffTime.setHours(cutoffTime.getHours() - 24);
```

---

## 4. PERFORMANCE E OTIMIZAÇÃO

### 4.1 Code Splitting

```tsx
// Lazy loading de componentes pesados
import dynamic from 'next/dynamic';

const TacticalBoard = dynamic(
  () => import('@/components/training/tactical-board'),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false // Não renderizar no servidor
  }
);

const ActivityChart = dynamic(
  () => import('@/components/analytics/activity-chart'),
  { loading: () => <LoadingSkeleton /> }
);
```

### 4.2 Database Query Optimization

```typescript
// ❌ N+1 queries
for (const event of events) {
  const attendance = await sql`SELECT * FROM event_attendance WHERE event_id = ${event.id}`;
}

// ✅ Join ou batch query
const eventsWithAttendance = await sql`
  SELECT
    e.*,
    COUNT(ea.id) as total_confirmed
  FROM events e
  LEFT JOIN event_attendance ea ON e.id = ea.event_id AND ea.status = 'yes'
  GROUP BY e.id
`;
```

### 4.3 Caching Strategy

**Server-side (Next.js):**
```tsx
// Revalidar a cada 60 segundos
export const revalidate = 60;

export default async function RankingsPage() {
  const rankings = await sql`SELECT * FROM rankings ORDER BY goals DESC`;
  return <RankingsList data={rankings} />;
}
```

**Client-side (React Query - futuro):**
```tsx
import { useQuery } from '@tanstack/react-query';

function useGroupStats(groupId: number) {
  return useQuery({
    queryKey: ['group-stats', groupId],
    queryFn: () => fetch(`/api/groups/${groupId}/stats`).then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
```

### 4.4 Image Optimization

```tsx
import Image from 'next/image';

// Usar Next.js Image component
<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // Para imagens above the fold
/>

// Lazy loading para avatares
<Image
  src={user.avatar}
  alt={user.name}
  width={40}
  height={40}
  loading="lazy"
/>
```

---

## 5. SEGURANÇA

### 5.1 Validação de Dados

**Sempre validar no servidor:**
```typescript
// ❌ Confiar em dados do cliente
const { amount } = await request.json();
await createCharge(amount);

// ✅ Validar com Zod
const chargeSchema = z.object({
  amount: z.number().positive().max(10000),
  description: z.string().min(1).max(200),
});

const { amount, description } = chargeSchema.parse(await request.json());
```

### 5.2 SQL Injection Prevention

**Sempre usar prepared statements:**
```typescript
// ❌ NUNCA fazer isso
const userId = request.query.userId;
await sql`SELECT * FROM users WHERE id = ${userId}`; // Vulnerável!

// ✅ Usar parâmetros
const userId = parseInt(request.query.userId);
await sql`SELECT * FROM users WHERE id = ${userId}`; // Seguro (biblioteca escapa)
```

### 5.3 Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
});

// Uso em API route
export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em alguns segundos.' },
      { status: 429 }
    );
  }

  // Processar requisição
}
```

### 5.4 Autorização

```typescript
// Sempre verificar permissões
async function requireGroupAdmin(groupId: number, userId: number) {
  const membership = await sql`
    SELECT role FROM group_members
    WHERE group_id = ${groupId} AND user_id = ${userId}
  `;

  if (membership.length === 0 || membership[0].role !== 'admin') {
    throw new Error('Acesso negado');
  }
}

// Uso
export async function DELETE(
  request: NextRequest,
  { params }: { params: { groupId: string, memberId: string } }
) {
  const user = await requireAuth();
  await requireGroupAdmin(parseInt(params.groupId), user.id);

  // Processar exclusão
}
```

---

## 6. DEVOPS E DEPLOY

### 6.1 Ambientes

```
Development:
  - Branch: develop
  - URL: http://localhost:3000
  - Database: Neon dev branch

Staging:
  - Branch: staging
  - URL: https://staging-peladeiros.vercel.app
  - Database: Neon staging branch

Production:
  - Branch: main
  - URL: https://resenhafc.com
  - Database: Neon production
```

### 6.2 Variáveis de Ambiente

```env
# .env.local (development)
DATABASE_URL=postgresql://...
AUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
FIREBASE_ADMIN_PRIVATE_KEY=...

# Cron
CRON_SECRET=...

# Rate Limiting (opcional)
UPSTASH_REDIS_URL=...
UPSTASH_REDIS_TOKEN=...
```

### 6.3 CI/CD (Vercel)

**Auto-deploy em cada push:**
- `main` → Production
- `staging` → Staging preview
- Feature branches → Preview deployments

**Vercel Build Command:**
```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install --frozen-lockfile"
}
```

---

## 7. TESTES

### 7.1 Estratégia de Testes (Futuro)

**Pirâmide de Testes:**
- 70% Unit tests (funções puras, validações)
- 20% Integration tests (API routes)
- 10% E2E tests (fluxos críticos)

**Ferramentas:**
- Unit: Vitest
- Integration: Vitest + Supertest
- E2E: Playwright

### 7.2 Exemplo de Unit Test

```typescript
// lib/__tests__/pix.test.ts
import { describe, it, expect } from 'vitest';
import { generatePixQRCode } from '../pix';

describe('generatePixQRCode', () => {
  it('should generate valid Pix payload', async () => {
    const result = await generatePixQRCode({
      pixKey: 'user@example.com',
      merchantName: 'Grupo Teste',
      merchantCity: 'São Paulo',
      amount: 50.00,
      description: 'Pelada Quinta',
    });

    expect(result.payload).toContain('user@example.com');
    expect(result.payload).toContain('Grupo Teste');
    expect(result.qrCodeDataURL).toMatch(/^data:image\/png;base64,/);
  });

  it('should throw error for invalid amount', async () => {
    await expect(
      generatePixQRCode({
        pixKey: 'user@example.com',
        merchantName: 'Grupo Teste',
        merchantCity: 'São Paulo',
        amount: -10,
        description: 'Teste',
      })
    ).rejects.toThrow();
  });
});
```

---

## 8. MONITORAMENTO

### 8.1 Logging (Pino)

```typescript
// lib/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,
});

export default logger;
```

**Uso:**
```typescript
logger.info({ userId, groupId }, 'User joined group');
logger.error({ error, context: 'payment' }, 'Pix generation failed');
logger.debug({ query }, 'Database query executed');
```

### 8.2 Error Tracking (Futuro - Sentry)

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  tracesSampleRate: 0.1,
});
```

### 8.3 Analytics (Futuro - Vercel Analytics)

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 9. PRÓXIMOS PASSOS

### 9.1 Setup Inicial

1. **Instalar novas dependências:**
   ```bash
   pnpm add recharts qrcode-pix qrcode firebase firebase-admin
   pnpm add -D @types/qrcode
   ```

2. **Configurar Firebase:**
   - Criar projeto no Firebase Console
   - Habilitar Cloud Messaging
   - Baixar credenciais (service account JSON)
   - Adicionar variáveis de ambiente

3. **Setup Vercel Cron:**
   - Criar `vercel.json` com configuração de cron
   - Gerar `CRON_SECRET` e adicionar em variáveis

### 9.2 Migrations

Executar migrations na ordem:
1. `001_notifications.sql`
2. `002_pix.sql`
3. `003_analytics.sql`
4. `004_training.sql`
5. `005_achievements.sql`

---

**Documento mantido por:** Luis Fernando Boff
**Última Atualização:** 2026-01-21
**Próxima Revisão:** Após Sprint 1 (09/02/2026)
