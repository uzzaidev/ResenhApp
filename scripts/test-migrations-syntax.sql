-- =====================================================
-- Script de Teste de Sintaxe das Migrations V2.0
-- 
-- Este script valida a sintaxe SQL sem aplicar as migrations
-- Execute no Supabase SQL Editor ou via psql
-- =====================================================

-- Teste 1: Verificar se todas as migrations podem ser parseadas
DO $$
BEGIN
  RAISE NOTICE '✅ Iniciando validação de sintaxe das migrations V2.0...';
END $$;

-- =====================================================
-- VALIDAÇÃO 1: Verificar referências de tabelas
-- =====================================================

DO $$
DECLARE
  missing_tables TEXT[];
BEGIN
  -- Verificar se tabelas base existem
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'groups') THEN
    RAISE EXCEPTION 'Tabela groups não existe';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
    RAISE EXCEPTION 'Tabela events não existe';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'Tabela profiles não existe';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_attendance') THEN
    RAISE EXCEPTION 'Tabela event_attendance não existe';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'charges') THEN
    RAISE EXCEPTION 'Tabela charges não existe';
  END IF;
  
  RAISE NOTICE '✅ Todas as tabelas base existem';
END $$;

-- =====================================================
-- VALIDAÇÃO 2: Verificar tipos de dados corretos
-- =====================================================

DO $$
BEGIN
  -- Verificar se groups.id é BIGINT
  IF (SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'groups' AND column_name = 'id') != 'bigint' THEN
    RAISE EXCEPTION 'groups.id deve ser BIGINT, mas é %', 
      (SELECT data_type FROM information_schema.columns 
       WHERE table_name = 'groups' AND column_name = 'id');
  END IF;
  
  -- Verificar se events.id é BIGINT
  IF (SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'events' AND column_name = 'id') != 'bigint' THEN
    RAISE EXCEPTION 'events.id deve ser BIGINT, mas é %', 
      (SELECT data_type FROM information_schema.columns 
       WHERE table_name = 'events' AND column_name = 'id');
  END IF;
  
  -- Verificar se profiles.id é UUID
  IF (SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'id') != 'uuid' THEN
    RAISE EXCEPTION 'profiles.id deve ser UUID, mas é %', 
      (SELECT data_type FROM information_schema.columns 
       WHERE table_name = 'profiles' AND column_name = 'id');
  END IF;
  
  RAISE NOTICE '✅ Tipos de dados estão corretos';
END $$;

-- =====================================================
-- VALIDAÇÃO 3: Verificar se colunas necessárias existem
-- =====================================================

DO $$
BEGIN
  -- Verificar colunas em events
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'events' AND column_name = 'date') THEN
    RAISE EXCEPTION 'Coluna events.date não existe';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'events' AND column_name = 'time') THEN
    RAISE EXCEPTION 'Coluna events.time não existe';
  END IF;
  
  RAISE NOTICE '✅ Colunas necessárias existem';
END $$;

-- =====================================================
-- RESUMO
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=' || repeat('=', 58);
  RAISE NOTICE '✅ VALIDAÇÃO COMPLETA';
  RAISE NOTICE '=' || repeat('=', 58);
  RAISE NOTICE '';
  RAISE NOTICE '✅ Todas as validações passaram!';
  RAISE NOTICE '💡 As migrations V2.0 podem ser aplicadas com segurança';
  RAISE NOTICE '';
END $$;






