import { Page } from '@playwright/test';

/**
 * Helpers para Dados de Teste
 * 
 * Facilita criação e limpeza de dados de teste
 * Sprint 7: Testes E2E + Observabilidade
 */

/**
 * Cria um treino de teste com preço
 * 
 * @param page - Instância do Playwright Page
 * @param groupId - ID do grupo
 * @returns ID do treino criado
 */
export async function createTestTraining(
  page: Page,
  groupId: string
): Promise<string> {
  await page.goto(`/groups/${groupId}/events/new`);
  
  // Preencher formulário básico
  await page.fill('[name="title"]', 'Treino de Teste E2E');
  await page.fill('[name="startsAt"]', new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  await page.fill('[name="maxPlayers"]', '10');
  
  // Adicionar preço
  await page.check('[name="hasPrice"]');
  await page.fill('[name="price"]', '20.00');
  
  // Submeter
  await page.click('button[type="submit"]');
  
  // Aguardar criação e extrair ID da URL
  await page.waitForURL(/\/events\/[^/]+/, { timeout: 10000 });
  const url = page.url();
  const eventId = url.match(/\/events\/([^/]+)/)?.[1];
  
  if (!eventId) {
    throw new Error('Não foi possível obter ID do treino criado');
  }
  
  return eventId;
}

/**
 * Limpa dados de teste
 * 
 * @param page - Instância do Playwright Page
 * @param eventId - ID do evento a ser deletado
 */
export async function cleanupTestData(
  page: Page,
  eventId: string
): Promise<void> {
  // TODO: Implementar limpeza via API ou UI
  // Por enquanto, apenas log
  console.log(`[TEST] Limpar dados de teste para evento ${eventId}`);
}

