-- =====================================================
-- SCRIPT DE DIAGNÓSTICO: Erro no Signup
-- Execute no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. VERIFICAR SE TABELA EXISTE
-- =====================================================

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    ) 
    THEN '✅ Tabela users EXISTE'
    ELSE '❌ Tabela users NÃO EXISTE - APLICAR MIGRATION!'
  END AS tabela_status;

-- =====================================================
-- 2. VERIFICAR ESTRUTURA DA TABELA
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- =====================================================
-- 3. VERIFICAR RLS (Row Level Security)
-- =====================================================

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'users' 
      AND rowsecurity = true
    )
    THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS DESABILITADO'
  END AS rls_status;

-- =====================================================
-- 4. VERIFICAR POLICIES RLS
-- =====================================================

SELECT 
  policyname AS "Nome da Policy",
  cmd AS "Comando",
  CASE 
    WHEN qual IS NOT NULL THEN '✅ Tem USING'
    ELSE '❌ Sem USING'
  END AS "USING Clause",
  CASE 
    WHEN with_check IS NOT NULL THEN '✅ Tem WITH CHECK'
    ELSE '❌ Sem WITH CHECK'
  END AS "WITH CHECK Clause",
  qual AS "USING (SQL)",
  with_check AS "WITH CHECK (SQL)"
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- =====================================================
-- 5. VERIFICAR ÍNDICES
-- =====================================================

SELECT 
  indexname AS "Nome do Índice",
  indexdef AS "Definição"
FROM pg_indexes
WHERE tablename = 'users'
ORDER BY indexname;

-- =====================================================
-- 6. CONTAR USUÁRIOS EXISTENTES
-- =====================================================

SELECT 
  COUNT(*) AS "Total de Usuários",
  COUNT(DISTINCT email) AS "Emails Únicos"
FROM users;

-- =====================================================
-- 7. TESTAR INSERÇÃO (SIMULA API)
-- =====================================================
-- Descomente para testar inserção manual

/*
INSERT INTO users (name, email, password_hash)
VALUES (
  'Test User Debug',
  'test-debug@example.com',
  '$2a$10$dummyhashfordebuggingpurposesonly'
)
RETURNING id, name, email, created_at;
*/

-- =====================================================
-- 8. VERIFICAR ÚLTIMOS USUÁRIOS CRIADOS
-- =====================================================

SELECT 
  id,
  name,
  email,
  created_at,
  email_verified
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- 9. VERIFICAR CONSTRAINTS
-- =====================================================

SELECT
  conname AS "Nome da Constraint",
  contype AS "Tipo",
  pg_get_constraintdef(oid) AS "Definição"
FROM pg_constraint
WHERE conrelid = 'users'::regclass
ORDER BY contype, conname;

-- =====================================================
-- 10. VERIFICAR PERMISSÕES
-- =====================================================

SELECT 
  grantee AS "Usuário/Role",
  privilege_type AS "Privilégio",
  is_grantable AS "Pode Conceder"
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY grantee, privilege_type;

