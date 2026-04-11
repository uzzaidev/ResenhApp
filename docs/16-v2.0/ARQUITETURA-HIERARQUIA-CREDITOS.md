# 🏗️ Arquitetura de Hierarquia, Créditos e Nichos - ResenhApp V2.0

> **Mapeamento completo da estrutura hierárquica, sistema de créditos e dois nichos do sistema**  
> **Data:** 2026-02-27  
> **Status:** 📋 Documentação

---

## 📋 ÍNDICE

1. [Hierarquia de Usuários](#1-hierarquia-de-usuários)
2. [Sistema de Créditos](#2-sistema-de-créditos)
3. [Dois Nichos do Sistema](#3-dois-nichos-do-sistema)
4. [Sistema de Permissões](#4-sistema-de-permissões)
5. [Sistema Financeiro Hierárquico](#5-sistema-financeiro-hierárquico)
6. [Migrations Necessárias](#6-migrations-necessárias)

---

## 1. HIERARQUIA DE USUÁRIOS

### 1.1 Estrutura Hierárquica

```
┌─────────────────────────────────────────────────────────────┐
│                    ATLÉTICA (Nível Superior)                │
│  - Pode criar e gerenciar múltiplos grupos                  │
│  - Controla sistema de créditos                             │
│  - Define código Pix próprio (opcional)                     │
│  - Acesso a todas as features premium                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                              │
┌───────▼────────┐          ┌──────────▼─────────┐
│  GRUPO 1       │          │  GRUPO 2           │
│  (Responsável) │          │  (Responsável)     │
│                │          │                    │
│  - Admin do    │          │  - Admin do        │
│    grupo       │          │    grupo           │
│  - Gerencia    │          │  - Gerencia       │
│    membros     │          │    membros         │
│  - Precisa de  │          │  - Precisa de      │
│    créditos    │          │    créditos        │
└───────┬────────┘          └──────────┬─────────┘
        │                              │
   ┌────┴────┐                    ┌────┴────┐
   │         │                    │         │
┌──▼──┐  ┌──▼──┐              ┌──▼──┐  ┌──▼──┐
│User │  │User │              │User │  │User │
│ 1   │  │ 2   │              │ 3   │  │ 4   │
└─────┘  └─────┘              └─────┘  └─────┘
```

### 1.2 Níveis de Usuário

#### Nível 1: Atlética
- **Tipo:** Organização superior
- **Permissões:**
  - Criar e gerenciar múltiplos grupos
  - Definir responsáveis de grupos
  - Controlar sistema de créditos
  - Configurar código Pix próprio (opcional)
  - Acesso a todas as features premium
  - Ver analytics de todos os grupos
- **Representação no DB:** `groups` com `group_type = 'athletic'` e `parent_group_id = NULL`

#### Nível 2: Responsável do Grupo
- **Tipo:** Admin de um grupo específico
- **Permissões:**
  - Gerenciar membros do seu grupo
  - Criar eventos/treinos
  - Gerenciar pagamentos do grupo
  - Usar features premium (se tiver créditos)
  - Ver analytics do seu grupo
- **Representação no DB:** `group_members` com `role = 'admin'`

#### Nível 3: Usuário Comum
- **Tipo:** Membro regular do grupo
- **Permissões:**
  - Confirmar presença em eventos
  - Ver rankings e estatísticas
  - Fazer check-in
  - Pagar via Pix (se grupo/atlética configurou)
- **Representação no DB:** `group_members` com `role = 'member'`

---

## 2. SISTEMA DE CRÉDITOS

### 2.1 Conceito

**Créditos = Poder usar o aplicativo**

- Atléticas e responsáveis de grupos precisam de créditos para usar features premium
- Créditos são consumidos ao usar determinadas funcionalidades
- Sistema financeiro interno do app

### 2.2 Features que Consomem Créditos

| Feature | Custo em Créditos | Quem Paga |
|---------|-------------------|-----------|
| **Criar Treino Recorrente** | 5 créditos | Responsável do Grupo |
| **Gerar QR Code Check-in** | 2 créditos | Responsável do Grupo |
| **Criar Convocação Oficial** | 3 créditos | Responsável do Grupo |
| **Analytics Avançado** | 10 créditos/mês | Atlética ou Responsável |
| **Split Pix Automático** | 15 créditos/evento | Responsável do Grupo |
| **Tabelinha Tática** | 1 crédito/salvar | Responsável do Grupo |
| **Notificações Push** | 1 crédito/100 notificações | Atlética ou Responsável |

### 2.3 Fluxo de Créditos

```
1. Atlética/Responsável compra créditos
   ↓
2. Créditos adicionados à conta
   ↓
3. Ao usar feature premium, créditos são consumidos
   ↓
4. Sistema verifica se há créditos suficientes
   ↓
5. Se sim: Feature liberada
   Se não: Bloqueio com opção de comprar mais créditos
```

### 2.4 Modelo de Negócio

**Opções de Compra:**
- **Pacote Básico:** R$ 20 = 100 créditos
- **Pacote Intermediário:** R$ 50 = 300 créditos (economia de 10%)
- **Pacote Premium:** R$ 100 = 700 créditos (economia de 20%)
- **Assinatura Mensal:** R$ 30/mês = 200 créditos/mês + features ilimitadas básicas

---

## 3. DOIS NICHOS DO SISTEMA

### 3.1 Nicho 1: Atléticas (Sistema Completo)

**Características:**
- Múltiplas modalidades esportivas
- Gestão completa de atletas
- Treinos e jogos oficiais
- Sistema de convocações
- Analytics avançado
- Tabelinha tática

**Tipo de Grupo:** `group_type = 'athletic'`

**Features Disponíveis:**
- ✅ Todas as features do sistema HTML
- ✅ Múltiplas modalidades
- ✅ Gestão de atletas por modalidade
- ✅ Treinos recorrentes
- ✅ Jogos oficiais com convocações
- ✅ Check-in QR Code
- ✅ Rankings por modalidade
- ✅ Tabelinha tática

### 3.2 Nicho 2: Peladas (Sistema Simples)

**Características:**
- Grupo de pessoas para jogos
- Foco em confirmações e sorteio
- Pagamentos simples
- Rankings básicos

**Tipo de Grupo:** `group_type = 'pelada'`

**Features Disponíveis:**
- ✅ Confirmações (RSVP)
- ✅ Sorteio de times
- ✅ Rankings básicos (artilharia, assistências)
- ✅ Pagamentos simples
- ✅ Check-in básico
- ❌ Múltiplas modalidades (não aplicável)
- ❌ Treinos recorrentes (não aplicável)
- ❌ Convocações (não aplicável)
- ❌ Tabelinha tática (não aplicável)

**Frequência de Jogos:**
- **Horário:** Jogos em horários específicos (ex: toda terça 20h)
- **Mensal:** Jogos mensais (ex: primeiro sábado do mês)
- **Semanal:** Jogos semanais (ex: todo domingo)

---

## 4. SISTEMA DE PERMISSÕES

### 4.1 Matriz de Permissões

| Ação | Atlética | Responsável Grupo | Usuário Comum |
|------|----------|-------------------|---------------|
| **Criar Grupos** | ✅ | ❌ | ❌ |
| **Editar Grupos** | ✅ (todos) | ✅ (seu grupo) | ❌ |
| **Deletar Grupos** | ✅ | ❌ | ❌ |
| **Adicionar Membros** | ✅ (todos) | ✅ (seu grupo) | ❌ |
| **Remover Membros** | ✅ (todos) | ✅ (seu grupo) | ❌ |
| **Criar Eventos** | ✅ (todos) | ✅ (seu grupo) | ❌ |
| **Editar Eventos** | ✅ (todos) | ✅ (seu grupo) | ❌ |
| **Confirmar Presença** | ✅ | ✅ | ✅ |
| **Criar Treino Recorrente** | ✅ (com créditos) | ✅ (com créditos) | ❌ |
| **Gerar QR Code** | ✅ (com créditos) | ✅ (com créditos) | ❌ |
| **Criar Convocação** | ✅ (com créditos) | ✅ (com créditos) | ❌ |
| **Ver Analytics** | ✅ (todos) | ✅ (seu grupo) | ✅ (limitado) |
| **Gerenciar Créditos** | ✅ | ✅ (seu grupo) | ❌ |
| **Configurar Pix** | ✅ | ✅ (seu grupo) | ❌ |
| **Ver Pagamentos** | ✅ (todos) | ✅ (seu grupo) | ✅ (próprios) |

### 4.2 Regras de Permissão

**Regra 1: Hierarquia**
- Atlética pode fazer tudo nos grupos que controla
- Responsável pode fazer tudo no seu grupo
- Usuário comum tem acesso limitado

**Regra 2: Créditos**
- Features premium requerem créditos
- Verificação de créditos antes de liberar feature
- Mensagem clara quando créditos insuficientes

**Regra 3: Tipo de Grupo**
- Features de atlética só disponíveis para `group_type = 'athletic'`
- Features de pelada disponíveis para ambos os tipos

---

## 5. SISTEMA FINANCEIRO HIERÁRQUICO

### 5.1 Fluxo de Pagamentos

```
┌─────────────────────────────────────────────────────────────┐
│                    DECISÃO DE PAGAMENTO                      │
│                    (Sempre vem de cima)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                              │
┌───────▼────────┐          ┌──────────▼─────────┐
│  ATLÉTICA      │          │  GRUPO             │
│  (Código Pix)  │          │  (Código Pix)      │
│                │          │                    │
│  - Define Pix  │          │  - Define Pix     │
│    próprio     │          │    próprio         │
│  - Recebe      │          │  - Recebe         │
│    pagamentos  │          │    pagamentos      │
└────────────────┘          └────────────────────┘
        │                              │
        └──────────────┬───────────────┘
                       │
                ┌──────▼──────┐
                │   USUÁRIO   │
                │   (Paga)    │
                └─────────────┘
```

### 5.2 Configuração de Pix

**Prioridade:**
1. Se Atlética configurou Pix → Usuários pagam para Atlética
2. Se Grupo configurou Pix → Usuários pagam para Grupo
3. Se nenhum configurou → Pagamento manual (sem Pix)

**Lógica:**
```sql
-- Função para determinar código Pix a usar
CREATE OR REPLACE FUNCTION get_pix_code_for_group(group_id UUID)
RETURNS TEXT AS $$
DECLARE
  athletic_pix TEXT;
  group_pix TEXT;
BEGIN
  -- Buscar Pix da atlética (se grupo tem parent)
  SELECT pix_code INTO athletic_pix
  FROM groups
  WHERE id = (SELECT parent_group_id FROM groups WHERE id = group_id)
    AND pix_code IS NOT NULL;
  
  -- Buscar Pix do grupo
  SELECT pix_code INTO group_pix
  FROM groups
  WHERE id = group_id
    AND pix_code IS NOT NULL;
  
  -- Retornar prioridade: atlética > grupo
  RETURN COALESCE(athletic_pix, group_pix);
END;
$$ LANGUAGE plpgsql;
```

### 5.3 Estrutura de Pagamentos

**Tabelas:**
- `groups.pix_code` - Código Pix da atlética/grupo
- `charges.group_id` - Grupo que recebe o pagamento
- `charges.pix_code_used` - Código Pix usado (atlética ou grupo)
- `transactions` - Registro de pagamentos

---

## 6. MIGRATIONS NECESSÁRIAS

### 6.1 Alterações em `groups`

```sql
-- Migration: 20260227000008_hierarchy_and_credits.sql

-- Adicionar hierarquia e tipo de grupo
ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS parent_group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS group_type VARCHAR(20) DEFAULT 'pelada' CHECK (group_type IN ('athletic', 'pelada')),
  ADD COLUMN IF NOT EXISTS pix_code TEXT, -- Código Pix próprio
  ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0, -- Saldo de créditos
  ADD COLUMN IF NOT EXISTS credits_purchased INTEGER DEFAULT 0, -- Total de créditos comprados
  ADD COLUMN IF NOT EXISTS credits_consumed INTEGER DEFAULT 0; -- Total de créditos consumidos

-- Índices
CREATE INDEX IF NOT EXISTS idx_groups_parent_group_id ON groups(parent_group_id);
CREATE INDEX IF NOT EXISTS idx_groups_group_type ON groups(group_type);
CREATE INDEX IF NOT EXISTS idx_groups_credits ON groups(credits_balance) WHERE credits_balance > 0;
```

### 6.2 Tabela `credit_transactions`

```sql
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'consumption', 'refund')),
  amount INTEGER NOT NULL, -- Quantidade de créditos
  description TEXT,
  feature_used VARCHAR(50), -- Feature que consumiu créditos (se aplicável)
  event_id UUID REFERENCES events(id), -- Evento relacionado (se aplicável)
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_credit_transactions_group_id ON credit_transactions(group_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);
```

### 6.3 Tabela `credit_packages`

```sql
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- 'Básico', 'Intermediário', 'Premium'
  credits_amount INTEGER NOT NULL,
  price_cents INTEGER NOT NULL, -- Preço em centavos
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir pacotes padrão
INSERT INTO credit_packages (name, credits_amount, price_cents) VALUES
  ('Básico', 100, 2000), -- R$ 20,00
  ('Intermediário', 300, 5000), -- R$ 50,00
  ('Premium', 700, 10000), -- R$ 100,00
  ('Mensal', 200, 3000); -- R$ 30,00/mês
```

### 6.4 Função para Consumir Créditos

```sql
CREATE OR REPLACE FUNCTION consume_credits(
  p_group_id UUID,
  p_amount INTEGER,
  p_feature VARCHAR(50),
  p_event_id UUID DEFAULT NULL,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Verificar saldo atual
  SELECT credits_balance INTO current_balance
  FROM groups
  WHERE id = p_group_id;
  
  -- Verificar se tem créditos suficientes
  IF current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Debitar créditos
  UPDATE groups
  SET 
    credits_balance = credits_balance - p_amount,
    credits_consumed = credits_consumed + p_amount
  WHERE id = p_group_id;
  
  -- Registrar transação
  INSERT INTO credit_transactions (
    group_id,
    transaction_type,
    amount,
    description,
    feature_used,
    event_id,
    created_by
  ) VALUES (
    p_group_id,
    'consumption',
    p_amount,
    'Créditos consumidos para: ' || p_feature,
    p_feature,
    p_event_id,
    p_user_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 6.5 Função para Adicionar Créditos

```sql
CREATE OR REPLACE FUNCTION add_credits(
  p_group_id UUID,
  p_amount INTEGER,
  p_package_id UUID DEFAULT NULL,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Adicionar créditos
  UPDATE groups
  SET 
    credits_balance = credits_balance + p_amount,
    credits_purchased = credits_purchased + p_amount
  WHERE id = p_group_id;
  
  -- Registrar transação
  INSERT INTO credit_transactions (
    group_id,
    transaction_type,
    amount,
    description,
    created_by
  ) VALUES (
    p_group_id,
    'purchase',
    p_amount,
    COALESCE((SELECT name FROM credit_packages WHERE id = p_package_id), 'Compra de créditos'),
    p_user_id
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 7. INTEGRAÇÃO COM FEATURES EXISTENTES

### 7.1 Verificação de Créditos em Features Premium

**Exemplo: Criar Treino Recorrente**

```typescript
// Backend: src/app/api/events/recurring/route.ts
export async function POST(request: Request) {
  const { groupId, ...eventData } = await request.json();
  
  // Verificar créditos
  const hasCredits = await checkAndConsumeCredits({
    groupId,
    amount: 5, // Custo do treino recorrente
    feature: 'recurring_training',
    userId: session.user.id
  });
  
  if (!hasCredits) {
    return Response.json(
      { error: 'Créditos insuficientes. Compre mais créditos para usar esta feature.' },
      { status: 402 } // Payment Required
    );
  }
  
  // Criar treino recorrente...
}
```

### 7.2 UI de Créditos

**Componente: `CreditsBalance`**
```tsx
// Mostrar saldo de créditos no header
<CreditsBalance groupId={groupId} />
```

**Modal de Compra:**
```tsx
// Quando créditos insuficientes
<BuyCreditsModal 
  groupId={groupId}
  requiredAmount={5}
  feature="Treino Recorrente"
/>
```

---

## 8. CHECKLIST DE IMPLEMENTAÇÃO

### Fase 0: Sistema de Créditos
- [ ] Criar migrations de créditos
- [ ] Implementar funções de créditos (consumir, adicionar)
- [ ] Criar API de créditos
- [ ] Criar UI de saldo de créditos
- [ ] Criar modal de compra de créditos

### Fase 1: Hierarquia
- [ ] Adicionar `parent_group_id` em `groups`
- [ ] Adicionar `group_type` em `groups`
- [ ] Implementar lógica de permissões hierárquicas
- [ ] Criar UI de criação de grupos (atlética vs pelada)

### Fase 2: Sistema Pix Hierárquico
- [ ] Adicionar `pix_code` em `groups`
- [ ] Implementar função `get_pix_code_for_group()`
- [ ] Atualizar lógica de pagamentos
- [ ] UI de configuração de Pix (atlética/grupo)

### Fase 3: Features por Nicho
- [ ] Implementar verificação de `group_type` em features
- [ ] Bloquear features de atlética para grupos pelada
- [ ] UI adaptativa baseada em tipo de grupo

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Mapeamento Completo






