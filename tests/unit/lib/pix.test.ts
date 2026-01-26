import { describe, it, expect } from 'vitest';
import { generatePixPayload, validatePixKey, formatPixKey } from '@/lib/pix';

/**
 * Testes Unitários: Pix Generation
 * 
 * Testa a geração de payload Pix e validação de chaves
 * Sprint 7: Testes E2E + Observabilidade
 */

describe('Pix Generation', () => {
  describe('generatePixPayload', () => {
    it('deve gerar payload Pix válido com CPF', () => {
      const payload = generatePixPayload({
        pixKey: '12345678900',
        pixType: 'cpf',
        merchantName: 'João Silva',
        merchantCity: 'São Paulo',
        amount: 20.00,
        txId: 'charge-123',
      });

      expect(payload).toMatch(/^000201/); // EMV format começa com 000201
      expect(payload.length).toBeGreaterThan(50);
      expect(payload).toContain('26'); // Merchant Account Information
      expect(payload).toContain('52'); // Merchant Name
      expect(payload).toContain('53'); // Transaction Currency
      expect(payload).toContain('54'); // Transaction Amount
    });

    it('deve gerar payload Pix válido com email', () => {
      const payload = generatePixPayload({
        pixKey: 'joao@example.com',
        pixType: 'email',
        merchantName: 'João Silva',
        merchantCity: 'São Paulo',
        amount: 50.00,
        txId: 'charge-456',
      });

      expect(payload).toMatch(/^000201/);
      expect(payload).toContain('joao@example.com');
    });

    it('deve gerar payload Pix válido com telefone', () => {
      const payload = generatePixPayload({
        pixKey: '+5511999999999',
        pixType: 'phone',
        merchantName: 'João Silva',
        merchantCity: 'São Paulo',
        amount: 100.00,
        txId: 'charge-789',
      });

      expect(payload).toMatch(/^000201/);
      expect(payload).toContain('5511999999999');
    });

    it('deve formatar valor corretamente', () => {
      const payload = generatePixPayload({
        pixKey: '12345678900',
        pixType: 'cpf',
        merchantName: 'João Silva',
        merchantCity: 'São Paulo',
        amount: 20.50,
        txId: 'charge-123',
      });

      // Verificar que o valor está no formato correto (20.50)
      // O payload contém o valor formatado como "20.50" na seção 54
      expect(payload).toContain('20.50');
    });

    it('deve incluir txId no payload', () => {
      const txId = 'charge-123-unique';
      const payload = generatePixPayload({
        pixKey: '12345678900',
        pixType: 'cpf',
        merchantName: 'João Silva',
        merchantCity: 'São Paulo',
        amount: 20.00,
        txId,
      });

      expect(payload).toContain(txId);
    });
  });

  describe('validatePixKey', () => {
    it('deve validar CPF corretamente', () => {
      expect(validatePixKey('12345678900', 'cpf')).toBe(true);
      expect(validatePixKey('123', 'cpf')).toBe(false); // Muito curto
      expect(validatePixKey('123456789012', 'cpf')).toBe(false); // Muito longo
    });

    it('deve validar email corretamente', () => {
      expect(validatePixKey('joao@example.com', 'email')).toBe(true);
      expect(validatePixKey('invalid-email', 'email')).toBe(false);
      expect(validatePixKey('joao@', 'email')).toBe(false);
    });

    it('deve validar telefone corretamente', () => {
      expect(validatePixKey('+5511999999999', 'phone')).toBe(true);
      expect(validatePixKey('+5511987654321', 'phone')).toBe(true);
      expect(validatePixKey('11999999999', 'phone')).toBe(false); // Sem +55
      expect(validatePixKey('123', 'phone')).toBe(false); // Muito curto
    });

    it('deve validar chave aleatória (32 caracteres alfanuméricos)', () => {
      const randomKey = '123e4567e89b12d3a456426614174000'; // 32 caracteres
      expect(validatePixKey(randomKey, 'random')).toBe(true);
      expect(validatePixKey('invalid', 'random')).toBe(false); // Muito curto
      expect(validatePixKey('123e4567-e89b-12d3-a456-426614174000', 'random')).toBe(false); // Com hífens
    });
  });

  describe('formatPixKey', () => {
    it('deve formatar CPF corretamente', () => {
      expect(formatPixKey('12345678900', 'cpf')).toBe('123.456.789-00');
    });

    it('deve formatar CNPJ corretamente', () => {
      expect(formatPixKey('12345678000190', 'cnpj')).toBe('12.345.678/0001-90');
    });

    it('deve formatar telefone corretamente', () => {
      expect(formatPixKey('+5511999999999', 'phone')).toBe('+55 (11) 99999-9999');
    });

    it('deve retornar chave sem formatação para tipos não suportados', () => {
      expect(formatPixKey('joao@example.com', 'email')).toBe('joao@example.com');
    });
  });
});

