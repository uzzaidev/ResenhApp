# 🔍 Debug Signup - Passo a Passo

**Guia prático para investigar o erro de signup**

---

## 🎯 PASSO 1: Verificar Logs do Vercel (5 min)

### 1.1 Acessar Logs

1. Ir em: https://vercel.com/dashboard
2. Selecionar projeto **ResenhApp**
3. Ir em: **Deployments** → Último deployment
4. Clicar em **Functions** (ou ver logs)

### 1.2 Procurar Erro

**Procurar por:**
- `/api/auth/signup`
- Erros relacionados a `users`
- Stack trace completo

**Copiar o erro completo** (será útil depois)

---

## 🎯 PASSO 2: Executar Script de Diagnóstico (2 min)

### 2.1 Acessar Supabase SQL Editor

1. Ir em: https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/sql/new
2. Ou: Dashboard → SQL Editor → New Query

### 2.2 Executar Script

1. Abrir arquivo: `supabase/debug_signup.sql`
2. Copiar TODO o conteúdo
3. Colar no SQL Editor
4. Clicar em **Run** (F5)

### 2.3 Analisar Resultados

**Verificar cada seção:**

1. **Tabela Status:**
   - ✅ Se diz "EXISTE" → OK
   - ❌ Se diz "NÃO EXISTE" → Aplicar migration

2. **Estrutura:**
   - Verificar se tem todas as colunas necessárias
   - Especialmente: `id`, `name`, `email`, `password_hash`

3. **RLS Status:**
   - ✅ Se diz "HABILITADO" → OK
   - ❌ Se diz "DESABILITADO" → Problema!

4. **Policies:**
   - Deve ter pelo menos 3 policies:
     - SELECT (qualquer um pode ler)
     - INSERT (API pode inserir)
     - UPDATE (usuários podem atualizar)

5. **Total de Usuários:**
   - Ver quantos já existem
   - Se 0, tabela está vazia (normal)

---

## 🎯 PASSO 3: Testar Inserção Manual (2 min)

### 3.1 Descomentar Teste

No arquivo `supabase/debug_signup.sql`, descomentar a seção 7:

```sql
INSERT INTO users (name, email, password_hash)
VALUES (
  'Test User Debug',
  'test-debug@example.com',
  '$2a$10$dummyhashfordebuggingpurposesonly'
)
RETURNING id, name, email, created_at;
```

### 3.2 Executar

1. Copiar apenas essa query
2. Colar no SQL Editor
3. Executar

### 3.3 Resultados Possíveis

**✅ Sucesso:**
- Retorna o usuário criado
- **Significa:** Tabela existe e RLS permite inserção
- **Problema:** Pode ser na API ou variáveis de ambiente

**❌ Erro "relation does not exist":**
- Tabela não existe
- **Solução:** Aplicar migration `20260127000000_legacy_users_table.sql`

**❌ Erro "permission denied":**
- RLS bloqueando
- **Solução:** Verificar/ajustar policies

**❌ Erro "duplicate key":**
- Email já existe
- **Solução:** Usar email diferente

---

## 🎯 PASSO 4: Verificar Variáveis de Ambiente (2 min)

### 4.1 No Vercel

1. Ir em: Settings → Environment Variables
2. Verificar se tem:

**Obrigatórias:**
- ✅ `SUPABASE_DB_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `AUTH_SECRET`

### 4.2 Testar Conexão

**No Supabase SQL Editor:**

```sql
-- Verificar se consegue conectar
SELECT 
  current_database() AS "Database",
  current_user AS "User",
  version() AS "PostgreSQL Version";
```

**Se funcionar:** Conexão OK ✅

---

## 🎯 PASSO 5: Adicionar Logs de Debug (Opcional)

### 5.1 Modificar API

Editar: `src/app/api/auth/signup/route.ts`

Adicionar logs antes do catch:

```typescript
} catch (error) {
  // Adicionar logs detalhados
  console.error('=== SIGNUP ERROR DETAILS ===');
  console.error('Error type:', error?.constructor?.name);
  console.error('Error message:', error?.message);
  console.error('Error stack:', error?.stack);
  console.error('Error full:', JSON.stringify(error, null, 2));
  
  // ... resto do código
}
```

### 5.2 Ver Logs

- **Local:** Terminal onde roda `pnpm run dev`
- **Vercel:** Functions logs

---

## 📊 INTERPRETAÇÃO DOS RESULTADOS

### Cenário 1: Tabela não existe

**Sintoma:** Script retorna "NÃO EXISTE"

**Solução:**
1. Aplicar migration: `supabase/migrations/20260127000000_legacy_users_table.sql`
2. Executar script de diagnóstico novamente
3. Testar signup

---

### Cenário 2: RLS bloqueando

**Sintoma:** 
- Tabela existe
- Inserção manual falha com "permission denied"
- Policies não têm INSERT

**Solução:**
1. Aplicar migration novamente (pode ter falhado)
2. Ou criar policy manualmente:

```sql
CREATE POLICY "Service role can insert users"
ON users FOR INSERT
WITH CHECK (true);
```

---

### Cenário 3: Variável de ambiente errada

**Sintoma:**
- Tabela existe
- RLS OK
- API retorna erro de conexão

**Solução:**
1. Verificar `SUPABASE_DB_URL` no Vercel
2. Verificar se senha está correta
3. Testar conexão manualmente

---

### Cenário 4: Email já existe

**Sintoma:**
- Erro "duplicate key value violates unique constraint"

**Solução:**
1. Usar email diferente
2. Ou verificar se usuário já existe:

```sql
SELECT * FROM users WHERE email = 'pedro.pagliarin@uzzai.com.br';
```

---

## ✅ CHECKLIST FINAL

- [ ] Logs do Vercel verificados
- [ ] Script de diagnóstico executado
- [ ] Tabela `users` existe
- [ ] RLS habilitado
- [ ] Policies configuradas (SELECT, INSERT, UPDATE)
- [ ] Inserção manual funciona
- [ ] Variáveis de ambiente corretas
- [ ] Erro específico identificado

---

## 🎯 PRÓXIMO PASSO

Após identificar o problema:

1. **Se tabela não existe:** Aplicar migration
2. **Se RLS bloqueando:** Ajustar policies
3. **Se variável errada:** Corrigir no Vercel
4. **Se outro erro:** Ver logs detalhados

---

**Documento criado:** 2026-01-27

