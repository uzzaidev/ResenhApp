# 🚀 Aplicar Migration: Tabela Users

**Problema:** Erro ao criar conta porque tabela `users` não existe no Supabase.

---

## ⚡ SOLUÇÃO RÁPIDA (2 minutos)

### 1. Acessar Supabase SQL Editor

1. Ir em: https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/sql/new
2. Ou: Dashboard → SQL Editor → New Query

### 2. Copiar e Colar o SQL

Copiar TODO o conteúdo do arquivo:
```
supabase/migrations/20260127000000_legacy_users_table.sql
```

### 3. Executar

1. Colar no SQL Editor
2. Clicar em **Run** (ou pressionar F5)
3. Aguardar execução (deve mostrar "Success")

### 4. Verificar

Executar no SQL Editor:

```sql
SELECT * FROM users LIMIT 1;
```

**Resultado esperado:** (nenhum erro, pode retornar vazio)

### 5. Testar Signup

1. Acessar: `https://resenhapp.uzzai.com.br/auth/signup`
2. Preencher formulário
3. Clicar em "Criar conta grátis"
4. **Deve funcionar!** ✅

---

## 📋 O QUE A MIGRATION FAZ

1. ✅ Cria tabela `users` com campos necessários
2. ✅ Cria índices para performance
3. ✅ Configura RLS (Row Level Security)
4. ✅ Permite inserção via API (signup)

---

## 🔍 VERIFICAÇÃO ADICIONAL

### Verificar Tabela

```sql
-- Ver estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

### Verificar RLS

```sql
-- Ver políticas RLS
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';
```

---

## ⚠️ IMPORTANTE

### Duas Tabelas de Usuários

Agora temos:
- **`users`** - Para NextAuth (legacy, mas funcional)
- **`profiles`** - Para Supabase Auth (futuro)

**Por enquanto, `users` resolve o problema de signup!**

---

## ✅ RESULTADO

Após aplicar:
- ✅ Tabela `users` criada
- ✅ Signup funcionando
- ✅ Usuários podem criar conta
- ✅ Login funcionando

---

**Documento criado:** 2026-01-27

