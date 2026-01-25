# 🎯 Sprint 3: Pix QR Code + ReceiverProfiles

> **Duração:** 4 dias  
> **Camada:** 1 - Fundação Sólida  
> **Prioridade:** 🔴 Crítica (Bloqueia MVP)

---

## 📋 Objetivo

Implementar sistema completo de pagamento Pix com geração de QR Code estático, permitindo que atletas paguem cobranças de forma simples e rápida.

---

## 🎯 Entregas

### 1. Migration: `receiver_profiles` Table

**Arquivo:** `supabase/migrations/YYYYMMDDHHMMSS_create_receiver_profiles.sql`

**Schema:**
```sql
CREATE TABLE receiver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('institution', 'user')),
  entity_id UUID NOT NULL, -- institution_id ou user_id
  pix_key TEXT NOT NULL,
  pix_type TEXT NOT NULL CHECK (pix_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  name TEXT NOT NULL, -- Nome para exibir no QR
  city TEXT NOT NULL, -- Obrigatório para Pix estático
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(pix_key, pix_type)
);

CREATE INDEX idx_receiver_profiles_entity ON receiver_profiles(type, entity_id);
```

---

### 2. Migration: Campos em `charges`

**Arquivo:** `supabase/migrations/YYYYMMDDHHMMSS_add_charge_pix.sql`

**Campos:**
```sql
ALTER TABLE charges
  ADD COLUMN receiver_profile_id UUID REFERENCES receiver_profiles(id),
  ADD COLUMN pix_payload TEXT, -- QR Code copia-e-cola
  ADD COLUMN qr_image_url TEXT, -- URL ou base64 da imagem
  ADD COLUMN pix_generated_at TIMESTAMPTZ;

CREATE INDEX idx_charges_pix ON charges(receiver_profile_id) WHERE pix_payload IS NOT NULL;
```

---

### 3. Biblioteca de Geração Pix

**Arquivo:** `src/lib/pix.ts`

**Funcionalidades:**
- [ ] Função `generatePixPayload()` - Gera payload EMV
- [ ] Função `validatePixKey()` - Valida chave por tipo
- [ ] Função `generatePixQRImage()` - Gera QR Code visual
- [ ] Suporte a todos os tipos (CPF, CNPJ, Email, Phone, Random)

**Dependências:**
```json
{
  "qrcode": "^1.5.3",
  "crc": "^4.3.2"
}
```

**Código Base:**
```typescript
interface PixData {
  pixKey: string;
  pixType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  merchantName: string;
  merchantCity: string;
  amount: number;
  txId: string; // charge.id
  description?: string;
}

export function generatePixPayload(data: PixData): string {
  // Implementação EMV (BR Code)
}

export async function generatePixQRImage(payload: string): Promise<string> {
  // Gera QR Code visual (base64)
}
```

---

### 4. API: Criar ReceiverProfile

**Arquivo:** `src/app/api/receiver-profiles/route.ts`

**Endpoints:**
- [ ] `POST /api/receiver-profiles` - Criar perfil
- [ ] `GET /api/receiver-profiles?type=user&entity_id=xxx` - Listar perfis

**Validações:**
- [ ] CPF: 11 dígitos numéricos
- [ ] CNPJ: 14 dígitos numéricos
- [ ] Email: formato válido
- [ ] Phone: formato +5511999999999
- [ ] Random: 32 caracteres alfanuméricos

---

### 5. API: Gerar Pix para Charge

**Arquivo:** `src/app/api/charges/[chargeId]/pix/route.ts`

**Endpoint:**
- [ ] `POST /api/charges/[chargeId]/pix` - Gerar QR Code

**Lógica:**
1. Buscar charge
2. Buscar receiver_profile (event → group → institution)
3. Gerar pix_payload
4. Gerar qr_image_url
5. Salvar em `charges`
6. Retornar payload + image

---

### 6. Tela de Pagamento Pix

**Arquivo:** `src/app/financeiro/charges/[chargeId]/page.tsx`

**UI:**
```
┌─────────────────────────────────────┐
│ Pagamento - R$ 20,00                │
├─────────────────────────────────────┤
│                                     │
│        ┌─────────────┐             │
│        │             │             │
│        │   QR CODE   │             │
│        │             │             │
│        └─────────────┘             │
│                                     │
│ Copia e cola:                       │
│ ┌─────────────────────────────┐   │
│ │ 00020126...                 │   │
│ └─────────────────────────────┘   │
│ [Copiar]                           │
│                                     │
│ Vencimento: 25/01/2026             │
│ Recebedor: João Silva              │
│                                     │
│ [Já paguei] [Cancelar]             │
└─────────────────────────────────────┘
```

**Funcionalidades:**
- [ ] Exibir QR Code visual
- [ ] Campo copia-e-cola com botão copiar
- [ ] Informações da cobrança
- [ ] Botão "Já paguei" (marca como pago manualmente)
- [ ] Design responsivo

---

### 7. Auto-Gerar Pix ao Criar Charge

**Arquivo:** `src/app/api/events/[eventId]/rsvp/route.ts` (atualizar)

**Funcionalidades:**
- [ ] Ao criar charge, gerar Pix automaticamente
- [ ] Salvar `pix_payload` e `qr_image_url`
- [ ] Retornar na response do RSVP

---

## ✅ Critérios de Done

### Funcionalidade
- [ ] QR Code gerado corretamente (formato EMV)
- [ ] Copia-e-cola funcional
- [ ] Validação de chaves Pix
- [ ] Auto-geração ao criar charge

### UX
- [ ] QR Code visual claro
- [ ] Botão copiar funcional
- [ ] Informações completas
- [ ] Design responsivo

### Testes
- [ ] Teste unitário: geração Pix payload
- [ ] Teste: validação de chaves
- [ ] Teste E2E: fluxo completo de pagamento

### Performance
- [ ] Geração QR Code < 500ms
- [ ] Cache de QR (não regenerar)

---

## 📝 Tarefas Detalhadas

### Dia 1: Migrations + ReceiverProfiles
- [ ] Criar migration `receiver_profiles`
- [ ] Criar migration `charges` (campos Pix)
- [ ] Aplicar migrations
- [ ] Criar API `/api/receiver-profiles`
- [ ] Testar CRUD

### Dia 2: Biblioteca Pix
- [ ] Instalar dependências (`qrcode`, `crc`)
- [ ] Implementar `generatePixPayload()`
- [ ] Implementar `validatePixKey()`
- [ ] Implementar `generatePixQRImage()`
- [ ] Testes unitários

### Dia 3: API Gerar Pix + Auto-Geração
- [ ] Criar API `/api/charges/[id]/pix`
- [ ] Integrar auto-geração no RSVP
- [ ] Testar diferentes tipos de chave
- [ ] Adicionar logs

### Dia 4: Tela de Pagamento + Testes
- [ ] Criar página `/financeiro/charges/[id]`
- [ ] Implementar UI completa
- [ ] Testes E2E
- [ ] Documentação

---

## 🐛 Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Formato EMV incorreto | Alto | Testar com apps Pix reais |
| QR Code não escaneável | Médio | Ajustar error correction level |
| Chave Pix inválida | Médio | Validação rigorosa |

---

## 📚 Referências

- [BR Code (Pix)](https://www.bcb.gov.br/estabilidadefinanceira/pix)
- [EMV QR Code](https://www.emvco.com/emv-technologies/qrcodes/)
- Biblioteca: `qrcode` npm

---

**Status:** ⏳ Pendente  
**Início:** ___/___/____  
**Conclusão:** ___/___/____

