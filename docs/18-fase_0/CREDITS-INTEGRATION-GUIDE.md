# 🎯 Guia de Integração - Sistema de Créditos

> **Data:** 2026-02-27  
> **Status:** ✅ Implementado  
> **Versão:** 1.0

---

## 📋 Visão Geral

Este guia mostra como integrar o **Sistema de Créditos** em features premium do Peladeiros.

---

## 🎯 Features Premium e Custos

| Feature | Custo | Descrição |
|---------|-------|-----------|
| **Treino Recorrente** | 5 créditos | Criar treinos automáticos semanais/mensais |
| **Convocação** | 3 créditos | Convocar jogadores para jogos oficiais |
| **QR Code Check-in** | 2 créditos | Gerar QR Code para check-in automático |
| **Tabelinha Tática** | 1 crédito | Salvar táticas personalizadas |
| **Analytics** | 10 créditos/mês | Dashboard avançado de estatísticas |
| **Split Pix** | 15 créditos/evento | Divisão automática de pagamentos |

---

## 🚀 Método 1: Usando `withCreditsCheck` (Recomendado)

### Exemplo Completo

```typescript
// src/app/api/recurring-trainings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withCreditsCheck } from "@/lib/credits-middleware";
import { sql } from "@/db/client";

export async function POST(request: NextRequest) {
  return withCreditsCheck(
    request,
    "recurring_training", // Feature type (5 créditos)
    async (user, groupId, eventId) => {
      // ✅ Créditos já foram verificados e consumidos!
      // ✅ Usuário já foi autenticado!
      // ✅ Membership já foi verificada!
      
      // Implementar lógica da feature aqui
      const body = await request.json();
      
      const result = await sql`
        INSERT INTO events (...)
        VALUES (...)
        RETURNING *
      `;
      
      return NextResponse.json({ success: true, data: result[0] });
    },
    {
      autoConsume: true,      // Consumir créditos automaticamente
      requireAdmin: true,     // Apenas admins podem usar
      description: "Criação de treino recorrente",
    }
  );
}
```

### Opções do `withCreditsCheck`

```typescript
interface CreditsCheckOptions {
  /** Se deve consumir créditos automaticamente (default: true) */
  autoConsume?: boolean;
  
  /** ID do evento relacionado (opcional) */
  eventId?: string;
  
  /** Descrição customizada da transação */
  description?: string;
  
  /** Verificar se usuário é admin do grupo (default: false) */
  requireAdmin?: boolean;
}
```

---

## 🛠️ Método 2: Verificação Manual

### Verificar sem Consumir

```typescript
import { hasEnoughCredits } from "@/lib/credits";

// Verificar se tem créditos suficientes
const check = await hasEnoughCredits(groupId, "convocation");

if (!check.hasCredits) {
  return NextResponse.json(
    {
      error: "Créditos insuficientes",
      code: "INSUFFICIENT_CREDITS",
      required: check.required,
      current: check.current,
    },
    { status: 402 } // 402 Payment Required
  );
}
```

### Consumir Manualmente

```typescript
import { checkAndConsumeCredits } from "@/lib/credits";

// Verificar e consumir créditos
const result = await checkAndConsumeCredits(
  groupId,
  "qrcode_checkin",
  userId,
  eventId,
  "Geração de QR Code para check-in"
);

if (!result.success) {
  return NextResponse.json(
    { error: result.error },
    { status: 402 }
  );
}

// Continuar com a lógica da feature
```

---

## 🎨 Integração Frontend

### 1. Exibir Saldo de Créditos

```tsx
// src/app/groups/[groupId]/credits/page.tsx
"use client";

import { useState, useEffect } from "react";
import { CreditsBalance } from "@/components/credits/credits-balance";
import { BuyCreditsModal } from "@/components/credits/buy-credits-modal";

export default function CreditsPage({ params }: { params: { groupId: string } }) {
  const [balance, setBalance] = useState(null);
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    const res = await fetch(`/api/credits?group_id=${params.groupId}`);
    const data = await res.json();
    setBalance(data.balance);
    setPackages(data.packages);
  };

  if (!balance) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-6">
      <CreditsBalance
        groupId={params.groupId}
        balance={balance.balance}
        purchased={balance.purchased}
        consumed={balance.consumed}
        onBuyClick={() => setShowModal(true)}
      />

      <BuyCreditsModal
        open={showModal}
        onOpenChange={setShowModal}
        groupId={params.groupId}
        packages={packages}
        onPurchaseSuccess={fetchBalance}
      />
    </div>
  );
}
```

### 2. Verificar Créditos Antes de Ação

```tsx
// Verificar créditos antes de criar treino recorrente
const handleCreateRecurring = async () => {
  // 1. Verificar créditos
  const checkRes = await fetch("/api/credits/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      groupId,
      feature: "recurring_training",
    }),
  });

  const check = await checkRes.json();

  if (!check.hasCredits) {
    toast({
      title: "Créditos insuficientes",
      description: `Você precisa de ${check.required} créditos. Saldo atual: ${check.current}`,
      variant: "destructive",
    });
    setShowBuyModal(true); // Abrir modal de compra
    return;
  }

  // 2. Criar treino recorrente (créditos serão consumidos)
  const res = await fetch("/api/recurring-trainings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, ...formData }),
  });

  if (res.status === 402) {
    // Créditos insuficientes (double-check)
    toast({
      title: "Créditos insuficientes",
      description: "Compre mais créditos para continuar",
      variant: "destructive",
    });
    setShowBuyModal(true);
    return;
  }

  // Sucesso!
  toast({ title: "Treino recorrente criado!" });
};
```

### 3. Tratar Erro 402 (Payment Required)

```tsx
// Interceptor global para erro 402
const handleApiError = (response: Response) => {
  if (response.status === 402) {
    toast({
      title: "Créditos insuficientes",
      description: "Esta feature requer créditos. Compre um pacote para continuar.",
      variant: "destructive",
      action: (
        <Button onClick={() => router.push(`/groups/${groupId}/credits`)}>
          Comprar Créditos
        </Button>
      ),
    });
    return true;
  }
  return false;
};
```

---

## 🎁 Sistema de Cupons

### Validar Cupom

```typescript
const validateCoupon = async (code: string, packagePriceCents: number) => {
  const res = await fetch("/api/credits/validate-coupon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      groupId,
      code: code.toUpperCase(),
      packagePriceCents,
    }),
  });

  const validation = await res.json();

  if (validation.isValid) {
    console.log("Desconto:", validation.discountApplied);
    console.log("Preço final:", validation.finalPriceCents);
    console.log("Bônus:", validation.bonusCredits);
  } else {
    console.log("Erro:", validation.errorMessage);
  }
};
```

### Tipos de Cupons

1. **Percentual** (`percentage`):
   - Exemplo: `WELCOME10` = 10% de desconto
   - `discountValue: 10` = 10%

2. **Valor Fixo** (`fixed_amount`):
   - Exemplo: `SAVE500` = R$ 5,00 de desconto
   - `discountValue: 500` = R$ 5,00 (em centavos)

3. **Créditos Bônus** (`fixed_credits`):
   - Exemplo: `BONUS50` = +50 créditos grátis
   - `discountValue: 50` = +50 créditos

### Criar Cupons (SQL)

```sql
-- Cupom de 20% de desconto (válido por 30 dias)
INSERT INTO promo_coupons (code, description, discount_type, discount_value, max_uses, valid_until)
VALUES ('PROMO20', 'Desconto de 20%', 'percentage', 20, 100, NOW() + INTERVAL '30 days');

-- Cupom de R$ 10,00 de desconto (uso único por grupo)
INSERT INTO promo_coupons (code, description, discount_type, discount_value, max_uses_per_group)
VALUES ('SAVE1000', 'R$ 10,00 OFF', 'fixed_amount', 1000, 1);

-- Cupom de +100 créditos bônus (ilimitado)
INSERT INTO promo_coupons (code, description, discount_type, discount_value, max_uses)
VALUES ('BONUS100', '+100 créditos grátis', 'fixed_credits', 100, NULL);
```

---

## 📊 Histórico de Transações

```typescript
// Buscar histórico
const res = await fetch(`/api/credits/history?group_id=${groupId}&limit=50`);
const data = await res.json();

console.log("Transações:", data.transactions);
console.log("Cupons usados:", data.coupons);
```

---

## ✅ Checklist de Integração

Para integrar uma nova feature premium:

- [ ] Definir custo em créditos (`FEATURE_COSTS` em `src/lib/credits.ts`)
- [ ] Criar rota API usando `withCreditsCheck`
- [ ] Adicionar verificação frontend antes da ação
- [ ] Tratar erro 402 (Payment Required)
- [ ] Adicionar feature na lista de custos (`CreditsBalance` component)
- [ ] Testar fluxo completo:
  - [ ] Com créditos suficientes
  - [ ] Sem créditos suficientes
  - [ ] Com cupom válido
  - [ ] Com cupom inválido
- [ ] Documentar no README

---

## 🔗 Arquivos Relacionados

- **Migration:** `supabase/migrations/20260227000009_promo_coupons.sql`
- **Lib:** `src/lib/credits.ts`
- **Middleware:** `src/lib/credits-middleware.ts`
- **API Routes:** `src/app/api/credits/`
- **Components:** `src/components/credits/`
- **Exemplo:** `src/app/api/recurring-trainings/route.ts`

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Sistema completo implementado  
**Próximo:** Integrar em todas as features premium






