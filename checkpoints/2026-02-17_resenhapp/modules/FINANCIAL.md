# Módulo: FINANCIAL

## Visão Geral

O módulo FINANCIAL gerencia toda a parte financeira dos grupos na plataforma ResenhApp: cobranças, pagamentos, geração de PIX, configuração de recebedores e histórico de transações. Suporte a cobrança automática no RSVP de eventos, geração de BR Code EMV para pagamentos PIX e operações com janela de desfazer de 8 segundos (undo).

---

## Rotas de Páginas

| Rota | Descrição |
|------|-----------|
| `/(dashboard)/financeiro` | Painel financeiro com tabela de cobranças e saldo |
| `/(dashboard)/financeiro/charges/[chargeId]` | Detalhes de uma cobrança específica com histórico de pagamentos |

---

## API Endpoints

### Cobranças

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/groups/[groupId]/charges` | Lista todas as cobranças do grupo |
| `POST` | `/api/groups/[groupId]/charges` | Cria uma nova cobrança |
| `GET` | `/api/groups/[groupId]/charges/[chargeId]` | Obtém detalhes de uma cobrança |
| `PATCH` | `/api/groups/[groupId]/charges/[chargeId]` | Atualiza uma cobrança |
| `DELETE` | `/api/groups/[groupId]/charges/[chargeId]` | Cancela/remove uma cobrança |
| `POST` | `/api/groups/[groupId]/charges/[chargeId]/mark-paid` | Marca cobrança como paga (com undo) |
| `POST` | `/api/groups/[groupId]/charges/[chargeId]/cancel` | Cancela cobrança (com undo) |

### PIX

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/charges/[chargeId]/pix` | Gera o PIX (BR Code EMV) para uma cobrança |
| `GET` | `/api/charges/[chargeId]/pix` | Obtém o status e dados do PIX de uma cobrança |

---

## Componentes

### `pix-payment-card`

**Tipo:** Client Component

**Descrição:** Card que exibe o QR Code e o código PIX Copia e Cola para pagamento de uma cobrança.

**Props principais:**
- `chargeId: string`
- `amount: number`
- `receiverName: string`
- `pixKey: string`
- `brCode: string` — código EMV gerado pelo backend
- `expiresAt?: Date`

**Funcionalidades:**
- Exibe QR Code gerado a partir do `brCode`
- Botão "Copiar código PIX"
- Countdown de expiração do PIX
- Status de pagamento com polling (verifica a cada 5s se o pagamento foi recebido)

---

### `charges-data-table`

**Tipo:** Client Component

**Descrição:** Tabela de cobranças com filtros, ordenação e ações em linha.

**Props principais:**
- `charges: Charge[]`
- `onMarkPaid: (chargeId: string) => void`
- `onCancel: (chargeId: string) => void`
- `onViewPix: (chargeId: string) => void`
- `isAdmin: boolean`

**Colunas:**
- Atleta (nome + avatar)
- Tipo de cobrança
- Valor
- Vencimento
- Status (badge colorido)
- Evento vinculado (se houver)
- Ações (marcar como pago, cancelar, ver PIX)

**Filtros:**
- Status (`pending`, `paid`, `cancelled`)
- Tipo (`monthly`, `daily`, `fine`, `other`)
- Período (data de vencimento)
- Atleta (busca por nome)

---

### `create-charge-modal`

**Tipo:** Client Component

**Descrição:** Modal para criação manual de cobranças.

**Props principais:**
- `groupId: string`
- `members: GroupMember[]`
- `isOpen: boolean`
- `onClose: () => void`
- `onSuccess: (charge: Charge) => void`

**Campos:**
- Seleção de atleta(s) — permite cobrança em lote (múltiplos atletas)
- Tipo de cobrança (`monthly`, `daily`, `fine`, `other`)
- Valor
- Descrição
- Data de vencimento
- Evento vinculado (opcional)

---

### `payments-content`

**Tipo:** Client Component

**Descrição:** Componente principal da página financeiro que combina o resumo de saldo, filtros e a tabela de cobranças.

**Props principais:**
- `groupId: string`
- `initialCharges: Charge[]`
- `wallet: Wallet`
- `receiverProfiles: ReceiverProfile[]`

**Seções:**
- Cards de resumo: Total pendente, Total recebido no mês, Total de cobranças
- Botão "Nova Cobrança" (admin)
- `charges-data-table`

---

## Tabelas do Banco de Dados

### `charges`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK | Grupo responsável |
| `user_id` | UUID FK | Atleta cobrado |
| `event_id` | UUID FK | Evento vinculado (nullable — auto-charge) |
| `type` | VARCHAR | `monthly`, `daily`, `fine`, `other` |
| `amount` | DECIMAL(10,2) | Valor em reais |
| `description` | TEXT | Descrição da cobrança |
| `due_date` | DATE | Data de vencimento |
| `status` | VARCHAR | `pending`, `paid`, `cancelled` |
| `paid_at` | TIMESTAMP | Data de pagamento (nullable) |
| `cancelled_at` | TIMESTAMP | Data de cancelamento (nullable) |
| `created_by` | UUID FK | Admin que criou |
| `created_at` | TIMESTAMP | Data de criação |

### `charge_splits`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `charge_id` | UUID FK | Cobrança principal |
| `receiver_profile_id` | UUID FK | Perfil recebedor do split |
| `percentage` | DECIMAL(5,2) | Percentual do split |
| `amount` | DECIMAL(10,2) | Valor calculado do split |

### `transactions`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK | Grupo |
| `charge_id` | UUID FK | Cobrança vinculada (nullable) |
| `type` | VARCHAR | `income`, `expense`, `refund` |
| `amount` | DECIMAL(10,2) | Valor |
| `description` | TEXT | Descrição da transação |
| `transaction_date` | TIMESTAMP | Data da transação |
| `created_at` | TIMESTAMP | Data de registro |

### `wallets`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK UNIQUE | Grupo proprietário da carteira |
| `balance` | DECIMAL(10,2) | Saldo atual em reais |
| `updated_at` | TIMESTAMP | Última atualização do saldo |

### `receiver_profiles`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK | Grupo proprietário |
| `name` | VARCHAR | Nome do recebedor |
| `pix_key` | VARCHAR | Chave PIX |
| `pix_key_type` | VARCHAR | `cpf`, `cnpj`, `email`, `phone`, `random` |
| `is_default` | BOOLEAN | Se é o recebedor padrão do grupo |
| `is_active` | BOOLEAN | Soft delete |

### `pix_payments`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `charge_id` | UUID FK | Cobrança vinculada |
| `br_code` | TEXT | Código EMV PIX gerado |
| `qr_code_url` | TEXT | URL da imagem do QR Code |
| `pix_key` | VARCHAR | Chave PIX usada |
| `receiver_name` | VARCHAR | Nome do recebedor |
| `amount` | DECIMAL(10,2) | Valor do PIX |
| `status` | VARCHAR | `pending`, `paid`, `expired` |
| `expires_at` | TIMESTAMP | Expiração do PIX |
| `paid_at` | TIMESTAMP | Data de confirmação do pagamento |
| `created_at` | TIMESTAMP | Data de geração |

### `group_pix_config`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Chave primária |
| `group_id` | UUID FK UNIQUE | Grupo |
| `default_receiver_profile_id` | UUID FK | Perfil de recebedor padrão |
| `auto_generate_pix` | BOOLEAN | Gera PIX automaticamente ao criar cobrança |
| `pix_expiry_hours` | INTEGER | Horas até o PIX expirar |
| `updated_at` | TIMESTAMP | Última atualização |

---

## Tipos e Status de Cobrança

### Tipos (`charges.type`)

| Tipo | Descrição | Exemplo de uso |
|------|-----------|----------------|
| `monthly` | Mensalidade | Taxa mensal do grupo |
| `daily` | Diária | Cobrança por evento (auto-charge) |
| `fine` | Multa | Ausência sem justificativa, cartão vermelho |
| `other` | Outros | Cobrança avulsa de qualquer natureza |

### Status (`charges.status`)

| Status | Descrição | Transições permitidas |
|--------|-----------|----------------------|
| `pending` | Aguardando pagamento | → `paid`, → `cancelled` |
| `paid` | Pago | → `pending` (apenas via undo em 8s) |
| `cancelled` | Cancelado | → `pending` (apenas via undo em 8s) |

---

## Fluxo de Geração de PIX (BR Code EMV)

```
1. Admin/usuário solicita PIX para uma cobrança
   POST /api/charges/[chargeId]/pix
        |
2. Backend verifica:
   - Cobrança existe e status = 'pending'
   - Grupo tem receiver_profile configurado
        |
3. Obtém os dados do receiver_profile padrão:
   - pix_key, pix_key_type, name
        |
4. Chama src/lib/pix.ts:
   generatePixCode({
     pixKey, pixKeyType, receiverName,
     amount, description, txid
   })
        |
5. Lib pix.ts monta o payload EMV (BR Code):
   - Campo 00: Payload Format Indicator
   - Campo 26: Merchant Account Information (chave PIX)
   - Campo 52: Merchant Category Code
   - Campo 53: Transaction Currency (986 = BRL)
   - Campo 54: Transaction Amount
   - Campo 58: Country Code (BR)
   - Campo 59: Merchant Name
   - Campo 60: Merchant City
   - Campo 62: Additional Data (txid)
   - Campo 63: CRC16 checksum
        |
6. INSERT em pix_payments com o br_code gerado
        |
7. Retorna { brCode, qrCodeUrl, expiresAt }
        |
8. Frontend exibe QR Code e código Copia e Cola
```

---

## Cobrança Automática no RSVP

Quando `events.auto_charge = true`:

```
1. Usuário confirma presença no evento
        |
2. Backend cria cobrança automática:
   INSERT charges {
     type: 'daily',
     amount: event.auto_charge_amount,
     user_id: userId,
     event_id: eventId,
     group_id: groupId,
     status: 'pending',
     due_date: event.scheduled_at
   }
        |
3. Marca event_attendance.auto_charge_applied = true
        |
4. [Se group_pix_config.auto_generate_pix = true]
        |
5. Gera PIX automaticamente e envia notificação
        |
6. Usuário recebe notificação de cobrança pendente
```

---

## Operações com Undo (Janela de 8 segundos)

As operações de marcar como pago e cancelar cobrança suportam desfazer dentro de uma janela de 8 segundos.

### `markChargeAsPaidWithUndo` (`src/lib/undo.ts`)

**Processo:**
1. Atualiza `charges.status = 'paid'` e `paid_at = now()`
2. Cria `transactions` com `type: 'income'`
3. Atualiza `wallets.balance += amount`
4. Retorna um token de undo
5. Frontend exibe toast "Cobrança marcada como paga. [Desfazer]"
6. Se usuário clica "Desfazer" em até 8s: POST `/undo/:token`
7. Backend reverte: `status = 'pending'`, remove transaction, ajusta saldo

### `cancelChargeWithUndo` (`src/lib/undo.ts`)

**Processo:**
1. Atualiza `charges.status = 'cancelled'` e `cancelled_at = now()`
2. Retorna token de undo
3. Frontend exibe toast com opção de desfazer (8s)
4. Se desfeito: reverte `status = 'pending'`, limpa `cancelled_at`

---

## Arquivos de Biblioteca

### `src/lib/pix.ts`

Biblioteca de geração de BR Code EMV para pagamentos PIX.

**Funções exportadas:**

| Função | Descrição |
|--------|-----------|
| `generatePixCode(params)` | Gera o código PIX EMV completo |
| `buildEMVField(id, value)` | Constrói um campo EMV (ID + length + value) |
| `calculateCRC16(payload)` | Calcula o checksum CRC-16/CCITT-FALSE |
| `formatAmount(amount)` | Formata o valor em reais para o payload (sem vírgula) |

---

### `src/lib/pix-helpers.ts`

Funções auxiliares para manipulação e validação de dados PIX.

**Funções exportadas:**

| Função | Descrição |
|--------|-----------|
| `validatePixKey(key, type)` | Valida se a chave PIX é válida para o tipo informado |
| `formatPixKeyDisplay(key, type)` | Formata a chave para exibição (máscara de CPF, etc.) |
| `getPixKeyTypeLabel(type)` | Retorna label amigável do tipo de chave |
| `sanitizeTxId(txid)` | Sanitiza o ID de transação para o formato aceito pelo PIX |

---

### `src/lib/undo.ts`

Biblioteca de operações reversíveis com janela temporal.

**Funções exportadas:**

| Função | Descrição |
|--------|-----------|
| `markChargeAsPaidWithUndo(chargeId, groupId)` | Marca cobrança como paga com possibilidade de undo |
| `cancelChargeWithUndo(chargeId, groupId)` | Cancela cobrança com possibilidade de undo |
| `executeUndo(undoToken)` | Executa o desfazimento de uma operação |
| `createUndoToken(operation)` | Cria token de undo com TTL de 8 segundos |

---

## Notas de Implementação

- O saldo da carteira (`wallets.balance`) é recalculado de forma incremental a cada pagamento; não é recalculado do zero a cada consulta
- Cobranças com `event_id` preenchido foram geradas automaticamente pelo RSVP; cobranças sem `event_id` foram criadas manualmente pelo admin
- A geração de PIX não depende de nenhum gateway externo; o BR Code EMV é gerado localmente pela lib `pix.ts`
- O QR Code visual é gerado no frontend a partir do `brCode` usando uma biblioteca de QR Code (ex: `qrcode.react`)
- Split de pagamento (tabela `charge_splits`) está estruturado no banco mas a lógica completa de distribuição automática está em desenvolvimento
- O feature `split_pix` consome 15 créditos (ver módulo CREDITS)
