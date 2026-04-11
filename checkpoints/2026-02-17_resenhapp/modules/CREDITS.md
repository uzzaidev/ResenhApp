# Módulo: CREDITS

## Visão Geral

O módulo CREDITS implementa o sistema de economia interna da plataforma ResenhApp. Grupos compram pacotes de créditos que são consumidos ao ativar funcionalidades premium (treinos recorrentes, QR Code check-in, convocação, analytics, split PIX e quadro tático). O consumo é atômico via função SQL, garantindo consistência mesmo em operações concorrentes.

---

## API Endpoints

### Créditos do grupo

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/credits` | Obtém o saldo atual de créditos do grupo ativo |
| `POST` | `/api/credits` | Compra um pacote de créditos |
| `GET` | `/api/credits/check` | Verifica se o grupo tem saldo suficiente para uma feature |
| `GET` | `/api/credits/history` | Histórico de transações de créditos do grupo |
| `POST` | `/api/credits/validate-coupon` | Valida um código de cupom promocional |

**Request body do POST /api/credits (compra):**
```json
{
  "packageId": "uuid",
  "couponCode": "PROMO20"
}
```

**Request body do GET /api/credits/check:**
```json
{
  "feature": "recurring_training"
}
```

**Resposta do GET /api/credits:**
```json
{
  "balance": 45,
  "groupId": "uuid"
}
```

**Resposta do POST /api/credits/validate-coupon:**
```json
{
  "isValid": true,
  "couponType": "percentage",
  "discountValue": 20,
  "description": "20% de desconto"
}
```

---

## Componentes

### `buy-credits-modal`

**Tipo:** Client Component

**Descrição:** Modal para compra de pacotes de créditos. Exibe os pacotes disponíveis com preços, permite aplicar cupom e finalizar a compra.

**Props principais:**
- `groupId: string`
- `packages: CreditPackage[]` — pacotes disponíveis carregados do banco
- `onPurchaseSuccess: (newBalance: number) => void`
- `isOpen: boolean`
- `onClose: () => void`

**Seções:**
- Saldo atual
- Grid de pacotes (nome, créditos, preço)
- Campo de cupom com botão "Validar"
- Resumo do pedido com desconto aplicado
- Botão "Comprar" (integração de pagamento)

---

### `credits-balance`

**Tipo:** Client Component (pode ser Server com revalidação)

**Descrição:** Componente de exibição do saldo de créditos atual do grupo, normalmente exibido na topbar ou no sidebar.

**Props principais:**
- `balance: number`
- `onBuyClick: () => void` — abre o `buy-credits-modal`

**Exibição:**
- Ícone de moeda
- Número de créditos formatado
- Indicador de saldo baixo (< 5 créditos)
- Botão "+" para comprar mais

---

### `credits-page-client`

**Tipo:** Client Component

**Descrição:** Componente principal da página de créditos. Combina saldo, histórico de transações e botão de compra.

**Props principais:**
- `groupId: string`
- `initialBalance: number`
- `initialHistory: CreditTransaction[]`
- `packages: CreditPackage[]`

**Seções:**
- Card de saldo com progresso visual
- Tabela de histórico de transações (feature, quantidade, data, operação: consumido/adicionado)
- Botão "Comprar Créditos"

---

## Tabelas do Banco de Dados

### `credit_transactions`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK | Grupo proprietário |
| `type` | VARCHAR | `purchase`, `consumption`, `refund`, `bonus` |
| `amount` | INTEGER | Quantidade de créditos (positivo = adição, negativo = consumo) |
| `feature` | VARCHAR | Feature consumida (ex: `recurring_training`) |
| `description` | TEXT | Descrição legível da transação |
| `package_id` | UUID FK | Pacote comprado (nullable — apenas em compras) |
| `coupon_id` | UUID FK | Cupom aplicado (nullable) |
| `created_by` | UUID FK | Admin que executou |
| `created_at` | TIMESTAMP | Data da transação |

### `credit_packages`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `name` | VARCHAR | Nome do pacote (ex: "Starter", "Pro", "Enterprise") |
| `credits` | INTEGER | Quantidade de créditos incluída |
| `price` | DECIMAL(10,2) | Preço em reais |
| `bonus_credits` | INTEGER | Créditos bônus extras (promoção) |
| `is_active` | BOOLEAN | Se o pacote está disponível para compra |
| `display_order` | INTEGER | Ordem de exibição |

### `promo_coupons`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `code` | VARCHAR UNIQUE | Código do cupom (ex: `PROMO20`) |
| `type` | VARCHAR | `percentage`, `fixed_credits`, `fixed_amount` |
| `value` | DECIMAL(10,2) | Valor do desconto (percentual ou fixo) |
| `description` | TEXT | Descrição do cupom |
| `max_uses` | INTEGER | Limite total de usos (nullable = ilimitado) |
| `use_count` | INTEGER | Contador de usos |
| `expires_at` | TIMESTAMP | Data de expiração (nullable) |
| `is_active` | BOOLEAN | Se o cupom está ativo |
| `created_at` | TIMESTAMP | Data de criação |

### `coupon_usages`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `coupon_id` | UUID FK | Cupom usado |
| `group_id` | UUID FK | Grupo que usou |
| `transaction_id` | UUID FK | Transação vinculada |
| `used_at` | TIMESTAMP | Data de uso |

---

## Custo por Feature

Cada feature premium consome uma quantidade fixa de créditos ao ser ativada:

| Feature | Créditos | Descrição |
|---------|----------|-----------|
| `recurring_training` | 5 | Criar um treino recorrente |
| `qrcode_checkin` | 2 | Ativar QR Code check-in para um evento |
| `convocation` | 3 | Enviar convocação em lote para membros |
| `analytics` | 10 | Acessar o dashboard de analytics avançado |
| `split_pix` | 15 | Usar split de pagamento PIX em cobranças |
| `tactical_board` | 1 | Usar o quadro tático (por sessão) |

---

## Tipos de Cupom

| Tipo | Comportamento | Exemplo |
|------|---------------|---------|
| `percentage` | Desconto percentual sobre o valor do pacote | Cupom de 20% → R$ 10,00 → R$ 8,00 |
| `fixed_credits` | Adiciona créditos extras ao pacote comprado | Compra 100 créditos, ganha +20 |
| `fixed_amount` | Desconto em valor fixo em reais | Cupom de R$ 5,00 off |

---

## Middleware: `withCreditsCheck`

O wrapper `withCreditsCheck` é um higher-order function que envolve route handlers do Next.js para verificar e consumir créditos antes de executar a lógica principal.

**Localização:** `src/lib/credits-middleware.ts`

**Assinatura:**
```typescript
const withCreditsCheck = (
  handler: RouteHandler,
  options: {
    feature: CreditFeature,
    autoConsume: boolean,
    requireAdmin: boolean,
  }
) => RouteHandler
```

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `feature` | `CreditFeature` | Feature a verificar/consumir |
| `autoConsume` | `boolean` | Se `true`, consome automaticamente antes de executar o handler |
| `requireAdmin` | `boolean` | Se `true`, verifica se o usuário é admin do grupo |

**Fluxo com `autoConsume: true`:**
```
1. Request chega ao endpoint protegido
        |
2. withCreditsCheck verifica saldo do grupo
        |
   [Saldo insuficiente]     [Saldo suficiente]
        |                          |
   Retorna 402              3. Chama consume_credits()
   { error: "Insufficient      (função SQL atômica)
     credits",                    |
     required: N,            4. Executa o handler original
     current: M }                 |
                             5. Se handler falhar:
                                  Reverte o consumo
```

**Exemplo de uso:**
```typescript
export const POST = withCreditsCheck(
  async (request, context) => {
    // lógica do endpoint
  },
  {
    feature: 'recurring_training',
    autoConsume: true,
    requireAdmin: true,
  }
)
```

---

## Função SQL: `consume_credits`

A função SQL `consume_credits` garante atomicidade no consumo de créditos, prevenindo race conditions quando múltiplos requests chegam simultaneamente.

**Assinatura SQL:**
```sql
CREATE OR REPLACE FUNCTION consume_credits(
  p_group_id UUID,
  p_feature VARCHAR,
  p_amount INTEGER,
  p_description TEXT,
  p_user_id UUID
) RETURNS BOOLEAN
```

**Lógica interna:**
1. Inicia uma transaction
2. Seleciona o saldo atual do grupo com `FOR UPDATE` (lock exclusivo)
3. Verifica se `balance >= p_amount`
4. Se sim: decrementa o saldo e insere em `credit_transactions`
5. Se não: faz rollback e retorna `false`
6. Retorna `true` em caso de sucesso

---

## Biblioteca `src/lib/credits.ts`

Funções principais para gerenciamento de créditos.

**Funções exportadas:**

| Função | Descrição |
|--------|-----------|
| `getGroupCreditsBalance(groupId)` | Obtém o saldo atual do grupo |
| `checkGroupHasEnoughCredits(groupId, feature)` | Verifica se tem saldo para a feature |
| `consumeCredits(groupId, feature, userId)` | Consome créditos (chama função SQL) |
| `addCredits(groupId, amount, packageId, couponId)` | Adiciona créditos após compra |
| `getCreditsHistory(groupId, limit, offset)` | Busca histórico paginado |
| `getCreditCost(feature)` | Retorna o custo em créditos de uma feature |

---

## Biblioteca `src/lib/credits-middleware.ts`

**Funções exportadas:**

| Função | Descrição |
|--------|-----------|
| `withCreditsCheck(handler, options)` | Wrapper HOF para verificação de créditos |
| `validateCouponCode(code, groupId)` | Valida e retorna dados do cupom |
| `applyCouponDiscount(packagePrice, coupon)` | Calcula preço final com desconto |

---

## Fluxo de Compra de Créditos

```
1. Admin abre buy-credits-modal
        |
2. Visualiza os pacotes disponíveis
        |
3. [Opcional] Digita código de cupom
   POST /api/credits/validate-coupon
        |
   [Válido] → exibe desconto calculado
   [Inválido] → exibe erro
        |
4. Seleciona o pacote e confirma
   POST /api/credits { packageId, couponCode }
        |
5. Backend processa pagamento (integração externa)
        |
6. [Pagamento aprovado]:
   - Chama addCredits(groupId, creditos + bonus)
   - INSERT em credit_transactions (type: 'purchase')
   - Se cupom usado: INSERT em coupon_usages
   - Incrementa coupon.use_count
        |
7. Retorna novo saldo
        |
8. Frontend atualiza credits-balance
9. Exibe toast de confirmação
```

---

## Notas de Implementação

- O saldo de créditos está vinculado ao grupo, não ao usuário individual
- Apenas admins podem comprar créditos e ativar features premium
- O consumo atômico via função SQL previne double-spending em environments com alta concorrência
- Features com `autoConsume: false` no middleware exigem que o developer chame manualmente `consumeCredits()` dentro da lógica do endpoint
- O histórico de `credit_transactions` registra tanto compras (amount positivo) quanto consumos (amount negativo), permitindo reconstruir o saldo a qualquer momento
- Cupons do tipo `fixed_credits` adicionam créditos extras na mesma transação de compra, registrados como `bonus_credits` no pacote
