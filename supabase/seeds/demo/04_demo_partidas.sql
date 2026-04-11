-- =====================================================
-- DEMO SEED 04 — Times, Acoes, Stats
-- =====================================================
-- Para 3 jogos oficiais passados (E02, E04, E07):
--   - teams (2 times por jogo)
--   - team_members
--   - event_actions (gols, assistencias, defesas)
--   - event_stats (resumo do jogo)
-- + player_stats cumulativos para Resenha FC
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

  v_e02 UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380002';
  v_e04 UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380004';
  v_e07 UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380007';

  v_resenha_id UUID;

  -- Times E02 (Pelada #1): Time Preto 3x1 Time Branco
  v_t02_preto  UUID := 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380021';
  v_t02_branco UUID := 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380022';

  -- Times E04 (Pelada #2): Time Verde 2x0 Time Laranja
  v_t04_verde  UUID := 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380041';
  v_t04_laranja UUID := 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380042';

  -- Times E07 (Pelada #3): Time Azul 2x2 Time Vermelho
  v_t07_azul    UUID := 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380071';
  v_t07_vermelho UUID := 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380072';
BEGIN

  SELECT id INTO v_resenha_id FROM groups WHERE name = 'Resenha FC' LIMIT 1;
  IF v_resenha_id IS NULL THEN RAISE EXCEPTION 'Grupo Resenha FC nao encontrado.'; END IF;

  -- =================================================
  -- JOGO E02: Pelada #1 — Time Preto 3x1 Time Branco
  -- =================================================

  INSERT INTO teams (id, event_id, name, seed, is_winner, created_at)
  VALUES
    (v_t02_preto,  v_e02, 'Time Preto',  1, TRUE,  NOW() - INTERVAL '50 days'),
    (v_t02_branco, v_e02, 'Time Branco', 2, FALSE, NOW() - INTERVAL '50 days')
  ON CONFLICT (id) DO NOTHING;

  -- Time Preto: Joao (fw), Maria (mid), Pedro (mid), Roberto (gk)
  INSERT INTO team_members (team_id, user_id, position, starter, created_at)
  VALUES
    (v_t02_preto, v_joao,    'forward',    TRUE, NOW() - INTERVAL '50 days'),
    (v_t02_preto, v_maria,   'midfielder', TRUE, NOW() - INTERVAL '50 days'),
    (v_t02_preto, v_pedro,   'midfielder', TRUE, NOW() - INTERVAL '50 days'),
    (v_t02_preto, v_roberto, 'gk',         TRUE, NOW() - INTERVAL '50 days')
  ON CONFLICT (team_id, user_id) DO NOTHING;

  -- Time Branco: Carlos (def), Lucas (mid), Ana (fw)
  INSERT INTO team_members (team_id, user_id, position, starter, created_at)
  VALUES
    (v_t02_branco, v_carlos, 'defender',   TRUE, NOW() - INTERVAL '50 days'),
    (v_t02_branco, v_lucas,  'midfielder', TRUE, NOW() - INTERVAL '50 days'),
    (v_t02_branco, v_ana,    'forward',    TRUE, NOW() - INTERVAL '50 days')
  ON CONFLICT (team_id, user_id) DO NOTHING;

  -- Acoes E02 — Joao hat-trick, Maria assist, Ana 1 gol
  INSERT INTO event_actions (event_id, actor_user_id, action_type, subject_user_id, team_id, minute, created_at)
  VALUES
    (v_e02, v_joao,  'goal',   v_maria, v_t02_preto,  12, NOW() - INTERVAL '50 days'),
    (v_e02, v_maria, 'assist', v_joao,  v_t02_preto,  12, NOW() - INTERVAL '50 days'),
    (v_e02, v_joao,  'goal',   NULL,    v_t02_preto,  28, NOW() - INTERVAL '50 days'),
    (v_e02, v_joao,  'goal',   v_pedro, v_t02_preto,  41, NOW() - INTERVAL '50 days'),
    (v_e02, v_pedro, 'assist', v_joao,  v_t02_preto,  41, NOW() - INTERVAL '50 days'),
    (v_e02, v_ana,   'goal',   v_lucas, v_t02_branco, 35, NOW() - INTERVAL '50 days'),
    (v_e02, v_lucas, 'assist', v_ana,   v_t02_branco, 35, NOW() - INTERVAL '50 days'),
    (v_e02, v_roberto, 'save', NULL,    v_t02_preto,  22, NOW() - INTERVAL '50 days'),
    (v_e02, v_roberto, 'save', NULL,    v_t02_preto,  38, NOW() - INTERVAL '50 days');

  -- event_stats E02
  INSERT INTO event_stats (event_id, group_id, attendees_count, confirmed_count, goals_count, assists_count, mvp_user_id, created_at, updated_at)
  VALUES (v_e02, v_resenha_id, 7, 7, 4, 3, v_joao, NOW(), NOW())
  ON CONFLICT (event_id) DO UPDATE SET goals_count = 4, assists_count = 3, mvp_user_id = v_joao, updated_at = NOW();

  RAISE NOTICE 'E02 (Pelada #1) — Times, acoes e stats criados.';

  -- =================================================
  -- JOGO E04: Pelada #2 — Time Verde 2x0 Time Laranja
  -- =================================================

  INSERT INTO teams (id, event_id, name, seed, is_winner, created_at)
  VALUES
    (v_t04_verde,  v_e04, 'Time Verde',  1, TRUE,  NOW() - INTERVAL '40 days'),
    (v_t04_laranja, v_e04, 'Time Laranja', 2, FALSE, NOW() - INTERVAL '40 days')
  ON CONFLICT (id) DO NOTHING;

  -- Time Verde: Ana (fw), Maria (mid), Pedro (def), Roberto (gk)
  INSERT INTO team_members (team_id, user_id, position, starter, created_at)
  VALUES
    (v_t04_verde, v_ana,     'forward',  TRUE, NOW() - INTERVAL '40 days'),
    (v_t04_verde, v_maria,   'midfielder', TRUE, NOW() - INTERVAL '40 days'),
    (v_t04_verde, v_pedro,   'defender', TRUE, NOW() - INTERVAL '40 days'),
    (v_t04_verde, v_roberto, 'gk',       TRUE, NOW() - INTERVAL '40 days')
  ON CONFLICT (team_id, user_id) DO NOTHING;

  -- Time Laranja: Joao (fw), Carlos (def), Lucas (mid)
  INSERT INTO team_members (team_id, user_id, position, starter, created_at)
  VALUES
    (v_t04_laranja, v_joao,  'forward',    TRUE, NOW() - INTERVAL '40 days'),
    (v_t04_laranja, v_carlos, 'defender',  TRUE, NOW() - INTERVAL '40 days'),
    (v_t04_laranja, v_lucas,  'midfielder', TRUE, NOW() - INTERVAL '40 days')
  ON CONFLICT (team_id, user_id) DO NOTHING;

  -- Acoes E04 — Ana 2 gols, Maria 1 assist
  INSERT INTO event_actions (event_id, actor_user_id, action_type, subject_user_id, team_id, minute, created_at)
  VALUES
    (v_e04, v_ana,   'goal',   v_maria, v_t04_verde, 18, NOW() - INTERVAL '40 days'),
    (v_e04, v_maria, 'assist', v_ana,   v_t04_verde, 18, NOW() - INTERVAL '40 days'),
    (v_e04, v_ana,   'goal',   NULL,    v_t04_verde, 37, NOW() - INTERVAL '40 days'),
    (v_e04, v_roberto, 'save', NULL,    v_t04_verde, 25, NOW() - INTERVAL '40 days'),
    (v_e04, v_roberto, 'save', NULL,    v_t04_verde, 42, NOW() - INTERVAL '40 days'),
    (v_e04, v_roberto, 'save', NULL,    v_t04_verde, 44, NOW() - INTERVAL '40 days');

  -- event_stats E04
  INSERT INTO event_stats (event_id, group_id, attendees_count, confirmed_count, goals_count, assists_count, mvp_user_id, created_at, updated_at)
  VALUES (v_e04, v_resenha_id, 7, 7, 2, 1, v_roberto, NOW(), NOW())
  ON CONFLICT (event_id) DO UPDATE SET goals_count = 2, assists_count = 1, mvp_user_id = v_roberto, updated_at = NOW();

  RAISE NOTICE 'E04 (Pelada #2) — Times, acoes e stats criados.';

  -- =================================================
  -- JOGO E07: Pelada #3 — Time Azul 2x2 Time Vermelho
  -- =================================================

  INSERT INTO teams (id, event_id, name, seed, is_winner, created_at)
  VALUES
    (v_t07_azul,    v_e07, 'Time Azul',    1, NULL,  NOW() - INTERVAL '22 days'),
    (v_t07_vermelho, v_e07, 'Time Vermelho', 2, NULL, NOW() - INTERVAL '22 days')
  ON CONFLICT (id) DO NOTHING;

  -- Time Azul: Joao (fw), Carlos (def), Pedro (mid), Roberto (gk)
  INSERT INTO team_members (team_id, user_id, position, starter, created_at)
  VALUES
    (v_t07_azul, v_joao,    'forward',    TRUE, NOW() - INTERVAL '22 days'),
    (v_t07_azul, v_carlos,  'defender',   TRUE, NOW() - INTERVAL '22 days'),
    (v_t07_azul, v_pedro,   'midfielder', TRUE, NOW() - INTERVAL '22 days'),
    (v_t07_azul, v_roberto, 'gk',         TRUE, NOW() - INTERVAL '22 days')
  ON CONFLICT (team_id, user_id) DO NOTHING;

  -- Time Vermelho: Ana (fw), Maria (fw), Lucas (mid)
  INSERT INTO team_members (team_id, user_id, position, starter, created_at)
  VALUES
    (v_t07_vermelho, v_ana,   'forward',    TRUE, NOW() - INTERVAL '22 days'),
    (v_t07_vermelho, v_maria, 'forward',    TRUE, NOW() - INTERVAL '22 days'),
    (v_t07_vermelho, v_lucas, 'midfielder', TRUE, NOW() - INTERVAL '22 days')
  ON CONFLICT (team_id, user_id) DO NOTHING;

  -- Acoes E07 — Joao 1 gol, Pedro 1 gol (Azul); Ana 1 gol, Maria 1 gol (Vermelho)
  INSERT INTO event_actions (event_id, actor_user_id, action_type, subject_user_id, team_id, minute, created_at)
  VALUES
    (v_e07, v_joao,    'goal',   v_pedro,  v_t07_azul,    10, NOW() - INTERVAL '22 days'),
    (v_e07, v_pedro,   'assist', v_joao,   v_t07_azul,    10, NOW() - INTERVAL '22 days'),
    (v_e07, v_ana,     'goal',   NULL,     v_t07_vermelho, 21, NOW() - INTERVAL '22 days'),
    (v_e07, v_maria,   'goal',   v_lucas,  v_t07_vermelho, 33, NOW() - INTERVAL '22 days'),
    (v_e07, v_lucas,   'assist', v_maria,  v_t07_vermelho, 33, NOW() - INTERVAL '22 days'),
    (v_e07, v_pedro,   'goal',   NULL,     v_t07_azul,    40, NOW() - INTERVAL '22 days'),
    (v_e07, v_roberto, 'save',   NULL,     v_t07_azul,    15, NOW() - INTERVAL '22 days'),
    (v_e07, v_roberto, 'save',   NULL,     v_t07_azul,    29, NOW() - INTERVAL '22 days');

  -- event_stats E07
  INSERT INTO event_stats (event_id, group_id, attendees_count, confirmed_count, goals_count, assists_count, mvp_user_id, created_at, updated_at)
  VALUES (v_e07, v_resenha_id, 7, 7, 4, 3, v_roberto, NOW(), NOW())
  ON CONFLICT (event_id) DO UPDATE SET goals_count = 4, assists_count = 3, mvp_user_id = v_roberto, updated_at = NOW();

  RAISE NOTICE 'E07 (Pelada #3) — Times, acoes e stats criados.';

  -- =================================================
  -- PLAYER STATS — Resenha FC (acumulado dos 3 jogos)
  -- =================================================
  -- Pedro:   3 jogos, 2 vitórias, 1 gol, 2 assistências, 0 saves, 0 MVP
  -- Joao:    3 jogos, 1 vitória, 4 gols, 1 assist, 0 saves, 1 MVP
  -- Carlos:  3 jogos, 1 vitória, 0 gols, 0 assists, 0 saves, 0 MVP
  -- Maria:   3 jogos, 1 vitória, 1 gol, 2 assists, 0 saves, 0 MVP
  -- Roberto: 3 jogos, 1 vitória, 0 gols, 0 assists, 7 saves, 2 MVP
  -- Lucas:   3 jogos, 1 vitória, 0 gols, 2 assists, 0 saves, 0 MVP
  -- Ana:     3 jogos, 2 vitórias, 3 gols, 0 assists, 0 saves, 0 MVP

  INSERT INTO player_stats (user_id, group_id, games_played, games_won, goals, assists, saves, mvp_count, attendance_rate, created_at, updated_at)
  VALUES
    (v_pedro,   v_resenha_id, 3, 2, 1, 2, 0, 0, 100.00, NOW(), NOW()),
    (v_joao,    v_resenha_id, 3, 1, 4, 1, 0, 1, 100.00, NOW(), NOW()),
    (v_carlos,  v_resenha_id, 3, 1, 0, 0, 0, 0, 86.00,  NOW(), NOW()),
    (v_maria,   v_resenha_id, 3, 1, 1, 2, 0, 0, 100.00, NOW(), NOW()),
    (v_roberto, v_resenha_id, 3, 1, 0, 0, 7, 2, 100.00, NOW(), NOW()),
    (v_lucas,   v_resenha_id, 3, 1, 0, 2, 0, 0, 86.00,  NOW(), NOW()),
    (v_ana,     v_resenha_id, 3, 2, 3, 0, 0, 0, 86.00,  NOW(), NOW())
  ON CONFLICT (user_id, group_id) DO UPDATE
    SET games_played = EXCLUDED.games_played,
        games_won    = EXCLUDED.games_won,
        goals        = EXCLUDED.goals,
        assists      = EXCLUDED.assists,
        saves        = EXCLUDED.saves,
        mvp_count    = EXCLUDED.mvp_count,
        attendance_rate = EXCLUDED.attendance_rate,
        updated_at   = NOW();

  RAISE NOTICE '✅ Partidas e player_stats concluidos.';
END $$;
