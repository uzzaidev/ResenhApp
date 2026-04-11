-- =====================================================
-- DEMO SEED 06 — Gamificação (Conquistas e Leaderboards)
-- =====================================================
-- Cria:
--   - 5 achievement_types (prefixo DEMO_)
--   - user_achievements para jogadores destaque
--   - leaderboards all_time para Resenha FC
-- =====================================================

DO $$
DECLARE
  v_pedro   UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  v_joao    UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
  v_carlos  UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
  v_maria   UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';
  v_roberto UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15';
  v_lucas   UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16';
  v_ana     UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17';

  v_resenha_id UUID;
  v_e02        UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380002';

  -- IDs das achievement_types (BIGSERIAL, capturados após insert)
  v_at_hat_trick  BIGINT;
  v_at_mvp        BIGINT;
  v_at_goleiro     BIGINT;
  v_at_artilheiro  BIGINT;
  v_at_presenca    BIGINT;
BEGIN

  SELECT id INTO v_resenha_id FROM groups WHERE name = 'Resenha FC' LIMIT 1;
  IF v_resenha_id IS NULL THEN RAISE EXCEPTION 'Grupo Resenha FC nao encontrado.'; END IF;

  -- =================================================
  -- ACHIEVEMENT TYPES (inserir ou recuperar existentes)
  -- =================================================

  INSERT INTO achievement_types (code, name, description, category, rarity, points, criteria, is_active)
  VALUES ('DEMO_HAT_TRICK', 'Hat-trick', 'Marcou 3 gols em uma unica partida', 'scoring', 'epic', 50, '{"goals_in_match": 3}'::jsonb, TRUE)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_at_hat_trick;
  IF v_at_hat_trick IS NULL THEN SELECT id INTO v_at_hat_trick FROM achievement_types WHERE code = 'DEMO_HAT_TRICK'; END IF;

  INSERT INTO achievement_types (code, name, description, category, rarity, points, criteria, is_active)
  VALUES ('DEMO_MVP', 'MVP', 'Eleito o melhor jogador da partida', 'recognition', 'rare', 30, '{"mvp_count": 1}'::jsonb, TRUE)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_at_mvp;
  IF v_at_mvp IS NULL THEN SELECT id INTO v_at_mvp FROM achievement_types WHERE code = 'DEMO_MVP'; END IF;

  INSERT INTO achievement_types (code, name, description, category, rarity, points, criteria, is_active)
  VALUES ('DEMO_GOLEIRO_FERA', 'Goleiro Fera', 'Fez 5 ou mais defesas em uma temporada', 'defense', 'rare', 35, '{"saves_season": 5}'::jsonb, TRUE)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_at_goleiro;
  IF v_at_goleiro IS NULL THEN SELECT id INTO v_at_goleiro FROM achievement_types WHERE code = 'DEMO_GOLEIRO_FERA'; END IF;

  INSERT INTO achievement_types (code, name, description, category, rarity, points, criteria, is_active)
  VALUES ('DEMO_ARTILHEIRO', 'Artilheiro', 'Lider de gols do grupo', 'scoring', 'legendary', 100, '{"top_scorer": true}'::jsonb, TRUE)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_at_artilheiro;
  IF v_at_artilheiro IS NULL THEN SELECT id INTO v_at_artilheiro FROM achievement_types WHERE code = 'DEMO_ARTILHEIRO'; END IF;

  INSERT INTO achievement_types (code, name, description, category, rarity, points, criteria, is_active)
  VALUES ('DEMO_FREQUENCIA', 'Pelada Viciado', 'Presente em 100% dos jogos', 'attendance', 'common', 20, '{"attendance_rate": 100}'::jsonb, TRUE)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_at_presenca;
  IF v_at_presenca IS NULL THEN SELECT id INTO v_at_presenca FROM achievement_types WHERE code = 'DEMO_FREQUENCIA'; END IF;

  RAISE NOTICE 'Achievement types criados/verificados.';

  -- =================================================
  -- USER ACHIEVEMENTS
  -- =================================================

  -- Joao — Hat-trick (E02) e Artilheiro
  INSERT INTO user_achievements (user_id, achievement_type_id, progress, progress_max, group_id, event_id, unlocked_at)
  VALUES
    (v_joao, v_at_hat_trick,  3, 3, v_resenha_id, v_e02,        NOW()-INTERVAL '50 days'),
    (v_joao, v_at_artilheiro, 4, 1, v_resenha_id, NULL,          NOW()-INTERVAL '22 days'),
    (v_joao, v_at_mvp,        1, 1, v_resenha_id, v_e02,         NOW()-INTERVAL '50 days')
  ON CONFLICT (user_id, achievement_type_id, group_id, event_id) DO NOTHING;

  -- Roberto — Goleiro Fera e MVP
  INSERT INTO user_achievements (user_id, achievement_type_id, progress, progress_max, group_id, event_id, unlocked_at)
  VALUES
    (v_roberto, v_at_goleiro, 7, 5, v_resenha_id, NULL, NOW()-INTERVAL '22 days'),
    (v_roberto, v_at_mvp,     1, 1, v_resenha_id, NULL, NOW()-INTERVAL '22 days')
  ON CONFLICT (user_id, achievement_type_id, group_id, event_id) DO NOTHING;

  -- Ana — Presença 100%
  INSERT INTO user_achievements (user_id, achievement_type_id, progress, progress_max, group_id, event_id, unlocked_at)
  VALUES (v_ana, v_at_presenca, 3, 3, v_resenha_id, NULL, NOW()-INTERVAL '22 days')
  ON CONFLICT (user_id, achievement_type_id, group_id, event_id) DO NOTHING;

  -- Pedro — Presença 100%
  INSERT INTO user_achievements (user_id, achievement_type_id, progress, progress_max, group_id, event_id, unlocked_at)
  VALUES (v_pedro, v_at_presenca, 3, 3, v_resenha_id, NULL, NOW()-INTERVAL '22 days')
  ON CONFLICT (user_id, achievement_type_id, group_id, event_id) DO NOTHING;

  RAISE NOTICE 'User achievements criados.';

  -- =================================================
  -- LEADERBOARDS — Resenha FC (all_time)
  -- =================================================
  -- metric: goals
  INSERT INTO leaderboards (group_id, metric, period, user_id, value, position, calculated_at)
  VALUES
    (v_resenha_id, 'goals', 'all_time', v_joao,   4, 1, NOW()),
    (v_resenha_id, 'goals', 'all_time', v_ana,    3, 2, NOW()),
    (v_resenha_id, 'goals', 'all_time', v_pedro,  1, 3, NOW()),
    (v_resenha_id, 'goals', 'all_time', v_maria,  1, 3, NOW()),
    (v_resenha_id, 'goals', 'all_time', v_carlos, 0, 5, NOW()),
    (v_resenha_id, 'goals', 'all_time', v_roberto,0, 5, NOW()),
    (v_resenha_id, 'goals', 'all_time', v_lucas,  0, 5, NOW())
  ON CONFLICT (group_id, metric, period, user_id) DO UPDATE
    SET value = EXCLUDED.value, position = EXCLUDED.position, calculated_at = NOW();

  -- metric: assists
  INSERT INTO leaderboards (group_id, metric, period, user_id, value, position, calculated_at)
  VALUES
    (v_resenha_id, 'assists', 'all_time', v_pedro,  2, 1, NOW()),
    (v_resenha_id, 'assists', 'all_time', v_maria,  2, 1, NOW()),
    (v_resenha_id, 'assists', 'all_time', v_lucas,  2, 1, NOW()),
    (v_resenha_id, 'assists', 'all_time', v_joao,   1, 4, NOW()),
    (v_resenha_id, 'assists', 'all_time', v_carlos, 0, 5, NOW()),
    (v_resenha_id, 'assists', 'all_time', v_roberto,0, 5, NOW()),
    (v_resenha_id, 'assists', 'all_time', v_ana,    0, 5, NOW())
  ON CONFLICT (group_id, metric, period, user_id) DO UPDATE
    SET value = EXCLUDED.value, position = EXCLUDED.position, calculated_at = NOW();

  -- metric: saves (goleiro)
  INSERT INTO leaderboards (group_id, metric, period, user_id, value, position, calculated_at)
  VALUES
    (v_resenha_id, 'saves', 'all_time', v_roberto, 7, 1, NOW()),
    (v_resenha_id, 'saves', 'all_time', v_pedro,   0, 2, NOW()),
    (v_resenha_id, 'saves', 'all_time', v_joao,    0, 2, NOW()),
    (v_resenha_id, 'saves', 'all_time', v_carlos,  0, 2, NOW()),
    (v_resenha_id, 'saves', 'all_time', v_maria,   0, 2, NOW()),
    (v_resenha_id, 'saves', 'all_time', v_lucas,   0, 2, NOW()),
    (v_resenha_id, 'saves', 'all_time', v_ana,     0, 2, NOW())
  ON CONFLICT (group_id, metric, period, user_id) DO UPDATE
    SET value = EXCLUDED.value, position = EXCLUDED.position, calculated_at = NOW();

  RAISE NOTICE '✅ Gamificacao concluida: conquistas e leaderboards criados.';
END $$;
