-- =====================================================
-- Script para verificar tipos reais das tabelas no banco
-- Execute no Supabase SQL Editor ANTES de aplicar migrations
-- =====================================================

-- Verificar tipo de groups.id
SELECT 
  'groups.id' AS coluna,
  data_type AS tipo_atual,
  CASE 
    WHEN data_type = 'bigint' THEN '✅ Correto (BIGINT)'
    WHEN data_type = 'uuid' THEN '⚠️ ATENÇÃO: É UUID, não BIGINT!'
    ELSE '❌ Tipo inesperado: ' || data_type
  END AS status
FROM information_schema.columns 
WHERE table_name = 'groups' AND column_name = 'id';

-- Verificar tipo de events.id
SELECT 
  'events.id' AS coluna,
  data_type AS tipo_atual,
  CASE 
    WHEN data_type = 'bigint' THEN '✅ Correto (BIGINT)'
    WHEN data_type = 'uuid' THEN '⚠️ ATENÇÃO: É UUID, não BIGINT!'
    ELSE '❌ Tipo inesperado: ' || data_type
  END AS status
FROM information_schema.columns 
WHERE table_name = 'events' AND column_name = 'id';

-- Verificar tipo de profiles.id
SELECT 
  'profiles.id' AS coluna,
  data_type AS tipo_atual,
  CASE 
    WHEN data_type = 'uuid' THEN '✅ Correto (UUID)'
    ELSE '❌ Tipo inesperado: ' || data_type
  END AS status
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'id';

-- Resumo
SELECT 
  'RESUMO' AS tipo,
  (SELECT data_type FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'id') AS groups_id_tipo,
  (SELECT data_type FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'id') AS events_id_tipo,
  (SELECT data_type FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'id') AS profiles_id_tipo;

