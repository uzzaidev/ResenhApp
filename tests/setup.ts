/**
 * Setup global para testes
 * 
 * Configurações e mocks globais executados antes de cada teste.
 * Sprint 1: GroupContext - Testes Críticos
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock do Next.js cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
  })),
}));

// Mock do sonner (toast)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
  default: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Limpar localStorage antes de cada teste
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// Limpar mocks após cada teste
afterEach(() => {
  vi.clearAllMocks();
});

