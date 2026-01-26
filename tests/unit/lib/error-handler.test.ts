import { describe, it, expect } from 'vitest';
import { categorizeError, createErrorAction, type ErrorCategory } from '@/lib/error-handler';

/**
 * Testes Unitários: Error Handler
 * 
 * Testa a categorização de erros e mensagens amigáveis
 * Sprint 7: Testes E2E + Observabilidade
 */

describe('Error Handler', () => {
  describe('categorizeError', () => {
    it('deve categorizar erro de autenticação', () => {
      const error = new Error('Unauthorized');
      
      const result = categorizeError(error);
      expect(result.category).toBe('UNAUTHORIZED');
      expect(result.title).toContain('Sessão');
    });

    it('deve categorizar erro de permissão', () => {
      const error = new Error('Forbidden');
      
      const result = categorizeError(error);
      expect(result.category).toBe('FORBIDDEN');
      expect(result.title).toContain('permissão');
    });

    it('deve categorizar erro de validação', () => {
      const error = new Error('Validation failed');
      
      const result = categorizeError(error);
      expect(result.category).toBe('VALIDATION_ERROR');
      expect(result.title).toContain('Dados');
    });

    it('deve categorizar erro de rede', () => {
      const error = new Error('Network error');
      
      const result = categorizeError(error);
      expect(result.category).toBe('NETWORK_ERROR');
      expect(result.title).toContain('conexão');
    });

    it('deve categorizar erro desconhecido como genérico', () => {
      const error = new Error('Unknown error');
      
      const result = categorizeError(error);
      expect(result.category).toBe('UNKNOWN_ERROR');
      expect(result.title).toContain('errado');
    });

    it('deve categorizar erro de servidor', () => {
      const error = new Error('Server error 500');
      
      const result = categorizeError(error);
      expect(result.category).toBe('SERVER_ERROR');
      expect(result.title).toContain('servidor');
    });

    it('deve categorizar erro de treino lotado', () => {
      const error = new Error('Treino lotado');
      
      const result = categorizeError(error);
      expect(result.category).toBe('EVENT_FULL');
      expect(result.title).toContain('lotado');
    });
  });

  describe('createErrorAction', () => {
    it('deve criar ação de login para erro de autenticação', () => {
      const mockRouter = {
        push: (path: string) => {
          expect(path).toBe('/auth/signin');
        },
      };
      
      const action = createErrorAction('UNAUTHORIZED', { router: mockRouter });
      expect(action).toBeDefined();
      expect(action?.label).toContain('login');
    });

    it('deve criar ação de retry para erro de rede', () => {
      const mockRetry = () => {
        // Mock retry function
      };
      
      const action = createErrorAction('NETWORK_ERROR', { onRetry: mockRetry });
      expect(action).toBeDefined();
      expect(action?.label).toContain('Tentar');
    });

    it('deve criar ação de contato para erro de servidor', () => {
      const action = createErrorAction('SERVER_ERROR');
      expect(action).toBeDefined();
      expect(action?.label).toContain('suporte');
    });

    it('deve retornar undefined para erro genérico', () => {
      const action = createErrorAction('UNKNOWN_ERROR');
      expect(action).toBeUndefined();
    });

    it('deve criar ação de ver lista de espera para treino lotado', () => {
      const mockRouter = {
        push: (path: string) => {
          expect(path).toContain('/treinos/');
          expect(path).toContain('/waitlist');
        },
      };
      
      const action = createErrorAction('EVENT_FULL', {
        eventId: 'event-123',
        router: mockRouter,
      });
      expect(action).toBeDefined();
      expect(action?.label).toContain('espera');
    });
  });
});

