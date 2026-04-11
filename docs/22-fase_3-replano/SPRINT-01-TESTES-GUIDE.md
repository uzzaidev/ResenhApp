# 🧪 Guia de Testes - Sprint 1: GroupContext

> **Objetivo:** Implementar suite completa de testes para GroupContext  
> **Frameworks:** Vitest (Unit/Integration), React Testing Library (Component), Playwright (E2E)

---

## 📋 Setup Inicial

### 1. Instalar Dependências

```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D playwright @playwright/test
pnpm add -D msw @mswjs/data
pnpm add -D @types/node
```

### 2. Configurar Vitest

Criar `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3. Configurar Playwright

Criar `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 🧪 Exemplos de Testes

### Unit Tests: `useGroup()` Hook

**Arquivo:** `tests/unit/contexts/group-context.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { GroupProvider, useGroup } from '@/contexts/group-context';

// Mock fetch
global.fetch = vi.fn();

describe('useGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('deve retornar erro se usado fora do Provider', () => {
    // Suprime console.error para este teste
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useGroup());
    }).toThrow('useGroup must be used within a GroupProvider');
    
    consoleSpy.mockRestore();
  });

  it('deve carregar grupos na inicialização', async () => {
    const mockGroups = [
      { id: '1', name: 'Futebol', role: 'admin', memberCount: 10 },
      { id: '2', name: 'Vôlei', role: 'member', memberCount: 5 },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockGroups }),
    });

    const { result } = renderHook(() => useGroup(), {
      wrapper: GroupProvider,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.groups).toEqual(mockGroups);
    expect(result.current.currentGroup).toEqual(mockGroups[0]); // Primeiro grupo
  });

  it('deve restaurar grupo do localStorage', async () => {
    const mockGroups = [
      { id: '1', name: 'Futebol', role: 'admin', memberCount: 10 },
      { id: '2', name: 'Vôlei', role: 'member', memberCount: 5 },
    ];

    // Simular grupo salvo no localStorage
    localStorage.setItem('currentGroupId', '2');

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockGroups }),
    });

    const { result } = renderHook(() => useGroup(), {
      wrapper: GroupProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Deve restaurar grupo do localStorage (Vôlei)
    expect(result.current.currentGroup?.id).toBe('2');
  });

  it('deve atualizar grupo atual e localStorage', async () => {
    const mockGroups = [
      { id: '1', name: 'Futebol', role: 'admin', memberCount: 10 },
      { id: '2', name: 'Vôlei', role: 'member', memberCount: 5 },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockGroups }),
    });

    const { result } = renderHook(() => useGroup(), {
      wrapper: GroupProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mudar grupo
    act(() => {
      result.current.setCurrentGroup(mockGroups[1]);
    });

    expect(result.current.currentGroup?.id).toBe('2');
    expect(localStorage.getItem('currentGroupId')).toBe('2');
  });

  it('deve alternar grupo via switchGroup', async () => {
    const mockGroups = [
      { id: '1', name: 'Futebol', role: 'admin', memberCount: 10 },
      { id: '2', name: 'Vôlei', role: 'member', memberCount: 5 },
    ];

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ groups: mockGroups }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, groupId: '2' }),
      });

    const { result } = renderHook(() => useGroup(), {
      wrapper: GroupProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Alternar grupo
    await act(async () => {
      await result.current.switchGroup('2');
    });

    expect(result.current.currentGroup?.id).toBe('2');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenLastCalledWith('/api/groups/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: '2' }),
    });
  });

  it('deve tratar erro ao carregar grupos', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useGroup(), {
      wrapper: GroupProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.groups).toEqual([]);
  });
});
```

---

### Unit Tests: Server Helpers

**Arquivo:** `tests/unit/lib/group-helpers.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserCurrentGroup, getUserGroups } from '@/lib/group-helpers';
import { sql } from '@/db/client';
import { cookies } from 'next/headers';

// Mock das dependências
vi.mock('@/db/client');
vi.mock('next/headers');

describe('getUserCurrentGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar grupo do cookie se válido', async () => {
    const userId = 'user-123';
    const groupId = 'group-456';

    // Mock cookie
    (cookies as any).mockResolvedValue({
      get: () => ({ value: groupId }),
    });

    // Mock validação de membership
    (sql as any).mockResolvedValueOnce([{ id: groupId }]);

    // Mock dados do grupo
    (sql as any).mockResolvedValueOnce([
      {
        id: groupId,
        name: 'Futebol',
        description: 'Grupo de futebol',
        group_type: 'athletic',
        parent_group_id: null,
        role: 'admin',
        member_count: 10,
      },
    ]);

    const result = await getUserCurrentGroup(userId);

    expect(result).toEqual({
      id: groupId,
      name: 'Futebol',
      description: 'Grupo de futebol',
      groupType: 'athletic',
      parentGroupId: null,
      role: 'admin',
      memberCount: 10,
    });
  });

  it('deve validar membership antes de retornar grupo do cookie', async () => {
    const userId = 'user-123';
    const groupId = 'group-456';

    (cookies as any).mockResolvedValue({
      get: () => ({ value: groupId }),
    });

    // Membership inválido (retorna vazio)
    (sql as any).mockResolvedValueOnce([]);

    // Deve buscar primeiro grupo como fallback
    (sql as any).mockResolvedValueOnce([{ id: 'group-789' }]);
    (sql as any).mockResolvedValueOnce([
      {
        id: 'group-789',
        name: 'Vôlei',
        description: null,
        group_type: 'pelada',
        parent_group_id: null,
        role: 'member',
        member_count: 5,
      },
    ]);

    const result = await getUserCurrentGroup(userId);

    // Deve retornar primeiro grupo (fallback)
    expect(result?.id).toBe('group-789');
  });

  it('deve retornar null se usuário não tem grupos', async () => {
    const userId = 'user-123';

    (cookies as any).mockResolvedValue({
      get: () => undefined, // Sem cookie
    });

    // Sem grupos
    (sql as any).mockResolvedValueOnce([]);

    const result = await getUserCurrentGroup(userId);

    expect(result).toBeNull();
  });
});
```

---

### Integration Tests: API Routes

**Arquivo:** `tests/integration/api/groups.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/groups/route';
import { requireAuth } from '@/lib/auth-helpers';
import { sql } from '@/db/client';

vi.mock('@/lib/auth-helpers');
vi.mock('@/db/client');

describe('GET /api/groups', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar grupos do usuário autenticado', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    (requireAuth as any).mockResolvedValue(mockUser);

    const mockGroups = [
      {
        id: 'group-1',
        name: 'Futebol',
        description: 'Grupo de futebol',
        privacy: 'public',
        photo_url: null,
        created_at: new Date(),
        group_type: 'athletic',
        parent_group_id: null,
        user_role: 'admin',
        member_count: 10,
      },
    ];

    (sql as any).mockResolvedValue(mockGroups);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.groups).toHaveLength(1);
    expect(data.groups[0]).toMatchObject({
      id: 'group-1',
      name: 'Futebol',
      role: 'admin',
      memberCount: 10,
    });
  });

  it('deve retornar 401 se não autenticado', async () => {
    (requireAuth as any).mockRejectedValue(new Error('Não autenticado'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Não autenticado');
  });
});

describe('POST /api/groups/switch', () => {
  it('deve atualizar cookie com groupId válido', async () => {
    // Implementação similar...
  });

  it('deve validar membership antes de alternar', async () => {
    // Implementação similar...
  });
});
```

---

### Component Tests: GroupSwitcher

**Arquivo:** `tests/components/layout/group-switcher.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GroupSwitcher } from '@/components/layout/group-switcher';
import { GroupProvider } from '@/contexts/group-context';

// Mock do useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('GroupSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('deve renderizar loading state', async () => {
    (fetch as any).mockImplementation(() => new Promise(() => {})); // Nunca resolve

    render(
      <GroupProvider>
        <GroupSwitcher />
      </GroupProvider>
    );

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('deve renderizar "Criar Grupo" quando não há grupos', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: [] }),
    });

    render(
      <GroupProvider>
        <GroupSwitcher />
      </GroupProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Criar Grupo')).toBeInTheDocument();
    });
  });

  it('deve renderizar dropdown com lista de grupos', async () => {
    const mockGroups = [
      { id: '1', name: 'Futebol', role: 'admin', memberCount: 10 },
      { id: '2', name: 'Vôlei', role: 'member', memberCount: 5 },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockGroups }),
    });

    render(
      <GroupProvider>
        <GroupSwitcher />
      </GroupProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Futebol')).toBeInTheDocument();
    });

    // Abrir dropdown
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    expect(screen.getByText('Vôlei')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // memberCount
  });

  it('deve mostrar checkmark no grupo atual', async () => {
    const mockGroups = [
      { id: '1', name: 'Futebol', role: 'admin', memberCount: 10 },
      { id: '2', name: 'Vôlei', role: 'member', memberCount: 5 },
    ];

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groups: mockGroups }),
    });

    render(
      <GroupProvider>
        <GroupSwitcher />
      </GroupProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Futebol')).toBeInTheDocument();
    });

    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);

    // Verificar se checkmark está presente (pode precisar ajustar seletor)
    const checkmark = screen.getByRole('menuitem', { name: /Futebol/i });
    expect(checkmark).toHaveClass('bg-uzzai-mint/10');
  });
});
```

---

### E2E Tests: Playwright

**Arquivo:** `tests/e2e/group-switching.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Group Switching', () => {
  test.beforeEach(async ({ page }) => {
    // Login (ajustar conforme sua implementação de auth)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('deve alternar entre grupos', async ({ page }) => {
    // Verificar que dropdown existe
    const groupSwitcher = page.locator('[data-testid="group-switcher"]');
    await expect(groupSwitcher).toBeVisible();

    // Abrir dropdown
    await groupSwitcher.click();

    // Verificar que lista de grupos aparece
    const vôleiOption = page.locator('text=Vôlei');
    await expect(vôleiOption).toBeVisible();

    // Clicar em "Vôlei"
    await vôleiOption.click();

    // Verificar toast de sucesso
    await expect(page.locator('text=Grupo alterado para: Vôlei')).toBeVisible();

    // Verificar que grupo atual mudou
    await expect(groupSwitcher).toContainText('Vôlei');

    // Verificar que dados da página atualizaram (ex: dashboard)
    // (ajustar conforme sua implementação)
  });

  test('deve persistir grupo selecionado entre sessões', async ({ page, context }) => {
    // Selecionar grupo
    await page.goto('/dashboard');
    const groupSwitcher = page.locator('[data-testid="group-switcher"]');
    await groupSwitcher.click();
    await page.locator('text=Vôlei').click();

    // Verificar localStorage
    const localStorage = await page.evaluate(() => {
      return window.localStorage.getItem('currentGroupId');
    });
    expect(localStorage).toBeTruthy();

    // Fechar e reabrir navegador (simular nova sessão)
    await context.close();
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();

    // Login novamente
    await newPage.goto('/login');
    // ... login steps ...

    // Verificar que grupo foi restaurado
    await newPage.goto('/dashboard');
    const restoredSwitcher = newPage.locator('[data-testid="group-switcher"]');
    await expect(restoredSwitcher).toContainText('Vôlei');
  });

  test('deve fazer fallback para primeiro grupo se não há grupo salvo', async ({ page }) => {
    // Limpar localStorage
    await page.goto('/dashboard');
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Recarregar página
    await page.reload();

    // Verificar que primeiro grupo foi selecionado automaticamente
    const groupSwitcher = page.locator('[data-testid="group-switcher"]');
    // Assumindo que "Futebol" é o primeiro grupo
    await expect(groupSwitcher).toContainText('Futebol');
  });
});
```

---

## 📊 Scripts de Teste

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "pnpm test && pnpm test:e2e"
  }
}
```

---

## ✅ Checklist de Implementação

- [ ] Instalar dependências de teste
- [ ] Configurar Vitest
- [ ] Configurar Playwright
- [ ] Criar arquivo de setup (`tests/setup.ts`)
- [ ] Implementar unit tests do hook `useGroup()`
- [ ] Implementar unit tests dos helpers server
- [ ] Implementar integration tests das APIs
- [ ] Implementar component tests do `GroupSwitcher`
- [ ] Implementar E2E tests do fluxo completo
- [ ] Configurar CI/CD para rodar testes
- [ ] Adicionar coverage reporting
- [ ] Documentar como rodar testes

---

## 🎯 Priorização

**Fase 1 (Crítico):**
1. Unit tests do hook `useGroup()` (core logic)
2. Integration tests da API `/api/groups/switch`
3. E2E test básico de alternância

**Fase 2 (Importante):**
4. Component tests do `GroupSwitcher`
5. E2E test de persistência
6. Unit tests dos helpers server

**Fase 3 (Refinamento):**
7. Testes de performance
8. Testes de edge cases
9. Coverage completo (>80%)

---

**Status:** 📝 Guia criado - Aguardando implementação  
**Próximo:** Começar pela Fase 1 (testes críticos)





