# 🐛 Mapeamento de Páginas Quebradas

**Data:** 2026-01-25  
**Status:** 🔴 Em Análise

---

## 📋 Resumo Executivo

Foram identificadas **3 páginas principais** que não estão funcionando corretamente:

1. ❌ `/groups/[groupId]/credits` - **404 Not Found**
2. ❌ `/rankings` - **ErrorBoundary acionado**
3. ❌ `/financeiro` - **ErrorBoundary acionado**

---

## 🔍 Análise Detalhada

### 1. ❌ `/groups/[groupId]/credits` - 404 Not Found

**Problema:**
- Página não existe no projeto
- Link presente no `Sidebar` (linha 200)
- URL: `/groups/temp-group-id/credits` ou `/groups/[groupId]/credits`

**Evidências:**
- ✅ API existe: `/api/credits/route.ts`
- ✅ Componente existe: `BuyCreditsModal`
- ❌ Página não existe: `src/app/groups/[groupId]/credits/page.tsx`

**Impacto:**
- Usuários não conseguem acessar a página de créditos
- Link no sidebar leva a 404

**Solução:**
- Criar `src/app/groups/[groupId]/credits/page.tsx`
- Implementar página para visualizar saldo e comprar créditos
- Integrar com `BuyCreditsModal` e API existente

---

### 2. ❌ `/rankings` - ErrorBoundary Acionado

**Problema:**
- ErrorBoundary está capturando erros na página
- Possível erro no SQL ou na query de rankings

**Arquivo:** `src/app/(dashboard)/rankings/page.tsx`

**Possíveis Causas:**

#### 2.1. Erro no SQL Query (linhas 62-116)
```sql
-- Query complexa com CTEs e múltiplos JOINs
WITH player_stats AS (
  SELECT ...
  FROM users u
  INNER JOIN group_members gm ON ...
  LEFT JOIN event_attendance ea ON ...
  LEFT JOIN events e ON ...
  WHERE ea.event_id IS NOT NULL  -- ⚠️ Pode retornar vazio
  GROUP BY ...
  HAVING COUNT(DISTINCT ea.event_id) > 0
)
```

**Problemas Potenciais:**
- `WHERE ea.event_id IS NOT NULL` pode filtrar todos os usuários se não houver eventos
- `HAVING COUNT(DISTINCT ea.event_id) > 0` pode retornar array vazio
- `RANDOM()` na linha 110 pode causar problemas em produção
- Casting de tipos pode falhar

#### 2.2. Erro no Casting de Tipos
```typescript
rankedPlayers = rankingResult as any; // ⚠️ Type assertion perigoso
```

#### 2.3. Erro no Cálculo de Métricas
```typescript
avgRating = rankedPlayers.reduce((sum, p) => sum + Number(p.rating), 0) / rankedPlayers.length;
// ⚠️ Divisão por zero se rankedPlayers.length === 0
```

**Solução:**
1. Adicionar try-catch mais específico
2. Validar se `rankedPlayers.length > 0` antes de calcular métricas
3. Remover `RANDOM()` e usar cálculo real de trend
4. Adicionar validação de tipos
5. Melhorar tratamento de erros

---

### 3. ❌ `/financeiro` - ErrorBoundary Acionado

**Problema:**
- ErrorBoundary está capturando erros na página
- Possível erro no SQL ou na query de cobranças

**Arquivo:** `src/app/(dashboard)/financeiro/page.tsx`

**Possíveis Causas:**

#### 3.1. Erro no SQL Query (linhas 75-92)
```sql
SELECT
  c.id,
  c.user_id,
  u.name as user_name,
  c.amount,
  c.description,
  c.due_date,
  c.paid_at,
  c.event_id,
  e.starts_at as event_date
FROM charges c
INNER JOIN users u ON c.user_id = u.id  -- ⚠️ INNER JOIN pode falhar se user não existir
LEFT JOIN events e ON c.event_id = e.id
WHERE c.group_id = ${groupId}  -- ⚠️ groupId pode ser null
ORDER BY c.due_date DESC, c.created_at DESC
LIMIT 50
```

**Problemas Potenciais:**
- `INNER JOIN users` pode falhar se `user_id` não existir na tabela `users`
- `groupId` pode ser `null` (mas há validação antes)
- `c.amount` pode ser `null` ou ter tipo incorreto
- `c.due_date` pode ser `null`

#### 3.2. Erro no Mapeamento de Dados (linhas 94-97)
```typescript
charges = (chargesResult as any[]).map((charge) => ({
  ...charge,
  event_name: charge.event_id ? `Treino - ${new Date(charge.event_date).toLocaleDateString('pt-BR')}` : null,
}));
// ⚠️ new Date() pode falhar se event_date for null ou inválido
```

#### 3.3. Erro no Cálculo de Métricas (linhas 105-126)
```typescript
charges.forEach((charge) => {
  totalCount++;
  const chargeAmount = Number(charge.amount) || 0;  // ⚠️ Pode ser NaN
  // ...
});
```

**Solução:**
1. Adicionar validação de `groupId` antes da query
2. Usar `LEFT JOIN` em vez de `INNER JOIN` para users
3. Validar tipos antes de calcular métricas
4. Adicionar try-catch mais específico
5. Validar datas antes de formatar

---

## 📊 Outras Páginas Verificadas

### ✅ Páginas Funcionando:
- `/dashboard` - ✅ Funcionando
- `/modalidades` - ✅ Funcionando
- `/atletas` - ✅ Funcionando
- `/treinos` - ✅ Funcionando (mas pode ter problemas similares)
- `/jogos` - ✅ Funcionando (mas pode ter problemas similares)
- `/frequencia` - ✅ Funcionando (mas pode ter problemas similares)

### ⚠️ Páginas com Possíveis Problemas:

#### `/treinos`
- Query SQL similar às outras
- Pode ter os mesmos problemas de validação

#### `/jogos`
- Query SQL similar às outras
- Pode ter os mesmos problemas de validação

#### `/frequencia`
- Usa fetch para API (linha 71) - pode falhar se API não estiver disponível
- Fallback para SQL direto (linha 84)
- Pode ter problemas de validação

---

## 🎯 Plano de Correção

### Prioridade Alta (Bloqueantes)

1. **Criar página `/groups/[groupId]/credits`**
   - Implementar página completa
   - Integrar com API existente
   - Adicionar loading states e error handling

2. **Corrigir `/rankings`**
   - Adicionar validações de tipos
   - Melhorar tratamento de erros
   - Remover `RANDOM()` e usar cálculo real
   - Adicionar fallback para array vazio

3. **Corrigir `/financeiro`**
   - Adicionar validações de tipos
   - Melhorar tratamento de erros
   - Validar dados antes de calcular métricas
   - Adicionar fallback para erros

### Prioridade Média (Melhorias)

4. **Melhorar tratamento de erros em todas as páginas**
   - Adicionar try-catch específicos
   - Validar tipos antes de usar
   - Adicionar fallbacks

5. **Adicionar loading states**
   - Usar `Suspense` ou loading states
   - Melhorar UX durante carregamento

6. **Adicionar validação de dados**
   - Validar `groupId` antes de queries
   - Validar tipos de dados retornados
   - Adicionar schemas Zod para validação

---

## 📝 Notas Técnicas

### Padrões de Erro Identificados:

1. **Type Assertions Perigosos:**
   ```typescript
   const result = sqlResult as any; // ⚠️ Perigoso
   ```

2. **Falta de Validação:**
   ```typescript
   const value = Number(data.field) || 0; // ⚠️ Pode ser NaN
   ```

3. **Divisão por Zero:**
   ```typescript
   const avg = sum / array.length; // ⚠️ Pode dividir por zero
   ```

4. **Datas Inválidas:**
   ```typescript
   new Date(data.date).toLocaleDateString(); // ⚠️ Pode falhar se date for null
   ```

5. **Queries SQL sem Validação:**
   ```typescript
   WHERE c.group_id = ${groupId} // ⚠️ groupId pode ser null
   ```

---

## 🔧 Recomendações

1. **Criar helper para validação de queries:**
   ```typescript
   function validateGroupId(groupId: string | null): asserts groupId is string {
     if (!groupId) throw new Error('groupId é obrigatório');
   }
   ```

2. **Criar helper para cálculos seguros:**
   ```typescript
   function safeAverage(array: number[]): number {
     return array.length > 0 ? array.reduce((a, b) => a + b, 0) / array.length : 0;
   }
   ```

3. **Adicionar ErrorBoundary específico para páginas:**
   - Criar ErrorBoundary por página
   - Mostrar mensagens específicas
   - Adicionar ações de retry

4. **Adicionar logging estruturado:**
   - Logar erros com contexto
   - Adicionar stack traces
   - Facilitar debugging

---

**Status:** 🔴 **3 páginas quebradas identificadas**  
**Próxima ação:** Criar página de créditos e corrigir erros nas páginas de rankings e financeiro

