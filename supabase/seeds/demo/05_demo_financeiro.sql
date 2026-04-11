-- =====================================================
-- DEMO SEED 05 — Cobranças (Financeiro)
-- =====================================================
-- Uma charge por usuario por evento jogado.
-- Modelo real: charges é POR USUÁRIO (group_id + user_id).
--
-- Eventos cobrados:
--   E02 (Pelada #1, 50 dias atrás): todos pagaram
--   E04 (Pelada #2, 40 dias atrás): todos pagaram
--   E07 (Pelada #3, 22 dias atrás): mistura paid/pending/self_reported
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
  v_recv_id    UUID;
BEGIN

  SELECT id INTO v_resenha_id FROM groups WHERE name = 'Resenha FC' LIMIT 1;
  IF v_resenha_id IS NULL THEN RAISE EXCEPTION 'Grupo Resenha FC nao encontrado.'; END IF;

  SELECT id INTO v_recv_id FROM receiver_profiles WHERE entity_id = v_resenha_id LIMIT 1;

  -- =================================================
  -- E02 — Pelada #1 (50 dias atrás): todos pagaram
  -- R$20,00 por pessoa = 2000 cents
  -- =================================================
  INSERT INTO charges (group_id, user_id, type, amount_cents, due_date, status,
    event_id, receiver_profile_id, paid_at, created_at, updated_at)
  VALUES
    (v_resenha_id, v_pedro,   'daily', 2000, (NOW()-INTERVAL '50 days')::date, 'paid', v_e02, v_recv_id, NOW()-INTERVAL '49 days', NOW()-INTERVAL '50 days', NOW()),
    (v_resenha_id, v_joao,    'daily', 2000, (NOW()-INTERVAL '50 days')::date, 'paid', v_e02, v_recv_id, NOW()-INTERVAL '49 days', NOW()-INTERVAL '50 days', NOW()),
    (v_resenha_id, v_carlos,  'daily', 2000, (NOW()-INTERVAL '50 days')::date, 'paid', v_e02, v_recv_id, NOW()-INTERVAL '49 days', NOW()-INTERVAL '50 days', NOW()),
    (v_resenha_id, v_maria,   'daily', 2000, (NOW()-INTERVAL '50 days')::date, 'paid', v_e02, v_recv_id, NOW()-INTERVAL '49 days', NOW()-INTERVAL '50 days', NOW()),
    (v_resenha_id, v_roberto, 'daily', 2000, (NOW()-INTERVAL '50 days')::date, 'paid', v_e02, v_recv_id, NOW()-INTERVAL '49 days', NOW()-INTERVAL '50 days', NOW()),
    (v_resenha_id, v_lucas,   'daily', 2000, (NOW()-INTERVAL '50 days')::date, 'paid', v_e02, v_recv_id, NOW()-INTERVAL '49 days', NOW()-INTERVAL '50 days', NOW()),
    (v_resenha_id, v_ana,     'daily', 2000, (NOW()-INTERVAL '50 days')::date, 'paid', v_e02, v_recv_id, NOW()-INTERVAL '49 days', NOW()-INTERVAL '50 days', NOW());

  RAISE NOTICE 'E02 — 7 cobranças pagas.';

  -- =================================================
  -- E04 — Pelada #2 (40 dias atrás): todos pagaram
  -- =================================================
  INSERT INTO charges (group_id, user_id, type, amount_cents, due_date, status,
    event_id, receiver_profile_id, paid_at, created_at, updated_at)
  VALUES
    (v_resenha_id, v_pedro,   'daily', 2000, (NOW()-INTERVAL '40 days')::date, 'paid', v_e04, v_recv_id, NOW()-INTERVAL '39 days', NOW()-INTERVAL '40 days', NOW()),
    (v_resenha_id, v_joao,    'daily', 2000, (NOW()-INTERVAL '40 days')::date, 'paid', v_e04, v_recv_id, NOW()-INTERVAL '39 days', NOW()-INTERVAL '40 days', NOW()),
    (v_resenha_id, v_carlos,  'daily', 2000, (NOW()-INTERVAL '40 days')::date, 'paid', v_e04, v_recv_id, NOW()-INTERVAL '39 days', NOW()-INTERVAL '40 days', NOW()),
    (v_resenha_id, v_maria,   'daily', 2000, (NOW()-INTERVAL '40 days')::date, 'paid', v_e04, v_recv_id, NOW()-INTERVAL '39 days', NOW()-INTERVAL '40 days', NOW()),
    (v_resenha_id, v_roberto, 'daily', 2000, (NOW()-INTERVAL '40 days')::date, 'paid', v_e04, v_recv_id, NOW()-INTERVAL '39 days', NOW()-INTERVAL '40 days', NOW()),
    (v_resenha_id, v_lucas,   'daily', 2000, (NOW()-INTERVAL '40 days')::date, 'paid', v_e04, v_recv_id, NOW()-INTERVAL '39 days', NOW()-INTERVAL '40 days', NOW()),
    (v_resenha_id, v_ana,     'daily', 2000, (NOW()-INTERVAL '40 days')::date, 'paid', v_e04, v_recv_id, NOW()-INTERVAL '39 days', NOW()-INTERVAL '40 days', NOW());

  RAISE NOTICE 'E04 — 7 cobranças pagas.';

  -- =================================================
  -- E07 — Pelada #3 (22 dias atrás): mistura de status
  --   Pedro: pago
  --   Joao: pago
  --   Carlos: self_reported (aguardando confirmação)
  --   Maria: pago
  --   Roberto: pago
  --   Lucas: pendente
  --   Ana: pago
  -- =================================================
  INSERT INTO charges (group_id, user_id, type, amount_cents, due_date, status,
    event_id, receiver_profile_id, paid_at, self_reported_at, created_at, updated_at)
  VALUES
    (v_resenha_id, v_pedro,   'daily', 2000, (NOW()-INTERVAL '22 days')::date, 'paid',          v_e07, v_recv_id, NOW()-INTERVAL '21 days', NULL,                   NOW()-INTERVAL '22 days', NOW()),
    (v_resenha_id, v_joao,    'daily', 2000, (NOW()-INTERVAL '22 days')::date, 'paid',          v_e07, v_recv_id, NOW()-INTERVAL '21 days', NULL,                   NOW()-INTERVAL '22 days', NOW()),
    (v_resenha_id, v_carlos,  'daily', 2000, (NOW()-INTERVAL '22 days')::date, 'self_reported', v_e07, v_recv_id, NULL,                   NOW()-INTERVAL '20 days', NOW()-INTERVAL '22 days', NOW()),
    (v_resenha_id, v_maria,   'daily', 2000, (NOW()-INTERVAL '22 days')::date, 'paid',          v_e07, v_recv_id, NOW()-INTERVAL '21 days', NULL,                   NOW()-INTERVAL '22 days', NOW()),
    (v_resenha_id, v_roberto, 'daily', 2000, (NOW()-INTERVAL '22 days')::date, 'paid',          v_e07, v_recv_id, NOW()-INTERVAL '21 days', NULL,                   NOW()-INTERVAL '22 days', NOW()),
    (v_resenha_id, v_lucas,   'daily', 2000, (NOW()-INTERVAL '22 days')::date, 'pending',       v_e07, v_recv_id, NULL,                   NULL,                    NOW()-INTERVAL '22 days', NOW()),
    (v_resenha_id, v_ana,     'daily', 2000, (NOW()-INTERVAL '22 days')::date, 'paid',          v_e07, v_recv_id, NOW()-INTERVAL '21 days', NULL,                   NOW()-INTERVAL '22 days', NOW());

  RAISE NOTICE 'E07 — 7 cobranças (5 pagas, 1 self_reported, 1 pendente).';

  RAISE NOTICE '✅ Financeiro demo concluido: 21 cobranças criadas.';
END $$;
