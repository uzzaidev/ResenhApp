# Sprint 4: Pendências e Próximos Passos

**Status Atual:** 🟡 60% Completo  
**Última Atualização:** 2026-01-25

---

## ✅ O que já foi feito

1. ✅ **Error Handler Categorizado** - `src/lib/error-handler.ts`
2. ✅ **Hook useErrorHandler** - `src/hooks/use-error-handler.ts`
3. ✅ **ButtonWithLoading Component** - `src/components/ui/button-with-loading.tsx`
4. ✅ **Error Boundary Global** - `src/components/error-boundary.tsx`
5. ✅ **EventRsvpForm atualizado** - Usa novos componentes

---

## ⏳ O que falta fazer

### 1. Atualizar Botões com Loading States

#### Prioridade Alta:
- [ ] **Marcar como Pago** 
  - Arquivo: `src/components/payments/payments-content.tsx` (linha 40)
  - Arquivo: `src/components/payments/charges-data-table.tsx` (linha 240)
  - Status: Usa `alert()` e não tem loading state

- [ ] **Criar Treino**
  - Arquivo: `src/components/events/event-form.tsx` (linha 97)
  - Status: Tem `isLoading` mas não usa `ButtonWithLoading`

- [ ] **Criar Modalidade**
  - Arquivo: `src/app/(dashboard)/modalidades/page.tsx` (linha 121)
  - Status: Botão simples, precisa de loading state

#### Prioridade Média:
- [ ] **Adicionar Atleta**
  - Localizar arquivo do formulário de adicionar atleta
  - Status: A localizar

- [ ] **Comprar Créditos**
  - Localizar arquivo do formulário de comprar créditos
  - Status: A localizar

- [ ] **Alternar Grupo**
  - Arquivo: `src/components/layout/group-switcher.tsx`
  - Status: Verificar se precisa de loading state

---

### 2. Validação de Formulários com Feedback Inline

#### Formulários a Atualizar:
- [ ] **Criar Treino** (`src/components/events/event-form.tsx`)
  - Adicionar validação Zod
  - Mostrar erros inline por campo
  - Feedback visual de campos inválidos

- [ ] **Criar Modalidade**
  - Localizar arquivo do formulário
  - Adicionar validação e feedback inline

- [ ] **Adicionar Atleta**
  - Localizar arquivo do formulário
  - Adicionar validação e feedback inline

- [ ] **Comprar Créditos**
  - Localizar arquivo do formulário
  - Adicionar validação e feedback inline

- [ ] **Criar ReceiverProfile**
  - Arquivo: `src/app/api/groups/[groupId]/receiver-profiles/route.ts`
  - Criar formulário frontend se não existir
  - Adicionar validação e feedback inline

---

### 3. Melhorias no Error Handler

- [ ] **VALIDATION_ERROR** → Mostrar campos inválidos
  - Atualmente só mostra mensagem genérica
  - Melhorar para listar campos específicos

- [ ] **Integração com Sentry** (Sprint 7)
  - Logging estruturado já preparado
  - Aguardar Sprint 7 para integração completa

---

### 4. Testes

- [ ] **Testes Unitários:**
  - [ ] `error-handler.ts` - Cada categoria de erro
  - [ ] `ButtonWithLoading` - Estados visuais
  - [ ] `useErrorHandler` - Integração com toasts

- [ ] **Testes E2E:**
  - [ ] Error boundary captura erros
  - [ ] Retry funciona corretamente
  - [ ] Loading states aparecem durante ações

---

## 🎯 Plano de Ação

### Fase 1: Botões Principais (Prioridade Alta)
1. Atualizar "Marcar como Pago" com `ButtonWithLoading`
2. Atualizar "Criar Treino" com `ButtonWithLoading`
3. Atualizar "Criar Modalidade" com `ButtonWithLoading`

### Fase 2: Validação de Formulários
1. Criar componente `FormField` com feedback inline
2. Atualizar formulários principais
3. Integrar validação Zod com feedback visual

### Fase 3: Testes e Polimento
1. Testes unitários
2. Testes E2E
3. Documentação final

---

## 📝 Notas

- **Error Handler** está completo e funcional
- **ButtonWithLoading** está pronto para uso
- **Error Boundary** está integrado e funcionando
- Foco agora: aplicar em mais componentes e melhorar validações

---

**Próxima Ação:** Atualizar botões de prioridade alta





