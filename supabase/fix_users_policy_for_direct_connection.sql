-- =====================================================
-- FIX: Ajustar Policy para Permitir Inserção via Conexão Direta
-- =====================================================
-- Quando conectamos diretamente ao PostgreSQL (via SUPABASE_DB_URL),
-- não há contexto de autenticação (auth.uid() não existe).
-- A policy precisa permitir inserções sem autenticação.
-- =====================================================

-- Remover policy existente
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- Criar nova policy que permite inserção sem autenticação
-- (necessário para conexão direta via SUPABASE_DB_URL)
CREATE POLICY "Allow inserts without auth context"
ON users FOR INSERT
WITH CHECK (true);

-- Verificar se foi criada
SELECT 
  policyname,
  cmd,
  with_check,
  '✅ Policy atualizada' AS status
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public'
AND cmd = 'INSERT';

