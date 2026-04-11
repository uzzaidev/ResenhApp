-- =====================================================
-- Script: Verificar e Corrigir Problema de Profiles
-- Execute no Supabase SQL Editor
-- =====================================================

-- PASSO 1: Verificar qual tabela existe
DO $$
DECLARE
  profiles_exists BOOLEAN;
  users_exists BOOLEAN;
BEGIN
  -- Verificar se profiles existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'profiles'
  ) INTO profiles_exists;
  
  -- Verificar se users existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'users'
  ) INTO users_exists;
  
  RAISE NOTICE '';
  RAISE NOTICE '=' || repeat('=', 60);
  RAISE NOTICE 'VERIFICAÇÃO DE TABELAS DE USUÁRIOS';
  RAISE NOTICE '=' || repeat('=', 60);
  RAISE NOTICE '';
  
  IF profiles_exists THEN
    RAISE NOTICE '✅ Tabela PROFILES existe';
  ELSE
    RAISE NOTICE '❌ Tabela PROFILES NÃO existe';
  END IF;
  
  IF users_exists THEN
    RAISE NOTICE '✅ Tabela USERS existe';
  ELSE
    RAISE NOTICE '❌ Tabela USERS NÃO existe';
  END IF;
  
  RAISE NOTICE '';
  
  IF NOT profiles_exists AND users_exists THEN
    RAISE NOTICE '⚠️  ATENÇÃO: Profiles não existe, mas users existe!';
    RAISE NOTICE '💡 Solução: Aplicar migration 20260127000002_auth_profiles.sql primeiro';
    RAISE NOTICE '   OU alterar migrations V2.0 para usar users em vez de profiles';
  ELSIF NOT profiles_exists AND NOT users_exists THEN
    RAISE NOTICE '❌ ERRO: Nem profiles nem users existem!';
    RAISE NOTICE '💡 Solução: Aplicar migrations base primeiro';
  ELSIF profiles_exists THEN
    RAISE NOTICE '✅ Tudo OK! Profiles existe, pode aplicar migrations V2.0';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '=' || repeat('=', 60);
END $$;






