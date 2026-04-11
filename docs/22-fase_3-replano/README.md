# 🎯 Fase 3: Replanejamento Profissional - Peladeiros V2

> **Objetivo:** Implementar todas as funcionalidades críticas com qualidade profissional  
> **Filosofia:** Qualidade > Velocidade  
> **Baseado em:** `AUDITORIA-COMPLETA-PROJETO.md`  
> **Data de Criação:** 2026-01-25

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Sprints](#estrutura-de-sprints)
3. [Sprints Detalhados](#sprints-detalhados)
4. [Critérios de Qualidade](#critérios-de-qualidade)
5. [Progresso](#progresso)

---

## 🎯 Visão Geral

### Estratégia: 4 Camadas de Profissionalismo

```
┌─────────────────────────────────────┐
│ Camada 1: Fundação Sólida        │ ← Sprints 1-3
│  - GroupContext                  │
│  - RSVP → Charge automática      │
│  - Pix QR Code                   │
│  - ReceiverProfiles + Institutions│
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│ Camada 2: UX Profissional          │ ← Sprints 4-5
│  - Loading states em tudo          │
│  - Error handling categorizado     │
│  - Undo em ações críticas         │
│  - Notificações reais              │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│ Camada 3: Refinamentos             │ ← Sprints 6-7
│  - Skeletons específicos           │
│  - Empty states com CTA            │
│  - Busca global real               │
│  - Testes E2E fluxos críticos      │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│ Camada 4: Inovação                 │ ← Sprints 8+
│  - QR Code check-in                │
│  - Tabelinha tática                 │
│  - Analytics avançado              │
│  - Real-time WebSockets            │
└─────────────────────────────────────┘
```

### Total de Sprints Planejados

- **Sprints 1-3:** Fundação Sólida (10 dias)
- **Sprints 4-5:** UX Profissional (8 dias)
- **Sprints 6-7:** Refinamentos (10 dias)
- **Sprints 8+:** Inovação (ilimitado)

**Total MVP:** 7 sprints (~28 dias de trabalho)

---

## 📅 Estrutura de Sprints

| Sprint | Foco | Duração | Status |
|--------|------|---------|--------|
| **Sprint 1** | GroupContext + Multi-Grupo | 3 dias | ⏳ Pendente |
| **Sprint 2** | RSVP → Charge Automática | 3 dias | ⏳ Pendente |
| **Sprint 3** | Pix QR Code + ReceiverProfiles | 4 dias | ⏳ Pendente |
| **Sprint 4** | Loading States + Error Handling | 4 dias | ⏳ Pendente |
| **Sprint 5** | Notificações Reais + Undo | 4 dias | ⏳ Pendente |
| **Sprint 6** | Skeletons + Empty States + Busca | 5 dias | ⏳ Pendente |
| **Sprint 7** | Testes E2E + Observabilidade | 5 dias | ⏳ Pendente |
| **Sprint 8+** | Features Avançadas | Ilimitado | ⏳ Pendente |

---

## 📚 Sprints Detalhados

### [Sprint 1: GroupContext + Multi-Grupo](./SPRINT-01-GROUP-CONTEXT.md)
**Objetivo:** Implementar sistema de seleção e alternância de grupos

**Entregas:**
- ✅ GroupContext com persistência
- ✅ GroupSwitcher no header
- ✅ Integração em todas as páginas
- ✅ Fallback para primeiro grupo

**Critérios de Done:**
- [ ] Usuário pode alternar entre grupos
- [ ] Grupo selecionado persiste entre sessões
- [ ] Todas as páginas reagem ao grupo atual
- [ ] Testes E2E de alternância

---

### [Sprint 2: RSVP → Charge Automática](./SPRINT-02-RSVP-CHARGE.md)
**Objetivo:** Auto-gerar cobrança quando atleta confirma presença

**Entregas:**
- ✅ Migration: events.price, events.receiver_profile_id
- ✅ Lógica de auto-cobrança no backend
- ✅ Frontend mostra cobrança gerada
- ✅ Notificação ao criar charge

**Critérios de Done:**
- [ ] RSVP=yes → charge criada automaticamente
- [ ] Charge vinculada ao event_id
- [ ] Toast mostra "Cobrança gerada"
- [ ] Testes E2E do fluxo completo

---

### [Sprint 3: Pix QR Code + ReceiverProfiles](./SPRINT-03-PIX-QRCODE.md)
**Objetivo:** Sistema completo de pagamento Pix com QR Code

**Entregas:**
- ✅ Migration: receiver_profiles table
- ✅ Migration: charges.pix_payload, charges.qr_image_url
- ✅ Função gerar Pix payload (EMV)
- ✅ Tela de pagamento com QR Code
- ✅ Validação de chaves Pix

**Critérios de Done:**
- [ ] QR Code gerado corretamente
- [ ] Copia-e-cola funcional
- [ ] Validação de CPF/CNPJ
- [ ] Testes unitários da geração Pix

---

### [Sprint 4: Loading States + Error Handling](./SPRINT-04-LOADING-ERRORS.md)
**Objetivo:** Feedback visual profissional em todas as ações

**Entregas:**
- ✅ Loading states em todos os botões
- ✅ Error handling categorizado
- ✅ Toast com ações contextuais
- ✅ Error boundary global

**Critérios de Done:**
- [ ] Todos botões têm loading/success/error
- [ ] Erros categorizados (EVENT_FULL, NETWORK_ERROR, etc)
- [ ] Toast com ações (Tentar novamente, Contatar suporte)
- [ ] Error boundary captura erros não tratados

---

### [Sprint 5: Notificações Reais + Undo](./SPRINT-05-NOTIFICATIONS-UNDO.md)
**Objetivo:** Sistema de notificações real + reversibilidade de ações

**Entregas:**
- ✅ Migration: notifications table
- ✅ Triggers para notificações automáticas
- ✅ API de notificações
- ✅ Undo em ações críticas (8s window)
- ✅ Polling no frontend (30s)

**Critérios de Done:**
- [ ] Notificações criadas ao gerar charge
- [ ] Badge mostra contagem real
- [ ] Undo funciona em marcar como pago
- [ ] Testes de notificações

---

### [Sprint 6: Skeletons + Empty States + Busca](./SPRINT-06-REFINEMENTS.md)
**Objetivo:** Polimento visual e busca global funcional

**Entregas:**
- ✅ Skeletons específicos por página
- ✅ Empty states com CTA contextual
- ✅ Materialized view de busca
- ✅ SearchCommand conectado à API real

**Critérios de Done:**
- [ ] Cada página tem skeleton único
- [ ] Empty states têm ilustração + CTA
- [ ] Busca global funciona (Cmd+K)
- [ ] Resultados categorizados

---

### [Sprint 7: Testes E2E + Observabilidade](./SPRINT-07-TESTS-OBSERVABILITY.md)
**Objetivo:** Qualidade garantida + monitoramento

**Entregas:**
- ✅ Testes E2E dos fluxos críticos
- ✅ Testes unitários de lógica complexa
- ✅ Logger estruturado (Pino)
- ✅ Error tracking (Sentry)
- ✅ Analytics básico

**Critérios de Done:**
- [ ] Testes E2E: RSVP, Pagamento, Multi-grupo
- [ ] Coverage > 60% em lógica crítica
- [ ] Logs estruturados em produção
- [ ] Sentry capturando erros

---

### [Sprint 8+: Features Avançadas](./SPRINT-08-ADVANCED.md)
**Objetivo:** Inovações e melhorias contínuas

**Features:**
- QR Code check-in
- Tabelinha tática
- Analytics avançado
- Real-time WebSockets
- Exportação de relatórios
- Audit log

---

## ✅ Critérios de Qualidade

### Por Sprint

Cada sprint deve atender:

- [ ] **Funcionalidade:** Feature funciona end-to-end
- [ ] **Testes:** Cobertura mínima de 60% em código novo
- [ ] **UX:** Loading + Error + Empty states
- [ ] **Performance:** Queries < 500ms, LCP < 2s
- [ ] **Acessibilidade:** ARIA labels + keyboard navigation
- [ ] **Documentação:** Comentários em lógica complexa

### Checklist de Profissionalismo

- [ ] Feedback imediato em todas as ações
- [ ] Progressive disclosure em forms complexos
- [ ] Undo/Redo em ações destrutivas
- [ ] Skeleton loading específico por página
- [ ] Empty states com CTA contextual
- [ ] Error handling categorizado
- [ ] Keyboard navigation completa
- [ ] Acessibilidade (ARIA + contraste)
- [ ] Responsividade mobile-first
- [ ] Performance otimizada

---

## 📊 Progresso

### Status Geral

```
Sprints Completos: 0/7 (0%)
Camada 1 (Fundação): 0/3 sprints
Camada 2 (UX): 0/2 sprints
Camada 3 (Refinamentos): 0/2 sprints
```

### Próximo Sprint

**Sprint 1: GroupContext + Multi-Grupo**

Ver detalhes em: [SPRINT-01-GROUP-CONTEXT.md](./SPRINT-01-GROUP-CONTEXT.md)

---

## 🚀 Como Usar Este Plano

1. **Iniciar Sprint:** Abrir o documento do sprint específico
2. **Seguir Checklist:** Marcar tarefas conforme completa
3. **Validar Critérios:** Verificar checklist de qualidade
4. **Documentar:** Atualizar progresso neste README
5. **Próximo Sprint:** Avançar apenas após validação completa

---

**Última atualização:** 2026-01-25  
**Status:** 📋 Planejamento Completo - Pronto para Execução  
**Próximo:** Iniciar Sprint 1






