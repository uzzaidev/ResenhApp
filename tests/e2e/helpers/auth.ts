import { Page } from '@playwright/test';

/**
 * Helper de Autenticacao para Testes E2E
 *
 * Facilita login/logout em testes
 * Sprint 7: Testes E2E + Observabilidade
 */

interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Faz login no sistema
 *
 * @param page - Instancia do Playwright Page
 * @param credentials - Credenciais de login (opcional, usa env vars se nao fornecido)
 */
export async function login(
  page: Page,
  credentials?: LoginCredentials
): Promise<void> {
  const email = credentials?.email ?? process.env.TEST_USER_EMAIL;
  const password = credentials?.password ?? process.env.TEST_USER_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "E2E login requer TEST_USER_EMAIL e TEST_USER_PASSWORD (ou credenciais explicitas no teste)."
    );
  }

  await page.goto('/auth/signin');

  // Preencher formulario (compativel com markup atual e legado)
  const emailInput = page.locator('#email, [name="email"]').first();
  const passwordInput = page.locator('#password, [name="password"]').first();
  await emailInput.fill(email);
  await passwordInput.fill(password);

  // Submeter
  const submitButton = page.locator('button[type="submit"], button:has-text("Entrar")').first();
  await submitButton.click();

  // Aguardar redirecionamento
  try {
    await page.waitForURL(/\/dashboard|\/grupos|\/onboarding\/step\/1/, { timeout: 15000 });
  } catch {
    const errorContainer = page.locator(".text-red-600").first();
    if (await errorContainer.isVisible()) {
      const errorText = (await errorContainer.innerText()).trim();
      throw new Error(`Falha de login no E2E: ${errorText}`);
    }
    throw new Error(
      "Falha de login no E2E: sem redirecionamento apos submit. Verifique TEST_USER_EMAIL/TEST_USER_PASSWORD."
    );
  }
}

/**
 * Faz logout do sistema
 *
 * @param page - Instancia do Playwright Page
 */
export async function logout(page: Page): Promise<void> {
  // Clicar no menu do usuario (assumindo que existe)
  const userMenu = page.locator('[data-testid="user-menu"]');
  if (await userMenu.count() > 0) {
    await userMenu.click();

    // Clicar em logout
    const logoutButton = page.locator('button:has-text("Sair"), a:has-text("Sair")');
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForURL(/\/auth\/signin/, { timeout: 5000 });
    }
  }
}

/**
 * Verifica se o usuario esta autenticado
 *
 * @param page - Instancia do Playwright Page
 * @returns true se autenticado, false caso contrario
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const currentUrl = page.url();
  return !currentUrl.includes('/auth/signin');
}

