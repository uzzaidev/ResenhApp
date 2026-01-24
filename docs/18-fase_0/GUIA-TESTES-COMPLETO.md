# 🧪 Guia Completo de Testes - FASE 0

> **Data:** 2026-02-27  
> **Status:** 📋 Pronto para execução  
> **Versão:** 1.0

---

## 📊 Visão Geral

Este guia contém **TODOS OS TESTES** que devem ser executados para validar a Fase 0 completa.

**Total de testes:** 67  
**Tempo estimado:** 3-4 horas

---

## 🗄️ 1. TESTES DE DATABASE (Migrations)

### 1.1 Aplicar Migrations no Supabase

**Ordem de execução:**

1. **Migration 1:** Sport Modalities
   ```sql
   -- No SQL Editor do Supabase
   -- Executar: supabase/migrations/20260227000001_sport_modalities.sql
   ```

2. **Migration 2:** Athlete Modalities
   ```sql
   -- Executar: supabase/migrations/20260227000002_athlete_modalities.sql
   ```

3. **Migration 3:** Recurring Trainings
   ```sql
   -- Executar: supabase/migrations/20260227000003_recurring_trainings.sql
   ```

4. **Migration 4:** Game Convocations
   ```sql
   -- Executar: supabase/migrations/20260227000004_game_convocations.sql
   ```

5. **Migration 5:** Check-in QR Codes
   ```sql
   -- Executar: supabase/migrations/20260227000005_checkin_qrcodes.sql
   ```

6. **Migration 6:** Saved Tactics
   ```sql
   -- Executar: supabase/migrations/20260227000006_saved_tactics.sql
   ```

7. **Migration 7:** Financial by Training
   ```sql
   -- Executar: supabase/migrations/20260227000007_financial_by_training.sql
   ```

8. **Migration 8:** Hierarchy and Credits
   ```sql
   -- Executar: supabase/migrations/20260227000008_hierarchy_and_credits.sql
   ```

9. **Migration 9:** Promo Coupons ⭐ **NOVO**
   ```sql
   -- Executar: supabase/migrations/20260227000009_promo_coupons.sql
   ```

---

### 1.2 Validar Migrations Aplicadas

**Script de validação:**

```sql
-- No SQL Editor do Supabase
-- Executar: scripts/validar-migrations-aplicadas.sql
```

**Resultado esperado:**
```
✅ 9 tabelas criadas
✅ 26 funções criadas
✅ 2 views criadas
✅ 20+ foreign keys validadas
```

---

### 1.3 Testar Tabelas Criadas

#### Teste 1.3.1: Sport Modalities

```sql
-- Criar modalidade de teste
INSERT INTO sport_modalities (group_id, name, description)
VALUES (
  'SEU_GROUP_ID_AQUI',
  'Futebol 11',
  'Futebol de campo tradicional'
)
RETURNING *;

-- Verificar se foi criada
SELECT * FROM sport_modalities WHERE name = 'Futebol 11';

-- ✅ Deve retornar 1 linha
```

#### Teste 1.3.2: Athlete Modalities

```sql
-- Associar atleta a modalidade
INSERT INTO athlete_modalities (user_id, modality_id, rating, is_active)
VALUES (
  'SEU_USER_ID_AQUI',
  'MODALITY_ID_DO_TESTE_ANTERIOR',
  8,
  TRUE
)
RETURNING *;

-- Verificar relacionamento
SELECT 
  am.*,
  sm.name as modality_name,
  p.name as athlete_name
FROM athlete_modalities am
INNER JOIN sport_modalities sm ON am.modality_id = sm.id
INNER JOIN profiles p ON am.user_id = p.id
WHERE am.user_id = 'SEU_USER_ID_AQUI';

-- ✅ Deve retornar 1 linha com dados completos
```

#### Teste 1.3.3: Recurring Trainings

```sql
-- Criar treino recorrente
UPDATE events
SET 
  is_recurring = TRUE,
  recurrence_pattern = '{"frequency": "weekly", "dayOfWeek": 3}'::jsonb,
  event_type = 'training'
WHERE id = 'SEU_EVENT_ID_AQUI'
RETURNING *;

-- Verificar padrão de recorrência
SELECT 
  id,
  name,
  is_recurring,
  recurrence_pattern,
  event_type
FROM events
WHERE is_recurring = TRUE;

-- ✅ Deve retornar o evento com recurrence_pattern
```

#### Teste 1.3.4: Game Convocations

```sql
-- Criar convocação
INSERT INTO game_convocations (
  event_id,
  created_by,
  required_positions,
  deadline
)
VALUES (
  'SEU_EVENT_ID_AQUI',
  'SEU_USER_ID_AQUI',
  '{"goalkeeper": 1, "defender": 4, "midfielder": 4, "forward": 2}'::jsonb,
  NOW() + INTERVAL '7 days'
)
RETURNING *;

-- Verificar convocação criada
SELECT * FROM game_convocations WHERE event_id = 'SEU_EVENT_ID_AQUI';

-- ✅ Deve retornar 1 linha
```

#### Teste 1.3.5: Check-in QR Codes

```sql
-- Criar QR Code para evento
SELECT create_event_qrcode(
  'SEU_EVENT_ID_AQUI'::UUID,
  'SEU_USER_ID_AQUI'::UUID,
  60
) as qrcode_id;

-- Verificar QR Code criado
SELECT * FROM checkin_qrcodes WHERE event_id = 'SEU_EVENT_ID_AQUI';

-- ✅ Deve retornar 1 linha com code e expires_at
```

#### Teste 1.3.6: Saved Tactics

```sql
-- Salvar tática
INSERT INTO saved_tactics (
  group_id,
  created_by,
  name,
  formation,
  field_data
)
VALUES (
  'SEU_GROUP_ID_AQUI',
  'SEU_USER_ID_AQUI',
  'Tática 4-3-3',
  '4-3-3',
  '{"players": [], "notes": "Teste"}'::jsonb
)
RETURNING *;

-- Verificar tática salva
SELECT * FROM saved_tactics WHERE name = 'Tática 4-3-3';

-- ✅ Deve retornar 1 linha
```

#### Teste 1.3.7: Financial by Training

```sql
-- Adicionar event_id a uma cobrança
UPDATE charges
SET event_id = 'SEU_EVENT_ID_AQUI'
WHERE id = 'SEU_CHARGE_ID_AQUI'
RETURNING *;

-- Verificar view de pagamentos por treino
SELECT * FROM v_training_payments
WHERE event_id = 'SEU_EVENT_ID_AQUI';

-- ✅ Deve retornar dados do treino com pagamentos
```

#### Teste 1.3.8: Hierarchy and Credits

```sql
-- Criar atlética (grupo pai)
INSERT INTO groups (name, group_type, created_by)
VALUES (
  'Atlética de Computação',
  'athletic',
  'SEU_USER_ID_AQUI'
)
RETURNING *;

-- Criar grupo filho
INSERT INTO groups (name, group_type, parent_group_id, created_by)
VALUES (
  'Pelada da Computação',
  'pelada',
  'ID_DA_ATLETICA_ACIMA',
  'SEU_USER_ID_AQUI'
)
RETURNING *;

-- Verificar hierarquia
SELECT 
  g1.name as athletic_name,
  g2.name as child_name,
  g2.parent_group_id
FROM groups g1
LEFT JOIN groups g2 ON g1.id = g2.parent_group_id
WHERE g1.group_type = 'athletic';

-- ✅ Deve retornar atlética com grupo filho
```

#### Teste 1.3.9: Promo Coupons

```sql
-- Verificar cupons de exemplo criados
SELECT 
  code,
  description,
  discount_type,
  discount_value,
  max_uses,
  valid_until
FROM promo_coupons
WHERE is_active = TRUE
ORDER BY created_at DESC;

-- ✅ Deve retornar 5 cupons (WELCOME10, PROMO20, SAVE500, BONUS50, BONUS100)
```

---

## 🔧 2. TESTES DE FUNÇÕES SQL

### 2.1 Funções de Créditos

#### Teste 2.1.1: add_credits()

```sql
-- Adicionar 100 créditos ao grupo
SELECT add_credits(
  'SEU_GROUP_ID_AQUI'::UUID,
  100,
  'SEU_USER_ID_AQUI'::UUID,
  'Teste de compra'
) as new_balance;

-- Verificar saldo
SELECT 
  credits_balance,
  credits_purchased,
  credits_consumed
FROM groups
WHERE id = 'SEU_GROUP_ID_AQUI';

-- ✅ credits_balance deve ser 100
-- ✅ credits_purchased deve ser 100
```

#### Teste 2.1.2: consume_credits() - Com créditos suficientes

```sql
-- Consumir 5 créditos
SELECT consume_credits(
  'SEU_GROUP_ID_AQUI'::UUID,
  5,
  'recurring_training',
  'SEU_USER_ID_AQUI'::UUID,
  NULL,
  'Teste de consumo'
) as new_balance;

-- Verificar saldo
SELECT 
  credits_balance,
  credits_consumed
FROM groups
WHERE id = 'SEU_GROUP_ID_AQUI';

-- ✅ credits_balance deve ser 95 (100 - 5)
-- ✅ credits_consumed deve ser 5
```

#### Teste 2.1.3: consume_credits() - Sem créditos suficientes

```sql
-- Tentar consumir 1000 créditos (mais do que tem)
SELECT consume_credits(
  'SEU_GROUP_ID_AQUI'::UUID,
  1000,
  'analytics',
  'SEU_USER_ID_AQUI'::UUID,
  NULL,
  'Teste de saldo insuficiente'
) as new_balance;

-- ✅ Deve retornar NULL (créditos insuficientes)
```

### 2.2 Funções de Cupons

#### Teste 2.2.1: validate_promo_coupon() - Cupom válido

```sql
-- Validar cupom WELCOME10 (10% de desconto)
SELECT * FROM validate_promo_coupon(
  'WELCOME10',
  'SEU_GROUP_ID_AQUI'::UUID,
  2000 -- R$ 20,00 em centavos
);

-- ✅ is_valid deve ser TRUE
-- ✅ discount_applied deve ser 200 (10% de 2000)
-- ✅ final_price_cents deve ser 1800
```

#### Teste 2.2.2: validate_promo_coupon() - Cupom inválido

```sql
-- Tentar validar cupom inexistente
SELECT * FROM validate_promo_coupon(
  'CUPOM_INVALIDO',
  'SEU_GROUP_ID_AQUI'::UUID,
  2000
);

-- ✅ is_valid deve ser FALSE
-- ✅ error_message deve conter "Cupom não encontrado"
```

#### Teste 2.2.3: validate_promo_coupon() - Cupom já usado

```sql
-- Aplicar cupom WELCOME10
SELECT apply_promo_coupon(
  'COUPON_ID_DO_WELCOME10',
  'SEU_GROUP_ID_AQUI'::UUID,
  'TRANSACTION_ID_QUALQUER'::UUID,
  200,
  'SEU_USER_ID_AQUI'::UUID
);

-- Tentar validar novamente (uso único por grupo)
SELECT * FROM validate_promo_coupon(
  'WELCOME10',
  'SEU_GROUP_ID_AQUI'::UUID,
  2000
);

-- ✅ is_valid deve ser FALSE
-- ✅ error_message deve conter "já utilizado por este grupo"
```

### 2.3 Funções de Hierarquia

#### Teste 2.3.1: can_manage_group() - Admin do grupo

```sql
-- Verificar se admin pode gerenciar seu grupo
SELECT can_manage_group(
  'SEU_USER_ID_AQUI'::UUID,
  'SEU_GROUP_ID_AQUI'::UUID
) as can_manage;

-- ✅ Deve retornar TRUE (se você é admin)
```

#### Teste 2.3.2: can_manage_group() - Admin de atlética pai

```sql
-- Verificar se admin da atlética pode gerenciar grupo filho
SELECT can_manage_group(
  'SEU_USER_ID_AQUI'::UUID,
  'ID_DO_GRUPO_FILHO'::UUID
) as can_manage;

-- ✅ Deve retornar TRUE (se você é admin da atlética pai)
```

#### Teste 2.3.3: get_pix_code_for_group()

```sql
-- Definir Pix da atlética
UPDATE groups
SET pix_code = 'pix@atletica.com'
WHERE id = 'ID_DA_ATLETICA';

-- Buscar Pix do grupo filho (deve herdar da atlética)
SELECT get_pix_code_for_group('ID_DO_GRUPO_FILHO'::UUID) as pix_code;

-- ✅ Deve retornar 'pix@atletica.com' (herdado da atlética)
```

---

## 🌐 3. TESTES DE API

### 3.1 API de Créditos

#### Teste 3.1.1: GET /api/credits

```bash
# Obter saldo de créditos
curl -X GET "http://localhost:3000/api/credits?group_id=SEU_GROUP_ID" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"

# ✅ Deve retornar:
# {
#   "balance": { "balance": 95, "purchased": 100, "consumed": 5 },
#   "packages": [...]
# }
```

#### Teste 3.1.2: POST /api/credits/purchase

```bash
# Comprar créditos
curl -X POST "http://localhost:3000/api/credits/purchase" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "groupId": "SEU_GROUP_ID",
    "packageId": "PACKAGE_ID_BASICO"
  }'

# ✅ Deve retornar:
# {
#   "success": true,
#   "creditsAdded": 100,
#   "finalPrice": 2000,
#   "balance": {...}
# }
```

#### Teste 3.1.3: POST /api/credits/purchase (com cupom)

```bash
# Comprar créditos com cupom
curl -X POST "http://localhost:3000/api/credits/purchase" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "groupId": "SEU_GROUP_ID",
    "packageId": "PACKAGE_ID_BASICO",
    "couponCode": "PROMO20"
  }'

# ✅ Deve retornar:
# {
#   "success": true,
#   "creditsAdded": 100,
#   "bonusCredits": 0,
#   "finalPrice": 1600,  // 20% de desconto
#   "balance": {...}
# }
```

#### Teste 3.1.4: POST /api/credits/check

```bash
# Verificar se tem créditos para feature
curl -X POST "http://localhost:3000/api/credits/check" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "groupId": "SEU_GROUP_ID",
    "feature": "recurring_training"
  }'

# ✅ Deve retornar:
# {
#   "hasCredits": true,
#   "required": 5,
#   "current": 195
# }
```

#### Teste 3.1.5: POST /api/credits/validate-coupon

```bash
# Validar cupom
curl -X POST "http://localhost:3000/api/credits/validate-coupon" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "groupId": "SEU_GROUP_ID",
    "code": "BONUS50",
    "packagePriceCents": 2000
  }'

# ✅ Deve retornar:
# {
#   "isValid": true,
#   "discountType": "fixed_credits",
#   "bonusCredits": 50,
#   "finalPriceCents": 2000
# }
```

#### Teste 3.1.6: GET /api/credits/history

```bash
# Obter histórico
curl -X GET "http://localhost:3000/api/credits/history?group_id=SEU_GROUP_ID" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"

# ✅ Deve retornar:
# {
#   "transactions": [...],
#   "coupons": [...]
# }
```

### 3.2 API de Grupos (Hierarquia)

#### Teste 3.2.1: GET /api/groups/managed

```bash
# Obter grupos gerenciáveis
curl -X GET "http://localhost:3000/api/groups/managed" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"

# ✅ Deve retornar:
# {
#   "groups": [
#     {
#       "id": "...",
#       "name": "Atlética de Computação",
#       "groupType": "athletic",
#       "children": [...]
#     }
#   ]
# }
```

#### Teste 3.2.2: POST /api/groups (criar atlética)

```bash
# Criar atlética
curl -X POST "http://localhost:3000/api/groups" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "name": "Atlética de Engenharia",
    "description": "Atlética do curso de Engenharia",
    "privacy": "private",
    "groupType": "athletic"
  }'

# ✅ Deve retornar:
# {
#   "group": {
#     "id": "...",
#     "name": "Atlética de Engenharia",
#     "group_type": "athletic",
#     "inviteCode": "..."
#   }
# }
```

#### Teste 3.2.3: POST /api/groups (criar grupo filho)

```bash
# Criar grupo filho
curl -X POST "http://localhost:3000/api/groups" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "name": "Pelada da Engenharia",
    "description": "Pelada semanal",
    "privacy": "private",
    "groupType": "pelada",
    "parentGroupId": "ID_DA_ATLETICA"
  }'

# ✅ Deve retornar:
# {
#   "group": {
#     "id": "...",
#     "name": "Pelada da Engenharia",
#     "group_type": "pelada",
#     "parent_group_id": "ID_DA_ATLETICA",
#     "inviteCode": "..."
#   }
# }
```

#### Teste 3.2.4: POST /api/groups (erro - hierarquia inválida)

```bash
# Tentar criar filho de pelada (deve falhar)
curl -X POST "http://localhost:3000/api/groups" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "name": "Grupo Inválido",
    "groupType": "pelada",
    "parentGroupId": "ID_DE_UMA_PELADA"
  }'

# ✅ Deve retornar erro 400:
# {
#   "error": "Grupo pai deve ser uma atlética"
# }
```

### 3.3 API de Recurring Trainings (Exemplo de Integração)

#### Teste 3.3.1: POST /api/recurring-trainings (com créditos)

```bash
# Criar treino recorrente (consome 5 créditos)
curl -X POST "http://localhost:3000/api/recurring-trainings" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{
    "groupId": "SEU_GROUP_ID",
    "name": "Treino Semanal",
    "recurrencePattern": {
      "frequency": "weekly",
      "dayOfWeek": 3
    },
    "startDate": "2026-03-01",
    "endDate": "2026-12-31"
  }'

# ✅ Deve retornar:
# {
#   "success": true,
#   "recurringEvent": {...},
#   "message": "Treino recorrente criado com sucesso (5 créditos consumidos)"
# }
```

#### Teste 3.3.2: POST /api/recurring-trainings (sem créditos)

```bash
# Tentar criar sem créditos (deve falhar)
# Primeiro, consumir todos os créditos do grupo
# Depois tentar criar treino recorrente

curl -X POST "http://localhost:3000/api/recurring-trainings" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=SEU_TOKEN" \
  -d '{...}'

# ✅ Deve retornar erro 402:
# {
#   "error": "Créditos insuficientes",
#   "code": "INSUFFICIENT_CREDITS",
#   "feature": "recurring_training",
#   "required": 5
# }
```

---

## 🎨 4. TESTES DE FRONTEND

### 4.1 Design System

#### Teste 4.1.1: MetricCard

1. Abrir `/design-system` (se criou a rota de teste)
2. Verificar MetricCard com:
   - ✅ Título, valor, descrição
   - ✅ Ícone customizado
   - ✅ Tendência (↑↓)
   - ✅ Gradiente de borda
   - ✅ 6 variantes de cor

#### Teste 4.1.2: StatusBadge

1. Verificar StatusBadge com:
   - ✅ 14 variantes (confirmed, pending, cancelled, etc.)
   - ✅ Ícones automáticos
   - ✅ 3 tamanhos (sm, md, lg)
   - ✅ Cores UzzAI

#### Teste 4.1.3: ProgressBar

1. Verificar ProgressBar com:
   - ✅ Valores 0-100
   - ✅ 11 variantes de cor
   - ✅ 4 tamanhos (sm, md, lg, xl)
   - ✅ Labels (top, bottom, inside)
   - ✅ Animação de pulso

### 4.2 Sidebar Navigation

#### Teste 4.2.1: Navegação Básica

1. Abrir qualquer página do dashboard
2. Verificar Sidebar com:
   - ✅ Logo UzzAI
   - ✅ 4 seções (Principal, Gestão, Análise, Ferramentas)
   - ✅ Ícones em todos os itens
   - ✅ Estado active (mint/10)
   - ✅ Hover effects

#### Teste 4.2.2: Navegação por Tipo de Grupo

**Pelada:**
- ✅ Seções: Principal, Gestão, Ferramentas
- ❌ Seção Análise não aparece

**Atlética:**
- ✅ Seções: Principal, Gestão, Análise, Ferramentas
- ✅ Analytics aparece em Ferramentas

#### Teste 4.2.3: Badges e Contadores

1. Verificar badges:
   - ✅ Notificações (vermelho)
   - ✅ Pagamentos pendentes (vermelho)
   - ✅ Custo em créditos (prata)
   - ✅ Indicador premium (⭐)

### 4.3 Sistema de Créditos

#### Teste 4.3.1: CreditsBalance

1. Criar página `/groups/[groupId]/credits`
2. Renderizar `<CreditsBalance />`
3. Verificar:
   - ✅ Saldo atual
   - ✅ Total comprado
   - ✅ Total consumido
   - ✅ Aviso de saldo baixo (< 20)
   - ✅ Lista de custos das features
   - ✅ Botões (Comprar, Histórico)

#### Teste 4.3.2: BuyCreditsModal

1. Clicar em "Comprar Créditos"
2. Verificar modal:
   - ✅ Lista de 4 pacotes
   - ✅ Preços e quantidades
   - ✅ Campo de cupom
   - ✅ Botão "Aplicar" cupom
   - ✅ Resumo da compra
   - ✅ Cálculo de preço final

#### Teste 4.3.3: Validação de Cupom em Tempo Real

1. No modal, digitar "WELCOME10"
2. Clicar em "Aplicar"
3. Verificar:
   - ✅ Mensagem de sucesso
   - ✅ Desconto aplicado (10%)
   - ✅ Preço final atualizado
   - ✅ Resumo atualizado

#### Teste 4.3.4: Compra com Cupom

1. Selecionar pacote "Básico" (R$ 20,00)
2. Aplicar cupom "PROMO20"
3. Clicar em "Comprar Agora"
4. Verificar:
   - ✅ Toast de sucesso
   - ✅ Saldo atualizado
   - ✅ Modal fechado

### 4.4 Hierarquia de Grupos

#### Teste 4.4.1: Criar Atlética

1. Ir para `/groups/new`
2. Selecionar "Atlética"
3. Preencher nome e descrição
4. Clicar em "Criar Grupo"
5. Verificar:
   - ✅ Grupo criado com `group_type = 'athletic'`
   - ✅ Redirecionado para página do grupo
   - ✅ Toast de sucesso

#### Teste 4.4.2: Criar Grupo Filho

1. Ir para `/groups/new`
2. Selecionar "Pelada"
3. Selecionar atlética pai no dropdown
4. Preencher nome e descrição
5. Clicar em "Criar Grupo"
6. Verificar:
   - ✅ Grupo criado com `parent_group_id`
   - ✅ Vinculado à atlética
   - ✅ Toast de sucesso

#### Teste 4.4.3: Seletor de Tipo

1. No formulário, alternar entre "Atlética" e "Pelada"
2. Verificar:
   - ✅ Ícones diferentes (Building2 vs Users)
   - ✅ Descrições diferentes
   - ✅ Placeholder do nome muda
   - ✅ Info card aparece para atléticas
   - ✅ Seletor de pai aparece apenas para peladas

#### Teste 4.4.4: Dropdown de Atléticas

1. Selecionar "Pelada"
2. Verificar dropdown "Atlética Pai":
   - ✅ Lista apenas atléticas onde você é admin
   - ✅ Opção "Nenhuma (independente)"
   - ✅ Ícones nas opções

---

## 🔍 5. TESTES DE PERMISSÕES

### 5.1 Permissões de Grupo

#### Teste 5.1.1: Admin pode gerenciar

1. Como admin do grupo, acessar `/groups/[groupId]/settings`
2. Verificar:
   - ✅ Acesso permitido
   - ✅ Pode editar configurações
   - ✅ Pode gerenciar membros

#### Teste 5.1.2: Member não pode gerenciar

1. Como membro (não admin), tentar acessar `/groups/[groupId]/settings`
2. Verificar:
   - ✅ Acesso negado (403)
   - ✅ Mensagem de erro apropriada

#### Teste 5.1.3: Admin de atlética pode gerenciar filho

1. Como admin de atlética, acessar settings do grupo filho
2. Verificar:
   - ✅ Acesso permitido
   - ✅ Pode gerenciar grupo filho

### 5.2 Permissões de Créditos

#### Teste 5.2.1: Apenas admin pode comprar

1. Como membro, tentar comprar créditos
2. Verificar:
   - ✅ API retorna erro 403
   - ✅ Mensagem: "Apenas administradores podem comprar créditos"

#### Teste 5.2.2: Member pode ver saldo

1. Como membro, acessar `/groups/[groupId]/credits`
2. Verificar:
   - ✅ Pode ver saldo
   - ✅ Botão "Comprar" desabilitado ou não aparece

---

## 📊 6. TESTES DE INTEGRAÇÃO

### 6.1 Fluxo Completo: Criar Atlética + Grupos Filhos

1. **Criar atlética:**
   - Nome: "Atlética de Medicina"
   - Tipo: Athletic
   - ✅ Criada com sucesso

2. **Adicionar créditos:**
   - Comprar pacote "Básico" (100 créditos)
   - ✅ Saldo: 100 créditos

3. **Criar grupo filho 1:**
   - Nome: "Pelada Semanal"
   - Tipo: Pelada
   - Pai: Atlética de Medicina
   - ✅ Criado e vinculado

4. **Criar grupo filho 2:**
   - Nome: "Futsal Quinta"
   - Tipo: Pelada
   - Pai: Atlética de Medicina
   - ✅ Criado e vinculado

5. **Verificar hierarquia:**
   - ✅ Atlética aparece como pai
   - ✅ 2 grupos filhos listados
   - ✅ Admin da atlética pode gerenciar ambos

### 6.2 Fluxo Completo: Comprar Créditos com Cupom

1. **Ver saldo inicial:**
   - ✅ Saldo: 0 créditos

2. **Abrir modal de compra:**
   - ✅ 4 pacotes listados

3. **Selecionar pacote "Intermediário":**
   - ✅ 300 créditos
   - ✅ R$ 50,00

4. **Aplicar cupom "PROMO20":**
   - ✅ Cupom validado
   - ✅ 20% de desconto
   - ✅ Preço final: R$ 40,00

5. **Confirmar compra:**
   - ✅ Compra realizada
   - ✅ Saldo: 300 créditos
   - ✅ Histórico atualizado

6. **Tentar usar cupom novamente:**
   - ✅ Erro: "Cupom já utilizado"

### 6.3 Fluxo Completo: Consumir Créditos em Feature

1. **Verificar saldo:**
   - ✅ Saldo: 300 créditos

2. **Criar treino recorrente:**
   - ✅ Consome 5 créditos automaticamente
   - ✅ Saldo: 295 créditos

3. **Criar convocação:**
   - ✅ Consome 3 créditos
   - ✅ Saldo: 292 créditos

4. **Tentar criar feature sem créditos:**
   - Consumir todos os créditos
   - Tentar criar treino recorrente
   - ✅ Erro 402: "Créditos insuficientes"
   - ✅ Modal de compra abre automaticamente

---

## ✅ 7. CHECKLIST FINAL

### 7.1 Migrations

- [ ] Todas as 9 migrations aplicadas no Supabase
- [ ] Script de validação executado com sucesso
- [ ] 9 tabelas criadas
- [ ] 26 funções criadas
- [ ] 2 views criadas
- [ ] 20+ foreign keys validadas

### 7.2 Funcionalidades

- [ ] Sistema de créditos funcionando
- [ ] Cupons promocionais validando
- [ ] Hierarquia de grupos criada
- [ ] Permissões funcionando corretamente
- [ ] Design System aplicado

### 7.3 APIs

- [ ] GET /api/credits funcionando
- [ ] POST /api/credits/purchase funcionando
- [ ] POST /api/credits/check funcionando
- [ ] POST /api/credits/validate-coupon funcionando
- [ ] GET /api/credits/history funcionando
- [ ] GET /api/groups/managed funcionando
- [ ] POST /api/groups (hierarquia) funcionando
- [ ] POST /api/recurring-trainings funcionando

### 7.4 Frontend

- [ ] MetricCard renderizando
- [ ] StatusBadge renderizando
- [ ] ProgressBar renderizando
- [ ] Sidebar navegando
- [ ] CreditsBalance exibindo
- [ ] BuyCreditsModal funcionando
- [ ] Formulário de grupos com hierarquia

### 7.5 Integrações

- [ ] Fluxo completo de compra testado
- [ ] Fluxo completo de hierarquia testado
- [ ] Fluxo completo de consumo testado
- [ ] Erro 402 tratado corretamente
- [ ] Permissões validadas

---

## 📝 8. RELATÓRIO DE TESTES

Após executar todos os testes, preencher:

```markdown
## Relatório de Testes - Fase 0

**Data:** __/__/____  
**Testador:** _______________  
**Ambiente:** Desenvolvimento / Produção

### Resumo

- **Total de testes:** 67
- **Testes executados:** __/67
- **Testes passaram:** __/67
- **Testes falharam:** __/67

### Falhas Encontradas

1. **Teste X.Y.Z:** Descrição da falha
   - **Esperado:** ...
   - **Obtido:** ...
   - **Ação:** ...

### Conclusão

[ ] ✅ FASE 0 100% VALIDADA - Pronto para produção  
[ ] ⚠️ FASE 0 COM PENDÊNCIAS - Necessário correções  
[ ] ❌ FASE 0 COM FALHAS CRÍTICAS - Necessário revisão
```

---

**Última atualização:** 2026-02-27  
**Status:** 📋 Pronto para execução  
**Tempo estimado:** 3-4 horas

