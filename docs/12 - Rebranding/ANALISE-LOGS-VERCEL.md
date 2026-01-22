# 📊 Análise dos Logs do Vercel

**Data:** 2026-01-27  
**Erro:** 500 em `/api/auth/signup`  
**Mensagem:** "Erro ao criar usuário"

---

## 🔍 OBSERVAÇÕES DOS LOGS

### Erros Identificados

**3 tentativas de signup falharam:**
- `15:01:05.52` - POST `/api/auth/signup` - 500
- `15:00:41.56` - POST `/api/auth/signup` - 500  
- `15:00:29.68` - POST `/api/auth/signup` - 500

**Mensagem de erro:**
```json
{
  "level": 50,
  "time": "...",
  "pid": 4,
  "hostname": "169.254.80.127",
  "error": {},
  "msg": "Erro ao criar usuário"
}
```

**Observação importante:**
- O campo `"error": {}` está **vazio**
- Isso significa que o erro não está sendo capturado corretamente
- Precisamos melhorar o logging

---

## 🐛 POSSÍVEIS CAUSAS

### 1. Tabela `users` não existe (MAIS PROVÁVEL)

**Sintoma:**
- Erro 500 genérico
- Mensagem "Erro ao criar usuário"
- `error: {}` vazio

**Como verificar:**
```sql
-- No Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';
```

**Solução:**
- Aplicar migration: `supabase/migrations/20260127000000_legacy_users_table.sql`

---

### 2. RLS bloqueando inserção

**Sintoma:**
- Erro 500
- Pode ter mensagem de "permission denied"

**Como verificar:**
```sql
-- Verificar policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';
```

**Solução:**
- Verificar se tem policy de INSERT
- Se não tiver, criar:

```sql
CREATE POLICY "Service role can insert users"
ON users FOR INSERT
WITH CHECK (true);
```

---

### 3. Erro de conexão com banco

**Sintoma:**
- Erro 500
- Timeout ou connection refused

**Como verificar:**
- Verificar variável `SUPABASE_DB_URL` no Vercel
- Verificar se senha está correta

---

### 4. Erro SQL (constraint, tipo, etc)

**Sintoma:**
- Erro 500
- Pode ter mensagem específica de SQL

**Como verificar:**
- Ver logs completos do Vercel
- Verificar estrutura da tabela

---

## 🔧 MELHORAR LOGGING

### Modificar API para Logs Melhores

Editar `src/app/api/auth/signup/route.ts`:

```typescript
} catch (error) {
  // Log detalhado do erro
  logger.error({ 
    error: {
      name: error?.constructor?.name,
      message: error?.message,
      stack: error?.stack,
      // Se for erro do SQL, capturar detalhes
      ...(error as any)?.code && { code: (error as any).code },
      ...(error as any)?.detail && { detail: (error as any).detail },
      ...(error as any)?.hint && { hint: (error as any).hint },
    },
    email: email?.toLowerCase(),
    name: name
  }, "Erro ao criar usuário");

  return NextResponse.json(
    { error: "Erro ao criar conta. Tente novamente." },
    { status: 500 }
  );
}
```

---

## ✅ AÇÃO IMEDIATA

### 1. Aplicar Migration (SE AINDA NÃO FEZ)

1. Acessar: https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/sql/new
2. Copiar conteúdo de: `supabase/migrations/20260127000000_legacy_users_table.sql`
3. Executar no SQL Editor
4. Verificar se criou com sucesso

### 2. Executar Script de Diagnóstico

1. Executar: `supabase/debug_signup.sql`
2. Verificar resultados
3. Compartilhar resultados

### 3. Testar Inserção Manual

```sql
INSERT INTO users (name, email, password_hash)
VALUES (
  'Test User',
  'test@example.com',
  '$2a$10$dummyhash'
)
RETURNING id, name, email;
```

---

## 📋 CHECKLIST

- [ ] Migration aplicada no Supabase
- [ ] Script de diagnóstico executado
- [ ] Tabela `users` existe
- [ ] RLS policies configuradas
- [ ] Inserção manual funciona
- [ ] Logs melhorados no código
- [ ] Testar signup novamente

---

**Documento criado:** 2026-01-27

