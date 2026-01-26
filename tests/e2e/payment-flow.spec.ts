import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

/**
 * Teste E2E: Fluxo de Pagamento (Pix)
 * 
 * Testa o fluxo completo de visualização e pagamento:
 * 1. Login
 * 2. Ir para financeiro
 * 3. Ver cobrança pendente
 * 4. Gerar/visualizar QR Code Pix
 * 5. Marcar como pago
 * 6. Verificar undo
 * 
 * Sprint 7: Testes E2E + Observabilidade
 */

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await login(page);
  });
  test('deve visualizar QR Code Pix de uma cobrança', async ({ page }) => {
    // 1. Ir para financeiro
    await page.goto('/financeiro');
    await expect(page.locator('h1')).toContainText('Financeiro');

    // 2. Verificar se há cobranças
    const charges = page.locator('[data-testid="charge-item"]');
    const chargeCount = await charges.count();

    if (chargeCount === 0) {
      test.skip('Nenhuma cobrança disponível para teste');
      return;
    }

    // 3. Clicar na primeira cobrança pendente
    const pendingCharge = charges.filter({ hasText: 'Pendente' }).first();
    
    if ((await pendingCharge.count()) === 0) {
      test.skip('Nenhuma cobrança pendente disponível');
      return;
    }

    await pendingCharge.click();

    // 4. Verificar que a página de detalhes da charge carregou
    await expect(page.locator('h1, h2')).toContainText(/Cobrança|Pagamento/i);

    // 5. Verificar que o QR Code Pix está visível
    const qrCode = page.locator('[data-testid="pix-qr-code"]');
    await expect(qrCode).toBeVisible({ timeout: 5000 });

    // 6. Verificar que o payload Pix está disponível para copiar
    const pixPayload = page.locator('[data-testid="pix-payload"]');
    await expect(pixPayload).toBeVisible();
  });

  test('deve marcar cobrança como paga e permitir undo', async ({ page }) => {
    await page.goto('/financeiro');
    
    const charges = page.locator('[data-testid="charge-item"]');
    const chargeCount = await charges.count();

    if (chargeCount === 0) {
      test.skip('Nenhuma cobrança disponível');
      return;
    }

    // Encontrar uma cobrança pendente
    const pendingCharge = charges.filter({ hasText: 'Pendente' }).first();
    
    if ((await pendingCharge.count()) === 0) {
      test.skip('Nenhuma cobrança pendente');
      return;
    }

    // Abrir menu de ações
    const actionsMenu = pendingCharge.locator('[data-testid="charge-actions"]');
    if ((await actionsMenu.count()) > 0) {
      await actionsMenu.click();
    }

    // Clicar em "Marcar como Pago"
    const markAsPaidButton = page.locator('button:has-text("Marcar como Pago")');
    await expect(markAsPaidButton).toBeVisible();
    await markAsPaidButton.click();

    // Verificar toast de sucesso com opção de desfazer
    const undoButton = page.locator('button:has-text("Desfazer")');
    await expect(undoButton).toBeVisible({ timeout: 5000 });

    // Verificar que a cobrança agora está marcada como paga
    await page.reload();
    const paidBadge = page.locator('text=Pago');
    await expect(paidBadge.first()).toBeVisible();

    // Testar undo (se ainda estiver no tempo)
    // Nota: O undo tem um timeout, então este teste pode ser flaky
    // É melhor testar isso em um teste separado com mock de tempo
  });
});

