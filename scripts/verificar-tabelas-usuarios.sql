-- =====================================================
-- Script para verificar quais tabelas de usuários existem
-- Execute no Supabase SQL Editor ANTES de aplicar migrations V2.0
-- =====================================================

-- Verificar se tabela profiles existe
SELECT 
  'profiles' AS tabela,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles')
    THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE'
  END AS status,
  (SELECT data_type FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'id' LIMIT 1) AS id_tipo;

-- Verificar se tabela users existe
SELECT 
  'users' AS tabela,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')
    THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE'
  END AS status,
  (SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id' LIMIT 1) AS id_tipo;

-- Verificar se auth.users existe (Supabase Auth)
SELECT 
  'auth.users' AS tabela,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users')
    THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE'
  END AS status,
  'UUID' AS id_tipo;

-- Resumo
SELECT 
  'RESUMO' AS tipo,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'profiles') AS profiles_existe,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users') AS users_existe,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') AS auth_users_existe;


