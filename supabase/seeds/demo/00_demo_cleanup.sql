-- =====================================================
-- DEMO SEED 00 — Cleanup
-- Remove todos os dados de demo anteriores (seguro)
-- Só apaga registros dos 7 usuários demo fixos
-- =====================================================

DO $$
DECLARE
  v_demo_users UUID[] := ARRAY[
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::UUID,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::UUID,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::UUID,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::UUID,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16'::UUID,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17'::UUID
  ];
  v_demo_group_ids UUID[];
BEGIN

  -- Capturar grupos criados pelos demo users
  SELECT ARRAY_AGG(id) INTO v_demo_group_ids
  FROM groups WHERE created_by = ANY(v_demo_users);

  IF v_demo_group_ids IS NULL THEN
    v_demo_group_ids := ARRAY[]::UUID[];
  END IF;

  -- Social
  BEGIN
    DELETE FROM social_reactions WHERE user_id  = ANY(v_demo_users);
    DELETE FROM social_comments  WHERE author_id = ANY(v_demo_users);
    DELETE FROM social_posts     WHERE author_id = ANY(v_demo_users);
    RAISE NOTICE 'Social limpo.';
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'Tabelas sociais nao existem — ignorando.';
  END;

  -- Notifications
  DELETE FROM notifications WHERE user_id = ANY(v_demo_users);

  -- Charges (deletamos por user antes de deletar grupos/eventos)
  DELETE FROM charges WHERE user_id = ANY(v_demo_users);

  -- Achievement types de demo (user_achievements cascadeiam via FK)
  BEGIN
    DELETE FROM achievement_types WHERE code LIKE 'DEMO_%';
    RAISE NOTICE 'Achievement types DEMO_ limpos.';
  EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'achievement_types nao existe — ignorando.';
  END;

  -- Grupos — cascateia: events→teams/team_members/event_actions/event_attendance/
  --   event_stats, group_members, invites, venues, player_stats,
  --   leaderboards, user_achievements, social_posts
  IF array_length(v_demo_group_ids, 1) > 0 THEN
    DELETE FROM groups WHERE id = ANY(v_demo_group_ids);
    RAISE NOTICE 'Grupos demo deletados (cascade aplicado).';
  END IF;

  -- Usuarios (cascateia o que restou)
  DELETE FROM users WHERE id = ANY(v_demo_users);

  RAISE NOTICE '✅ Cleanup demo concluido.';
END $$;
