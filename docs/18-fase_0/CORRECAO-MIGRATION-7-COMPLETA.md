# 🔧 Correção Completa: Migration 7 - Financial by Training

> **Data:** 2026-02-27  
> **Status:** ✅ **TODAS AS CORREÇÕES APLICADAS**

---

## 🐛 PROBLEMAS IDENTIFICADOS E CORRIGIDOS

### 1. ❌ Tabela `charge_splits` não existe
- **Erro:** `relation "charge_splits" does not exist`
- **Correção:** Removido `LEFT JOIN charge_splits` da view `v_training_payment_details`
- **Solução:** Usar apenas dados de `charges` (schema antigo)

### 2. ❌ Coluna `amount` não existe
- **Erro:** `column c.amount does not exist`
- **Correção:** Usar apenas `amount_cents` (schema antigo)
- **Solução:** Converter `amount_cents / 100.0` para decimal

### 3. ❌ Colunas `total_paid`, `paid_count`, `pending_count` não existem
- **Correção:** Usar valores placeholder (0) até migration `financial_system` ser aplicada
- **Solução:** Simplificar views para funcionar com schema antigo

### 4. ❌ Tipo `payment_status_type` não existe
- **Erro:** `type "payment_status_type" does not exist`
- **Correção:** Usar `'pending'` como string (schema antigo)
- **Solução:** Remover cast para enum inexistente

### 5. ❌ Tipo de retorno incorreto (`BIGINT` vs `UUID`)
- **Correção:** `create_training_charge` retorna `UUID` (schema antigo)
- **Solução:** Alterar tipo de retorno e variável `charge_id`

---

## ✅ CORREÇÕES APLICADAS

### View `v_training_payments`
- ✅ Usa apenas `amount_cents` (convertido para decimal)
- ✅ Valores placeholder para campos que não existem
- ✅ Status simplificado (no_attendance, no_charge, pending)

### View `v_training_payment_details`
- ✅ Removido `LEFT JOIN charge_splits`
- ✅ Usa apenas dados de `charges`
- ✅ `paid_amount` sempre 0 (não existe no schema antigo)

### Função `create_training_charge`
- ✅ Usa `amount_cents` em vez de `amount`
- ✅ Usa `type` em vez de `description`
- ✅ Retorna `UUID` em vez de `BIGINT`
- ✅ Usa `'pending'` como string em vez de enum
- ✅ Remove referências a `quantity`, `split_type`, `split_config`

---

## 📋 ESTRUTURA DO SCHEMA ANTIGO

### Tabela `charges` (schema antigo):
```sql
CREATE TABLE charges (
  id UUID PRIMARY KEY,
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,  -- Não usado nesta migration
  type VARCHAR(20),        -- 'monthly', 'daily', 'fine', 'other'
  amount_cents INTEGER NOT NULL,  -- Valor em centavos
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'paid', 'canceled'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Colunas que NÃO existem:**
- ❌ `amount` (DECIMAL)
- ❌ `description` (TEXT)
- ❌ `quantity` (INTEGER)
- ❌ `total_paid` (DECIMAL)
- ❌ `paid_count` (INTEGER)
- ❌ `pending_count` (INTEGER)
- ❌ `split_type`, `split_config`
- ❌ `created_by` (UUID)

**Tabelas que NÃO existem:**
- ❌ `charge_splits`
- ❌ `transactions`
- ❌ `wallets`

---

## 🎯 COMPATIBILIDADE

### Schema Antigo (Atual)
- ✅ Views funcionam com dados básicos
- ✅ Função `create_training_charge` cria charges no formato antigo
- ⚠️ Funcionalidades avançadas (splits, pagamentos detalhados) não disponíveis

### Schema Novo (Após `financial_system`)
- ⚠️ Views precisarão ser atualizadas para usar novas colunas
- ⚠️ Função `create_training_charge` precisará ser atualizada

---

## 📝 NOTAS IMPORTANTES

1. **Esta migration funciona com o schema antigo**
2. **Para funcionalidade completa, aplicar `20260204000001_financial_system.sql` primeiro**
3. **Views retornam valores placeholder (0) para campos não disponíveis**
4. **Status de pagamento simplificado (pending/paid baseado apenas em `charges.status`)**

---

## ✅ VALIDAÇÃO

- ✅ Sem referências a `charge_splits`
- ✅ Usa apenas `amount_cents`
- ✅ Tipos corretos (UUID para charges.id)
- ✅ Sem referências a enums inexistentes
- ✅ Views simplificadas mas funcionais

---

**Última atualização:** 2026-02-27  
**Status:** ✅ Pronto para aplicação no schema antigo






