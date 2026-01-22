-- =====================================================
-- Script de Verificação SIMPLIFICADO
-- ResenhApp V2.0 - Supabase
-- Execute cada seção separadamente se necessário
-- =====================================================

-- =====================================================
-- RESUMO GERAL (Execute esta query primeiro)
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
-- LISTAR TODAS AS TABELAS
-- =====================================================

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
    ) THEN '✅ Esperada'
    ELSE '⚠️ Não esperada'
  END AS status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- VERIFICAR RLS POR TABELA
-- =====================================================

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
-- VERIFICAR TABELAS POR MIGRATION
-- =====================================================

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

