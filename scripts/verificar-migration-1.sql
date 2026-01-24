-- =====================================================
-- Script de Verificação - Migration 1: Sport Modalities
-- Execute APÓS aplicar a migration no Supabase SQL Editor
-- =====================================================

-- Verificar se tabela foi criada
SELECT 
  'Tabela sport_modalities' AS verificação,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sport_modalities')
    THEN '✅ CRIADA'
    ELSE '❌ NÃO ENCONTRADA'
  END AS status;

-- Verificar colunas
SELECT 
  'Colunas da tabela' AS verificação,
  COUNT(*) AS total_colunas,
  STRING_AGG(column_name, ', ' ORDER BY column_name) AS colunas
FROM information_schema.columns 
WHERE table_name = 'sport_modalities';

-- Verificar índices
SELECT 
  'Índices criados' AS verificação,
  COUNT(*) AS total_indices,
  STRING_AGG(indexname, ', ' ORDER BY indexname) AS indices
FROM pg_indexes
WHERE tablename = 'sport_modalities';

-- Verificar função
SELECT 
  'Função get_group_modalities' AS verificação,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_group_modalities')
    THEN '✅ CRIADA'
    ELSE '❌ NÃO ENCONTRADA'
  END AS status;

-- Verificar trigger
SELECT 
  'Trigger update_updated_at' AS verificação,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'trigger_update_sport_modalities_updated_at'
    )
    THEN '✅ CRIADO'
    ELSE '❌ NÃO ENCONTRADO'
  END AS status;

-- Resumo final
SELECT 
  'RESUMO MIGRATION 1' AS tipo,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'sport_modalities') AS tabelas,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'sport_modalities') AS colunas,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'sport_modalities') AS indices,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'get_group_modalities') AS funcoes,
  (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'trigger_update_sport_modalities_updated_at') AS triggers;

