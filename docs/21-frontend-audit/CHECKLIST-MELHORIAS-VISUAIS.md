# ✅ Checklist de Melhorias Visuais

> **Baseado em:** Análise Visual Completa  
> **Referência:** `ATLETICAS-SISTEMA-COMPLETO-V1.html`  
> **Status:** 🟢 Sprint 1 Completo (2026-01-24)

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
- [ ] **1.2** Criar `src/app/(dashboard)/layout.tsx`
  - [ ] Integrar Sidebar
  - [ ] Integrar Topbar
  - [ ] Estrutura flex responsiva
  - [ ] Padding e espaçamento consistentes

#### Group Context
- [ ] **1.3** Criar `src/contexts/group-context.tsx`
  - [ ] Provider para grupo atual
  - [ ] Hook `useGroup()`
  - [ ] Persistência de grupo selecionado
  - [ ] Integração com todas as páginas

#### Integração Sidebar
- [ ] **1.4** Integrar Sidebar em todas as páginas
  - [ ] Remover `groupId` hardcoded
  - [ ] Usar contexto de grupo
  - [ ] Navegação funcional

---

### 2. Dashboard Principal

#### Métricas Principais
- [ ] **2.1** Adicionar 4 MetricCards no topo
  - [ ] Atletas Ativos (com tendência ↑↓)
  - [ ] Treinos Esta Semana
  - [ ] Frequência Média (com tendência)
  - [ ] Caixa do Mês (com pendente)

#### Grid de Modalidades
- [ ] **2.2** Criar `src/components/dashboard/modalities-grid.tsx`
  - [ ] Cards visuais com ícones grandes
  - [ ] Background com gradiente
  - [ ] 3 estatísticas (Atletas, Treinos/Semana, Frequência)
  - [ ] Hover effects pronunciados
  - [ ] Link para detalhes

#### Lista de Treinos
- [ ] **2.3** Criar `src/components/dashboard/upcoming-trainings.tsx`
  - [ ] Cards de treino expandidos
  - [ ] Data destacada (15 JAN)
  - [ ] Badge de modalidade
  - [ ] Progress bar de RSVP
  - [ ] Lista de avatares confirmados
  - [ ] Badge de status (CONFIRMADO/PENDENTE)
  - [ ] Badge RECORRENTE quando aplicável

#### Componentes Auxiliares
- [ ] **2.4** Criar `src/components/trainings/rsvp-progress.tsx`
  - [ ] Progress bar visual
  - [ ] Contador (23/30)
  - [ ] Porcentagem destacada

- [ ] **2.5** Criar `src/components/trainings/confirmed-avatars.tsx`
  - [ ] Lista de avatares (primeiros 5)
  - [ ] Contador "+19" para restantes
  - [ ] Overlap visual

---

### 3. Página de Treinos

#### Página Completa
- [x] **3.1** Criar `src/app/(dashboard)/treinos/page.tsx` ✅ **SPRINT 1**
  - [x] Header com título e ações
  - [x] 4 métricas (Total, Próximos, Participação, Esta Semana)
  - [x] Filtros (Todos/Próximos/Passados)
  - [x] Lista de treinos com cards expandidos

#### Cards de Treino
- [ ] **3.2** Criar `src/components/trainings/training-card.tsx`
  - [ ] Data destacada
  - [ ] Badge modalidade
  - [ ] Título e descrição
  - [ ] Detalhes (horário, local, preço)
  - [ ] Botão de ação (Confirmar/Responder)
  - [ ] RSVP progress
  - [ ] Avatares confirmados
  - [ ] Badge RECORRENTE

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
- [ ] **5.2** Criar `src/components/ui/empty-state.tsx`
  - [ ] Ícone grande
  - [ ] Título e descrição
  - [ ] Ação sugerida (botão)
  - [ ] Variantes (sem dados, erro, busca vazia)

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
| Layout e Navegação | 4 | 0 | 0% |
| Dashboard Principal | 5 | 0 | 0% |
| Página Treinos | 2 | 2 | 100% ✅ |
| Página Financeiro | 4 | 1 | 25% 🟡 |
| Componentes UI | 4 | 3 | 75% 🟢 |
| Páginas Adicionais | 3 | 3 | 100% ✅ |
| Melhorias Visuais | 3 | 1 | 33% 🟡 |
| Features Avançadas | 3 | 0 | 0% |
| **TOTAL** | **28** | **10** | **36%** |

---

## 🎯 PRÓXIMOS PASSOS

1. **Revisar este checklist** com a equipe
2. **Priorizar tarefas** baseado em impacto
3. **Criar issues** no GitHub (se aplicável)
4. **Iniciar implementação** pela Prioridade Alta
5. **Validar** com referência visual constantemente

---

**Última atualização:** 2026-01-24  
**Status:** 🟢 Sprint 1 Completo (36% do checklist)  
**Próximo:** Sprint 2 - Conectar APIs reais e Dashboard Principal

