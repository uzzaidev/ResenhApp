# ResenhApp V2.0 — Análise de Delta: Atual vs. Visão Revisada
> O que existe hoje, o que precisa mudar, o que precisa ser criado
> Gerado em 2026-02-17 | Atualizado em 2026-02-17 com status de implementação real

---

## Status Geral de Implementação (2026-02-17)

| Área | Código | Banco (migration) | Testado |
|------|--------|------------------|---------|
| Hierarquia de grupos (group_type) | ✅ Implementado | ⏳ Pendente (`000010`) | ❌ |
| Créditos pessoais (user_wallets) | ✅ Implementado | ⏳ Pendente (`000011`) | ❌ |
| Earning rules + daily caps | ✅ Implementado | ⏳ Pendente (`000012`) | ❌ |
| PIX simplificado + self-report | ✅ Implementado | ⏳ Pendente (`000013`) | ❌ |
| Módulo social (posts/feed/reações) | ✅ Implementado | ⏳ Pendente (`000014`, `000016`) | ❌ |
| Onboarding + referral | 🔶 Parcial | ⏳ Pendente (`000015`) | ❌ |
| Gamificação (API) | 🔶 Parcial | ✅ Schema existente | ❌ |
| Compra de créditos (fluxo manual) | 🔶 Parcial | ⏳ Pendente (`000017`) | ❌ |
| Notificações integradas | ✅ Implementado | ✅ Schema existente | ❌ |
| Sidebar badge PENDENTE | ✅ Implementado | — | ❌ |

> **Próximo passo crítico**: Aplicar as 8 migrations pendentes e executar testes manuais dos 8 pontos listados no IMPLEMENTATION_ROADMAP.md

---

## Legenda de Status

| Símbolo | Significado |
|---------|-------------|
| ✅ | Já existe e está alinhado com a nova visão |
| ⚠️ | Existe mas precisa ser MODIFICADO |
| ❌ | NÃO existe — precisa ser CRIADO |
| 🗑️ | Existe mas será REMOVIDO/SUBSTITUÍDO |
| 🟢 | **IMPLEMENTADO** — código escrito, aguarda migration |

---

## 1. Arquitetura de Grupos (Hierarquia Multi-tenant)

### Estado Atual
```
groups
  ├── id
  ├── name
  ├── parent_group_id (NULL = atlética, NOT NULL = grupo filho)
  ├── modality_type
  └── max 2 níveis: Atlética → Pelada
```

A hierarquia atual implementa Atlética como "grupo pai" e Pelada como "grupo filho", mas **não há isolamento de tenant real**. Um grupo filho pode teoricamente ser acessado por qualquer usuário autenticado.

### O Que Precisa Mudar

| Item | Status | Mudança Necessária |
|------|--------|-------------------|
| Conceito de "tenant" para atlética | ⚠️ | Adicionar `is_tenant` ou `group_type ENUM` para distinguir atletica de grupo simples |
| Admin delegado externo | ❌ | Hoje o owner do grupo filho deve ser membro da atlética. Precisamos permitir owner externo |
| Grupo completamente independente (sem atlética) | ⚠️ | Funciona hoje (parent_group_id=NULL sem ser atlética), mas não há fluxo de criação |
| Isolamento de dados por tenant | ⚠️ | Queries filtram por group_id mas não por atlética-tenant |
| Credencial de criação de grupo | ⚠️ | Campo `can_create_groups` existe em profiles mas não usa créditos |

### Schema Delta — Tabela `groups`

```sql
-- ADICIONAR à tabela groups:
ALTER TABLE groups ADD COLUMN group_type TEXT
  CHECK (group_type IN ('atletica', 'modality_group', 'standalone'))
  DEFAULT 'standalone';

-- ADICIONAR: owner pode ser externo à atlética
-- (já é possível pela estrutura, só precisa de fluxo de convite)

-- ADICIONAR: créditos necessários para criar/manter
ALTER TABLE groups ADD COLUMN credits_required INTEGER DEFAULT 0;
ALTER TABLE groups ADD COLUMN credits_renewal_period TEXT
  CHECK (credits_renewal_period IN ('once', 'monthly', 'yearly'));
ALTER TABLE groups ADD COLUMN last_renewal_at TIMESTAMPTZ;
ALTER TABLE groups ADD COLUMN expires_at TIMESTAMPTZ;
```

---

## 2. Sistema de Pagamentos PIX

### Estado Atual

```
charges (tabela) → charge_splits → pix (endpoint)
receiver_profiles (chave PIX do admin)

Fluxo atual:
1. RSVP yes → auto_charge_on_rsvp → cria charge
2. /api/charges/[chargeId]/pix → gera QR Code BR Code EMV completo
3. Admin confirma manualmente pagamento
```

O sistema já tem a base certa (confirmação manual pelo admin), mas usa BR Code EMV dinâmico que é complexo e desnecessário.

### O Que Precisa Mudar

| Item | Status | Mudança Necessária |
|------|--------|-------------------|
| QR Code dinâmico BR Code EMV | 🗑️ | Substituir por exibição da chave PIX estática |
| `src/lib/pix.ts` (300 linhas de BR Code) | 🗑️ | Pode ser simplificado ou removido |
| `receiver_profiles` | ✅ | Mantido — armazena a chave PIX do admin |
| Confirmação manual pelo admin | ✅ | Alinhado com nova visão |
| Participante marca "eu paguei" | ⚠️ | Hoje não tem esse status explícito. Precisa de `self_reported_paid_at` |
| Admin nega pagamento | ⚠️ | Hoje só tem pending/paid/cancelled. Falta status `denied` |
| Exibição da chave PIX | ⚠️ | Hoje mostra QR Code. Mudar para: chave copiável + instruções |

### Schema Delta — Tabela `charges`

```sql
-- ADICIONAR status mais granular:
-- Atualmente: payment_status_type = 'pending' | 'paid' | 'cancelled' | 'refunded'
-- Adicionar: 'self_reported' (usuário disse que pagou, aguardando confirmação do admin)

ALTER TYPE payment_status_type ADD VALUE 'self_reported';
ALTER TYPE payment_status_type ADD VALUE 'denied';

-- ADICIONAR campos:
ALTER TABLE charges ADD COLUMN self_reported_at TIMESTAMPTZ;
ALTER TABLE charges ADD COLUMN admin_confirmed_at TIMESTAMPTZ;
ALTER TABLE charges ADD COLUMN admin_confirmed_by UUID REFERENCES users(id);
ALTER TABLE charges ADD COLUMN admin_denial_reason TEXT;
```

### Novo Fluxo de UI

```
/financeiro/[chargeId]
  ├── Para o participante:
  │   ├── Valor + instruções do admin
  │   ├── Chave PIX copiável (ex: joao@email.com)
  │   ├── Nome do destinatário
  │   ├── Botão "Marcar como pago" → status = self_reported
  │   └── Status atual (pendente / aguardando confirmação / confirmado / negado)
  │
  └── Para o admin:
      ├── Lista de cobranças por status
      ├── Quem está pendente / quem disse que pagou / quem foi confirmado
      ├── Botão "Confirmar pagamento" → status = paid
      └── Botão "Negar" + campo motivo → status = denied
```

---

## 3. Sistema de Créditos

### Estado Atual

```
group_wallets: créditos POR GRUPO (não por usuário)
credit_transactions: histórico de transações
credit_packages: pacotes para comprar
credits.ts: lógica de consumo (withCreditsCheck middleware)

Uso atual: apenas CONSUMO de créditos para features premium
Earning: NÃO EXISTE — créditos só entram via compra
```

### O Que Precisa Mudar

| Item | Status | Mudança Necessária |
|------|--------|-------------------|
| `group_wallets` (créditos por grupo) | ⚠️ | Migrar para `user_wallets` (créditos pessoais) |
| Earning de créditos por ações sociais | ❌ | Criar tabela `credit_earning_rules` e lógica de earning |
| Earning por RSVP/frequência/MVP | ❌ | Trigger ou API event que credita usuário |
| Créditos necessários para criar atlética | ❌ | Verificar antes de criar grupo do tipo 'atletica' |
| Créditos necessários para criar grupo | ⚠️ | Existe `can_create_groups` mas sem verificação de créditos |
| Histórico unificado (ganhos + gastos) | ⚠️ | `credit_transactions` existe mas só registra gastos |
| Limites diários de earning | ❌ | Criar `daily_credit_caps` ou campo na regra |
| Sistema de referral | ❌ | Tabela `referrals` + lógica de bonus |

### Schema Delta — Novas Tabelas de Créditos

```sql
-- Carteira pessoal de créditos (substituir group_wallets para créditos)
CREATE TABLE user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Regras de earning de créditos
CREATE TABLE credit_earning_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL, -- 'post_photo', 'like', 'comment', 'rsvp_yes', 'check_in', 'mvp', etc.
  credits_awarded INTEGER NOT NULL,
  daily_limit INTEGER, -- NULL = sem limite
  min_content_length INTEGER, -- Para comentários: mínimo de caracteres
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Log de créditos ganhos (earning)
-- (credit_transactions já existe para gastos, adicionar earning_type)
ALTER TABLE credit_transactions ADD COLUMN transaction_direction TEXT
  CHECK (transaction_direction IN ('earn', 'spend')) DEFAULT 'spend';
ALTER TABLE credit_transactions ADD COLUMN action_type TEXT; -- ex: 'post_photo', 'purchase', 'rsvp'
ALTER TABLE credit_transactions ADD COLUMN reference_id UUID; -- ID do post, evento, etc.

-- Controle de limite diário de earning
CREATE TABLE daily_credit_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL,
  earned_today INTEGER DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, action_type, date)
);

-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_id UUID NOT NULL REFERENCES users(id),
  status TEXT CHECK (status IN ('pending', 'completed', 'rewarded')) DEFAULT 'pending',
  credits_awarded INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(referred_id) -- cada pessoa só pode ser indicada uma vez
);
```

---

## 4. Módulo Social (NÃO EXISTE HOJE)

### Estado Atual

❌ Não há nenhuma funcionalidade de rede social no projeto atual.
O projeto tem **gamificação** (achievements, badges, rankings), mas **não tem feed, posts, curtidas ou comentários**.

### O Que Precisa Ser Criado

```sql
-- Posts sociais
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id),
  group_id UUID REFERENCES groups(id), -- NULL = post pessoal
  post_type TEXT NOT NULL CHECK (post_type IN ('training_photo', 'match_result', 'achievement', 'milestone', 'text_update')),
  content TEXT,
  media_urls TEXT[], -- array de URLs de imagens/vídeos
  event_id UUID REFERENCES events(id), -- vinculado a um evento?
  privacy TEXT CHECK (privacy IN ('public', 'atletica', 'group', 'private')) DEFAULT 'group',
  credits_pending BOOLEAN DEFAULT true, -- créditos ainda não concedidos
  credits_awarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ -- soft delete
);

-- Curtidas
CREATE TABLE social_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  reaction_type TEXT CHECK (reaction_type IN ('like', 'fire', 'goal', 'awesome')) DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id) -- um usuário, uma reação por post
);

-- Comentários
CREATE TABLE social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  parent_comment_id UUID REFERENCES social_comments(id), -- para replies
  content TEXT NOT NULL CHECK (length(content) >= 3),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Denúncias de moderação
CREATE TABLE social_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id),
  post_id UUID REFERENCES social_posts(id),
  comment_id UUID REFERENCES social_comments(id),
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Storage para Mídia Social

```
bucket: social-media (novo — hoje os buckets existentes são para avatars, event-images, etc.)
path: social-media/{userId}/{postId}/{filename}
policy: authenticated read (dentro do escopo de privacidade), authenticated upload
max file size: 10MB por imagem, 3 imagens por post
```

---

## 5. Perfil e Wallet do Usuário

### Estado Atual

```
profiles: dados do usuário ✅ (bem estruturado)
group_wallets: créditos por grupo ⚠️ (deveria ser por usuário)
platform_role: 'player' | 'organizer' | 'admin' | 'super_admin' ✅
can_create_groups: boolean (sem verificação de créditos) ⚠️
```

### O Que Precisa Mudar

| Item | Status | Mudança Necessária |
|------|--------|-------------------|
| `user_wallets` | ❌ | Criar tabela (ver seção 3) |
| `profiles.can_create_groups` | ⚠️ | Mudar lógica: verificar créditos ao invés de flag estática |
| `profiles.referral_code` | ❌ | Campo de código de convite único |
| `profiles.referred_by` | ❌ | Quem indicou este usuário |

```sql
-- Adicionar ao profiles:
ALTER TABLE profiles ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN referred_by UUID REFERENCES users(id);
-- referral_code gerado automaticamente no cadastro (ex: JOAO_1234)
```

---

## 6. Onboarding (Fluxo de Entrada)

### Estado Atual

```
/auth/signup → NextAuth credentials → profiles.onboarding_completed = false
Não há fluxo de onboarding real implementado
```

### O Que Precisa Ser Criado

```
Tela 1: Bem-vindo! Criar conta ✅ (existe)
Tela 2: Complete seu perfil (nome, foto, posição, cidade) → +50 créditos
Tela 3: Você é... [Jogador / Organizador de pelada / Administrador de atlética]
Tela 4 (Organizador): Criar grupo agora? (200 créditos) ou Ganhar créditos primeiro
Tela 5 (Atlética): Criar atlética? (1000 créditos) ou Ganhar créditos primeiro
Tela 6: Como ganhar créditos? (mostrar todas as ações e valores)
Tela 7: Entre em um grupo existente (busca por código/nome)
```

---

## 7. Gamificação (Parcialmente Implementada)

### Estado Atual

```
achievements: tabela existe, sem API/UI implementada
user_achievements: tabela existe, sem API/UI
leaderboards: tabela existe, sem API/UI
badges: tabela existe, sem API/UI
```

Toda a gamificação está estruturada no banco mas **sem implementação no app**.

### Alinhamento com Nova Visão

A gamificação nova deve INTEGRAR com o sistema de créditos:
- Desbloquear achievement → ganhar créditos
- Alcançar leaderboard top 3 → ganhar créditos
- Badge especial → créditos bônus

| Item | Status | Mudança Necessária |
|------|--------|-------------------|
| API de achievements | ❌ | Criar endpoints + triggers |
| UI de conquistas | ❌ | Página de perfil com conquistas |
| Earning de créditos por conquistas | ❌ | Integrar com credit_earning_rules |
| Leaderboard de créditos | ❌ | Rankings por créditos totais ganhos |

---

## 8. Módulo de Busca e Descoberta

### Estado Atual

```
GET /api/search — busca básica em users, events, sport_modalities
```

### O Que Precisa Mudar

| Item | Status | Mudança Necessária |
|------|--------|-------------------|
| Busca de grupos/atleticas | ⚠️ | Incluir groups na busca |
| Descoberta de grupos públicos | ❌ | Página de exploração de grupos públicos |
| Busca por localização | ❌ | Filtrar grupos por cidade/estado/coordenadas |
| Código de convite para grupo | ❌ | Grupos têm código único para entrar (ex: ABC123) |

---

## 9. Notificações

### Estado Atual

```
notifications: tabela exists, in_app implementado (polling 30s)
push: estrutura sem sender implementado
email: estrutura sem sender implementado
```

### Novas Notificações Necessárias

| Trigger | Notificação | Canal |
|---------|-------------|-------|
| Créditos ganhos | "Você ganhou X créditos por postar uma foto!" | in_app |
| Créditos insuficientes | "Você precisa de X créditos para criar este grupo" | in_app |
| Pagamento confirmado | "Seu pagamento foi confirmado pelo admin" | in_app + push |
| Pagamento negado | "Seu pagamento foi negado: [motivo]" | in_app + push |
| Post curtido | "João curtiu sua foto de treino" | in_app |
| Novo comentário | "Maria comentou em seu post" | in_app |
| Grupo expirando | "Seu grupo expira em 7 dias — renove com X créditos" | in_app + email |
| Atlética expirando | "Sua atlética expira em 7 dias" | in_app + email |

---

## 10. Resumo Executivo do Delta

### Categorias de Mudança

| Categoria | Escopo | Impacto |
|-----------|--------|---------|
| **Arquitetura de grupos** | Médio — adicionar `group_type`, fluxo de criação revisado | Alto — afeta toda a hierarquia |
| **Sistema PIX** | Pequeno — simplificar de BR Code para chave estática | Médio — menos código, melhor UX |
| **Créditos pessoais** | Médio — criar user_wallets, migrar de group_wallets | Alto — muda modelo de negócio |
| **Earning de créditos** | Grande — novo sistema de recompensas | Alto — core do modelo de engajamento |
| **Módulo social** | Grande — criar do zero (posts, curtidas, comentários, feed) | Muito Alto — nova feature principal |
| **Gamificação** | Médio — implementar UI/API do que está no banco | Médio — melhora retenção |
| **Onboarding** | Médio — criar fluxo de entrada com escolha de papel | Médio — melhora ativação |
| **Busca/Descoberta** | Pequeno — expandir busca, criar exploração de grupos | Médio — growth |

### O Que NÃO Muda

- Stack tecnológico (Next.js, NextAuth, Supabase, Vercel)
- Core de gestão de eventos (RSVP, sorteio, live score, MVP)
- Estrutura de atletas e modalidades
- Sistema de rankings de performance
- Treinos recorrentes
- Hierarquia de permissões (admin/moderator/member)

### Risco de Migração

| Mudança | Risco | Estratégia |
|---------|-------|------------|
| group_wallets → user_wallets | Médio | Criar user_wallets novo, manter group_wallets temporariamente |
| PIX simplificado | Baixo | Manter src/lib/pix.ts mas não usar BR Code; adicionar modo "static_key" |
| group_type novo ENUM | Baixo | Migration SQL simples, default 'standalone' para grupos existentes |
| Módulo social | Zero | Feature nova, sem migração necessária |
