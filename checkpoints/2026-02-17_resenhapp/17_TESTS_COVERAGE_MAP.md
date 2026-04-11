# ResenhApp V2.0 — Cobertura de Testes
> FATO (do código) — tests/, vitest.config.ts, playwright.config.ts

## Infraestrutura de Testes
- **Unit/Integration**: Vitest 4.0.18 + jsdom
- **E2E**: Playwright 1.58.0 (Chrome, Firefox, Safari)
- **Coverage**: V8 provider (HTML + JSON + text)
- **Setup file**: tests/setup.ts

## Arquivos de Teste (13 total)

### Unit Tests
| Arquivo | Módulo Testado | O que testa |
|---------|---------------|-------------|
| tests/unit/lib/pix.test.ts | src/lib/pix.ts | Geração PIX, validação de chaves, CRC16 |
| tests/unit/lib/error-handler.test.ts | src/lib/error-handler.ts | Categorização e ações de erro |
| tests/unit/lib/group-helpers.test.ts | src/lib/group-helpers.ts | Utilitários de grupo |
| tests/unit/api/rsvp-auto-charge.test.ts | Lógica RSVP→charge | Auto-criação de cobrança |
| tests/unit/contexts/group-context.test.tsx | GroupContext | Estado e troca de grupo |

### Integration Tests
| Arquivo | Módulo Testado | O que testa |
|---------|---------------|-------------|
| tests/integration/api/groups-switch-logic.test.ts | /api/groups/switch | Lógica de troca de grupo |

### Component Tests
| Arquivo | Componente Testado | O que testa |
|---------|-------------------|-------------|
| tests/components/layout/group-switcher.test.tsx | GroupSwitcher | Renderização e interação |

### E2E Tests
| Arquivo | Fluxo Testado |
|---------|--------------|
| tests/e2e/payment-flow.spec.ts | Fluxo de pagamento PIX |
| tests/e2e/rsvp-flow.spec.ts | Fluxo de confirmação de presença |

### E2E Helpers
| Arquivo | Propósito |
|---------|-----------|
| tests/e2e/helpers/auth.ts | Autenticação nos testes E2E |
| tests/e2e/helpers/data.ts | Criação de dados de teste |

## Cobertura por Módulo
| Módulo | Cobertura Unit | Cobertura E2E | Lacunas |
|--------|---------------|--------------|---------|
| PIX | Alta (testes dedicados) | Parcial (payment-flow) | - |
| Error Handler | Alta | - | - |
| Group Helpers | Média | - | - |
| RSVP | Média | Alta (rsvp-flow) | - |
| Group Context | Alta | - | - |
| Group Switcher | Média | - | - |
| Financial | Baixa | Baixa | Cobranças manuais |
| Modalities | Nenhuma | Nenhuma | Completamente descoberto |
| Rankings | Nenhuma | Nenhuma | Completamente descoberto |
| Trainings | Nenhuma | Nenhuma | Completamente descoberto |
| Gamification | Nenhuma | Nenhuma | Completamente descoberto |
| Notifications | Nenhuma | Nenhuma | Completamente descoberto |
| Auth | Nenhuma | Nenhuma | Sem testes de signup/login |

## Riscos de Cobertura
1. Múltiplos módulos sem qualquer teste (modalities, rankings, trainings, gamification)
2. Sem testes de API routes completos (apenas mocks unitários)
3. Sem testes de permissões RBAC
4. E2E depende de banco de dados real para funcionar
