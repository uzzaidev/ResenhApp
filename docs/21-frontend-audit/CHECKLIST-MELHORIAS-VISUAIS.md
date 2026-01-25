# ✅ Checklist de Melhorias Visuais

> **Baseado em:** Análise Visual Completa  
> **Referência:** `ATLETICAS-SISTEMA-COMPLETO-V1.html`  
> **Status:** 🟡 Aguardando início

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
- [ ] **3.1** Criar `src/app/(dashboard)/treinos/page.tsx`
  - [ ] Header com título e ações
  - [ ] 4 métricas (Hoje, Esta Semana, Pendentes, Taxa)
  - [ ] Filtros (por modalidade)
  - [ ] Lista de treinos com cards expandidos

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
- [ ] **4.1** Melhorar `src/app/(dashboard)/financeiro/page.tsx`
  - [ ] 4 métricas principais (Arrecadado, Pendente, Despesas, Saldo)
  - [ ] Tendências (↑↓)
  - [ ] Seção "Pagamentos por Treino"
  - [ ] Cards de treino com:
    - Total esperado vs recebido
    - Lista de pendentes
    - Botão "Cobrar" individual
    - Badge "100% PAGO"
  - [ ] Histórico de transações

#### Componentes
- [ ] **4.2** Criar `src/components/financial/payment-by-training-card.tsx`
- [ ] **4.3** Criar `src/components/financial/pending-payers-list.tsx`
- [ ] **4.4** Criar `src/components/financial/transaction-history.tsx`

---

## 🟡 PRIORIDADE MÉDIA

### 5. Componentes de UI

#### Loading States
- [ ] **5.1** Criar `src/components/ui/loading-skeleton.tsx`
  - [ ] Skeleton para cards
  - [ ] Skeleton para tabelas
  - [ ] Skeleton para listas
  - [ ] Animação de shimmer

#### Empty States
- [ ] **5.2** Criar `src/components/ui/empty-state.tsx`
  - [ ] Ícone grande
  - [ ] Título e descrição
  - [ ] Ação sugerida (botão)
  - [ ] Variantes (sem dados, erro, busca vazia)

#### Notificações
- [ ] **5.3** Criar `src/components/notifications/notification-dropdown.tsx`
  - [ ] Lista de notificações
  - [ ] Badge contador
  - [ ] Marcar como lida
  - [ ] Integração com Topbar

#### Busca
- [ ] **5.4** Criar `src/components/ui/search-bar.tsx`
  - [ ] Input com ícone
  - [ ] Sugestões (opcional)
  - [ ] Integração com Topbar

---

### 6. Páginas Adicionais

#### Frequência
- [ ] **6.1** Criar `src/app/(dashboard)/frequencia/page.tsx`
  - [ ] 4 métricas
  - [ ] Ranking Top 10
  - [ ] Sistema de check-in QR Code
  - [ ] Check-in manual
  - [ ] Lista de check-ins

#### Rankings
- [ ] **6.2** Criar `src/app/(dashboard)/rankings/page.tsx`
  - [ ] Top 5 Artilheiros
  - [ ] Top 5 Assistências
  - [ ] Top 5 MVP
  - [ ] Tabela completa
  - [ ] Filtro por modalidade

#### Jogos
- [ ] **6.3** Criar `src/app/(dashboard)/jogos/page.tsx`
  - [ ] 4 métricas
  - [ ] Cards de jogos
  - [ ] Convocações
  - [ ] Calendário de competições

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
- [ ] **7.3** Aplicar Design System UzzAI
  - [ ] Cores consistentes
  - [ ] Tipografia padronizada
  - [ ] Espaçamentos consistentes
  - [ ] Gradientes aplicados

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
| Página Treinos | 2 | 0 | 0% |
| Página Financeiro | 4 | 0 | 0% |
| Componentes UI | 4 | 0 | 0% |
| Páginas Adicionais | 3 | 0 | 0% |
| Melhorias Visuais | 3 | 0 | 0% |
| Features Avançadas | 3 | 0 | 0% |
| **TOTAL** | **28** | **0** | **0%** |

---

## 🎯 PRÓXIMOS PASSOS

1. **Revisar este checklist** com a equipe
2. **Priorizar tarefas** baseado em impacto
3. **Criar issues** no GitHub (se aplicável)
4. **Iniciar implementação** pela Prioridade Alta
5. **Validar** com referência visual constantemente

---

**Última atualização:** 2026-01-24  
**Status:** 🟡 Aguardando início

