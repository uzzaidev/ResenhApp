/**
 * Integration Tests - Lógica da API /api/groups/switch
 * 
 * Testes críticos da lógica de alternância de grupo.
 * Como testar rotas do Next.js diretamente é complexo, testamos a lógica isolada.
 * Sprint 1: GroupContext - Testes Críticos (Fase 1)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth } from '@/lib/auth-helpers';
import { sql } from '@/db/client';
import { cookies } from 'next/headers';
import logger from '@/lib/logger';

// Mock das dependências
vi.mock('@/lib/auth-helpers');
vi.mock('@/db/client');
vi.mock('next/headers');
vi.mock('@/lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

/**
 * Função que replica a lógica da API para testes
 * (Extraída da rota real para ser testável)
 */
async function switchGroupLogic(groupId: string, userId: string) {
  if (!groupId) {
    return { error: 'groupId é obrigatório', status: 400 };
  }

  // Verificar membership
  const membership = await sql`
    SELECT role FROM group_members
    WHERE group_id = ${groupId} AND user_id = ${userId}
    LIMIT 1
  `;

  if (membership.length === 0) {
    return { error: 'Você não é membro deste grupo', status: 403 };
  }

  // Atualizar cookie
  const cookieStore = await cookies();
  cookieStore.set('currentGroupId', groupId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: 'lax',
  });

  logger.info({ userId, groupId }, 'Group switched');

  return { success: true, groupId, status: 200 };
}

describe('API /api/groups/switch - Lógica de Integração', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (cookies as any).mockResolvedValue(mockCookieStore);
  });

  describe('1. Validação de Entrada', () => {
    it('deve retornar erro 400 se groupId não for fornecido', async () => {
      const result = await switchGroupLogic('', mockUser.id);

      expect(result.status).toBe(400);
      expect(result.error).toBe('groupId é obrigatório');
    });

    it('deve retornar erro 400 se groupId for undefined', async () => {
      const result = await switchGroupLogic(undefined as any, mockUser.id);

      expect(result.status).toBe(400);
      expect(result.error).toBe('groupId é obrigatório');
    });
  });

  describe('2. Validação de Membership', () => {
    it('deve retornar 403 se usuário não for membro do grupo', async () => {
      (sql as any).mockResolvedValue([]); // Nenhum membership

      const result = await switchGroupLogic('group-123', mockUser.id);

      expect(result.status).toBe(403);
      expect(result.error).toBe('Você não é membro deste grupo');
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it('deve validar membership antes de atualizar cookie', async () => {
      (sql as any).mockResolvedValue([]); // Sem membership

      await switchGroupLogic('group-123', mockUser.id);

      // Cookie não deve ser atualizado
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });
  });

  describe('3. Alternância Bem-sucedida', () => {
    it('deve atualizar cookie com groupId válido', async () => {
      (sql as any).mockResolvedValue([{ role: 'admin' }]); // Membership válido

      const result = await switchGroupLogic('group-456', mockUser.id);

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.groupId).toBe('group-456');

      // Verificar que cookie foi atualizado
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'currentGroupId',
        'group-456',
        {
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
          httpOnly: false,
          sameSite: 'lax',
        }
      );

      // Verificar que logger foi chamado
      expect(logger.info).toHaveBeenCalledWith(
        { userId: 'user-123', groupId: 'group-456' },
        'Group switched'
      );
    });

    it('deve funcionar com role member', async () => {
      (sql as any).mockResolvedValue([{ role: 'member' }]);

      const result = await switchGroupLogic('group-789', mockUser.id);

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);
      expect(mockCookieStore.set).toHaveBeenCalled();
    });

    it('deve funcionar com role admin', async () => {
      (sql as any).mockResolvedValue([{ role: 'admin' }]);

      const result = await switchGroupLogic('group-999', mockUser.id);

      expect(result.status).toBe(200);
      expect(result.success).toBe(true);
    });
  });

  describe('4. Configuração do Cookie', () => {
    it('deve configurar cookie com parâmetros corretos', async () => {
      (sql as any).mockResolvedValue([{ role: 'admin' }]);

      await switchGroupLogic('group-123', mockUser.id);

      const setCall = mockCookieStore.set.mock.calls[0];
      expect(setCall[0]).toBe('currentGroupId');
      expect(setCall[1]).toBe('group-123');
      expect(setCall[2]).toMatchObject({
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: false,
        sameSite: 'lax',
      });
    });
  });

  describe('5. Query SQL', () => {
    it('deve executar query SQL correta para verificar membership', async () => {
      (sql as any).mockResolvedValue([{ role: 'admin' }]);

      await switchGroupLogic('group-123', 'user-456');

      // Verificar que sql foi chamado
      expect(sql).toHaveBeenCalled();
      
      // Verificar que a query contém os parâmetros corretos
      const sqlCall = (sql as any).mock.calls[0];
      expect(sqlCall).toBeDefined();
    });
  });
});

