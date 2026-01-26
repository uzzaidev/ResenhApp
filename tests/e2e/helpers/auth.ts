import { Page } from '@playwright/test';

/**
 * Helper de Autenticação para Testes E2E
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
 * @param page - Instância do Playwright Page
 * @param credentials - Credenciais de login (opcional, usa env vars se não fornecido)
 */
export async function login(
  page: Page,
  credentials?: LoginCredentials
): Promise<void> {
  const email = credentials?.email || process.env.TEST_USER_EMAIL || 'test@example.com';
  const password = credentials?.password || process.env.TEST_USER_PASSWORD || 'password123';

  await page.goto('/auth/signin');
  
  // Preencher formulário
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  
  // Submeter
  await page.click('button[type="submit"]');
  
  // Aguardar redirecionamento
  await page.waitForURL(/\/dashboard|\/groups/, { timeout: 10000 });
}

/**
 * Faz logout do sistema
 * 
 * @param page - Instância do Playwright Page
 */
export async function logout(page: Page): Promise<void> {
  // Clicar no menu do usuário (assumindo que existe)
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
 * Verifica se o usuário está autenticado
 * 
 * @param page - Instância do Playwright Page
 * @returns true se autenticado, false caso contrário
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const currentUrl = page.url();
  return !currentUrl.includes('/auth/signin');
}

