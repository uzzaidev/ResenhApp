/**
 * Component Tests - GroupSwitcher
 * 
 * Testes do componente GroupSwitcher que exibe dropdown de grupos.
 * Sprint 1: GroupContext - Testes Fase 2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GroupSwitcher } from '@/components/layout/group-switcher';
import { GroupProvider, useGroup } from '@/contexts/group-context';

// Mock do useRouter
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => '/dashboard',
}));

// Mock do useGroup para controlar o estado
vi.mock('@/contexts/group-context', async () => {
  const actual = await vi.importActual('@/contexts/group-context');
  return {
    ...actual,
    useGroup: vi.fn(),
  };
});

describe('GroupSwitcher Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('1. Loading State', () => {
    it('deve renderizar loading state quando isLoading = true', () => {
      (useGroup as any).mockReturnValue({
        currentGroup: null,
        groups: [],
        isLoading: true,
        switchGroup: vi.fn(),
      });

      render(<GroupSwitcher />);

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('2. Empty State (Sem Grupos)', () => {
    it('deve renderizar botão "Criar Grupo" quando não há grupos', () => {
      (useGroup as any).mockReturnValue({
        currentGroup: null,
        groups: [],
        isLoading: false,
        switchGroup: vi.fn(),
      });

      render(<GroupSwitcher />);

      const createButton = screen.getByText('Criar Grupo');
      expect(createButton).toBeInTheDocument();
      
      // Verificar que é um link
      const link = createButton.closest('a');
      expect(link).toHaveAttribute('href', '/groups/new');
    });
  });

  describe('3. Dropdown com Grupos', () => {
    const mockGroups = [
      { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
      { id: '2', name: 'Vôlei', role: 'member' as const, memberCount: 5 },
      { id: '3', name: 'Basquete', role: 'admin' as const, memberCount: 8 },
    ];

    it('deve renderizar dropdown com lista de grupos', async () => {
      (useGroup as any).mockReturnValue({
        currentGroup: mockGroups[0],
        groups: mockGroups,
        isLoading: false,
        switchGroup: vi.fn(),
      });

      render(<GroupSwitcher />);

      // Verificar que grupo atual está visível
      expect(screen.getByText('Futebol')).toBeInTheDocument();

      // Abrir dropdown
      const trigger = screen.getByRole('button');
      await userEvent.click(trigger);

      // Verificar que todos os grupos aparecem
      await waitFor(() => {
        expect(screen.getByText('Vôlei')).toBeInTheDocument();
        expect(screen.getByText('Basquete')).toBeInTheDocument();
      });
    });

    it('deve mostrar checkmark no grupo atual', async () => {
      (useGroup as any).mockReturnValue({
        currentGroup: mockGroups[0], // Futebol é o atual
        groups: mockGroups,
        isLoading: false,
        switchGroup: vi.fn(),
      });

      render(<GroupSwitcher />);

      const trigger = screen.getByRole('button');
      await userEvent.click(trigger);

      // Verificar que grupo atual tem indicador visual
      // (checkmark ou classe especial)
      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        const futebolItem = menuItems.find((item) => 
          item.textContent?.includes('Futebol') && item.textContent?.includes('10')
        );
        expect(futebolItem).toBeDefined();
        expect(futebolItem).toHaveClass('bg-uzzai-mint/10');
      });
    });

    it('deve mostrar memberCount em cada grupo', async () => {
      (useGroup as any).mockReturnValue({
        currentGroup: mockGroups[0],
        groups: mockGroups,
        isLoading: false,
        switchGroup: vi.fn(),
      });

      render(<GroupSwitcher />);

      const trigger = screen.getByRole('button');
      await userEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument(); // Futebol
        expect(screen.getByText('5')).toBeInTheDocument(); // Vôlei
        expect(screen.getByText('8')).toBeInTheDocument(); // Basquete
      });
    });

    it('deve chamar switchGroup ao clicar em um grupo', async () => {
      const mockSwitchGroup = vi.fn();

      (useGroup as any).mockReturnValue({
        currentGroup: mockGroups[0],
        groups: mockGroups,
        isLoading: false,
        switchGroup: mockSwitchGroup,
      });

      render(<GroupSwitcher />);

      const trigger = screen.getByRole('button');
      await userEvent.click(trigger);

      // Clicar em "Vôlei"
      const voleiItem = await screen.findByText('Vôlei');
      await userEvent.click(voleiItem);

      expect(mockSwitchGroup).toHaveBeenCalledWith('2');
    });
  });

  describe('4. Link Criar Novo Grupo', () => {
    it('deve ter link "Criar Novo Grupo" no dropdown', async () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
      ];

      (useGroup as any).mockReturnValue({
        currentGroup: mockGroups[0],
        groups: mockGroups,
        isLoading: false,
        switchGroup: vi.fn(),
      });

      render(<GroupSwitcher />);

      const trigger = screen.getByRole('button');
      await userEvent.click(trigger);

      await waitFor(() => {
        const createLink = screen.getByText('Criar Novo Grupo');
        expect(createLink).toBeInTheDocument();
        expect(createLink.closest('a')).toHaveAttribute('href', '/groups/new');
      });
    });
  });

  describe('5. Truncamento de Nomes Longos', () => {
    it('deve truncar nomes longos de grupos', () => {
      const longNameGroup = {
        id: '1',
        name: 'Grupo com Nome Muito Longo que Deve Ser Truncado',
        role: 'admin' as const,
        memberCount: 10,
      };

      (useGroup as any).mockReturnValue({
        currentGroup: longNameGroup,
        groups: [longNameGroup],
        isLoading: false,
        switchGroup: vi.fn(),
      });

      render(<GroupSwitcher />);

      // Verificar que nome está visível (mesmo que truncado)
      const nameElement = screen.getByText(longNameGroup.name);
      expect(nameElement).toBeInTheDocument();
      expect(nameElement).toHaveClass('truncate');
    });
  });

  describe('6. Estado Sem Grupo Atual', () => {
    it('deve mostrar "Selecionar Grupo" quando não há grupo atual', () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
      ];

      (useGroup as any).mockReturnValue({
        currentGroup: null,
        groups: mockGroups,
        isLoading: false,
        switchGroup: vi.fn(),
      });

      render(<GroupSwitcher />);

      expect(screen.getByText('Selecionar Grupo')).toBeInTheDocument();
    });
  });

  describe('7. Acessibilidade', () => {
    it('deve ter botão acessível com role correto', () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
      ];

      (useGroup as any).mockReturnValue({
        currentGroup: mockGroups[0],
        groups: mockGroups,
        isLoading: false,
        switchGroup: vi.fn(),
      });

      render(<GroupSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it('deve ter itens de menu acessíveis', async () => {
      const mockGroups = [
        { id: '1', name: 'Futebol', role: 'admin' as const, memberCount: 10 },
        { id: '2', name: 'Vôlei', role: 'member' as const, memberCount: 5 },
      ];

      (useGroup as any).mockReturnValue({
        currentGroup: mockGroups[0],
        groups: mockGroups,
        isLoading: false,
        switchGroup: vi.fn(),
      });

      render(<GroupSwitcher />);

      const trigger = screen.getByRole('button');
      await userEvent.click(trigger);

      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        expect(menuItems.length).toBeGreaterThan(0);
      });
    });
  });
});

