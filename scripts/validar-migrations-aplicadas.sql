-- =====================================================
-- Script: Validar Migrations Aplicadas
-- Execute no Supabase SQL Editor após aplicar todas as migrations
-- =====================================================

-- =====================================================
-- 1.9.3 VALIDAR INTEGRIDADE REFERENCIAL
-- =====================================================

DO $$
DECLARE
  errors TEXT[] := ARRAY[]::TEXT[];
  separator TEXT;
BEGIN
  separator := repeat('=', 60);
  RAISE NOTICE '';
  RAISE NOTICE '%', separator;
  RAISE NOTICE 'VALIDAÇÃO DE INTEGRIDADE REFERENCIAL';
  RAISE NOTICE '%', separator;
  RAISE NOTICE '';
  
  -- Verificar foreign keys de sport_modalities
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'sport_modalities_group_id_fkey') THEN
    errors := array_append(errors, '❌ Foreign key sport_modalities_group_id_fkey não encontrada');
  ELSE
    RAISE NOTICE '✅ Foreign key sport_modalities_group_id_fkey OK';
  END IF;
  
  -- Verificar foreign keys de athlete_modalities
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'athlete_modalities_user_id_fkey') THEN
    errors := array_append(errors, '❌ Foreign key athlete_modalities_user_id_fkey não encontrada');
  ELSE
    RAISE NOTICE '✅ Foreign key athlete_modalities_user_id_fkey OK';
  END IF;
  
  -- Verificar foreign keys de credit_transactions
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'credit_transactions_group_id_fkey') THEN
    errors := array_append(errors, '❌ Foreign key credit_transactions_group_id_fkey não encontrada');
  ELSE
    RAISE NOTICE '✅ Foreign key credit_transactions_group_id_fkey OK';
  END IF;
  
  IF array_length(errors, 1) > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE 'ERROS ENCONTRADOS:';
    FOREACH errors IN ARRAY errors LOOP
      RAISE NOTICE '  %', errors;
    END LOOP;
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '✅ TODAS AS FOREIGN KEYS VALIDADAS!';
  END IF;
END $$;

-- =====================================================
-- 1.9.4 VERIFICAR SE TODAS AS TABELAS FORAM CRIADAS
-- =====================================================

DO $$
DECLARE
  expected_tables TEXT[] := ARRAY[
    'sport_modalities',
    'athlete_modalities',
    'checkin_qrcodes',
    'checkins',
    'game_convocations',
    'convocation_responses',
    'saved_tactics',
    'credit_transactions',
    'credit_packages'
  ];
  missing_tables TEXT[] := ARRAY[]::TEXT[];
  expected_table TEXT;  -- Renomeado para evitar ambiguidade
  separator TEXT;
BEGIN
  separator := repeat('=', 60);
  RAISE NOTICE '';
  RAISE NOTICE '%', separator;
  RAISE NOTICE 'VERIFICAÇÃO DE TABELAS CRIADAS';
  RAISE NOTICE '%', separator;
  RAISE NOTICE '';
  
  FOREACH expected_table IN ARRAY expected_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_name = expected_table) THEN
      RAISE NOTICE '✅ Tabela % existe', expected_table;
    ELSE
      missing_tables := array_append(missing_tables, expected_table);
      RAISE NOTICE '❌ Tabela % NÃO encontrada', expected_table;
    END IF;
  END LOOP;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE 'TABELAS FALTANDO:';
    FOREACH expected_table IN ARRAY missing_tables LOOP
      RAISE NOTICE '  - %', expected_table;
    END LOOP;
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '✅ TODAS AS TABELAS FORAM CRIADAS!';
  END IF;
END $$;

-- =====================================================
-- 1.9.5 VERIFICAR SE TODAS AS FUNÇÕES FORAM CRIADAS
-- =====================================================

DO $$
DECLARE
  expected_functions TEXT[] := ARRAY[
    -- Migration 1: Sport Modalities
    'get_group_modalities',
    'update_sport_modalities_updated_at',
    -- Migration 2: Athlete Modalities
    'get_athlete_modalities',
    'get_modality_athletes',
    'update_athlete_modalities_updated_at',
    -- Migration 3: Recurring Trainings
    'generate_recurring_events',
    'get_next_recurrence_date',
    -- Migration 4: Game Convocations
    'get_convocation_stats',
    'is_convocation_complete',
    'update_game_convocations_updated_at',
    'update_convocation_responses_updated_at',
    -- Migration 5: Check-in QR Codes
    'create_event_qrcode',
    'process_qrcode_checkin',
    'get_event_checkins',
    -- Migration 6: Saved Tactics
    'get_group_tactics',
    'get_public_tactics',
    'update_saved_tactics_updated_at',
    -- Migration 7: Financial by Training
    'get_training_payment_summary',
    'get_training_pending_payments',
    'create_training_charge',
    -- Migration 8: Hierarchy and Credits
    'consume_credits',
    'add_credits',
    'get_pix_code_for_group',
    'can_manage_group',
    'check_hierarchy_cycle',
    'update_credit_packages_updated_at'
  ];
  missing_functions TEXT[] := ARRAY[]::TEXT[];
  func_name TEXT;
  separator TEXT;
BEGIN
  separator := repeat('=', 60);
  RAISE NOTICE '';
  RAISE NOTICE '%', separator;
  RAISE NOTICE 'VERIFICAÇÃO DE FUNÇÕES CRIADAS';
  RAISE NOTICE '%', separator;
  RAISE NOTICE '';
  
  FOREACH func_name IN ARRAY expected_functions LOOP
    IF EXISTS (SELECT 1 FROM pg_proc p 
               JOIN pg_namespace n ON p.pronamespace = n.oid 
               WHERE n.nspname = 'public' AND p.proname = func_name) THEN
      RAISE NOTICE '✅ Função % existe', func_name;
    ELSE
      missing_functions := array_append(missing_functions, func_name);
      RAISE NOTICE '❌ Função % NÃO encontrada', func_name;
    END IF;
  END LOOP;
  
  IF array_length(missing_functions, 1) > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE 'FUNÇÕES FALTANDO:';
    FOREACH func_name IN ARRAY missing_functions LOOP
      RAISE NOTICE '  - %', func_name;
    END LOOP;
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '✅ TODAS AS FUNÇÕES FORAM CRIADAS!';
  END IF;
END $$;

-- =====================================================
-- RESUMO FINAL
-- =====================================================

-- Resumo detalhado
SELECT 
  'RESUMO DETALHADO' AS tipo,
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('sport_modalities', 'athlete_modalities', 'checkin_qrcodes', 
                      'checkins', 'game_convocations', 'convocation_responses', 
                      'saved_tactics', 'credit_transactions', 'credit_packages')) AS tabelas_criadas,
  (SELECT COUNT(*) FROM pg_proc p 
   JOIN pg_namespace n ON p.pronamespace = n.oid 
   WHERE n.nspname = 'public' 
   AND p.proname IN ('get_group_modalities', 'update_sport_modalities_updated_at',
                     'get_athlete_modalities', 'get_modality_athletes', 'update_athlete_modalities_updated_at',
                     'generate_recurring_events', 'get_next_recurrence_date',
                     'get_convocation_stats', 'is_convocation_complete', 'update_game_convocations_updated_at', 'update_convocation_responses_updated_at',
                     'create_event_qrcode', 'process_qrcode_checkin', 'get_event_checkins',
                     'get_group_tactics', 'get_public_tactics', 'update_saved_tactics_updated_at',
                     'get_training_payment_summary', 'get_training_pending_payments', 'create_training_charge',
                     'consume_credits', 'add_credits', 'get_pix_code_for_group', 'can_manage_group', 
                     'check_hierarchy_cycle', 'update_credit_packages_updated_at')) AS funcoes_criadas,
  (SELECT COUNT(*) FROM information_schema.views 
   WHERE table_schema = 'public' 
   AND table_name IN ('v_training_payments', 'v_training_payment_details')) AS views_criadas,
  (SELECT COUNT(*) FROM information_schema.table_constraints 
   WHERE constraint_type = 'FOREIGN KEY' 
   AND (constraint_name LIKE '%modalities%' OR constraint_name LIKE '%checkin%' 
        OR constraint_name LIKE '%convocation%' OR constraint_name LIKE '%tactics%'
        OR constraint_name LIKE '%credit%' OR constraint_name LIKE '%groups%')) AS foreign_keys_relevantes;

