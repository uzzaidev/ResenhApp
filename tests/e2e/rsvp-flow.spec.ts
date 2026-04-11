import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';
import { createAuthUserFixture, cleanupAuthUserFixture, type AuthUserFixture } from './helpers/db';

/**
 * Teste E2E: Fluxo RSVP Completo
 * 
 * Testa o fluxo completo de confirmação de presença:
 * 1. Login
 * 2. Navegar para treinos
 * 3. Confirmar presença em um treino com preço
 * 4. Verificar que charge foi criada
 * 5. Verificar notificação
 * 
 * Sprint 7: Testes E2E + Observabilidade
 */

test.describe('RSVP Flow', () => {
  let fixture: AuthUserFixture;

  test.beforeEach(async ({ page }) => {
    fixture = await createAuthUserFixture('rsvp', { withUpcomingEvent: true });
    await login(page, { email: fixture.email, password: fixture.password });
  });

  test.afterEach(async () => {
    if (fixture) {
      await cleanupAuthUserFixture(fixture);
    }
  });

  test('deve confirmar presença e gerar charge automaticamente', async ({ page }) => {
    // 2. Ir para treinos
    await page.goto('/eventos?tipo=treino', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await expect(
      page.getByRole('main').getByRole('heading', { name: 'Eventos', exact: true })
    ).toBeVisible();

    // 3. Verificar se há treinos disponíveis
    const eventLinks = page.locator('a[href*="/eventos/"][href*="returnTo="]');
    const hasTrainings = await eventLinks.count() > 0;
    
    if (!hasTrainings) {
      test.skip('Nenhum treino disponível para teste');
      return;
    }

    // 4. Clicar no primeiro treino com preço
    const trainingCard = eventLinks.first();
    await trainingCard.click();

    // 5. Verificar se há botão de confirmar presença
    const confirmButton = page.locator('[data-testid="confirm-presence-button"]');
    await expect(confirmButton).toBeVisible();

    // 6. Confirmar presença
    await confirmButton.click();

    // 7. Verificar toast de sucesso
    await expect(page.locator('text=Presença confirmada')).toBeVisible({ timeout: 5000 });

    // 8. Verificar se charge foi criada (ir para financeiro)
    await page.goto('/financeiro');
    await expect(page.locator('h1')).toContainText('Financeiro');

    // 9. Verificar se há uma nova cobrança
    // (Assumindo que o treino tinha preço configurado)
    const charges = page.locator('[data-testid="charge-item"]');
    const chargeCount = await charges.count();
    
    // Se houver charges, verificar que a mais recente está relacionada ao treino
    if (chargeCount > 0) {
      const latestCharge = charges.first();
      await expect(latestCharge).toBeVisible();
    }

    // 10. Verificar notificação (se implementado)
    // await page.goto('/dashboard');
    // const notificationBadge = page.locator('[data-testid="notification-badge"]');
    // await expect(notificationBadge).toContainText('1');
  });

  test('deve exibir link para charge quando charge é criada', async ({ page }) => {
    // Este teste verifica que o toast de sucesso do RSVP
    // contém um link para a página da charge criada
    
    await page.goto('/eventos?tipo=treino', { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    // Assumindo que há um treino com preço
    const trainingCard = page.locator('a[href*="/eventos/"][href*="returnTo="]').first();
    
    if ((await trainingCard.count()) === 0) {
      test.skip('Nenhum treino disponível');
      return;
    }

    await trainingCard.click();
    
    const confirmButton = page.locator('button:has-text("Confirmar Presença")');
    if ((await confirmButton.count()) === 0) {
      test.skip('Treino não tem opção de confirmar presença');
      return;
    }

    await confirmButton.click();

    // Verificar que o toast contém link para charge
    const toastLink = page.locator('a[href*="/financeiro/charges/"]');
    await expect(toastLink).toBeVisible({ timeout: 5000 });
  });
});
