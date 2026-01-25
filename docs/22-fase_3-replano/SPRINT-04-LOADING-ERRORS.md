# 🎯 Sprint 4: Loading States + Error Handling

> **Duração:** 4 dias  
> **Camada:** 2 - UX Profissional  
> **Prioridade:** 🟡 Importante (Afeta UX)

---

## 📋 Objetivo

Implementar feedback visual profissional em todas as ações do sistema, garantindo que o usuário sempre saiba o estado atual (loading, success, error) e tenha ações contextuais para resolver problemas.

---

## 🎯 Entregas

### 1. Loading States em Todos os Botões

**Padrão a Aplicar:**
```typescript
const [isLoading, setIsLoading] = useState(false);
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

<Button
  onClick={handleAction}
  disabled={isLoading || status === 'success'}
>
  {isLoading && <Spinner className="mr-2 h-4 w-4" />}
  {status === 'success' && <CheckCircle className="mr-2 h-4 w-4" />}
  {status === 'error' && <AlertCircle className="mr-2 h-4 w-4" />}
  
  {status === 'idle' && 'Confirmar Presença'}
  {status === 'loading' && 'Confirmando...'}
  {status === 'success' && 'Confirmado!'}
  {status === 'error' && 'Tentar Novamente'}
</Button>
```

**Botões a Atualizar:**
- [ ] RSVP (Confirmar Presença)
- [ ] Marcar como Pago
- [ ] Criar Treino
- [ ] Criar Modalidade
- [ ] Adicionar Atleta
- [ ] Comprar Créditos
- [ ] Alternar Grupo

---

### 2. Error Handling Categorizado

**Arquivo:** `src/lib/error-handler.ts`

**Categorias de Erro:**
- [ ] `EVENT_FULL` - Treino lotado
- [ ] `ALREADY_CONFIRMED` - Já confirmou presença
- [ ] `NETWORK_ERROR` - Sem conexão
- [ ] `UNAUTHORIZED` - Não autenticado
- [ ] `FORBIDDEN` - Sem permissão
- [ ] `VALIDATION_ERROR` - Dados inválidos
- [ ] `NOT_FOUND` - Recurso não encontrado
- [ ] `SERVER_ERROR` - Erro do servidor

**Função Helper:**
```typescript
export function handleError(error: unknown, context?: Record<string, any>) {
  if (error instanceof Error) {
    // Categorizar erro
    const category = categorizeError(error);
    
    // Toast com ação contextual
    toast.error(category.title, {
      description: category.description,
      action: category.action,
      duration: category.duration || 5000
    });
    
    // Log para Sentry
    logError(error, { context, category });
  }
}
```

---

### 3. Toast com Ações Contextuais

**Padrão:**
```typescript
// Erro com ação
toast.error('Treino lotado', {
  description: 'Este treino já atingiu o número máximo de participantes',
  action: {
    label: 'Ver lista de espera',
    onClick: () => router.push(`/events/${eventId}/waitlist`)
  }
});

// Erro de rede com retry
toast.error('Sem conexão', {
  description: 'Verifique sua internet e tente novamente',
  action: {
    label: 'Tentar novamente',
    onClick: () => handleRSVP()
  }
});

// Erro genérico com suporte
toast.error('Algo deu errado', {
  description: 'Nossa equipe foi notificada. Tente novamente em alguns minutos.',
  action: {
    label: 'Contatar suporte',
    onClick: () => window.open('/suporte', '_blank')
  }
});
```

**Casos a Implementar:**
- [ ] EVENT_FULL → Link para lista de espera
- [ ] NETWORK_ERROR → Botão "Tentar novamente"
- [ ] SERVER_ERROR → Link para suporte
- [ ] VALIDATION_ERROR → Mostrar campos inválidos

---

### 4. Error Boundary Global

**Arquivo:** `src/components/error-boundary.tsx`

**Funcionalidades:**
- [ ] Capturar erros não tratados
- [ ] UI de fallback amigável
- [ ] Botão "Recarregar página"
- [ ] Link para reportar bug
- [ ] Log automático para Sentry

**UI:**
```
┌─────────────────────────────────────┐
│        ⚠️ Ops! Algo deu errado      │
│                                     │
│ Não se preocupe, nossa equipe foi   │
│ notificada e está trabalhando para  │
│ resolver o problema.                │
│                                     │
│ [Recarregar Página]                │
│ [Reportar Bug]                     │
└─────────────────────────────────────┘
```

---

### 5. Validação de Formulários

**Padrão:**
```typescript
// Usar Zod para validação
const schema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  price: z.number().positive('Preço deve ser maior que zero'),
});

// Mostrar erros inline
{errors.name && (
  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
)}
```

**Forms a Atualizar:**
- [ ] Criar Treino
- [ ] Criar Modalidade
- [ ] Adicionar Atleta
- [ ] Comprar Créditos
- [ ] Criar ReceiverProfile

---

## ✅ Critérios de Done

### Funcionalidade
- [ ] Todos botões têm loading/success/error states
- [ ] Erros categorizados corretamente
- [ ] Toast com ações contextuais
- [ ] Error boundary captura erros não tratados

### UX
- [ ] Feedback imediato (< 100ms)
- [ ] Mensagens claras e acionáveis
- [ ] Não bloqueia usuário (sempre tem saída)
- [ ] Design consistente

### Testes
- [ ] Teste: Cada categoria de erro
- [ ] Teste: Error boundary
- [ ] Teste: Retry funciona

---

## 📝 Tarefas Detalhadas

### Dia 1: Loading States
- [ ] Criar componente `ButtonWithLoading`
- [ ] Atualizar 8 botões principais
- [ ] Adicionar Spinner component
- [ ] Testar estados visuais

### Dia 2: Error Handling
- [ ] Criar `src/lib/error-handler.ts`
- [ ] Implementar categorização
- [ ] Criar helper `handleError()`
- [ ] Integrar em APIs principais

### Dia 3: Toast Contextual + Error Boundary
- [ ] Atualizar toasts com ações
- [ ] Criar Error Boundary
- [ ] Integrar no layout
- [ ] Testar cenários de erro

### Dia 4: Validação Forms + Testes
- [ ] Atualizar validação de forms
- [ ] Mostrar erros inline
- [ ] Testes E2E de erros
- [ ] Documentação

---

## 🐛 Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Muitos toasts simultâneos | Médio | Queue de toasts (max 3) |
| Erro não categorizado | Baixo | Fallback genérico |
| Error boundary não captura | Baixo | Testar com erros reais |

---

## 📚 Referências

- [Sonner Toast](https://sonner.emilkowal.ski/)
- [React Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Zod Validation](https://zod.dev/)

---

**Status:** ⏳ Pendente  
**Início:** ___/___/____  
**Conclusão:** ___/___/____

