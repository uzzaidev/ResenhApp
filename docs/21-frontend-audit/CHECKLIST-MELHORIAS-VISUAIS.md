# ✅ Checklist de Melhorias Visuais

> **Baseado em:** Análise Visual Completa  
> **Referência:** `ATLETICAS-SISTEMA-COMPLETO-V1.html`  
> **Status:** 🟢 Sprint 2 Em Andamento (2026-01-24)

---

## 🔴 PRIORIDADE ALTA (Antes da Fase 2)

### 1. Layout e Navegação

#### Topbar Component
- [ ] **1.1** Criar `src/components/layout/topbar.tsx`
  - [ ] Search bar funcional
  - [ ] Ícone de notificações com badge
  - [ ] User profile dropdown
  - [ ] Título dinâmico baseado na página
  - [ ] Subtitle dinâmico
  - [ ] Design System UzzAI aplicado

#### Dashboard Layout
- [x] **1.2** Criar `src/app/(dashboard)/layout.tsx` ✅ **SPRINT 2**
  - [x] Integrar Sidebar
  - [x] Integrar Topbar
  - [x] Estrutura flex responsiva
  - [x] Padding e espaçamento consistentes

#### Group Context
- [x] **1.3** Criar `src/contexts/group-context.tsx` ✅ **SPRINT 2**
  - [x] Provider para grupo atual
  - [x] Hook `useGroup()`
  - [x] Persistência de grupo selecionado (localStorage)
  - [x] Integração com todas as páginas

#### Integração Sidebar
- [ ] **1.4** Integrar Sidebar em todas as páginas
  - [ ] Remover `groupId` hardcoded
  - [ ] Usar contexto de grupo
  - [ ] Navegação funcional

---

### 2. Dashboard Principal

#### Métricas Principais
- [x] **2.1** Adicionar 4 MetricCards no topo ✅ **SPRINT 2**
  - [x] Atletas Ativos (com tendência ↑↓)
  - [x] Treinos Esta Semana
  - [x] Frequência Média (com tendência)
  - [x] Caixa do Mês (com pendente)

#### Grid de Modalidades
- [x] **2.2** Criar `src/components/dashboard/modalities-grid.tsx` ✅ **SPRINT 2**
  - [x] Cards visuais com ícones grandes
  - [x] Background com gradiente
  - [x] 3 estatísticas (Atletas, Treinos/Semana, Frequência)
  - [x] Hover effects pronunciados
  - [x] Link para detalhes

#### Lista de Treinos
- [x] **2.3** Criar `src/components/dashboard/upcoming-trainings.tsx` ✅ **SPRINT 2**
  - [x] Cards de treino expandidos
  - [x] Data destacada (15 JAN)
  - [x] Badge de modalidade
  - [x] Progress bar de RSVP
  - [x] Lista de avatares confirmados
  - [x] Badge de status (CONFIRMADO/PENDENTE)
  - [x] Badge RECORRENTE quando aplicável

#### Componentes Auxiliares
- [x] **2.4** Criar `src/components/trainings/rsvp-progress.tsx` ✅ **SPRINT 2**
  - [x] Progress bar visual
  - [x] Contador (23/30)
  - [x] Porcentagem destacada

- [x] **2.5** Criar `src/components/trainings/confirmed-avatars.tsx` ✅ **SPRINT 2**
  - [x] Lista de avatares (primeiros 5)
  - [x] Contador "+19" para restantes
  - [x] Overlap visual

---

### 3. Página de Treinos

#### Página Completa
- [x] **3.1** Criar `src/app/(dashboard)/treinos/page.tsx` ✅ **SPRINT 1**
  - [x] Header com título e ações
  - [x] 4 métricas (Total, Próximos, Participação, Esta Semana)
  - [x] Filtros (Todos/Próximos/Passados)
  - [x] Lista de treinos com cards expandidos

#### Cards de Treino
- [x] **3.2** Criar `src/components/trainings/training-card.tsx` ✅ **SPRINT 2**
  - [x] Data destacada
  - [x] Badge modalidade
  - [x] Título e descrição
  - [x] Detalhes (horário, local, preço)
  - [x] Botão de ação (Confirmar/Responder)
  - [x] RSVP progress
  - [x] Avatares confirmados
  - [x] Badge RECORRENTE

---

### 4. Página Financeiro

#### Dashboard Financeiro
- [x] **4.1** Melhorar `src/app/(dashboard)/financeiro/page.tsx` ✅ **SPRINT 1**
  - [x] 4 métricas principais (Receita Total, Mês, Pendentes, Taxa Pagamento)
  - [x] Tendências (↑↓)
  - [x] Seção "Pagamentos por Treino" ⭐ **PROBLEMA CRÍTICO RESOLVIDO**
  - [x] Cards de treino com:
    - Total esperado vs recebido
    - Lista de pendentes
    - Botão "Cobrar" individual
    - Badge "100% PAGO"
  - [x] Histórico de transações (filtros: Todos/Pendentes/Pagos)

#### Componentes
- [ ] **4.2** Criar `src/components/financial/payment-by-training-card.tsx`
- [ ] **4.3** Criar `src/components/financial/pending-payers-list.tsx`
- [ ] **4.4** Criar `src/components/financial/transaction-history.tsx`

---

## 🟡 PRIORIDADE MÉDIA

### 5. Componentes de UI

#### Loading States
- [x] **5.1** Criar `src/components/ui/loading-skeleton.tsx` ✅ **SPRINT 1**
  - [x] Skeleton para cards
  - [x] Skeleton para tabelas
  - [x] Skeleton para listas
  - [x] Animação de shimmer
  - [x] Integrado em MetricCard V2

#### Empty States
- [x] **5.2** Criar `src/components/ui/empty-state.tsx` ✅ **SPRINT 2**
  - [x] Ícone grande
  - [x] Título e descrição
  - [x] Ação sugerida (botão)
  - [x] Variantes (sem dados, erro, busca vazia)

#### Notificações
- [x] **5.3** Criar `src/components/notifications/notification-dropdown.tsx` ✅ **SPRINT 1**
  - [x] Lista de notificações funcional
  - [x] Badge contador
  - [x] Marcar como lida
  - [x] Integração com Topbar

#### Busca
- [x] **5.4** Criar `src/components/ui/search-bar.tsx` ✅ **SPRINT 1**
  - [x] SearchCommand com Cmd+K
  - [x] Sugestões funcionais
  - [x] Integração com Topbar

---

### 6. Páginas Adicionais

#### Frequência
- [x] **6.1** Criar `src/app/(dashboard)/frequencia/page.tsx` ✅ **SPRINT 1**
  - [x] 4 métricas (Taxa, Total, Faltas, Atletas Presentes)
  - [x] Ranking Top 10 com medalhas (ouro/prata/bronze)
  - [ ] Sistema de check-in QR Code (backend pendente)
  - [ ] Check-in manual (backend pendente)
  - [x] Lista de check-ins (treinos recentes)

#### Rankings
- [x] **6.2** Criar `src/app/(dashboard)/rankings/page.tsx` ✅ **SPRINT 1**
  - [x] Top 10 com medalhas 1°/2°/3°
  - [x] 3 categorias (Geral/Técnica/Presença)
  - [x] Filtro por modalidade
  - [x] Trends de melhoria/piora
  - [x] MVP badges
  - [x] Progress bars de rating

#### Jogos
- [x] **6.3** Criar `src/app/(dashboard)/jogos/page.tsx` ✅ **SPRINT 1**
  - [x] 4 métricas (Total, Vitórias, Empates, Derrotas, Win Rate)
  - [x] Próximos jogos com VS adversários
  - [x] Resultados recentes com badges V/E/D
  - [ ] Convocações (backend pendente)
  - [ ] Calendário de competições (Sprint 2+)

---

### 7. Melhorias Visuais

#### Cards de Modalidades
- [ ] **7.1** Melhorar `src/components/modalities/modality-card.tsx`
  - [ ] Ícone maior (48px)
  - [ ] Background gradiente
  - [ ] Estatísticas mais visuais
  - [ ] Hover effect melhorado

#### Cards de Atletas
- [ ] **7.2** Melhorar `src/components/athletes/athletes-table.tsx`
  - [ ] Coluna de frequência com progress bar
  - [ ] Badges de status
  - [ ] Avatares maiores
  - [ ] Ações mais visíveis

#### Design System
- [x] **7.3** Aplicar Design System UzzAI ✅ **SPRINT 1**
  - [x] Cores consistentes (8 categorias de features)
  - [x] Tipografia padronizada
  - [x] Espaçamentos consistentes
  - [x] Gradientes aplicados (8 gradientes únicos)

---

## 🟢 PRIORIDADE BAIXA

### 8. Features Avançadas

#### Animações
- [ ] **8.1** Adicionar animações sutis
  - [ ] Fade in em cards
  - [ ] Hover transitions
  - [ ] Loading animations

#### Filtros Avançados
- [ ] **8.2** Melhorar filtros
  - [ ] Filtros salvos
  - [ ] Filtros por data
  - [ ] Filtros combinados

#### Exportação
- [ ] **8.3** Adicionar exportação
  - [ ] Exportar rankings
  - [ ] Exportar relatórios
  - [ ] Exportar dados

---

## 📊 PROGRESSO

### Por Categoria

| Categoria | Total | Concluído | % |
|-----------|-------|-----------|---|
| Layout e Navegação | 4 | 2 | 50% 🟡 |
| Dashboard Principal | 5 | 5 | 100% ✅ |
| Página Treinos | 2 | 2 | 100% ✅ |
| Página Financeiro | 4 | 1 | 25% 🟡 |
| Componentes UI | 4 | 4 | 100% ✅ |
| Páginas Adicionais | 3 | 3 | 100% ✅ |
| Melhorias Visuais | 3 | 1 | 33% 🟡 |
| Features Avançadas | 3 | 0 | 0% |
| **TOTAL** | **28** | **18** | **64%** |

---

## 🎯 PRÓXIMOS PASSOS

1. **Revisar este checklist** com a equipe
2. **Priorizar tarefas** baseado em impacto
3. **Criar issues** no GitHub (se aplicável)
4. **Iniciar implementação** pela Prioridade Alta
5. **Validar** com referência visual constantemente

---

**Última atualização:** 2026-01-24  
**Status:** 🟢 Sprint 2 Em Andamento (64% do checklist)  
**Próximo:** Conectar APIs reais e finalizar integrações

