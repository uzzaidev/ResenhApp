-- =====================================================
-- Script de Verificação de Migrations
-- ResenhApp V2.0 - Supabase
-- =====================================================
-- Execute este script no SQL Editor do Supabase para verificar
-- se todas as migrations foram aplicadas corretamente
-- =====================================================

-- =====================================================
-- 1. VERIFICAR TABELAS CRIADAS
-- =====================================================

SELECT 
  'TABELAS CRIADAS' AS categoria,
  COUNT(*) AS total
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Listar todas as tabelas
SELECT 
  tablename AS tabela,
  CASE 
    WHEN tablename IN (
      'profiles', 'groups', 'group_members', 'venues', 'events',
      'event_attendance', 'teams', 'team_members', 'event_actions', 'votes',
      'wallets', 'charges', 'charge_splits', 'transactions', 'pix_payments', 'group_pix_config',
      'notifications', 'notification_templates', 'push_tokens', 'email_queue', 'notification_batches',
      'player_stats', 'group_stats', 'event_stats', 'leaderboards', 'analytics_events',
      'achievement_types', 'user_achievements', 'badges', 'user_badges', 'milestones', 'challenges', 'challenge_participants'
    ) THEN '✅'
    ELSE '⚠️'
  END AS status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 2. VERIFICAR RLS HABILITADO
-- =====================================================

SELECT 
  'RLS HABILITADO' AS categoria,
  COUNT(*) AS total_com_rls
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- Listar tabelas com RLS
SELECT 
  tablename AS tabela,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS Ativo'
    ELSE '❌ RLS Desativado'
  END AS status_rls
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 3. VERIFICAR ENUMS CRIADOS
-- =====================================================

SELECT 
  'ENUMS CRIADOS' AS categoria,
  COUNT(DISTINCT t.typname) AS total_enums
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%_type';

-- Listar todos os enums e seus valores
SELECT 
  t.typname AS enum_name,
  COUNT(e.enumlabel) AS total_valores,
  STRING_AGG(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS valores
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%_type'
GROUP BY t.typname
ORDER BY t.typname;

-- =====================================================
-- 4. VERIFICAR FUNCTIONS CRIADAS
-- =====================================================

SELECT 
  'FUNCTIONS CRIADAS' AS categoria,
  COUNT(*) AS total
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname NOT LIKE 'pg_%'
AND p.proname NOT LIKE '_%';

-- Listar functions principais
SELECT 
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  CASE 
    WHEN p.proname LIKE 'generate_%' OR p.proname LIKE 'trigger_%' OR p.proname LIKE 'check_%' THEN '✅'
    ELSE 'ℹ️'
  END AS tipo
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname NOT LIKE 'pg_%'
AND p.proname NOT LIKE '_%'
ORDER BY p.proname;

-- =====================================================
-- 5. VERIFICAR TRIGGERS CRIADOS
-- =====================================================

SELECT 
  'TRIGGERS CRIADOS' AS categoria,
  COUNT(*) AS total
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND NOT t.tgisinternal;

-- Listar triggers
SELECT 
  c.relname AS tabela,
  t.tgname AS trigger_name,
  pg_get_triggerdef(t.oid) AS definicao
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- =====================================================
-- 6. VERIFICAR POLÍTICAS RLS
-- =====================================================

SELECT 
  'POLÍTICAS RLS' AS categoria,
  COUNT(*) AS total
FROM pg_policies
WHERE schemaname = 'public';

-- Listar políticas RLS por tabela
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS operacao,
  qual AS condicao_using,
  with_check AS condicao_with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 7. VERIFICAR ÍNDICES
-- =====================================================

SELECT 
  'ÍNDICES CRIADOS' AS categoria,
  COUNT(*) AS total
FROM pg_indexes
WHERE schemaname = 'public';

-- Listar índices por tabela
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- =====================================================
-- 8. VERIFICAR FOREIGN KEYS
-- =====================================================

SELECT 
  'FOREIGN KEYS' AS categoria,
  COUNT(*) AS total
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_schema = 'public';

-- Listar foreign keys
SELECT 
  tc.table_name AS tabela_origem,
  kcu.column_name AS coluna_origem,
  ccu.table_name AS tabela_destino,
  ccu.column_name AS coluna_destino,
  tc.constraint_name AS constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 9. RESUMO GERAL
-- =====================================================

SELECT 
  '📊 RESUMO GERAL' AS categoria,
  '' AS detalhes
UNION ALL
SELECT 
  'Tabelas criadas',
  COUNT(*)::TEXT
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Tabelas com RLS',
  COUNT(*)::TEXT
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true
UNION ALL
SELECT 
  'Enums criados',
  COUNT(DISTINCT t.typname)::TEXT
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%_type'
UNION ALL
SELECT 
  'Functions criadas',
  COUNT(*)::TEXT
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname NOT LIKE 'pg_%'
AND p.proname NOT LIKE '_%'
UNION ALL
SELECT 
  'Triggers criados',
  COUNT(*)::TEXT
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND NOT t.tgisinternal
UNION ALL
SELECT 
  'Políticas RLS',
  COUNT(*)::TEXT
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Índices criados',
  COUNT(*)::TEXT
FROM pg_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Foreign Keys',
  COUNT(*)::TEXT
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_schema = 'public';

-- =====================================================
-- 10. VERIFICAR TABELAS ESPECÍFICAS POR MIGRATION
-- =====================================================

-- Migration 1: Initial Schema (Extensions + Enums)
SELECT 'Migration 1: Initial Schema' AS migration, 'Extensions e Enums' AS conteudo;

-- Migration 2: Auth & Profiles
SELECT 'Migration 2: Auth & Profiles' AS migration, tablename AS tabelas
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles')
ORDER BY tablename;

-- Migration 3: Groups & Events
SELECT 'Migration 3: Groups & Events' AS migration, tablename AS tabelas
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'groups', 'group_members', 'venues', 'events', 'event_attendance',
  'teams', 'team_members', 'event_actions', 'votes'
)
ORDER BY tablename;

-- Migration 4: RLS Policies (já verificado acima)

-- Migration 5: Financial System
SELECT 'Migration 5: Financial System' AS migration, tablename AS tabelas
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'wallets', 'charges', 'charge_splits', 'transactions', 'pix_payments', 'group_pix_config'
)
ORDER BY tablename;

-- Migration 6: Notifications
SELECT 'Migration 6: Notifications' AS migration, tablename AS tabelas
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'notifications', 'notification_templates', 'push_tokens', 'email_queue', 'notification_batches'
)
ORDER BY tablename;

-- Migration 7: Analytics
SELECT 'Migration 7: Analytics' AS migration, tablename AS tabelas
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'player_stats', 'group_stats', 'event_stats', 'leaderboards', 'analytics_events'
)
ORDER BY tablename;

-- Migration 8: Gamification
SELECT 'Migration 8: Gamification' AS migration, tablename AS tabelas
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'achievement_types', 'user_achievements', 'badges', 'user_badges', 
  'milestones', 'challenges', 'challenge_participants'
)
ORDER BY tablename;

-- =====================================================
-- FIM DO SCRIPT DE VERIFICAÇÃO
-- =====================================================
-- Se todas as verificações retornarem valores esperados,
-- suas migrations foram aplicadas com sucesso! ✅
-- =====================================================

