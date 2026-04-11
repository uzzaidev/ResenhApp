# ResenhApp V2.0 — Roadmap de Implementação
> Plano ordenado de mudanças para alinhar o sistema com a visão revisada
> Gerado em 2026-02-17 | Atualizado em 2026-02-17 | Baseado em DELTA_ANALYSIS.md + CONCEPT_V2_VISION.md

---

## Status Atual das Fases (atualizado 2026-02-17)

| Fase | Nome | Status Código | Status Banco | Próximo Passo |
|------|------|--------------|--------------|---------------|
| **0** | Correções Críticas | ✅ CONCLUÍDA | ✅ Sem migrations | — |
| **1** | Arquitetura de Grupos | ✅ CONCLUÍDA (código) | ⏳ Migration pendente | Aplicar `20260301000010` |
| **2** | Créditos Pessoais + Earning | ✅ CONCLUÍDA (código) | ⏳ Migrations pendentes | Aplicar `000011` e `000012` |
| **3** | PIX Simplificado | ✅ CONCLUÍDA (código) | ⏳ Migration pendente | Aplicar `20260301000013` |
| **4** | Módulo Social | ✅ CONCLUÍDA (código) | ⏳ Migrations pendentes | Aplicar `000014` e `000016` |
| **5** | Onboarding + Referral | 🔶 PARCIAL (código) | ⏳ Migration pendente | Aplicar `20260301000015` |
| **6** | Gamificação Completa | 🔶 PARCIAL (código) | ✅ Schema existente | Completar UI |
| **7** | Compra de Créditos | 🔶 PARCIAL (código) | ⏳ Migration pendente | Aplicar `20260301000017` |

> **DEFERRED MODE**: O código detecta automaticamente quando as migrations não foram aplicadas.
> Funcionalidades sem banco mostram badge `PENDENTE` na sidebar (ex: créditos → `/api/credits/me` retorna `deferred: true`).

### Ordem de Aplicação das Migrations Pendentes
```bash
# Aplicar na ordem — cada uma depende da anterior
supabase db push
# ou manualmente:
psql $DATABASE_URL -f supabase/migrations/20260301000010_phase1_group_lifecycle.sql
psql $DATABASE_URL -f supabase/migrations/20260301000011_phase2_user_wallets.sql
psql $DATABASE_URL -f supabase/migrations/20260301000012_phase2_credit_earning_rules.sql
psql $DATABASE_URL -f supabase/migrations/20260301000013_phase3_pix_simplified.sql
psql $DATABASE_URL -f supabase/migrations/20260301000014_phase4_social_core.sql
psql $DATABASE_URL -f supabase/migrations/20260301000015_phase5_onboarding_referrals.sql
psql $DATABASE_URL -f supabase/migrations/20260301000016_phase4_social_storage.sql
psql $DATABASE_URL -f supabase/migrations/20260301000017_phase7_credit_purchase_requests.sql
```

### O Que Testar Após Aplicar Migrations
1. `/api/credits/me` → deve retornar `{ balance, deferred: false }`
2. `/api/social/feed` → deve retornar array (vazio é OK)
3. Criar post no feed → deve incrementar créditos do usuário
4. RSVP yes em evento → deve ganhar 3 créditos
5. Auto-declarar pagamento (`POST /api/charges/[id]/self-report`) → status vira `self_reported`
6. Admin confirmar pagamento → status vira `paid`, participante recebe notificação
7. Código de referral em `/api/referrals/me` → deve retornar código único
8. Badge PENDENTE na sidebar some após migrations aplicadas

---

## Princípios do Roadmap

1. **Não quebrar o que funciona**: Core de eventos/RSVP/sorteio é intocável nas fases iniciais
2. **Menor risco primeiro**: Migrations simples e features novas antes de refatorações
3. **Valor incremental**: Cada fase entrega algo utilizável em produção
4. **Débito técnico junto**: Corrigir os problemas críticos (crons, RLS) nas primeiras fases

---

## Fase 0 — Correções Críticas (Pré-requisito)
> Antes de qualquer nova feature, corrigir problemas que ameaçam produção

### 0.1 Criar as rotas de cron que estão ausentes

**Problema**: `vercel.json` tem 3 cron jobs apontando para `/api/cron/*` que não existem.
Em produção, esses jobs falham silenciosamente.

**Arquivos a criar**:
```
src/app/api/cron/
  ├── send-reminders/route.ts   → Notificações de eventos próximos
  ├── process-events/route.ts   → Atualizar status de eventos passados
  └── cleanup/route.ts          → Limpeza de dados temporários
```

**Implementação mínima** (cada um):
```typescript
// src/app/api/cron/send-reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // TODO: implementar lógica de lembretes
  return NextResponse.json({ ok: true, processed: 0 });
}
```

**Variável de ambiente necessária**: `CRON_SECRET` (adicionar ao `.env.local` e Vercel)

### 0.2 Corrigir endpoint público de debug

**Problema**: `GET /api/debug` expõe variáveis de ambiente sem autenticação.

```typescript
// src/app/api/debug/route.ts — adicionar verificação
const isDev = process.env.NODE_ENV === 'development';
if (!isDev) {
  return NextResponse.json({ error: 'Not available' }, { status: 404 });
}
```

### 0.3 Remover ou proteger RLS no Supabase

**Problema**: As RLS policies usam `auth.uid()` que retorna NULL (app usa NextAuth, não Supabase Auth).
As policies estão sendo ignoradas — toda a segurança está nas API routes.

**Decisão necessária**: Duas opções:
- **A)** Aceitar o status atual (segurança nas API routes) e desativar RLS para evitar falsa sensação de segurança
- **B)** Migrar para Supabase Auth (grande esforço — Sprint futuro)

**Ação imediata**: Documentar claramente que segurança está nas API routes, não no RLS.

---

## Fase 1 — Arquitetura de Grupos Multi-tenant
> Implementar o modelo correto de hierarquia Atlética/Grupo/Independente

### 1.1 Migration: Adicionar `group_type` à tabela `groups`

```sql
-- Arquivo: supabase/migrations/YYYYMMDD_add_group_type.sql

-- Adicionar tipo de grupo
ALTER TABLE groups ADD COLUMN group_type TEXT
  NOT NULL DEFAULT 'standalone'
  CHECK (group_type IN ('atletica', 'modality_group', 'standalone'));

-- Grupos com parent_group_id NULL e sem parent = atletica ou standalone
-- Grupos com parent_group_id NOT NULL = modality_group
UPDATE groups SET group_type = 'modality_group' WHERE parent_group_id IS NOT NULL;
-- Atleticas existentes (por convenção, eram grupos pai)
-- Manter como 'standalone' por enquanto — admin deve reclassificar manualmente

-- Adicionar metadados de expiração
ALTER TABLE groups ADD COLUMN expires_at TIMESTAMPTZ;
ALTER TABLE groups ADD COLUMN is_suspended BOOLEAN DEFAULT false;
```

**Arquivos de código afetados**:
- `src/lib/permissions.ts` — adicionar `group_type` à lógica de permissões
- `src/db/queries/groups.ts` (se existir) ou queries inline nas API routes
- `src/types/` — atualizar tipos TypeScript

### 1.2 Fluxo de Criação de Atlética

**Nova rota**: `POST /api/groups` com `group_type: 'atletica'`

**Lógica**:
```typescript
// 1. Verificar autenticação
// 2. Verificar se usuário tem >= 1000 créditos (user_wallet)
// 3. Criar grupo com group_type = 'atletica'
// 4. Consumir 1000 créditos
// 5. Criar group_member com role = 'owner'
// 6. Criar group_wallet (para features do grupo)
// 7. Retornar grupo criado
```

**Página**: `/groups/create` — separar criação de atlética vs grupo simples

### 1.3 Fluxo de Criação de Grupo de Modalidade

**Variações**:
- **Dentro de uma atlética**: Admin da atlética cria, pode convidar owner externo
- **Standalone**: Qualquer usuário com 200 créditos

**Nova lógica de convite de owner externo**:
```sql
-- Adicionar ao group_members:
ALTER TABLE group_members ADD COLUMN invited_as_owner BOOLEAN DEFAULT false;
ALTER TABLE group_members ADD COLUMN invitation_accepted_at TIMESTAMPTZ;
```

### 1.4 UI: Dashboard de Atlética

**Nova página**: `/atletica/[atleticaId]/dashboard`
- Lista todos os grupos da atlética
- Status de cada grupo (ativo, expirando, suspenso)
- Botão para criar novo grupo de modalidade
- Botão para convidar admin externo para um grupo

---

## Fase 2 — Sistema de Créditos Pessoais (User Wallets)
> Migrar créditos de por-grupo para por-usuário

### 2.1 Migration: Criar `user_wallets`

```sql
-- Arquivo: supabase/migrations/YYYYMMDD_user_wallets.sql

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

-- Criar wallet para todos os usuários existentes
INSERT INTO user_wallets (user_id, balance)
SELECT id, 0 FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Trigger para criar wallet automaticamente em novos usuários
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created_create_wallet
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_user_wallet();
```

### 2.2 Migration: Regras de Earning de Créditos

```sql
-- Arquivo: supabase/migrations/YYYYMMDD_credit_earning_rules.sql

CREATE TABLE credit_earning_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL UNIQUE,
  credits_awarded INTEGER NOT NULL,
  daily_limit INTEGER, -- NULL = sem limite diário
  min_content_length INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir regras iniciais
INSERT INTO credit_earning_rules (action_type, credits_awarded, daily_limit, description) VALUES
  ('post_training_photo', 10, 2, 'Postar foto de treino'),
  ('react_to_post', 1, 20, 'Curtir um post'),
  ('comment_on_post', 2, 10, 'Comentar em um post'),
  ('rsvp_yes', 3, 5, 'Confirmar presença em evento'),
  ('attend_event', 5, 3, 'Comparecer ao treino (confirmado pelo admin)'),
  ('receive_mvp', 15, 1, 'Ser eleito MVP do evento'),
  ('complete_profile', 50, 1, 'Completar perfil (uma vez)'),
  ('invite_friend', 30, 10, 'Indicar amigo que se cadastra'),
  ('first_event_created', 20, 1, 'Criar primeiro evento'),
  ('attendance_streak_10', 100, 1, 'Sequência de 10 presenças');

CREATE TABLE daily_credit_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL,
  earned_today INTEGER DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, action_type, date)
);
```

### 2.3 Função SQL: Ganhar Créditos

```sql
-- Função central para creditar usuário
CREATE OR REPLACE FUNCTION earn_credits(
  p_user_id UUID,
  p_action_type TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_rule credit_earning_rules%ROWTYPE;
  v_today_earned INTEGER;
  v_credits INTEGER;
BEGIN
  -- Buscar regra
  SELECT * INTO v_rule FROM credit_earning_rules
  WHERE action_type = p_action_type AND is_active = true;

  IF NOT FOUND THEN RETURN 0; END IF;

  -- Verificar limite diário
  IF v_rule.daily_limit IS NOT NULL THEN
    SELECT COALESCE(SUM(earned_today), 0) INTO v_today_earned
    FROM daily_credit_earnings
    WHERE user_id = p_user_id AND action_type = p_action_type AND date = CURRENT_DATE;

    IF v_today_earned >= v_rule.daily_limit THEN RETURN 0; END IF;
  END IF;

  v_credits := v_rule.credits_awarded;

  -- Creditar na wallet
  UPDATE user_wallets
  SET balance = balance + v_credits,
      lifetime_earned = lifetime_earned + v_credits,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Registrar no histórico
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description, reference_id)
  VALUES (p_user_id, v_credits, 'earn', p_action_type, p_reference_id);

  -- Atualizar controle diário
  INSERT INTO daily_credit_earnings (user_id, action_type, earned_today, date)
  VALUES (p_user_id, p_action_type, 1, CURRENT_DATE)
  ON CONFLICT (user_id, action_type, date)
  DO UPDATE SET earned_today = daily_credit_earnings.earned_today + 1;

  RETURN v_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.4 Integrar Earning com Eventos Existentes

**Pontos de integração** (adicionar chamada `earn_credits()` em):

| Evento | Arquivo | Onde adicionar |
|--------|---------|----------------|
| RSVP yes | `src/app/api/events/[eventId]/rsvp/route.ts` | Após inserir attendance |
| Receber MVP | `src/app/api/events/[eventId]/ratings/route.ts` | Após calcular MVP |
| Primeiro evento criado | `src/app/api/events/route.ts` | Após criar evento (verificar se é o primeiro) |
| Completar perfil | `src/app/api/profile/route.ts` | Após atualizar (verificar completude) |

---

## Fase 3 — PIX Simplificado
> Substituir BR Code EMV por exibição de chave PIX estática

### 3.1 Atualizar `charges` com novos status

```sql
-- Arquivo: supabase/migrations/YYYYMMDD_charges_status.sql

-- Adicionar novos valores ao ENUM payment_status_type
-- NOTA: Em PostgreSQL, não se pode remover valores de ENUM — apenas adicionar
ALTER TYPE payment_status_type ADD VALUE 'self_reported';
ALTER TYPE payment_status_type ADD VALUE 'denied';

-- Adicionar campos à tabela charges
ALTER TABLE charges ADD COLUMN self_reported_at TIMESTAMPTZ;
ALTER TABLE charges ADD COLUMN admin_confirmed_at TIMESTAMPTZ;
ALTER TABLE charges ADD COLUMN admin_confirmed_by UUID REFERENCES users(id);
ALTER TABLE charges ADD COLUMN admin_denial_reason TEXT;
```

### 3.2 Nova Rota: Participante Marca como Pago

```typescript
// POST /api/charges/[chargeId]/self-report
// src/app/api/charges/[chargeId]/self-report/route.ts

// Regras:
// - Autenticado
// - charge.user_id === currentUser.id
// - status deve ser 'pending'
// - Mudar para 'self_reported' + self_reported_at = now()
// - Notificar admin do grupo
```

### 3.3 Atualizar Rota de Confirmação (Admin)

```typescript
// PATCH /api/charges/[chargeId]/confirm  (existente: atualizar)
// src/app/api/charges/[chargeId]/route.ts

// Adicionar:
// - status 'self_reported' pode virar 'paid' (confirmar) ou 'denied' (negar)
// - Campo denial_reason obrigatório quando status = 'denied'
// - Notificar participante do resultado
// - Earning de crédito se admin confirmar (action: 'attend_event')
```

### 3.4 Simplificar UI de PIX

**Página atual**: Exibe QR Code gerado dinamicamente
**Página nova**:

```
/charges/[chargeId]/pay
  ├── Valor: R$ XX,XX
  ├── Para: [Nome do admin]
  ├── Chave PIX: [chave copiável com botão copiar]
  ├── Tipo: [CPF / email / telefone / etc]
  ├── Instruções: [campo livre do admin, ex: "coloque seu nome no comentário"]
  ├── [Botão] "Copiar chave PIX"
  ├── [Botão] "Abrir app de banco" (deep link para bancos BR)
  └── [Botão] "Já paguei" → chama POST /self-report → status: aguardando confirmação
```

**Deep links** de apps bancários BR (para botão "Abrir app de banco"):
- Nubank: `nubank://`
- Inter: `bancointer://`
- PicPay: `picpay://`
- Genérico: `intent://` (Android)

### 3.5 Deprecar BR Code EMV

```
src/lib/pix.ts — manter arquivo mas marcar funções como @deprecated
Remover uso de generatePixPayload() e generateQRCode() das API routes
Manter apenas: parsePix(), validatePixKey() para validação de chaves
```

---

## Fase 4 — Módulo Social
> Criar rede social esportiva do zero

### 4.1 Migrations do Módulo Social

Ver schema completo em `DELTA_ANALYSIS.md` Seção 4.
Arquivos:
- `supabase/migrations/YYYYMMDD_social_posts.sql`
- `supabase/migrations/YYYYMMDD_social_reactions.sql`
- `supabase/migrations/YYYYMMDD_social_comments.sql`

### 4.2 Storage Bucket para Mídia

```
Bucket: social-media
Policy: authenticated users can upload (máx 10MB/arquivo)
Policy: read baseado em privacy do post
CDN: Cloudflare (já configurado)
```

### 4.3 API Routes do Social

```
POST   /api/social/posts              → Criar post
GET    /api/social/feed               → Feed (com filtros: group/atletica/global)
GET    /api/social/posts/[postId]     → Post individual
DELETE /api/social/posts/[postId]     → Soft delete (próprio post)

POST   /api/social/posts/[postId]/react    → Curtir/reagir
DELETE /api/social/posts/[postId]/react    → Remover reação

POST   /api/social/posts/[postId]/comments      → Comentar
DELETE /api/social/posts/[postId]/comments/[id] → Remover comentário

POST   /api/social/reports            → Denunciar post/comentário
```

### 4.4 Feed Query

```sql
-- Feed do grupo ativo (base da query)
SELECT
  sp.*,
  p.display_name as author_name,
  p.avatar_url as author_avatar,
  COUNT(DISTINCT sr.id) as reactions_count,
  COUNT(DISTINCT sc.id) as comments_count,
  MAX(CASE WHEN sr.user_id = $currentUserId THEN sr.reaction_type END) as my_reaction
FROM social_posts sp
JOIN profiles p ON p.id = sp.author_id
LEFT JOIN social_reactions sr ON sr.post_id = sp.id
LEFT JOIN social_comments sc ON sc.post_id = sp.id AND sc.deleted_at IS NULL
WHERE sp.deleted_at IS NULL
  AND sp.group_id = $groupId              -- feed do grupo
  AND sp.privacy IN ('public', 'group')  -- filtro de privacidade
GROUP BY sp.id, p.display_name, p.avatar_url
ORDER BY sp.created_at DESC
LIMIT 20 OFFSET $offset;
```

### 4.5 Earning de Créditos no Social

**Pontos de integração**:

| Ação | Onde | Créditos |
|------|------|---------|
| Criar post | `POST /api/social/posts` | `earn_credits(userId, 'post_training_photo')` |
| Reagir a post | `POST /api/social/posts/[id]/react` | `earn_credits(userId, 'react_to_post')` |
| Comentar | `POST /api/social/posts/[id]/comments` | `earn_credits(userId, 'comment_on_post')` |

### 4.6 Páginas do Social

```
/feed                     → Feed principal (group/atletica/global tabs)
/feed/[postId]            → Post individual com comentários
/profile/[userId]         → Perfil público com posts do usuário
```

---

## Fase 5 — Onboarding e Referral
> Melhorar ativação de novos usuários e crescimento orgânico

### 5.1 Fluxo de Onboarding

```
/onboarding
  ├── /step/1 → Completar perfil (nome, foto, posição, cidade)
  ├── /step/2 → Escolher papel (jogador/organizador/admin atlética)
  ├── /step/3 → (Organizador) Criar grupo ou ganhar créditos
  ├── /step/4 → Encontrar grupos para participar
  └── /step/5 → Como ganhar créditos (tutorial)
```

**Trigger**: Após signup, verificar `profiles.onboarding_completed = false` → redirect `/onboarding`

### 5.2 Sistema de Referral

```sql
-- Migration: supabase/migrations/YYYYMMDD_referrals.sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_id UUID NOT NULL REFERENCES users(id),
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  credits_awarded INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(referred_id)
);

-- Adicionar ao profiles:
ALTER TABLE profiles ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN referred_by UUID REFERENCES users(id);
```

**Fluxo**:
```
Usuário A → Copia link de referral: resenhapp.uzzai.com.br/join?ref=JOAO_1234
Usuário B → Clica no link → cadastra → linked a referrer_id = A
Usuário B → Completa onboarding → status = 'completed'
Sistema → earn_credits(A, 'invite_friend') → +30 créditos para A
Usuário B → ganha bônus de boas-vindas: +20 créditos
```

---

## Fase 6 — Gamificação Completa
> Implementar UI/API para o sistema de conquistas que já está no banco

### 6.1 API de Conquistas

```
GET  /api/users/[userId]/achievements    → Conquistas do usuário
GET  /api/achievements                   → Catálogo de conquistas disponíveis
POST /api/achievements/check             → Verificar e conceder conquistas (cron)
```

### 6.2 Triggers Automáticos de Achievement

```sql
-- Trigger que verifica conquistas após eventos relevantes
-- Ex: após player_stats ser atualizado, verificar se atingiu metas

CREATE OR REPLACE FUNCTION check_and_award_achievements(p_user_id UUID, p_group_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_goals INTEGER;
  v_total_games INTEGER;
BEGIN
  SELECT SUM(goals) INTO v_total_goals FROM player_stats WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_total_games FROM event_attendance
  WHERE user_id = p_user_id AND status = 'yes';

  -- Achievement: 10 gols
  IF v_total_goals >= 10 THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT p_user_id, id FROM achievements WHERE code = 'goals_10'
    ON CONFLICT DO NOTHING;
  END IF;

  -- Continuar para outros achievements...
END;
$$ LANGUAGE plpgsql;
```

### 6.3 Integrar Conquistas com Créditos

```typescript
// Quando user_achievement é inserido → verificar se tem créditos associados
// → earn_credits(userId, 'achievement_unlocked', achievementId)
```

---

## Fase 7 — Compra de Créditos
> Implementar monetização real da plataforma

### 7.1 Integração com Gateway de Pagamento

**Opções**:
- **Mercado Pago** (melhor para BR, tem PIX nativo)
- **Stripe** (melhor internacionalmente, tem PaymentIntent)
- **PIX manual** (simplíssimo: admin do app confirma pagamentos de crédito)

**Recomendação**: Começar com PIX manual para o próprio sistema de créditos (bootstrap), migrar para Mercado Pago quando volume justificar.

### 7.2 Pacotes de Créditos

```
/credits/buy
  ├── Pacotes exibidos como cards
  ├── Ao clicar: gera cobrança para o email/WhatsApp da plataforma
  ├── Admin da plataforma confirma → créditos creditados
  └── (Futuro) Integração automática via Mercado Pago/Stripe
```

---

## Resumo: Ordem de Execução

| Fase | Entregável | Impacto | Dependência |
|------|-----------|---------|-------------|
| **0** | Crons, debug fix | Estabilidade produção | Nenhuma |
| **1** | group_type + fluxo atlética | Modelo de negócio correto | Fase 0 |
| **2** | user_wallets + earning rules | Economia de créditos | Fase 1 |
| **3** | PIX simplificado | Melhor UX financeiro | Fase 0 |
| **4** | Módulo social | Feature principal nova | Fase 2 |
| **5** | Onboarding + referral | Growth | Fase 4 |
| **6** | Gamificação completa | Retenção | Fase 4 |
| **7** | Compra de créditos | Monetização | Fase 5 |

---

## Métricas de Sucesso por Fase

| Fase | Métrica | Meta Inicial |
|------|---------|-------------|
| 0 | Crons executando sem erro | 100% success rate |
| 1 | Atléticas criadas | 5 atléticas reais em 30 dias |
| 2 | Créditos ganhos via social | > 50% dos usuários ativos ganham créditos |
| 3 | Tempo de confirmação de pagamento | < 2h em média |
| 4 | Posts por semana | 10+ posts por grupo ativo |
| 5 | Referrals convertidos | 20% dos novos usuários via referral |
| 6 | Conquistas desbloqueadas | 1+ conquista por usuário ativo |
| 7 | Receita de créditos | R$ 500/mês primeiros 60 dias |

---

## Dívidas Técnicas a Resolver em Paralelo

| Dívida | Sprint Sugerido | Esforço |
|--------|----------------|---------|
| NextAuth beta → v5 estável | Fase 0 | Pequeno |
| Email delivery (Resend/SendGrid) | Fase 2 | Médio |
| Push notifications (FCM) | Fase 4 | Médio |
| RLS real (migrar para Supabase Auth?) | Fase futura | Grande |
| Testes E2E para flows críticos | Contínuo | Médio |
| Middleware centralizado de auth | Fase 1 | Pequeno |
