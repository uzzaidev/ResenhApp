# 🔧 Fix: Erro ao Criar Conta no Signup

**Erro:** "Erro ao criar conta. Tente novamente."

---

## 🐛 PROBLEMA

O código de signup está tentando inserir na tabela `users`, mas essa tabela não existe no Supabase. O Supabase usa:
- `auth.users` (gerenciado pelo Supabase Auth)
- `profiles` (extensão de auth.users)

Mas o código NextAuth precisa de uma tabela `users` para funcionar.

---

## ✅ SOLUÇÃO

Criar a tabela `users` no Supabase para compatibilidade com NextAuth.

---

## 📋 PASSO A PASSO

### 1. Aplicar Migration no Supabase

1. Acessar: https://app.supabase.com/project/ujrvfkkkssfdhwizjucq/sql/new
2. Copiar o conteúdo do arquivo: `supabase/migrations/20260127000000_legacy_users_table.sql`
3. Colar no SQL Editor
4. Clicar em **Run** (ou F5)

### 2. Verificar se Funcionou

Executar no SQL Editor:

```sql
SELECT * FROM users LIMIT 1;
```

**Deve retornar:** (nenhum resultado, mas sem erro)

### 3. Testar Signup Novamente

1. Acessar: `https://resenhapp.uzzai.com.br/auth/signup`
2. Preencher o formulário
3. Clicar em "Criar conta grátis"
4. **Deve funcionar agora!** ✅

---

## 🔍 VERIFICAÇÃO

### Verificar Tabela Criada

```sql
-- Verificar se tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- Verificar estrutura
\d users
```

### Verificar RLS Policies

```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'users';
```

---

## 📝 O QUE A MIGRATION FAZ

1. **Cria tabela `users`:**
   - `id` (UUID)
   - `name` (VARCHAR)
   - `email` (VARCHAR, UNIQUE)
   - `password_hash` (TEXT)
   - `email_verified` (TIMESTAMPTZ)
   - `image` (TEXT)
   - Timestamps

2. **Cria índices:**
   - Índice em `email` (para buscas rápidas)
   - Índice em `email_verified`

3. **Configura RLS:**
   - Qualquer um pode ler (para perfis públicos)
   - API pode inserir (para signup)
   - Usuários podem atualizar próprio perfil

---

## ⚠️ IMPORTANTE

### Duas Tabelas de Usuários

Agora temos **duas tabelas de usuários**:

1. **`users`** (Legacy - NextAuth)
   - Usada pelo NextAuth para autenticação
   - Criada via `/api/auth/signup`
   - Compatível com código existente

2. **`profiles`** (Supabase - Futuro)
   - Extensão de `auth.users`
   - Usada para funcionalidades avançadas
   - Pode ser integrada depois

### Próximos Passos (Opcional)

No futuro, podemos:
1. Integrar `users` com `profiles`
2. Sincronizar dados entre as duas tabelas
3. Migrar completamente para Supabase Auth

**Por enquanto, a tabela `users` resolve o problema!**

---

## ✅ RESULTADO ESPERADO

Após aplicar a migration:

1. ✅ Tabela `users` criada
2. ✅ RLS configurado
3. ✅ Signup funcionando
4. ✅ Usuários podem criar conta

---

**Documento criado:** 2026-01-27

