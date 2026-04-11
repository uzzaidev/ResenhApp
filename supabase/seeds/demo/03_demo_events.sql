-- =====================================================
-- DEMO SEED 03 — Eventos e Attendances (Resenha FC)
-- =====================================================
-- Cria 9 eventos no Resenha FC:
--   E01-E07: passados (finished) — treinos e jogos
--   E08: upcoming (scheduled) — treino
--   E09: upcoming (scheduled) — jogo oficial
-- + event_attendance para todos os eventos
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
  v_venue_id   UUID;
  v_recv_id    UUID;

  -- IDs fixos para eventos (para referenciar nos scripts 04 e 05)
  v_e01 UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380001';
  v_e02 UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380002';
  v_e03 UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380003';
  v_e04 UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380004';
  v_e05 UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380005';
  v_e06 UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380006';
  v_e07 UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380007';
  v_e08 UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380008';
  v_e09 UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380009';
BEGIN

  -- Buscar IDs do grupo e venue
  SELECT id INTO v_resenha_id FROM groups WHERE name = 'Resenha FC' AND created_by = v_pedro LIMIT 1;
  IF v_resenha_id IS NULL THEN RAISE EXCEPTION 'Grupo Resenha FC nao encontrado. Execute 02_demo_groups.sql primeiro.'; END IF;

  SELECT id INTO v_venue_id FROM venues WHERE name = 'Arena Society SP' AND group_id = v_resenha_id LIMIT 1;
  SELECT id INTO v_recv_id  FROM receiver_profiles WHERE entity_id = v_resenha_id LIMIT 1;

  -- =================================================
  -- EVENTOS PASSADOS (finished)
  -- =================================================

  -- E01: Treino de Formacao (60 dias atras)
  INSERT INTO events (id, group_id, starts_at, venue_id, max_players, max_goalkeepers,
    status, event_type, price, receiver_profile_id, auto_charge_on_rsvp,
    created_by, created_at, updated_at)
  VALUES (v_e01, v_resenha_id, NOW() - INTERVAL '60 days' + TIME '09:00:00',
    v_venue_id, 14, 2, 'finished', 'training', 15.00, v_recv_id, TRUE,
    v_pedro, NOW() - INTERVAL '65 days', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- E02: Pelada #1 — Jogo Oficial (50 dias atras)
  INSERT INTO events (id, group_id, starts_at, venue_id, max_players, max_goalkeepers,
    status, event_type, price, receiver_profile_id, auto_charge_on_rsvp,
    created_by, created_at, updated_at)
  VALUES (v_e02, v_resenha_id, NOW() - INTERVAL '50 days' + TIME '19:00:00',
    v_venue_id, 14, 2, 'finished', 'official_game', 20.00, v_recv_id, TRUE,
    v_pedro, NOW() - INTERVAL '55 days', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- E03: Treino Tecnico (45 dias atras)
  INSERT INTO events (id, group_id, starts_at, venue_id, max_players, max_goalkeepers,
    status, event_type, price, receiver_profile_id, auto_charge_on_rsvp,
    created_by, created_at, updated_at)
  VALUES (v_e03, v_resenha_id, NOW() - INTERVAL '45 days' + TIME '09:00:00',
    v_venue_id, 14, 2, 'finished', 'training', 15.00, v_recv_id, TRUE,
    v_pedro, NOW() - INTERVAL '48 days', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- E04: Pelada #2 — Jogo Oficial (40 dias atras)
  INSERT INTO events (id, group_id, starts_at, venue_id, max_players, max_goalkeepers,
    status, event_type, price, receiver_profile_id, auto_charge_on_rsvp,
    created_by, created_at, updated_at)
  VALUES (v_e04, v_resenha_id, NOW() - INTERVAL '40 days' + TIME '19:00:00',
    v_venue_id, 14, 2, 'finished', 'official_game', 20.00, v_recv_id, TRUE,
    v_pedro, NOW() - INTERVAL '43 days', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- E05: Racha Especial — Amistoso (35 dias atras)
  INSERT INTO events (id, group_id, starts_at, venue_id, max_players, max_goalkeepers,
    status, event_type, price, receiver_profile_id, auto_charge_on_rsvp,
    created_by, created_at, updated_at)
  VALUES (v_e05, v_resenha_id, NOW() - INTERVAL '35 days' + TIME '10:00:00',
    v_venue_id, 14, 2, 'finished', 'friendly', 10.00, v_recv_id, FALSE,
    v_pedro, NOW() - INTERVAL '37 days', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- E06: Treino de Finalizacao (28 dias atras)
  INSERT INTO events (id, group_id, starts_at, venue_id, max_players, max_goalkeepers,
    status, event_type, price, receiver_profile_id, auto_charge_on_rsvp,
    created_by, created_at, updated_at)
  VALUES (v_e06, v_resenha_id, NOW() - INTERVAL '28 days' + TIME '09:00:00',
    v_venue_id, 14, 2, 'finished', 'training', 15.00, v_recv_id, TRUE,
    v_pedro, NOW() - INTERVAL '30 days', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- E07: Pelada #3 — Jogo Oficial (22 dias atras)
  INSERT INTO events (id, group_id, starts_at, venue_id, max_players, max_goalkeepers,
    status, event_type, price, receiver_profile_id, auto_charge_on_rsvp,
    created_by, created_at, updated_at)
  VALUES (v_e07, v_resenha_id, NOW() - INTERVAL '22 days' + TIME '19:00:00',
    v_venue_id, 14, 2, 'finished', 'official_game', 20.00, v_recv_id, TRUE,
    v_pedro, NOW() - INTERVAL '25 days', NOW())
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Eventos passados (E01-E07) criados.';

  -- =================================================
  -- EVENTOS FUTUROS (scheduled)
  -- =================================================

  -- E08: Treino (daqui 7 dias)
  INSERT INTO events (id, group_id, starts_at, venue_id, max_players, max_goalkeepers,
    status, event_type, price, receiver_profile_id, auto_charge_on_rsvp,
    created_by, created_at, updated_at)
  VALUES (v_e08, v_resenha_id, NOW() + INTERVAL '7 days' + TIME '09:00:00',
    v_venue_id, 14, 2, 'scheduled', 'training', 15.00, v_recv_id, TRUE,
    v_pedro, NOW() - INTERVAL '2 days', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- E09: Pelada #4 — Jogo Oficial (daqui 14 dias)
  INSERT INTO events (id, group_id, starts_at, venue_id, max_players, max_goalkeepers,
    status, event_type, price, receiver_profile_id, auto_charge_on_rsvp,
    created_by, created_at, updated_at)
  VALUES (v_e09, v_resenha_id, NOW() + INTERVAL '14 days' + TIME '19:00:00',
    v_venue_id, 14, 2, 'scheduled', 'official_game', 20.00, v_recv_id, TRUE,
    v_pedro, NOW() - INTERVAL '1 day', NOW())
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Eventos futuros (E08-E09) criados.';

  -- =================================================
  -- ATTENDANCES — Eventos passados: todos confirmaram
  -- =================================================

  -- E01 (treino): todos 'yes'
  INSERT INTO event_attendance (event_id, user_id, role, status, checked_in_at, order_of_arrival, created_at, updated_at)
  VALUES
    (v_e01, v_pedro,   'line', 'yes', NOW()-INTERVAL '60 days'+TIME '08:55:00', 1, NOW(), NOW()),
    (v_e01, v_joao,    'line', 'yes', NOW()-INTERVAL '60 days'+TIME '08:58:00', 2, NOW(), NOW()),
    (v_e01, v_carlos,  'line', 'yes', NOW()-INTERVAL '60 days'+TIME '09:00:00', 3, NOW(), NOW()),
    (v_e01, v_maria,   'line', 'yes', NOW()-INTERVAL '60 days'+TIME '09:02:00', 4, NOW(), NOW()),
    (v_e01, v_roberto, 'gk',  'yes', NOW()-INTERVAL '60 days'+TIME '09:03:00', 5, NOW(), NOW()),
    (v_e01, v_lucas,   'line', 'yes', NOW()-INTERVAL '60 days'+TIME '09:05:00', 6, NOW(), NOW()),
    (v_e01, v_ana,     'line', 'yes', NOW()-INTERVAL '60 days'+TIME '09:07:00', 7, NOW(), NOW())
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- E02 (pelada #1): todos confirmaram
  INSERT INTO event_attendance (event_id, user_id, role, status, checked_in_at, order_of_arrival, created_at, updated_at)
  VALUES
    (v_e02, v_pedro,   'line', 'yes', NOW()-INTERVAL '50 days'+TIME '18:55:00', 1, NOW(), NOW()),
    (v_e02, v_joao,    'line', 'yes', NOW()-INTERVAL '50 days'+TIME '18:57:00', 2, NOW(), NOW()),
    (v_e02, v_carlos,  'line', 'yes', NOW()-INTERVAL '50 days'+TIME '18:58:00', 3, NOW(), NOW()),
    (v_e02, v_maria,   'line', 'yes', NOW()-INTERVAL '50 days'+TIME '19:00:00', 4, NOW(), NOW()),
    (v_e02, v_roberto, 'gk',  'yes', NOW()-INTERVAL '50 days'+TIME '19:01:00', 5, NOW(), NOW()),
    (v_e02, v_lucas,   'line', 'yes', NOW()-INTERVAL '50 days'+TIME '19:03:00', 6, NOW(), NOW()),
    (v_e02, v_ana,     'line', 'yes', NOW()-INTERVAL '50 days'+TIME '19:05:00', 7, NOW(), NOW())
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- E03 (treino): 6 confirmaram (Carlos nao veio)
  INSERT INTO event_attendance (event_id, user_id, role, status, checked_in_at, order_of_arrival, created_at, updated_at)
  VALUES
    (v_e03, v_pedro,   'line', 'yes', NOW()-INTERVAL '45 days'+TIME '08:55:00', 1, NOW(), NOW()),
    (v_e03, v_joao,    'line', 'yes', NOW()-INTERVAL '45 days'+TIME '09:00:00', 2, NOW(), NOW()),
    (v_e03, v_carlos,  'line', 'no',  NULL, NULL, NOW(), NOW()),
    (v_e03, v_maria,   'line', 'yes', NOW()-INTERVAL '45 days'+TIME '09:05:00', 3, NOW(), NOW()),
    (v_e03, v_roberto, 'gk',  'yes', NOW()-INTERVAL '45 days'+TIME '09:07:00', 4, NOW(), NOW()),
    (v_e03, v_lucas,   'line', 'yes', NOW()-INTERVAL '45 days'+TIME '09:10:00', 5, NOW(), NOW()),
    (v_e03, v_ana,     'line', 'yes', NOW()-INTERVAL '45 days'+TIME '09:12:00', 6, NOW(), NOW())
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- E04 (pelada #2): todos confirmaram
  INSERT INTO event_attendance (event_id, user_id, role, status, checked_in_at, order_of_arrival, created_at, updated_at)
  VALUES
    (v_e04, v_pedro,   'line', 'yes', NOW()-INTERVAL '40 days'+TIME '18:55:00', 1, NOW(), NOW()),
    (v_e04, v_joao,    'line', 'yes', NOW()-INTERVAL '40 days'+TIME '18:57:00', 2, NOW(), NOW()),
    (v_e04, v_carlos,  'line', 'yes', NOW()-INTERVAL '40 days'+TIME '18:59:00', 3, NOW(), NOW()),
    (v_e04, v_maria,   'line', 'yes', NOW()-INTERVAL '40 days'+TIME '19:00:00', 4, NOW(), NOW()),
    (v_e04, v_roberto, 'gk',  'yes', NOW()-INTERVAL '40 days'+TIME '19:02:00', 5, NOW(), NOW()),
    (v_e04, v_lucas,   'line', 'yes', NOW()-INTERVAL '40 days'+TIME '19:04:00', 6, NOW(), NOW()),
    (v_e04, v_ana,     'line', 'yes', NOW()-INTERVAL '40 days'+TIME '19:06:00', 7, NOW(), NOW())
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- E05 (amistoso): 5 confirmaram
  INSERT INTO event_attendance (event_id, user_id, role, status, checked_in_at, order_of_arrival, created_at, updated_at)
  VALUES
    (v_e05, v_pedro,   'line', 'yes', NOW()-INTERVAL '35 days'+TIME '09:55:00', 1, NOW(), NOW()),
    (v_e05, v_joao,    'line', 'yes', NOW()-INTERVAL '35 days'+TIME '09:57:00', 2, NOW(), NOW()),
    (v_e05, v_carlos,  'line', 'no',  NULL, NULL, NOW(), NOW()),
    (v_e05, v_maria,   'line', 'yes', NOW()-INTERVAL '35 days'+TIME '10:00:00', 3, NOW(), NOW()),
    (v_e05, v_roberto, 'gk',  'yes', NOW()-INTERVAL '35 days'+TIME '10:02:00', 4, NOW(), NOW()),
    (v_e05, v_lucas,   'line', 'no',  NULL, NULL, NOW(), NOW()),
    (v_e05, v_ana,     'line', 'yes', NOW()-INTERVAL '35 days'+TIME '10:05:00', 5, NOW(), NOW())
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- E06 (treino finalizacao): todos confirmaram
  INSERT INTO event_attendance (event_id, user_id, role, status, checked_in_at, order_of_arrival, created_at, updated_at)
  VALUES
    (v_e06, v_pedro,   'line', 'yes', NOW()-INTERVAL '28 days'+TIME '08:55:00', 1, NOW(), NOW()),
    (v_e06, v_joao,    'line', 'yes', NOW()-INTERVAL '28 days'+TIME '08:58:00', 2, NOW(), NOW()),
    (v_e06, v_carlos,  'line', 'yes', NOW()-INTERVAL '28 days'+TIME '09:00:00', 3, NOW(), NOW()),
    (v_e06, v_maria,   'line', 'yes', NOW()-INTERVAL '28 days'+TIME '09:03:00', 4, NOW(), NOW()),
    (v_e06, v_roberto, 'gk',  'yes', NOW()-INTERVAL '28 days'+TIME '09:05:00', 5, NOW(), NOW()),
    (v_e06, v_lucas,   'line', 'yes', NOW()-INTERVAL '28 days'+TIME '09:07:00', 6, NOW(), NOW()),
    (v_e06, v_ana,     'line', 'yes', NOW()-INTERVAL '28 days'+TIME '09:10:00', 7, NOW(), NOW())
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- E07 (pelada #3): todos confirmaram
  INSERT INTO event_attendance (event_id, user_id, role, status, checked_in_at, order_of_arrival, created_at, updated_at)
  VALUES
    (v_e07, v_pedro,   'line', 'yes', NOW()-INTERVAL '22 days'+TIME '18:55:00', 1, NOW(), NOW()),
    (v_e07, v_joao,    'line', 'yes', NOW()-INTERVAL '22 days'+TIME '18:57:00', 2, NOW(), NOW()),
    (v_e07, v_carlos,  'line', 'yes', NOW()-INTERVAL '22 days'+TIME '18:59:00', 3, NOW(), NOW()),
    (v_e07, v_maria,   'line', 'yes', NOW()-INTERVAL '22 days'+TIME '19:01:00', 4, NOW(), NOW()),
    (v_e07, v_roberto, 'gk',  'yes', NOW()-INTERVAL '22 days'+TIME '19:02:00', 5, NOW(), NOW()),
    (v_e07, v_lucas,   'line', 'yes', NOW()-INTERVAL '22 days'+TIME '19:04:00', 6, NOW(), NOW()),
    (v_e07, v_ana,     'line', 'yes', NOW()-INTERVAL '22 days'+TIME '19:06:00', 7, NOW(), NOW())
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- E08 (proximo treino): alguns confirmaram
  INSERT INTO event_attendance (event_id, user_id, role, status, created_at, updated_at)
  VALUES
    (v_e08, v_pedro,   'line', 'yes', NOW(), NOW()),
    (v_e08, v_joao,    'line', 'yes', NOW(), NOW()),
    (v_e08, v_carlos,  'line', 'yes', NOW(), NOW()),
    (v_e08, v_maria,   'line', 'no',  NOW(), NOW()),
    (v_e08, v_roberto, 'gk',  'yes', NOW(), NOW()),
    (v_e08, v_lucas,   'line', 'yes', NOW(), NOW()),
    (v_e08, v_ana,     'line', 'yes', NOW(), NOW())
  ON CONFLICT (event_id, user_id) DO NOTHING;

  -- E09 (pelada futura): confirmacoes parciais
  INSERT INTO event_attendance (event_id, user_id, role, status, created_at, updated_at)
  VALUES
    (v_e09, v_pedro,   'line', 'yes', NOW(), NOW()),
    (v_e09, v_joao,    'line', 'yes', NOW(), NOW()),
    (v_e09, v_carlos,  'line', 'yes', NOW(), NOW()),
    (v_e09, v_maria,   'line', 'yes', NOW(), NOW()),
    (v_e09, v_roberto, 'gk',  'yes', NOW(), NOW()),
    (v_e09, v_lucas,   'line', 'no',  NOW(), NOW()),
    (v_e09, v_ana,     'line', 'yes', NOW(), NOW())
  ON CONFLICT (event_id, user_id) DO NOTHING;

  RAISE NOTICE '✅ 9 eventos criados + attendances inseridas.';
END $$;
