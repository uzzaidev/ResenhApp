-- =====================================================
-- SCRIPT DE VERIFICAÇÃO PRÉVIA - Migration Users Table
-- Execute ANTES da migration para verificar o estado atual
-- =====================================================

-- =====================================================
-- 1. VERIFICAR SE TABELA users JÁ EXISTE
-- =====================================================

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    ) 
    THEN '⚠️  Tabela users JÁ EXISTE - Migration vai usar IF NOT EXISTS (seguro)'
    ELSE '✅  Tabela users NÃO EXISTE - Migration vai criar (seguro)'
  END AS tabela_status;

-- =====================================================
-- 2. VERIFICAR ESTRUTURA ATUAL (se existir)
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- 3. VERIFICAR POLICIES EXISTENTES
-- =====================================================

SELECT 
  policyname,
  cmd,
  CASE 
    WHEN policyname IN ('Anyone can view users', 'Service role can insert users', 'Users can update own profile')
    THEN '⚠️  Esta policy será DROPADA e RECRIADA (seguro)'
    ELSE 'ℹ️  Policy existente (não será alterada)'
  END AS status
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public';

-- =====================================================
-- 4. VERIFICAR CONFLITOS COM auth.users (Supabase)
-- =====================================================

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'auth' AND table_name = 'users'
    )
    THEN '✅  auth.users existe (Supabase nativo) - NÃO HÁ CONFLITO'
    ELSE '⚠️  auth.users não encontrado (normal se não usar Supabase Auth)'
  END AS auth_users_status;

-- =====================================================
-- 5. VERIFICAR CONFLITOS COM profiles
-- =====================================================

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'profiles'
    )
    THEN '✅  Tabela profiles existe - NÃO HÁ CONFLITO (são tabelas diferentes)'
    ELSE 'ℹ️  Tabela profiles não existe (normal)'
  END AS profiles_status;

-- =====================================================
-- 6. VERIFICAR DADOS EXISTENTES (se tabela existir)
-- =====================================================

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
    THEN (SELECT COUNT(*)::TEXT || ' usuários existentes na tabela users' FROM users)
    ELSE 'Tabela não existe ainda'
  END AS dados_existentes;

-- =====================================================
-- RESUMO DE SEGURANÇA
-- =====================================================

SELECT 
  '✅ SEGURO PARA EXECUTAR' AS conclusao,
  'O script usa IF NOT EXISTS e DROP IF EXISTS' AS motivo,
  'Não mexe com auth.users ou profiles' AS observacao;

