# 📚 ÍNDICE DE DOCUMENTAÇÃO - PELADEIROS V2.0

**Central de Planejamento Arquitetural**
**Data de Criação:** 2026-01-21
**Versão:** 1.0

---

## 🎯 COMEÇE AQUI

Este diretório contém todo o planejamento arquitetural para a **Versão 2.0** do Peladeiros (ResenhApp).

**Se você é:**

- **👔 Stakeholder/Product Owner** → Leia o [Sumário Executivo](#sumário-executivo)
- **💻 Desenvolvedor** → Leia a [Arquitetura Completa](#arquitetura-completa) + [Decisões Técnicas](#decisões-técnicas)
- **🎨 Designer** → Veja a seção de [Design System](#design-system)
- **📊 Analista de Negócio** → Veja o [Dashboard do Projeto](#dashboard-do-projeto)

---

## 📄 DOCUMENTOS PRINCIPAIS

### 1️⃣ Sumário Executivo

**Arquivo:** `SUMARIO-EXECUTIVO-V2.md`

**Para quem:** Stakeholders, Product Owner, Comercial

**Conteúdo:**
- Visão geral do projeto (1 página)
- Modelo de negócio e projeções
- Roadmap visual (14-16 semanas)
- Métricas de sucesso
- Riscos e mitigações
- Próximos passos imediatos

**Tempo de leitura:** 10 minutos

🔗 [Abrir Sumário Executivo](./SUMARIO-EXECUTIVO-V2.md)

---

### 2️⃣ Arquitetura Completa

**Arquivo:** `ARQUITETURA-COMPLETA-SISTEMA-V2.md`

**Para quem:** Tech Lead, Desenvolvedores, Arquitetos

**Conteúdo:**
- Análise da situação atual (MVP)
- Gap analysis (funcionalidades faltantes)
- Arquitetura de dados (tabelas, migrations)
- Arquitetura de frontend (componentes, rotas)
- Arquitetura de backend (API routes)
- Design System UzzAI (cores, fonts, componentes)
- Roadmap detalhado por sprints (8 sprints)
- Decisões técnicas fundamentais

**Tempo de leitura:** 30-40 minutos

🔗 [Abrir Arquitetura Completa](./ARQUITETURA-COMPLETA-SISTEMA-V2.md)

---

### 3️⃣ Decisões Técnicas

**Arquivo:** `DECISOES-TECNICAS-V2.md`

**Para quem:** Tech Lead, Desenvolvedores

**Conteúdo:**
- Comparação de tecnologias (bibliotecas de gráficos, Pix, push notifications)
- Decisões de stack confirmadas
- Padrões de código (componentes, API routes)
- Performance e otimização
- Segurança (validação, SQL injection, rate limiting)
- DevOps e deploy
- Estratégia de testes
- Monitoramento e logging

**Tempo de leitura:** 25-30 minutos

🔗 [Abrir Decisões Técnicas](./DECISOES-TECNICAS-V2.md)

---

### 4️⃣ Dashboard do Projeto

**Arquivo:** `PELADEIROS-PROJECT-DASHBOARD.md`

**Para quem:** Product Owner, Stakeholders

**Conteúdo:**
- Status executivo atualizado
- Timeline de rebranding e lançamento
- Features implementadas vs. pendentes
- Matriz de riscos
- Insights de pesquisa de mercado
- Estatísticas do rebranding
- Roadmap geral

**Tempo de leitura:** 15-20 minutos

🔗 [Abrir Dashboard do Projeto](./PELADEIROS-PROJECT-DASHBOARD.md)

---

### 5️⃣ Arquitetura de Banco de Dados (Supabase)

**Arquivo:** `DATABASE-ARCHITECTURE-SUPABASE-V2.md`

**Para quem:** Tech Lead, Desenvolvedores, DBAs

**Conteúdo:**
- Migração de Neon para Supabase
- Sistema de tipos de usuários (player, organizer, admin, super_admin)
- Gerenciamento multi-grupos
- 40+ tabelas completas com RLS
- Triggers, functions, e materialized views
- Supabase Storage, Realtime, Edge Functions
- Estratégia de migrations

**Tempo de leitura:** 45-60 minutos

🔗 [Abrir Arquitetura de Banco de Dados](./DATABASE-ARCHITECTURE-SUPABASE-V2.md)

**Migrations SQL:**
- 📁 [Pasta de Migrations](./supabase/migrations/)
- 📖 [Guia de Migrations](./supabase/migrations/README.md)
- 8 arquivos de migration prontos para deploy
- Seed data incluído

**Migrations Disponíveis:**
1. `20260127000001_initial_schema.sql` - Extensions + Enums
2. `20260127000002_auth_profiles.sql` - Auth & User Types
3. `20260127000003_groups_and_events.sql` - Core System
4. `20260127000004_rls_policies.sql` - Row Level Security
5. `20260204000001_financial_system.sql` - Financeiro + Pix
6. `20260211000001_notifications.sql` - Notificações
7. `20260218000001_analytics.sql` - Analytics + Stats
8. `20260225000001_gamification.sql` - Gamificação

---

## 🎨 DESIGN SYSTEM

### Referências Visuais (HTML Demos)

Protótipos HTML completos com a identidade visual UzzAI aplicada:

1. **`ATLETICAS-SISTEMA-COMPLETO-V1.html`**
   - Sistema multi-modalidades (visão futura)
   - Sidebar hierárquica
   - Dashboard principal com métricas
   - Cards de modalidades esportivas
   - Lista de treinos

2. **`PELADEIROS-LANDING-PAGE-COMPLETE (1).html`**
   - Landing page profissional
   - Hero section com mockup
   - Seção de problemas
   - Features destacadas
   - Pricing
   - Waitlist

3. **`DASHBOARD-PRINCIPAL-UZZAI-DEMO.html`**
   - Dashboard principal do app
   - Métricas e gráficos
   - Quick actions
   - Rankings

4. **`MEUS-GRUPOS-UZZAI-DEMO.html`**
   - Página de listagem de grupos
   - Cards de grupos
   - Filtros e busca

5. **`RANKINGS-UZZAI-DEMO.html`**
   - Página de rankings
   - Tabelas estilizadas
   - Badges e conquistas

6. **`PLANILHAS-TREINO-UZZAI-DEMO.html`**
   - Feature de planilhas táticas
   - Campo de futsal interativo
   - Drag & drop de jogadores

**Como usar:**
1. Abrir os arquivos .html no navegador
2. Inspecionar componentes e estilos
3. Usar como referência para implementação React

---

## 🗂️ ESTRUTURA DE ARQUIVOS

```
peladeiros-main/
│
├── 📘 PLANEJAMENTO-V2-INDEX.md           # ← VOCÊ ESTÁ AQUI
├── 📄 SUMARIO-EXECUTIVO-V2.md            # Apresentação stakeholders
├── 📄 ARQUITETURA-COMPLETA-SISTEMA-V2.md # Documentação técnica completa
├── 📄 DECISOES-TECNICAS-V2.md            # Decisões de stack e padrões
├── 📊 PELADEIROS-PROJECT-DASHBOARD.md    # Status do projeto
│
├── 🎨 HTML Demos/
│   ├── ATLETICAS-SISTEMA-COMPLETO-V1.html
│   ├── PELADEIROS-LANDING-PAGE-COMPLETE (1).html
│   ├── DASHBOARD-PRINCIPAL-UZZAI-DEMO.html
│   ├── MEUS-GRUPOS-UZZAI-DEMO.html
│   ├── RANKINGS-UZZAI-DEMO.html
│   └── PLANILHAS-TREINO-UZZAI-DEMO.html
│
├── 🗄️ supabase/                          # Supabase (NOVO - V2.0)
│   ├── migrations/
│   │   ├── 20260127000001_initial_schema.sql
│   │   ├── 20260127000002_auth_profiles.sql
│   │   ├── 20260127000003_groups_and_events.sql
│   │   ├── 20260127000004_rls_policies.sql
│   │   ├── 20260204000001_financial_system.sql
│   │   ├── 20260211000001_notifications.sql
│   │   ├── 20260218000001_analytics.sql
│   │   ├── 20260225000001_gamification.sql
│   │   └── README.md                  # Guia de migrations
│   └── seed.sql                        # Dados iniciais
│
├── 📚 docs/                              # Documentação existente (MVP)
│   ├── 01-getting-started/
│   ├── 02-architecture/
│   ├── 03-api/
│   ├── 04-database/
│   ├── 05-authentication/
│   └── ...
│
├── 🛠️ src/                               # Código-fonte atual
│   ├── app/
│   ├── components/
│   ├── db/
│   └── lib/
│
└── 📖 README.md                          # Setup básico do projeto
```

---

## 📋 CHECKLIST DE APROVAÇÃO

### ✅ Decisões Necessárias

Antes de iniciar a implementação, precisamos de aprovação sobre:

- [ ] **Roadmap geral aprovado** (8 sprints, 14-16 semanas)
- [ ] **Pricing definido** (R$ 30, 40 ou 50/mês?)
- [ ] **Investimento WhatsApp** (sim ou postergar?)
- [ ] **Stack técnica aprovada** (Recharts, Firebase, qrcode-pix)
- [ ] **Pilotos identificados** (2-3 grupos iniciais)

### 🎯 Próximos Passos Imediatos

- [ ] Agendar reunião de aprovação (30min)
- [ ] Criar branch `v2-development`
- [ ] Setup Firebase (push notifications)
- [ ] Instalar dependências novas (Recharts, qrcode-pix)
- [ ] Iniciar Sprint 1 (Sidebar + Topbar + Dashboard)

---

## 🔗 LINKS ÚTEIS

### Documentação Externa

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Recharts Documentation](https://recharts.org/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [**Supabase Docs**](https://supabase.com/docs) **← NOVO**
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [qrcode-pix npm](https://www.npmjs.com/package/qrcode-pix)

### Repositório

- **GitHub:** `uzzai/peladeiros-web` (renomear para `uzzai/resenha-fc`)
- **Vercel:** [Link do projeto]
- **Neon Database:** [Link do dashboard]

---

## 📞 CONTATOS

### Equipe

| Papel | Nome | Responsabilidade |
|-------|------|------------------|
| **Product Owner** | Pedro Vitor Pagliarin | Visão do produto, priorização |
| **Tech Lead** | Luis Fernando Boff | Arquitetura técnica, código |
| **Comercial** | Vitor Reis Pirolli | Validação pilotos, pricing |
| **Branding** | Arthur Brandalise | Identidade visual, UX/UI |

---

## 📅 CRONOGRAMA RESUMIDO

```
📆 JAN 2026
├── 22-26 Jan: Aprovação do plano
└── 27-31 Jan: Sprint 1 (UI/UX Core - Parte 1)

📆 FEV 2026
├── 03-07 Fev: Sprint 1 (UI/UX Core - Parte 2)
├── 10-14 Fev: Sprint 2 (Notificações - Parte 1)
├── 17-21 Fev: Sprint 2 (Notificações - Parte 2)
└── 24-28 Fev: Sprint 3 (Analytics - Parte 1)
    └── 🎯 INÍCIO TESTES COM PILOTOS

📆 MAR 2026
├── 03-07 Mar: Sprint 3 (Analytics - Parte 2)
├── 10-14 Mar: Sprint 4 (Split Pix - Parte 1)
├── 17-21 Mar: Sprint 4 (Split Pix - Parte 2)
└── 24-28 Mar: Sprint 4 (Split Pix - Parte 3)
    └── 🎯 SPLIT PIX FUNCIONAL

📆 ABR 2026
├── 31 Mar-04 Abr: Sprint 5 (Planilhas - Parte 1)
├── 07-11 Abr: Sprint 5 (Planilhas - Parte 2)
├── 14-18 Abr: Sprint 6 (Sorteio IA - Parte 1)
└── 21-25 Abr: Sprint 6 (Sorteio IA - Parte 2)
    └── 🎯 ANALYTICS COMPLETO

📆 MAI 2026
├── 28 Abr-02 Mai: Sprint 7 (Conquistas - Parte 1)
├── 05-09 Mai: Sprint 7 (Conquistas - Parte 2)
├── 12-16 Mai: Sprint 8 (WhatsApp - Opcional)
└── 19-23 Mai: Sprint 8 (Polimento Final)
    └── 🎯 BETA PÚBLICO (SOFT LAUNCH)
```

**Marcos Importantes:**
- ✅ **24 Fev:** Início testes com pilotos
- ✅ **24 Mar:** Split Pix funcional (feature killer)
- ✅ **21 Abr:** Analytics completo
- ✅ **19 Mai:** Beta público

---

## 🎓 COMO USAR ESTA DOCUMENTAÇÃO

### Para Desenvolvedores

1. **Leia primeiro:** `ARQUITETURA-COMPLETA-SISTEMA-V2.md` (seções 1-6)
2. **Consulte sempre:** `DECISOES-TECNICAS-V2.md` (para padrões de código)
3. **Use como referência:** HTML demos (para componentes visuais)
4. **Atualize conforme avança:** `PELADEIROS-PROJECT-DASHBOARD.md`

### Para Product Owner

1. **Apresente:** `SUMARIO-EXECUTIVO-V2.md` (para stakeholders)
2. **Acompanhe:** `PELADEIROS-PROJECT-DASHBOARD.md` (status semanal)
3. **Revise:** `ARQUITETURA-COMPLETA-SISTEMA-V2.md` (seção 8 - Roadmap)

### Para Designers

1. **Analise:** HTML demos (todos os arquivos .html)
2. **Consulte:** `ARQUITETURA-COMPLETA-SISTEMA-V2.md` (seção 7 - Design System)
3. **Crie assets baseado em:** Cores e tipografia UzzAI definidas

---

## 🔄 HISTÓRICO DE VERSÕES

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0 | 2026-01-21 | Claude Code | Criação inicial de toda documentação V2.0 |

---

## 📝 NOTAS FINAIS

### Status Atual

✅ **Documentação completa criada**
- Arquitetura técnica definida
- Roadmap de 8 sprints planejado
- Stack tecnológica decidida
- Decisões pendentes mapeadas

⏳ **Aguardando aprovação**
- Reunião de stakeholders
- Definição de pricing
- Aprovação de investimento WhatsApp
- Confirmação de pilotos

### O que foi entregue

📄 **4 documentos principais:**
1. Sumário Executivo (apresentação)
2. Arquitetura Completa (técnico)
3. Decisões Técnicas (padrões)
4. Este índice (navegação)

🎨 **6 HTML demos analisados:**
- Referências visuais completas
- Componentes UzzAI aplicados
- Exemplos de UX/UI

📊 **Planejamento completo:**
- 8 sprints detalhados
- 14-16 semanas mapeadas
- Riscos identificados
- Métricas definidas

---

**🎯 Próximo passo:** Agendar reunião de aprovação e iniciar Sprint 1

---

**Criado por:** Claude Code (Anthropic) em colaboração com Pedro Vitor Pagliarin
**Data:** 2026-01-21
**Versão:** 1.0
**Status:** ✅ Completo - Aguardando Aprovação
