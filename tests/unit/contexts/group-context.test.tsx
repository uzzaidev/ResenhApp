/**
 * Unit Tests - useGroup Hook
 * 
 * Testes críticos do hook useGroup() que gerencia o estado do grupo atual.
 * Sprint 1: GroupContext - Testes Críticos (Fase 1)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { GroupProvider, useGroup } from '@/contexts/group-context';
import { toast } from 'sonner';

// Mock do toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock do router
const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockPathname = '/dashboard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => mockPathname,
}));

describe('useGroup Hook - Testes Críticos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Validação de Provider', () => {
    it('deve retornar erro se usado fora do Provider', () => {
      // Suprime console.error para este teste
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useGroup());
      }).toThrow('useGroup must be used within a GroupProvider');
      
      consoleSpy.mockRestore();
    });

    it('deve retornar contexto correto quando dentro do Provider', async () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ groups: mockGroups }),
      });

      const { result } = renderHook(() => useGroup(), {
        wrapper: GroupProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toHaveProperty('currentGroup');
      expect(result.current).toHaveProperty('groups');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('setCurrentGroup');
      expect(result.current).toHaveProperty('switchGroup');
      expect(result.current).toHaveProperty('loadGroups');
    });
  });

  describe('2. Carregamento Inicial de Grupos', () => {
    it('deve carregar grupos na inicialização', async () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
        { id: '2', name: 'Vôlei', role: 'member' as const, memberCount: 5 },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ groups: mockGroups }),
      });

      const { result } = renderHook(() => useGroup(), {
        wrapper: GroupProvider,
      });

      // Deve estar carregando inicialmente
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Deve ter carregado os grupos
      expect(result.current.groups).toEqual(mockGroups);
      expect(result.current.userGroups).toEqual(mockGroups); // Alias
      
      // Deve ter selecionado o primeiro grupo automaticamente
      expect(result.current.currentGroup).toEqual(mockGroups[0]);
      
      // Deve ter persistido no localStorage
      expect(localStorage.getItem('currentGroupId')).toBe('1');
    });

    it('deve restaurar grupo do localStorage se existir', async () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
        { id: '2', name: 'Vôlei', role: 'member' as const, memberCount: 5 },
      ];

      // Simular grupo salvo no localStorage
      localStorage.setItem('currentGroupId', '2');

      (global.fetch as any).mockResolvedValueOnce({
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
      expect(result.current.currentGroup?.name).toBe('Vôlei');
    });

    it('deve fazer fallback para primeiro grupo se localStorage inválido', async () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
        { id: '2', name: 'Vôlei', role: 'member' as const, memberCount: 5 },
      ];

      // Grupo salvo não existe mais
      localStorage.setItem('currentGroupId', 'grupo-inexistente');

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ groups: mockGroups }),
      });

      const { result } = renderHook(() => useGroup(), {
        wrapper: GroupProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Deve fazer fallback para primeiro grupo
      expect(result.current.currentGroup?.id).toBe('1');
      expect(localStorage.getItem('currentGroupId')).toBe('1');
    });
  });

  describe('3. setCurrentGroup', () => {
    it('deve atualizar grupo atual e localStorage', async () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
        { id: '2', name: 'Vôlei', role: 'member' as const, memberCount: 5 },
      ];

      (global.fetch as any).mockResolvedValueOnce({
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
      expect(result.current.currentGroup?.name).toBe('Vôlei');
      expect(localStorage.getItem('currentGroupId')).toBe('2');
    });

    it('deve limpar localStorage ao definir grupo como null', async () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ groups: mockGroups }),
      });

      const { result } = renderHook(() => useGroup(), {
        wrapper: GroupProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Limpar grupo
      act(() => {
        result.current.setCurrentGroup(null);
      });

      expect(result.current.currentGroup).toBeNull();
      expect(localStorage.getItem('currentGroupId')).toBeNull();
    });
  });

  describe('4. switchGroup', () => {
    it('deve alternar grupo via switchGroup com sucesso', async () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
        { id: '2', name: 'Vôlei', role: 'member' as const, memberCount: 5 },
      ];

      (global.fetch as any)
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

      // Verificar que grupo foi alterado
      expect(result.current.currentGroup?.id).toBe('2');
      expect(localStorage.getItem('currentGroupId')).toBe('2');
      
      // Verificar que API foi chamada corretamente
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith('/api/groups/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: '2' }),
      });

      // Verificar toast de sucesso
      expect(toast.success).toHaveBeenCalledWith('Grupo alterado para: Vôlei');
    });

    it('deve tratar erro ao alternar grupo', async () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
        { id: '2', name: 'Vôlei', role: 'member' as const, memberCount: 5 },
      ];

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ groups: mockGroups }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const { result } = renderHook(() => useGroup(), {
        wrapper: GroupProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Tentar alternar grupo (deve falhar)
      await act(async () => {
        await result.current.switchGroup('2');
      });

      // Verificar que toast de erro foi chamado
      expect(toast.error).toHaveBeenCalledWith('Erro ao alternar grupo');
      
      // Grupo não deve ter mudado (ainda é o primeiro)
      expect(result.current.currentGroup?.id).toBe('1');
    });

    it('deve chamar router.refresh quando não está em página de grupo', async () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
        { id: '2', name: 'Vôlei', role: 'member' as const, memberCount: 5 },
      ];

      (global.fetch as any)
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

      await act(async () => {
        await result.current.switchGroup('2');
      });

      // Deve chamar refresh (pathname é /dashboard, não /groups/)
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('5. Tratamento de Erros', () => {
    it('deve tratar erro ao carregar grupos', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useGroup(), {
        wrapper: GroupProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.groups).toEqual([]);
      expect(result.current.currentGroup).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar grupos');
    });

    it('deve tratar erro quando API retorna não-ok', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useGroup(), {
        wrapper: GroupProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar grupos');
    });
  });

  describe('6. Aliases e Compatibilidade', () => {
    it('deve fornecer aliases userGroups e fetchUserGroups', async () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ groups: mockGroups }),
      });

      const { result } = renderHook(() => useGroup(), {
        wrapper: GroupProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verificar aliases
      expect(result.current.userGroups).toEqual(result.current.groups);
      expect(typeof result.current.fetchUserGroups).toBe('function');
      
      // Testar fetchUserGroups
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ groups: mockGroups }),
      });

      await act(async () => {
        await result.current.fetchUserGroups();
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});

