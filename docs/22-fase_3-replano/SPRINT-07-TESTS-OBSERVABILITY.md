# 🎯 Sprint 7: Testes E2E + Observabilidade

> **Duração:** 5 dias  
> **Camada:** 3 - Refinamentos  
> **Prioridade:** 🟢 Refinamento (Qualidade)

---

## 📋 Objetivo

Garantir qualidade através de testes E2E dos fluxos críticos e implementar observabilidade completa (logs, error tracking, analytics) para monitoramento em produção.

---

## 🎯 Entregas

### 1. Testes E2E dos Fluxos Críticos

**Ferramenta:** Playwright

**Fluxos a Testar:**
- [ ] **RSVP Flow:** Confirmar presença → charge gerada → notificação
- [ ] **Payment Flow:** Ver cobrança → gerar Pix → marcar como pago
- [ ] **Multi-Group Flow:** Alternar entre grupos → dados atualizados
- [ ] **Create Training:** Criar treino com preço → charge automática

**Arquivo:** `tests/e2e/rsvp-flow.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test('RSVP flow completo', async ({ page }) => {
  // 1. Login
  await page.goto('/auth/signin');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // 2. Ir para dashboard
  await page.goto('/dashboard');
  await expect(page.locator('text=Próximos Treinos')).toBeVisible();

  // 3. Confirmar presença
  await page.click('button:has-text("Confirmar Presença")');
  await expect(page.locator('text=Presença confirmada')).toBeVisible();

  // 4. Verificar charge criada
  await page.goto('/financeiro');
  await expect(page.locator('text=R$ 20,00')).toBeVisible();
});
```

---

### 2. Testes Unitários de Lógica Complexa

**Ferramenta:** Vitest

**Código a Testar:**
- [ ] `src/lib/pix.ts` - Geração de Pix payload
- [ ] `src/lib/permissions.ts` - Lógica de permissões
- [ ] `src/lib/error-handler.ts` - Categorização de erros
- [ ] `src/schemas/*.ts` - Validações Zod

**Arquivo:** `src/lib/pix.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { generatePixPayload, validatePixKey } from './pix';

describe('Pix Generation', () => {
  it('should generate valid Pix payload', () => {
    const payload = generatePixPayload({
      pixKey: '12345678900',
      pixType: 'cpf',
      merchantName: 'João Silva',
      merchantCity: 'São Paulo',
      amount: 20.00,
      txId: 'charge-123'
    });

    expect(payload).toMatch(/^000201/); // EMV format
    expect(payload.length).toBeGreaterThan(50);
  });

  it('should validate CPF correctly', () => {
    expect(validatePixKey('12345678900', 'cpf')).toBe(true);
    expect(validatePixKey('123', 'cpf')).toBe(false);
  });
});
```

---

### 3. Logger Estruturado

**Arquivo:** `src/lib/logger.ts`

**Biblioteca:** Pino

**Funcionalidades:**
- [ ] Logs estruturados (JSON)
- [ ] Níveis: debug, info, warn, error
- [ ] Contexto automático (userId, requestId)
- [ ] Transport para produção (Datadog/Better Stack)

**Código:**
```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : { target: 'pino-datadog' }
});

// Uso:
logger.info({ userId, eventId }, 'RSVP confirmed');
logger.error({ error, context }, 'Failed to generate Pix');
```

**Integração:**
- [ ] Todas as APIs usam logger
- [ ] Erros logados com stack trace
- [ ] Requests logados com timing

---

### 4. Error Tracking (Sentry)

**Setup:**
- [ ] Instalar `@sentry/nextjs`
- [ ] Configurar DSN
- [ ] Integrar no `next.config.js`
- [ ] Capturar erros automáticos

**Código:**
```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

export { Sentry };
```

**Integração:**
- [ ] Error boundary usa Sentry
- [ ] API errors capturados
- [ ] User context (userId, groupId)

---

### 5. Analytics Básico

**Ferramenta:** PostHog (ou similar)

**Eventos a Rastrear:**
- [ ] `rsvp_confirmed` - Atleta confirma presença
- [ ] `charge_created` - Cobrança criada
- [ ] `payment_marked_paid` - Pagamento marcado
- [ ] `group_switched` - Alternou grupo
- [ ] `training_created` - Treino criado

**Código:**
```typescript
// src/lib/analytics.ts
import posthog from 'posthog-js';

export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties);
  }
}

// Uso:
trackEvent('rsvp_confirmed', {
  eventId: '123',
  groupId: '456',
  hasCharge: true
});
```

---

### 6. Performance Monitoring

**Métricas:**
- [ ] LCP (Largest Contentful Paint) < 2s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] API Response Time (p50, p95, p99)

**Implementação:**
- [ ] Web Vitals (Next.js built-in)
- [ ] Custom metrics em APIs
- [ ] Dashboard de métricas

---

## ✅ Critérios de Done

### Testes
- [ ] 4 fluxos E2E críticos testados
- [ ] Coverage > 60% em lógica complexa
- [ ] Testes rodam em CI/CD
- [ ] Testes passam consistentemente

### Observabilidade
- [ ] Logs estruturados em produção
- [ ] Sentry capturando erros
- [ ] Analytics rastreando eventos principais
- [ ] Performance metrics coletadas

---

## 📝 Tarefas Detalhadas

### Dia 1: Setup + Testes E2E
- [ ] Instalar Playwright
- [ ] Configurar ambiente de testes
- [ ] Criar teste RSVP flow
- [ ] Criar teste Payment flow

### Dia 2: Testes Unitários
- [ ] Instalar Vitest
- [ ] Criar testes para `pix.ts`
- [ ] Criar testes para `permissions.ts`
- [ ] Criar testes para `error-handler.ts`

### Dia 3: Logger + Sentry
- [ ] Instalar Pino
- [ ] Configurar logger
- [ ] Integrar em APIs
- [ ] Setup Sentry
- [ ] Integrar error boundary

### Dia 4: Analytics + Performance
- [ ] Setup PostHog
- [ ] Rastrear 5 eventos principais
- [ ] Configurar Web Vitals
- [ ] Criar dashboard básico

### Dia 5: CI/CD + Documentação
- [ ] Configurar testes no CI
- [ ] Documentar como rodar testes
- [ ] Documentar observabilidade
- [ ] Code review

---

## 🐛 Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Testes flaky | Médio | Retry logic + timeouts |
| Sentry muito caro | Baixo | Sampling rate (10%) |
| Performance overhead | Baixo | Async logging |

---

## 📚 Referências

- [Playwright](https://playwright.dev/)
- [Vitest](https://vitest.dev/)
- [Pino Logger](https://getpino.io/)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [PostHog](https://posthog.com/)

---

**Status:** ⏳ Pendente  
**Início:** ___/___/____  
**Conclusão:** ___/___/____






