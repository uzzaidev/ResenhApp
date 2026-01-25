# 🚀 ROADMAP MVP REORGANIZADO - Peladeiros V2

> **Foco:** Entregar valor MÁXIMO para Atleta, Gestor e Atlética em 4-6 semanas
> **Última atualização:** 2026-01-25

---

## 🎯 FILOSOFIA DO NOVO ROADMAP

### Problema do Plano Anterior
- ❌ 18 semanas para ter funcionalidade básica
- ❌ Features "nice-to-have" antes de features críticas
- ❌ Dashboard completo só na semana 17
- ❌ Financeiro vinculado a treino só na semana 7

### Novo Princípio: MVP em Camadas
✅ **Semana 1-2:** Loop principal funcionando (RSVP → Cobrança → Pagamento)
✅ **Semana 3-4:** Refinamentos e UX crítica
✅ **Semana 5-6:** Features que escalam (recorrência, multi-grupo)
✅ **Pós-MVP:** Inovação (QR Code, táticas, rankings avançados)

---

## 📋 MVP CORE (Semanas 1-6)

### 🔥 SPRINT 1: Loop Principal (Semana 1-2)
**Objetivo:** Atleta consegue confirmar presença e pagar em menos de 1 minuto

#### 1.1 GroupContext & Fundação (3 dias)
**Por quê:** Sem isso, multi-grupo não funciona

**Entregáveis:**
- [ ] `GroupContext` e `GroupProvider` criados
- [ ] Header com seletor de grupo (dropdown)
- [ ] Todas as páginas consomem groupId do contexto
- [ ] localStorage para lembrar grupo selecionado
- [ ] Remover busca manual de groupId em cada página

**Arquivos:**
```
src/contexts/GroupContext.tsx
src/components/layout/group-selector.tsx
```

**Teste de Aceitação:**
✅ Usuário com 2+ grupos consegue alternar sem reload
✅ groupId aparece no URL ou context, não em query manual

---

#### 1.2 RSVP Conectado (2 dias)
**Por quê:** "4 passos vs 7 passos" define se app é usado

**Entregáveis:**
- [ ] Conectar botão "Confirmar Presença" ao endpoint
- [ ] `POST /api/events/{id}/rsvp` funcionando
- [ ] Toast de feedback ("Presença confirmada!")
- [ ] `router.refresh()` atualiza lista sem reload
- [ ] Mostrar status do usuário no card ("✓ Confirmado" / "⏳ Pendente")

**Arquivos:**
```
src/components/dashboard/upcoming-trainings.tsx (modificar)
src/app/api/events/[eventId]/rsvp/route.ts (já existe, testar)
```

**Teste de Aceitação:**
✅ Clicar "Confirmar" atualiza card em <2s
✅ Badge muda de "Pendente" para "Confirmado"
✅ Não precisa navegar para outra página

---

#### 1.3 Auto-Geração de Cobrança (3 dias)
**Por quê:** Resolve o caos operacional "confirmou mas não pagou"

**Entregáveis:**
- [ ] Migration: adicionar `receiver_profiles` table
- [ ] Migration: adicionar `events.price` e `events.receiver_profile_id`
- [ ] Backend: ao RSVP=yes, criar `charge` vinculada
- [ ] API retorna: `{ rsvp_status, charge: {...} }`
- [ ] Frontend mostra após RSVP: "Cobrança de R$ 20 gerada"

**SQL Migration:**
```sql
-- receiver_profiles.sql
CREATE TABLE receiver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('institution', 'user')),
  entity_id UUID NOT NULL,
  pix_key TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- events_pricing.sql
ALTER TABLE events
  ADD COLUMN price DECIMAL(10,2),
  ADD COLUMN receiver_profile_id UUID REFERENCES receiver_profiles(id);

-- charges_link.sql
ALTER TABLE charges
  ADD COLUMN receiver_profile_id UUID REFERENCES receiver_profiles(id),
  ADD COLUMN pix_payload TEXT,
  ADD COLUMN qr_image_url TEXT;
```

**Arquivos:**
```
src/app/api/events/[eventId]/rsvp/route.ts (modificar)
migrations/010_receiver_profiles.sql
migrations/011_events_pricing.sql
migrations/012_charges_pix.sql
```

**Teste de Aceitação:**
✅ RSVP=yes em treino com preço → cria charge no mesmo request
✅ charge.event_id aponta para o treino correto
✅ charge.receiver_profile_id define quem recebe

---

#### 1.4 Pix QR Code (2 dias)
**Por quê:** Atleta precisa pagar fácil

**Entregáveis:**
- [ ] Função gerar Pix estático (sem PSP no MVP)
- [ ] `pix_payload` salvo em charges
- [ ] Tela de cobrança mostra QR Code + copia-e-cola
- [ ] Botão "Marcar como Pago" (manual no MVP)

**Bibliotecas:**
```bash
npm install qrcode
npm install @types/qrcode -D
```

**Arquivos:**
```
src/lib/pix.ts
src/app/(dashboard)/financeiro/[chargeId]/page.tsx (nova)
src/components/financeiro/pix-qr-display.tsx
```

**Teste de Aceitação:**
✅ Abrir cobrança mostra QR + copia-e-cola
✅ Gestor consegue marcar como pago
✅ Status muda de "Pendente" para "Pago"

---

### 🎨 SPRINT 2: UX Crítica (Semana 3-4)

#### 2.1 Dashboard como Central de Ações (3 dias)
**Por quê:** Usuário resolve o dia em 1 tela

**Entregáveis:**
- [ ] Hero melhorado (saudação + próximo treino + créditos)
- [ ] 4 métricas principais com trends reais
- [ ] Quick Actions: "Novo Treino", "Cobrar Atletas"
- [ ] UpcomingTrainings com RSVP funcionando (já feito Sprint 1)
- [ ] PendingPaymentsCard expandido (top 5 devedores)

**Arquivos:**
```
src/components/dashboard/hero-section.tsx (melhorar)
src/components/dashboard/quick-actions.tsx (novo)
src/components/dashboard/pending-payments-card.tsx (expandir)
```

**Teste de Aceitação:**
✅ Gestor abre app → vê pendências + confirma RSVP sem sair do dashboard
✅ Atleta vê seus treinos + suas dívidas em 1 tela

---

#### 2.2 Criar Treino com Preço (2 dias)
**Por quê:** Gestor precisa definir cobrança ao criar

**Entregáveis:**
- [ ] Form criar evento: campos `price` e `receiver_profile_id`
- [ ] Dropdown "Quem recebe?": Admin do Grupo / Instituição
- [ ] Preview: "Cada atleta pagará R$ X"
- [ ] Validação: preço >= 0

**Arquivos:**
```
src/app/(dashboard)/groups/[groupId]/events/new/page.tsx (modificar)
src/components/events/event-form.tsx (adicionar campos)
```

**Teste de Aceitação:**
✅ Criar treino com R$ 20 → atletas que confirmarem recebem charge de R$ 20
✅ Treino sem preço → sem cobrança gerada

---

#### 2.3 Tela Financeiro Completa (3 dias)
**Por quê:** Gestor/Atlética precisa visão clara

**Entregáveis:**
- [ ] Métricas: Arrecadado / Pendente / Taxa de Pagamento
- [ ] Seção "Pagamentos por Treino" expandida
- [ ] Filtros: Pendentes / Pagos / Por Treino
- [ ] Exportar CSV (básico)

**Arquivos:**
```
src/app/(dashboard)/financeiro/page.tsx (já existe, melhorar)
src/components/financeiro/payments-by-training.tsx
src/components/financeiro/export-csv.tsx
```

**Teste de Aceitação:**
✅ Gestor vê "Treino 22/01 - R$ 200 arrecadado / R$ 80 pendente"
✅ Clicar no treino mostra quem pagou e quem deve

---

#### 2.4 Notificações Reais (2 dias)
**Por quê:** Atleta precisa saber quando deve

**Entregáveis:**
- [ ] Notificação: "Você tem 1 cobrança pendente - Treino 22/01"
- [ ] Badge no ícone de notificações (número)
- [ ] Clicar leva para /financeiro

**Arquivos:**
```
src/components/notifications/notifications-dropdown.tsx (modificar)
src/lib/notifications.ts
```

**Teste de Aceitação:**
✅ Atleta com dívida vê notificação ao logar
✅ Badge mostra número correto de pendências

---

### 🔧 SPRINT 3: Refinamentos (Semana 5-6)

#### 3.1 Treinos Recorrentes (4 dias)
**Por quê:** Gestor não quer criar "Futebol Terça" toda semana

**Entregáveis:**
- [ ] Form: "Recorrência: Semanal / Quinzenal"
- [ ] Job agendado: gerar eventos futuros (próximas 4 semanas)
- [ ] Badge "RECORRENTE" nos cards

**Arquivos:**
```
src/app/api/recurring-trainings/route.ts (já existe, testar)
src/jobs/generate-recurring-events.ts (criar)
```

**Teste de Aceitação:**
✅ Criar "Futebol toda Terça 19h" → gera 4 eventos automaticamente
✅ Editar recorrência atualiza próximos eventos

---

#### 3.2 Modalidades Básicas (3 dias)
**Por quê:** Atlética gerencia Futebol, Vôlei, Basquete

**Entregáveis:**
- [ ] CRUD modalidades (já tem API, criar UI)
- [ ] Página /modalidades com grid de cards
- [ ] Filtrar treinos/atletas por modalidade

**Arquivos:**
```
src/app/(dashboard)/modalidades/page.tsx (já existe, conectar)
src/components/modalidades/modality-card.tsx
```

**Teste de Aceitação:**
✅ Criar modalidade "Vôlei" com cor azul
✅ Filtrar treinos: "Mostrar só Vôlei"

---

#### 3.3 Instituições (Multi-Org) - Fundação (3 dias)
**Por quê:** Preparar para Atlética gerenciar múltiplos grupos

**Entregáveis:**
- [ ] Migration: `institutions` table
- [ ] `groups.institution_id` (nullable no MVP)
- [ ] Permissão: `org_admin` enxerga todos os grupos
- [ ] UI: Switch "Meu Grupo" / "Visão Instituição"

**SQL Migration:**
```sql
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  default_receiver_profile_id UUID REFERENCES receiver_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE groups
  ADD COLUMN institution_id UUID REFERENCES institutions(id);

CREATE TABLE institution_memberships (
  user_id UUID REFERENCES users(id),
  institution_id UUID REFERENCES institutions(id),
  role TEXT NOT NULL CHECK (role IN ('org_admin', 'org_finance', 'org_viewer')),
  PRIMARY KEY (user_id, institution_id)
);
```

**Teste de Aceitação:**
✅ Admin da Atlética vê dashboard consolidado de 3 grupos
✅ Atleta normal só vê seu grupo

---

## 📊 COMPARAÇÃO: Plano Antigo vs Novo

| Feature | Plano Antigo | Novo MVP | Ganho |
|---------|--------------|----------|-------|
| **RSVP Conectado** | Semana 5-6 | Semana 1 | -4 semanas |
| **Auto-Cobrança** | Semana 7-8 | Semana 1-2 | -6 semanas |
| **Pix QR Code** | Não previsto | Semana 1-2 | ∞ |
| **Dashboard Real** | Semana 17-18 | Semana 3-4 | -14 semanas |
| **GroupContext** | Não previsto | Semana 1 | ∞ |
| **Multi-Org** | Não previsto | Semana 5-6 | ∞ |

**Resultado:** MVP funcional em **6 semanas** vs **18 semanas** (redução de 66%)

---

## 🚫 O QUE FICA PÓS-MVP (Semanas 7+)

Essas features são importantes, mas não críticas:

### Fase 4: Inovação (Semanas 7-10)
- QR Code Check-in (Frequência)
- Jogos Oficiais + Convocações
- Rankings Melhorados por Modalidade
- Tabelinha Tática

### Fase 5: Escala (Semanas 11-14)
- Integração PSP (webhook Pix automático)
- Analytics avançado (gráficos Recharts)
- Conciliação bancária
- Relatórios exportáveis

### Fase 6: Otimização (Semanas 15-18)
- Performance (React Query, virtualization)
- Offline-first (PWA)
- Notificações push
- Gamificação

---

## ✅ CRITÉRIOS DE SUCESSO DO MVP

### Atleta:
✅ Confirma presença em <10 segundos
✅ Vê cobrança gerada automaticamente
✅ Paga com QR Code em <30 segundos
✅ Acompanha frequência própria

### Gestor:
✅ Cria treino com preço em <2 minutos
✅ Vê quem confirmou em tempo real
✅ Cobra automaticamente quem confirmou
✅ Marca pagamentos como recebidos

### Atlética:
✅ Alterna entre múltiplos grupos
✅ Dashboard consolidado funciona
✅ Exporta relatório financeiro
✅ Define recebedor por treino

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

**Esta Semana (Sprint 1 - Dias 1-3):**
1. ✅ Criar `GroupContext` + `GroupProvider`
2. ✅ Header com seletor de grupo
3. ✅ Conectar botão RSVP ao endpoint
4. ✅ Toast + router.refresh()

**Esta Semana (Sprint 1 - Dias 4-7):**
5. ✅ Migrations: receiver_profiles, events.price
6. ✅ Backend: RSVP → auto-criar charge
7. ✅ Frontend: gerar Pix QR Code
8. ✅ Tela de cobrança funcional

**Próxima Semana (Sprint 1 - Dias 8-10):**
9. ✅ Dashboard como Central de Ações
10. ✅ Form criar treino com preço
11. ✅ Tela financeiro completa

---

**Este roadmap prioriza VALOR ao usuário sobre complexidade técnica.**
**Cada sprint entrega algo USÁVEL, não apenas "progresso".**

**Criado em:** 2026-01-25
**Baseado em:** Feedback externo + análise de 8 fases originais + necessidades reais dos 3 perfis
