# 📚 Documentação de Funções SQL - V2.0

> **Data:** 2026-02-27  
> **Versão:** 2.0  
> **Status:** ✅ Implementado

---

## 📋 Índice

1. [Sistema de Modalidades](#sistema-de-modalidades)
2. [Sistema de Créditos](#sistema-de-créditos)
3. [Hierarquia de Grupos](#hierarquia-de-grupos)
4. [Treinos Recorrentes](#treinos-recorrentes)
5. [Check-in QR Code](#check-in-qr-code)
6. [Convocações](#convocações)
7. [Táticas Salvas](#táticas-salvas)
8. [Financeiro por Treino](#financeiro-por-treino)

---

## Sistema de Modalidades

### `get_group_modalities(p_group_id UUID)`

**Descrição:** Retorna todas as modalidades esportivas de um grupo.

**Parâmetros:**
- `p_group_id` (UUID): ID do grupo

**Retorno:**
```sql
TABLE (
  id UUID,
  name VARCHAR(50),
  description TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
```

**Exemplo de Uso:**
```sql
SELECT * FROM get_group_modalities('550e8400-e29b-41d4-a716-446655440000');
```

**Resultado:**
```
id                                   | name      | description | is_active | created_at
-------------------------------------|-----------|-------------|-----------|-------------------
a1b2c3d4-e5f6-...                   | Futebol   | Futebol 7   | true      | 2026-02-27 10:00
b2c3d4e5-f6a7-...                   | Vôlei     | Vôlei de Praia | true   | 2026-02-27 10:01
```

---

### `get_athlete_modalities(p_user_id UUID)`

**Descrição:** Retorna todas as modalidades em que um atleta está inscrito.

**Parâmetros:**
- `p_user_id` (UUID): ID do usuário (profile)

**Retorno:**
```sql
TABLE (
  modality_id UUID,
  modality_name VARCHAR(50),
  rating INTEGER,
  is_active BOOLEAN
)
```

**Exemplo de Uso:**
```sql
SELECT * FROM get_athlete_modalities('550e8400-e29b-41d4-a716-446655440000');
```

---

### `get_modality_athletes(p_modality_id UUID)`

**Descrição:** Retorna todos os atletas inscritos em uma modalidade.

**Parâmetros:**
- `p_modality_id` (UUID): ID da modalidade

**Retorno:**
```sql
TABLE (
  user_id UUID,
  user_name TEXT,
  rating INTEGER,
  is_active BOOLEAN
)
```

**Exemplo de Uso:**
```sql
SELECT * FROM get_modality_athletes('a1b2c3d4-e5f6-...');
```

---

## Sistema de Créditos

### `consume_credits(p_group_id UUID, p_amount INTEGER, p_feature VARCHAR(50), p_user_id UUID, p_event_id UUID DEFAULT NULL)`

**Descrição:** Consome créditos de um grupo para usar uma feature premium.

**Parâmetros:**
- `p_group_id` (UUID): ID do grupo
- `p_amount` (INTEGER): Quantidade de créditos a consumir
- `p_feature` (VARCHAR): Nome da feature ('recurring_training', 'qrcode_checkin', etc.)
- `p_user_id` (UUID): ID do usuário que está usando a feature
- `p_event_id` (UUID, opcional): ID do evento relacionado (se aplicável)

**Retorno:**
- `BOOLEAN`: `TRUE` se consumiu com sucesso, `FALSE` se créditos insuficientes

**Exemplo de Uso:**
```sql
-- Consumir 5 créditos para criar treino recorrente
SELECT consume_credits(
  '550e8400-e29b-41d4-a716-446655440000',  -- group_id
  5,                                        -- amount
  'recurring_training',                    -- feature
  'user-uuid-here',                        -- user_id
  'event-uuid-here'                        -- event_id (opcional)
);
```

**Comportamento:**
1. Verifica se grupo tem créditos suficientes
2. Se sim: debita créditos, registra transação, retorna `TRUE`
3. Se não: retorna `FALSE` (sem alterar saldo)

**Erros:**
- `Group not found` - Se grupo não existe

---

### `add_credits(p_group_id UUID, p_amount INTEGER, p_user_id UUID, p_package_id UUID DEFAULT NULL)`

**Descrição:** Adiciona créditos a um grupo (compra de créditos).

**Parâmetros:**
- `p_group_id` (UUID): ID do grupo
- `p_amount` (INTEGER): Quantidade de créditos a adicionar
- `p_user_id` (UUID): ID do usuário que está comprando
- `p_package_id` (UUID, opcional): ID do pacote comprado (se aplicável)

**Retorno:**
- `VOID` (sem retorno)

**Exemplo de Uso:**
```sql
-- Adicionar 100 créditos (compra do pacote básico)
SELECT add_credits(
  '550e8400-e29b-41d4-a716-446655440000',  -- group_id
  100,                                       -- amount
  'user-uuid-here',                         -- user_id
  'package-uuid-here'                       -- package_id (opcional)
);
```

**Comportamento:**
1. Adiciona créditos ao saldo do grupo
2. Incrementa `credits_purchased`
3. Registra transação do tipo 'purchase'

---

### `get_pix_code_for_group(p_group_id UUID)`

**Descrição:** Retorna o código Pix para um grupo, com prioridade: atlética (pai) > grupo.

**Parâmetros:**
- `p_group_id` (UUID): ID do grupo

**Retorno:**
- `TEXT`: Código Pix ou `NULL` se não encontrado

**Exemplo de Uso:**
```sql
SELECT get_pix_code_for_group('550e8400-e29b-41d4-a716-446655440000');
```

**Comportamento:**
1. Verifica se grupo tem `parent_group_id`
2. Se sim: busca Pix code da atlética pai
3. Se não encontrado ou não tem pai: busca Pix code do próprio grupo
4. Retorna código encontrado ou `NULL`

**Exemplo de Resultado:**
```
get_pix_code_for_group
----------------------
00020126360014BR.GOV.BCB.PIX...
```

---

### `can_manage_group(p_user_id UUID, p_group_id UUID)`

**Descrição:** Verifica se um usuário pode gerenciar um grupo (como admin do grupo ou da atlética pai).

**Parâmetros:**
- `p_user_id` (UUID): ID do usuário
- `p_group_id` (UUID): ID do grupo

**Retorno:**
- `BOOLEAN`: `TRUE` se pode gerenciar, `FALSE` caso contrário

**Exemplo de Uso:**
```sql
SELECT can_manage_group('user-uuid', 'group-uuid');
```

**Comportamento:**
1. Verifica se usuário é admin do grupo
2. Se não, verifica se grupo tem `parent_group_id`
3. Se sim, verifica se usuário é admin da atlética pai
4. Retorna `TRUE` se qualquer condição for verdadeira

---

## Treinos Recorrentes

### `generate_recurring_events(p_template_event_id UUID, p_start_date DATE, p_end_date DATE DEFAULT NULL, p_max_occurrences INTEGER DEFAULT NULL)`

**Descrição:** Gera eventos recorrentes a partir de um template.

**Parâmetros:**
- `p_template_event_id` (UUID): ID do evento template (deve ter `is_recurring = TRUE`)
- `p_start_date` (DATE): Data de início para gerar ocorrências
- `p_end_date` (DATE, opcional): Data final (máximo)
- `p_max_occurrences` (INTEGER, opcional): Número máximo de ocorrências

**Retorno:**
- `INTEGER`: Número de eventos criados

**Exemplo de Uso:**
```sql
-- Gerar eventos semanais até 31/12/2026
SELECT generate_recurring_events(
  'event-template-uuid',
  '2026-03-01',
  '2026-12-31',
  NULL  -- sem limite de ocorrências
);
```

**Padrões Suportados:**
- `weekly` - Semanal (ex: toda quinta-feira)
- `biweekly` - Quinzenal
- `monthly` - Mensal

**Estrutura de `recurrence_pattern` (JSONB):**
```json
{
  "type": "weekly",
  "day": "thursday",
  "interval": 1,
  "endDate": "2026-12-31",
  "count": 10
}
```

---

### `get_next_recurrence_date(p_template_event_id UUID)`

**Descrição:** Retorna a próxima data de ocorrência para um evento recorrente.

**Parâmetros:**
- `p_template_event_id` (UUID): ID do evento template

**Retorno:**
- `DATE`: Próxima data ou `NULL` se não encontrado

**Exemplo de Uso:**
```sql
SELECT get_next_recurrence_date('event-template-uuid');
```

---

## Check-in QR Code

### `create_event_qrcode(p_event_id UUID, p_user_id UUID, p_expires_in_minutes INTEGER DEFAULT 60)`

**Descrição:** Cria um QR code para check-in em um evento.

**Parâmetros:**
- `p_event_id` (UUID): ID do evento
- `p_user_id` (UUID): ID do usuário criador
- `p_expires_in_minutes` (INTEGER, opcional): Minutos até expirar (padrão: 60)

**Retorno:**
```sql
TABLE (
  qr_code_id UUID,
  qr_code_data TEXT,
  qr_code_hash TEXT,
  expires_at TIMESTAMPTZ
)
```

**Exemplo de Uso:**
```sql
SELECT * FROM create_event_qrcode(
  'event-uuid',
  'user-uuid',
  120  -- expira em 2 horas
);
```

---

### `process_qrcode_checkin(p_qr_code_hash TEXT, p_user_id UUID)`

**Descrição:** Processa o check-in de um usuário via QR code.

**Parâmetros:**
- `p_qr_code_hash` (TEXT): Hash do QR code escaneado
- `p_user_id` (UUID): ID do usuário fazendo check-in

**Retorno:**
```sql
TABLE (
  success BOOLEAN,
  message TEXT,
  event_id UUID,
  checked_in_at TIMESTAMPTZ
)
```

**Exemplo de Uso:**
```sql
SELECT * FROM process_qrcode_checkin('abc123hash', 'user-uuid');
```

**Validações:**
- QR code existe e está ativo
- QR code não expirou
- QR code não excedeu limite de usos
- Usuário ainda não fez check-in neste evento

**Mensagens de Retorno:**
- `'Check-in realizado com sucesso'` - Sucesso
- `'QR Code não encontrado ou inativo'` - QR code inválido
- `'QR Code expirado'` - Expirado
- `'QR Code já foi utilizado'` - Limite de usos excedido
- `'Usuário já fez check-in neste evento'` - Check-in duplicado

---

### `get_event_checkins(p_event_id UUID)`

**Descrição:** Retorna todos os check-ins de um evento.

**Parâmetros:**
- `p_event_id` (UUID): ID do evento

**Retorno:**
```sql
TABLE (
  user_id UUID,
  user_name TEXT,
  checkin_method VARCHAR(20),
  checked_in_at TIMESTAMPTZ
)
```

**Exemplo de Uso:**
```sql
SELECT * FROM get_event_checkins('event-uuid');
```

---

## Convocações

### `get_convocation_stats(p_convocation_id UUID)`

**Descrição:** Retorna estatísticas de uma convocação (confirmados, pendentes, etc.).

**Parâmetros:**
- `p_convocation_id` (UUID): ID da convocação

**Retorno:**
```sql
TABLE (
  total_invited INTEGER,
  confirmed_count INTEGER,
  pending_count INTEGER,
  declined_count INTEGER,
  completion_percentage DECIMAL(5,2)
)
```

**Exemplo de Uso:**
```sql
SELECT * FROM get_convocation_stats('convocation-uuid');
```

---

### `is_convocation_complete(p_convocation_id UUID)`

**Descrição:** Verifica se uma convocação está completa (todas as posições preenchidas).

**Parâmetros:**
- `p_convocation_id` (UUID): ID da convocação

**Retorno:**
- `BOOLEAN`: `TRUE` se completa, `FALSE` caso contrário

**Exemplo de Uso:**
```sql
SELECT is_convocation_complete('convocation-uuid');
```

---

## Táticas Salvas

### `get_group_tactics(p_group_id UUID, p_modality_id UUID DEFAULT NULL)`

**Descrição:** Retorna táticas salvas de um grupo, opcionalmente filtradas por modalidade.

**Parâmetros:**
- `p_group_id` (UUID): ID do grupo
- `p_modality_id` (UUID, opcional): ID da modalidade (filtro)

**Retorno:**
```sql
TABLE (
  id UUID,
  name VARCHAR(100),
  modality_id UUID,
  modality_name VARCHAR(50),
  is_public BOOLEAN,
  created_at TIMESTAMPTZ
)
```

**Exemplo de Uso:**
```sql
-- Todas as táticas do grupo
SELECT * FROM get_group_tactics('group-uuid');

-- Apenas táticas de futebol
SELECT * FROM get_group_tactics('group-uuid', 'modality-uuid');
```

---

### `get_public_tactics(p_modality_id UUID DEFAULT NULL)`

**Descrição:** Retorna táticas públicas (de todos os grupos), opcionalmente filtradas por modalidade.

**Parâmetros:**
- `p_modality_id` (UUID, opcional): ID da modalidade (filtro)

**Retorno:**
```sql
TABLE (
  id UUID,
  name VARCHAR(100),
  modality_id UUID,
  modality_name VARCHAR(50),
  group_id UUID,
  group_name TEXT,
  created_at TIMESTAMPTZ
)
```

**Exemplo de Uso:**
```sql
-- Todas as táticas públicas
SELECT * FROM get_public_tactics();

-- Apenas táticas públicas de futebol
SELECT * FROM get_public_tactics('modality-uuid');
```

---

## Financeiro por Treino

### `get_training_payment_summary(p_event_id UUID)`

**Descrição:** Retorna resumo de pagamentos de um treino.

**Parâmetros:**
- `p_event_id` (UUID): ID do evento (treino)

**Retorno:**
```sql
TABLE (
  event_id UUID,
  event_name TEXT,
  event_date DATE,
  confirmed_count INTEGER,
  expected_amount DECIMAL(10,2),
  received_amount DECIMAL(10,2),
  paid_count INTEGER,
  pending_count INTEGER,
  payment_percentage DECIMAL(5,2),
  payment_status TEXT
)
```

**Exemplo de Uso:**
```sql
SELECT * FROM get_training_payment_summary('event-uuid');
```

**Status Possíveis:**
- `'no_attendance'` - Nenhum confirmado
- `'unpaid'` - Ninguém pagou
- `'partially_paid'` - Alguns pagaram
- `'fully_paid'` - Todos pagaram

---

### `get_training_pending_payments(p_event_id UUID)`

**Descrição:** Retorna lista de usuários com pagamentos pendentes em um treino.

**Parâmetros:**
- `p_event_id` (UUID): ID do evento (treino)

**Retorno:**
```sql
TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  amount DECIMAL(10,2),
  charge_id UUID
)
```

**Exemplo de Uso:**
```sql
SELECT * FROM get_training_pending_payments('event-uuid');
```

---

### `create_training_charge(p_event_id UUID, p_amount_per_person DECIMAL(10,2), p_user_id UUID, p_description TEXT DEFAULT NULL)`

**Descrição:** Cria uma cobrança para um treino baseada nos confirmados.

**Parâmetros:**
- `p_event_id` (UUID): ID do evento (treino)
- `p_amount_per_person` (DECIMAL): Valor por pessoa
- `p_user_id` (UUID): ID do usuário criador
- `p_description` (TEXT, opcional): Descrição da cobrança

**Retorno:**
- `UUID`: ID da cobrança criada

**Exemplo de Uso:**
```sql
SELECT create_training_charge(
  'event-uuid',
  15.00,  -- R$ 15,00 por pessoa
  'user-uuid',
  'Treino de quinta-feira'
);
```

**Comportamento:**
1. Conta quantos confirmaram (`event_attendance.status = 'yes'`)
2. Cria cobrança no valor `amount_per_person * confirmed_count`
3. Associa cobrança ao evento (`charges.event_id`)
4. Retorna ID da cobrança criada

---

## 📝 Notas Importantes

### Ordem de Parâmetros

Todas as funções seguem a regra PostgreSQL:
- **Parâmetros obrigatórios** (sem DEFAULT) → Primeiro
- **Parâmetros opcionais** (com DEFAULT) → Por último

### Tipos de Dados

- `groups.id` e `events.id` são **UUID** (não BIGINT)
- `profiles.id` é **UUID**
- `charges.id` pode ser **UUID** ou **BIGINT** (depende do schema)

### Tratamento de Erros

Funções retornam:
- `BOOLEAN` para sucesso/falha
- `TABLE` para listas
- `TEXT` ou `UUID` para valores únicos
- `EXCEPTION` para erros críticos

---

**Última atualização:** 2026-02-27  
**Versão:** 2.0  
**Status:** ✅ Todas as funções implementadas e testadas


