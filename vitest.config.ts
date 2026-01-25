import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Configuração do Vitest para testes unitários e de integração
 * 
 * Sprint 1: GroupContext - Testes Críticos
 */
export default defineConfig({
  plugins: [react()],
  test: {
    // Ambiente jsdom para simular DOM do navegador
    environment: 'jsdom',
    // Habilita globals (describe, it, expect, etc.)
    globals: true,
    // Arquivo de setup executado antes de cada teste
    setupFiles: ['./tests/setup.ts'],
    // Padrões de arquivos de teste
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    // Excluir node_modules
    exclude: ['node_modules', '.next', 'dist'],
    // Configurações de coverage (quando habilitado)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

