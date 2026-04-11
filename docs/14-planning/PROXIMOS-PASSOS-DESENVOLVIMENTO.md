# 🚀 Próximos Passos - Desenvolvimento de Features

> **Objetivo:** Plano detalhado para desenvolvimento de novas features no ResenhApp  
> **Data:** 2026-01-27  
> **Status:** 📋 Planejamento

---

## 🎯 Visão Geral

Este documento define os próximos passos para desenvolvimento de features no ResenhApp, organizando o trabalho em sprints focados e priorizados.

---

## 📊 Situação Atual

### ✅ O que já temos (MVP Funcional)

- ✅ **Autenticação** - Signup, login, sessão
- ✅ **Grupos** - Criação, gestão, membros
- ✅ **Eventos** - Criação, confirmação (RSVP), sorteio básico
- ✅ **Rankings** - Sistema básico de pontuação
- ✅ **Financeiro** - Estrutura básica (wallets, charges)
- ✅ **Database** - Schema V1.0 (17 tabelas) funcional

### ⏸️ O que está planejado (V2.0)

- ⏸️ **Migrations V2.0** - 40+ tabelas (não aplicadas)
- ⏸️ **RLS (Row Level Security)** - Segurança avançada
- ⏸️ **Notificações** - Push, email, in-app
- ⏸️ **Analytics** - Stats, leaderboards, dashboards
- ⏸️ **Gamificação** - Achievements, badges, challenges
- ⏸️ **Financeiro Avançado** - PIX automático, splits

---

## 🎯 Prioridades de Desenvolvimento

### 🔴 PRIORIDADE ALTA - Core Features

#### 1. Sistema de Notificações
**Status:** ⏸️ Planejado  
**Tempo Estimado:** 2-3 semanas

**O que desenvolver:**
- [ ] Backend: API de notificações
- [ ] Frontend: Componente de notificações
- [ ] Push notifications (FCM/Web Push)
- [ ] Email notifications (templates)
- [ ] In-app notifications (badge, lista)
- [ ] Preferências de notificação por usuário

**Database:**
- Migration V2.0: `20260211000001_notifications.sql`
- Tabelas: `notifications`, `notification_templates`, `push_tokens`, `email_queue`

**Arquivos a criar:**
```
src/app/api/notifications/
  ├── route.ts                    # GET, POST notifications
  ├── [id]/route.ts              # GET, PATCH, DELETE
  └── mark-read/route.ts         # Marcar como lida

src/components/notifications/
  ├── NotificationBell.tsx       # Badge + dropdown
  ├── NotificationList.tsx       # Lista de notificações
  └── NotificationItem.tsx       # Item individual

src/lib/notifications/
  ├── push.ts                    # Push notifications
  ├── email.ts                   # Email notifications
  └── in-app.ts                  # In-app notifications
```

**Checklist:**
- [ ] Aplicar migration de notificações
- [ ] Criar API endpoints
- [ ] Criar componentes UI
- [ ] Integrar FCM/Web Push
- [ ] Configurar templates de email
- [ ] Testar fluxo completo

---

#### 2. Analytics Dashboard
**Status:** ⏸️ Planejado  
**Tempo Estimado:** 2-3 semanas

**O que desenvolver:**
- [ ] Dashboard de estatísticas do grupo
- [ ] Gráficos de participação
- [ ] Estatísticas de jogadores
- [ ] Leaderboards visuais
- [ ] Histórico de eventos
- [ ] Export de dados

**Database:**
- Migration V2.0: `20260218000001_analytics.sql`
- Tabelas: `player_stats`, `event_stats`, `group_stats`, `leaderboards`, `activity_log`

**Arquivos a criar:**
```
src/app/dashboard/analytics/
  └── page.tsx                    # Página de analytics

src/components/analytics/
  ├── StatsCards.tsx             # Cards de estatísticas
  ├── ParticipationChart.tsx    # Gráfico de participação
  ├── PlayerStats.tsx            # Stats de jogadores
  ├── Leaderboard.tsx            # Leaderboard visual
  └── EventHistory.tsx           # Histórico de eventos

src/lib/analytics/
  ├── calculate-stats.ts         # Cálculo de estatísticas
  └── export-data.ts            # Export de dados
```

**Checklist:**
- [ ] Aplicar migration de analytics
- [ ] Criar queries de estatísticas
- [ ] Criar componentes de gráficos
- [ ] Integrar com dashboard
- [ ] Adicionar export de dados
- [ ] Testar performance

---

#### 3. Sorteio Inteligente de Times
**Status:** ⚠️ Parcial (sorteio básico existe)  
**Tempo Estimado:** 1-2 semanas

**O que desenvolver:**
- [ ] Algoritmo de balanceamento por rating
- [ ] Considerar posições preferidas
- [ ] Balanceamento de goleiros
- [ ] Preview antes de confirmar
- [ ] Opção de ajuste manual
- [ ] Histórico de sorteios

**Melhorias:**
- [ ] Algoritmo mais inteligente (IA/ML opcional)
- [ ] Balanceamento por histórico de vitórias
- [ ] Considerar química entre jogadores

**Arquivos a modificar/criar:**
```
src/app/api/events/[eventId]/draw/
  └── route.ts                    # Melhorar algoritmo

src/lib/draw/
  ├── balance-teams.ts           # Algoritmo de balanceamento
  ├── calculate-ratings.ts       # Cálculo de ratings
  └── optimize-lineup.ts         # Otimização de escalação

src/components/events/
  ├── DrawPreview.tsx            # Preview do sorteio
  └── DrawControls.tsx           # Controles de sorteio
```

**Checklist:**
- [ ] Melhorar algoritmo de balanceamento
- [ ] Adicionar preview
- [ ] Permitir ajustes manuais
- [ ] Testar com diferentes cenários
- [ ] Documentar algoritmo

---

### 🟡 PRIORIDADE MÉDIA - Features Premium

#### 4. Split Pix Automático
**Status:** ⏸️ Planejado  
**Tempo Estimado:** 3-4 semanas

**O que desenvolver:**
- [ ] Geração de QR Code PIX
- [ ] Divisão automática de valores
- [ ] Tracking de pagamentos
- [ ] Notificações de pagamento
- [ ] Dashboard financeiro
- [ ] Relatórios de pagamento

**Database:**
- Migration V2.0: `20260204000001_financial_system.sql`
- Tabelas: `pix_payments`, `group_pix_config`, `charge_splits`

**Arquivos a criar:**
```
src/app/api/payments/
  ├── pix/
  │   ├── generate-qr/route.ts   # Gerar QR Code
  │   ├── webhook/route.ts       # Webhook de pagamento
  │   └── status/route.ts        # Status do pagamento
  └── splits/
      └── route.ts               # Calcular splits

src/components/payments/
  ├── PixQRCode.tsx              # Componente QR Code
  ├── PaymentStatus.tsx          # Status de pagamento
  ├── PaymentDashboard.tsx       # Dashboard financeiro
  └── SplitCalculator.tsx        # Calculadora de splits

src/lib/payments/
  ├── pix.ts                     # Integração PIX
  ├── qr-code.ts                # Geração QR Code
  └── splits.ts                  # Cálculo de splits
```

**Checklist:**
- [ ] Aplicar migration financeira
- [ ] Integrar com gateway PIX
- [ ] Criar geração de QR Code
- [ ] Implementar webhook
- [ ] Criar dashboard financeiro
- [ ] Testar fluxo completo

---

#### 5. Gamificação (Achievements & Badges)
**Status:** ⏸️ Planejado  
**Tempo Estimado:** 2-3 semanas

**O que desenvolver:**
- [ ] Sistema de achievements
- [ ] Badges visuais
- [ ] Desbloqueio automático
- [ ] Perfil com conquistas
- [ ] Leaderboard de achievements
- [ ] Notificações de conquistas

**Database:**
- Migration V2.0: `20260225000001_gamification.sql`
- Tabelas: `achievement_types`, `user_achievements`, `badges`, `user_badges`, `milestones`, `challenges`

**Arquivos a criar:**
```
src/app/api/achievements/
  ├── route.ts                    # GET achievements
  └── unlock/route.ts            # Desbloquear achievement

src/components/gamification/
  ├── AchievementBadge.tsx        # Badge visual
  ├── AchievementList.tsx        # Lista de achievements
  ├── UserProfile.tsx            # Perfil com conquistas
  └── AchievementNotification.tsx # Notificação de conquista

src/lib/gamification/
  ├── check-achievements.ts      # Verificar achievements
  ├── unlock-achievement.ts     # Desbloquear achievement
  └── calculate-progress.ts      # Calcular progresso
```

**Checklist:**
- [ ] Aplicar migration de gamificação
- [ ] Criar sistema de achievements
- [ ] Criar badges visuais
- [ ] Implementar desbloqueio automático
- [ ] Adicionar ao perfil
- [ ] Testar sistema completo

---

### 🟢 PRIORIDADE BAIXA - Melhorias e Polish

#### 6. Row Level Security (RLS)
**Status:** ⏸️ Planejado  
**Tempo Estimado:** 1 semana

**O que desenvolver:**
- [ ] Aplicar migration RLS
- [ ] Testar políticas
- [ ] Documentar políticas
- [ ] Validar segurança

**Database:**
- Migration V2.0: `20260127000004_rls_policies.sql`

**Checklist:**
- [ ] Backup do database
- [ ] Aplicar migration RLS
- [ ] Testar todas as políticas
- [ ] Validar acesso de usuários
- [ ] Documentar políticas

---

#### 7. Melhorias de UX/UI
**Status:** ⚠️ Contínuo  
**Tempo Estimado:** Contínuo

**O que desenvolver:**
- [ ] Loading states melhorados
- [ ] Error handling consistente
- [ ] Animações e transições
- [ ] Responsividade mobile
- [ ] Acessibilidade (a11y)
- [ ] Dark mode (opcional)

**Arquivos a modificar:**
```
src/components/ui/
  ├── loading.tsx                # Loading states
  ├── error-boundary.tsx         # Error handling
  └── animations.tsx             # Animações

src/app/globals.css              # Estilos globais
```

---

## 📅 Roadmap de Sprints

### Sprint 1 (2 semanas) - Notificações
**Objetivo:** Sistema de notificações funcional

- Semana 1:
  - [ ] Aplicar migration de notificações
  - [ ] Criar API endpoints
  - [ ] Criar componentes básicos
  
- Semana 2:
  - [ ] Integrar push notifications
  - [ ] Configurar email templates
  - [ ] Testar e polir

**Entregável:** Sistema de notificações completo

---

### Sprint 2 (2 semanas) - Analytics
**Objetivo:** Dashboard de analytics funcional

- Semana 1:
  - [ ] Aplicar migration de analytics
  - [ ] Criar queries de estatísticas
  - [ ] Criar componentes de gráficos
  
- Semana 2:
  - [ ] Integrar com dashboard
  - [ ] Adicionar export de dados
  - [ ] Testar performance

**Entregável:** Dashboard de analytics completo

---

### Sprint 3 (1-2 semanas) - Sorteio Inteligente
**Objetivo:** Sorteio melhorado e inteligente

- Semana 1:
  - [ ] Melhorar algoritmo de balanceamento
  - [ ] Adicionar preview
  - [ ] Permitir ajustes manuais

**Entregável:** Sorteio inteligente funcional

---

### Sprint 4 (3-4 semanas) - Split Pix
**Objetivo:** Sistema de pagamento PIX automático

- Semana 1-2:
  - [ ] Aplicar migration financeira
  - [ ] Integrar com gateway PIX
  - [ ] Criar geração de QR Code
  
- Semana 3-4:
  - [ ] Implementar webhook
  - [ ] Criar dashboard financeiro
  - [ ] Testar fluxo completo

**Entregável:** Split Pix automático funcional

---

### Sprint 5 (2-3 semanas) - Gamificação
**Objetivo:** Sistema de achievements e badges

- Semana 1:
  - [ ] Aplicar migration de gamificação
  - [ ] Criar sistema de achievements
  - [ ] Criar badges visuais
  
- Semana 2-3:
  - [ ] Implementar desbloqueio automático
  - [ ] Adicionar ao perfil
  - [ ] Testar sistema completo

**Entregável:** Sistema de gamificação completo

---

## 🛠️ Setup para Desenvolvimento

### Pré-requisitos

1. **Database:**
   ```bash
   # Aplicar migrations V2.0 quando necessário
   # Ver: supabase/migrations/README.md
   ```

2. **Variáveis de Ambiente:**
   ```env
   # Notificações
   FCM_SERVER_KEY=...
   EMAIL_SERVICE_KEY=...
   
   # PIX
   PIX_API_KEY=...
   PIX_WEBHOOK_SECRET=...
   ```

3. **Dependências:**
   ```bash
   # Instalar dependências adicionais
   pnpm add firebase-admin          # Push notifications
   pnpm add @react-email/components # Email templates
   pnpm add recharts                # Gráficos
   pnpm add qrcode                  # QR Code PIX
   ```

---

## 📋 Checklist Geral

### Antes de Começar
- [ ] Revisar documentação existente
- [ ] Verificar migrations disponíveis
- [ ] Configurar ambiente de desenvolvimento
- [ ] Criar branch para feature

### Durante Desenvolvimento
- [ ] Seguir padrões de código existentes
- [ ] Escrever testes quando possível
- [ ] Documentar código complexo
- [ ] Commits descritivos

### Antes de Finalizar
- [ ] Testar funcionalidade completa
- [ ] Verificar responsividade
- [ ] Validar acessibilidade
- [ ] Revisar código
- [ ] Atualizar documentação

---

## 🔗 Documentação Relacionada

- [Arquitetura do Sistema](../02-architecture/SYSTEM_V2.md)
- [Database Supabase V2](../04-database/SUPABASE_V2.md)
- [Migrations V2.0](../../supabase/migrations/README.md)
- [API Docs](../03-api/API_DOCS.md)
- [Technical Decisions](../13-decisions/TECHNICAL_DECISIONS_V2.md)

---

## 📝 Notas Importantes

### Migrations V2.0
- ⚠️ **IMPORTANTE:** As migrations V2.0 ainda não foram aplicadas em produção
- Aplicar apenas quando necessário para a feature
- Sempre fazer backup antes de aplicar migrations
- Testar em ambiente de desenvolvimento primeiro

### Priorização
- Features de prioridade ALTA devem ser desenvolvidas primeiro
- Features de prioridade MÉDIA podem ser desenvolvidas em paralelo
- Features de prioridade BAIXA podem ser desenvolvidas quando houver tempo

### Testes
- Sempre testar features em ambiente de desenvolvimento
- Validar com usuários reais quando possível
- Monitorar performance após deploy

---

**Última atualização:** 2026-01-27  
**Próxima revisão:** Após cada sprint






