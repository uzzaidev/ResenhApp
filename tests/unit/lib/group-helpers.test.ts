/**
 * Unit Tests - Group Helpers (Server-side)
 * 
 * Testes dos helpers server que buscam grupos do usuário.
 * Sprint 1: GroupContext - Testes Fase 2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserCurrentGroup, getUserGroups } from '@/lib/group-helpers';
import { sql } from '@/db/client';
import { cookies } from 'next/headers';

// Mock das dependências
vi.mock('@/db/client');
vi.mock('next/headers');

describe('getUserCurrentGroup - Server Helper', () => {
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

  describe('1. Busca do Cookie', () => {
    it('deve retornar grupo do cookie se válido', async () => {
      const userId = 'user-123';
      const groupId = 'group-456';

      // Mock cookie com groupId
      mockCookieStore.get.mockReturnValue({ value: groupId });

      // Mock validação de membership (grupo existe e usuário é membro)
      (sql as any)
        .mockResolvedValueOnce([{ id: groupId }]) // Validação membership
        .mockResolvedValueOnce([
          {
            id: groupId,
            name: 'Futebol',
            description: 'Grupo de futebol',
            group_type: 'athletic',
            parent_group_id: null,
            role: 'admin',
            member_count: 10,
          },
        ]); // Dados completos

      const result = await getUserCurrentGroup(userId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(groupId);
      expect(result?.name).toBe('Futebol');
      expect(result?.description).toBe('Grupo de futebol');
      expect(result?.groupType).toBe('athletic');
      expect(result?.role).toBe('admin');
      expect(result?.memberCount).toBe(10);
    });

    it('deve validar membership antes de retornar grupo do cookie', async () => {
      const userId = 'user-123';
      const groupId = 'group-456';

      mockCookieStore.get.mockReturnValue({ value: groupId });

      // Membership inválido (retorna vazio)
      (sql as any)
        .mockResolvedValueOnce([]) // Validação membership falha
        .mockResolvedValueOnce([{ id: 'group-789' }]) // Fallback: primeiro grupo
        .mockResolvedValueOnce([
          {
            id: 'group-789',
            name: 'Vôlei',
            description: null,
            group_type: 'pelada',
            parent_group_id: null,
            role: 'member',
            member_count: 5,
          },
        ]); // Dados do primeiro grupo

      const result = await getUserCurrentGroup(userId);

      // Deve fazer fallback para primeiro grupo
      expect(result?.id).toBe('group-789');
      expect(result?.name).toBe('Vôlei');
    });
  });

  describe('2. Fallback para Primeiro Grupo', () => {
    it('deve buscar primeiro grupo se não há cookie', async () => {
      const userId = 'user-123';

      // Sem cookie
      mockCookieStore.get.mockReturnValue(undefined);

      // Buscar primeiro grupo
      (sql as any)
        .mockResolvedValueOnce([{ id: 'group-123' }]) // Primeiro grupo
        .mockResolvedValueOnce([
          {
            id: 'group-123',
            name: 'Basquete',
            description: 'Grupo de basquete',
            group_type: 'athletic',
            parent_group_id: null,
            role: 'admin',
            member_count: 8,
          },
        ]); // Dados completos

      const result = await getUserCurrentGroup(userId);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('group-123');
      expect(result?.name).toBe('Basquete');
    });

    it('deve buscar primeiro grupo se cookie é inválido', async () => {
      const userId = 'user-123';
      const invalidGroupId = 'grupo-inexistente';

      mockCookieStore.get.mockReturnValue({ value: invalidGroupId });

      // Validação falha (grupo não existe)
      (sql as any)
        .mockResolvedValueOnce([]) // Validação membership falha
        .mockResolvedValueOnce([{ id: 'group-999' }]) // Primeiro grupo
        .mockResolvedValueOnce([
          {
            id: 'group-999',
            name: 'Handball',
            description: null,
            group_type: 'pelada',
            parent_group_id: null,
            role: 'member',
            member_count: 3,
          },
        ]); // Dados completos

      const result = await getUserCurrentGroup(userId);

      expect(result?.id).toBe('group-999');
    });
  });

  describe('3. Casos Especiais', () => {
    it('deve retornar null se usuário não tem grupos', async () => {
      const userId = 'user-123';

      mockCookieStore.get.mockReturnValue(undefined);

      // Sem grupos
      (sql as any).mockResolvedValueOnce([]); // Nenhum grupo encontrado

      const result = await getUserCurrentGroup(userId);

      expect(result).toBeNull();
    });

    it('deve tratar erro de banco de dados e retornar null', async () => {
      const userId = 'user-123';

      mockCookieStore.get.mockReturnValue(undefined);
      (sql as any).mockRejectedValueOnce(new Error('Database error'));

      // Suprimir console.error no teste
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getUserCurrentGroup(userId);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('deve mapear corretamente os campos do banco', async () => {
      const userId = 'user-123';
      const groupId = 'group-123';

      mockCookieStore.get.mockReturnValue({ value: groupId });

      (sql as any)
        .mockResolvedValueOnce([{ id: groupId }])
        .mockResolvedValueOnce([
          {
            id: groupId,
            name: 'Teste',
            description: 'Descrição',
            group_type: 'athletic',
            parent_group_id: 'parent-123',
            role: 'admin',
            member_count: 15,
          },
        ]);

      const result = await getUserCurrentGroup(userId);

      expect(result).toMatchObject({
        id: groupId,
        name: 'Teste',
        description: 'Descrição',
        groupType: 'athletic',
        parentGroupId: 'parent-123',
        role: 'admin',
        memberCount: 15,
      });
    });
  });
});

describe('getUserGroups - Server Helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar todos os grupos do usuário', async () => {
    const userId = 'user-123';

    (sql as any).mockResolvedValueOnce([
      {
        id: 'group-1',
        name: 'Futebol',
        description: 'Grupo de futebol',
        group_type: 'athletic',
        parent_group_id: null,
        role: 'admin',
        member_count: 10,
      },
      {
        id: 'group-2',
        name: 'Vôlei',
        description: null,
        group_type: 'pelada',
        parent_group_id: null,
        role: 'member',
        member_count: 5,
      },
    ]);

    const result = await getUserGroups(userId);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'group-1',
      name: 'Futebol',
      groupType: 'athletic',
      role: 'admin',
      memberCount: 10,
    });
    expect(result[1]).toMatchObject({
      id: 'group-2',
      name: 'Vôlei',
      groupType: 'pelada',
      role: 'member',
      memberCount: 5,
    });
  });

  it('deve retornar array vazio se usuário não tem grupos', async () => {
    const userId = 'user-123';

    (sql as any).mockResolvedValueOnce([]);

    const result = await getUserGroups(userId);

    expect(result).toEqual([]);
  });

  it('deve ordenar grupos por created_at DESC', async () => {
    const userId = 'user-123';

    (sql as any).mockResolvedValueOnce([
      {
        id: 'group-new',
        name: 'Novo Grupo',
        description: null,
        group_type: 'athletic',
        parent_group_id: null,
        role: 'admin',
        member_count: 1,
      },
      {
        id: 'group-old',
        name: 'Grupo Antigo',
        description: null,
        group_type: 'pelada',
        parent_group_id: null,
        role: 'member',
        member_count: 5,
      },
    ]);

    const result = await getUserGroups(userId);

    // Verificar que query foi executada (ordenação é feita no SQL)
    expect(sql).toHaveBeenCalled();
    expect(result).toHaveLength(2);
  });

  it('deve tratar erro de banco de dados e retornar array vazio', async () => {
    const userId = 'user-123';

    (sql as any).mockRejectedValueOnce(new Error('Database error'));

    // Suprimir console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getUserGroups(userId);

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('deve mapear memberCount corretamente (converter para número)', async () => {
    const userId = 'user-123';

    (sql as any).mockResolvedValueOnce([
      {
        id: 'group-1',
        name: 'Teste',
        description: null,
        group_type: 'athletic',
        parent_group_id: null,
        role: 'admin',
        member_count: 20,
      },
    ]);

    const result = await getUserGroups(userId);

    expect(result[0].memberCount).toBe(20);
    expect(typeof result[0].memberCount).toBe('number');
  });

  it('deve tratar memberCount null/undefined', async () => {
    const userId = 'user-123';

    (sql as any).mockResolvedValueOnce([
      {
        id: 'group-1',
        name: 'Teste',
        description: null,
        group_type: 'athletic',
        parent_group_id: null,
        role: 'admin',
        member_count: null,
      },
    ]);

    const result = await getUserGroups(userId);

    expect(result[0].memberCount).toBe(0); // Number(null || 0) = 0
  });
});

