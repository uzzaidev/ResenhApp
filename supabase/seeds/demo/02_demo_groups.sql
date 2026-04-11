-- =====================================================
-- DEMO SEED 02 — Grupos, Venue, Membros, Receiver Profile
-- =====================================================
-- Cria:
--   - 1 venue (Arena Society SP)
--   - Resenha FC (pelada/standalone) — grupo principal do demo
--   - Atletica Demo (athletic/parent)
--   - Futebol Society Terca (pelada/child da Atletica)
--   - 1 receiver_profile PIX para Resenha FC
--   - group_members para todos os 3 grupos
--   - 1 invite por grupo
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

  v_venue_id    UUID;
  v_resenha_id  UUID;
  v_atletica_id UUID;
  v_society_id  UUID;
  v_recv_id     UUID;
BEGIN

  -- =================================================
  -- VENUE
  -- =================================================
  INSERT INTO venues (group_id, name, address, created_at)
  VALUES (NULL, 'Arena Society SP', 'Rua das Palmeiras, 42 - Vila Madalena, Sao Paulo SP', NOW() - INTERVAL '70 days')
  RETURNING id INTO v_venue_id;
  RAISE NOTICE 'Venue criado: id=%', v_venue_id;

  -- =================================================
  -- GRUPO 1: Resenha FC (pelada/standalone)
  -- =================================================
  INSERT INTO groups (
    name, description, privacy, group_type,
    created_by, credits_balance, credits_purchased, credits_consumed,
    created_at, updated_at
  ) VALUES (
    'Resenha FC',
    'A pelada mais animada da Vila Madalena! Todo sabado tem racha. Organizacao do Pedro, galera boa e campo bom.',
    'private', 'pelada',
    v_pedro, 450, 550, 100,
    NOW() - INTERVAL '70 days', NOW()
  )
  RETURNING id INTO v_resenha_id;
  RAISE NOTICE 'Resenha FC criado: id=%', v_resenha_id;

  -- Vincular venue ao grupo
  UPDATE venues SET group_id = v_resenha_id WHERE id = v_venue_id;

  -- Receiver profile PIX para Resenha FC
  INSERT INTO receiver_profiles (type, entity_id, pix_key, pix_type, name, city, bank_name, instructions, created_at, updated_at)
  VALUES (
    'institution', v_resenha_id,
    'resenhafc@demo.resenhapp.com', 'email',
    'Resenha FC', 'Sao Paulo',
    'Banco Demo', 'Pague via PIX para confirmar sua vaga na pelada.',
    NOW(), NOW()
  )
  RETURNING id INTO v_recv_id;

  -- Membros Resenha FC
  -- role: 'admin' (organizer) ou 'member'. base_rating 0-10.
  INSERT INTO group_members (user_id, group_id, role, is_goalkeeper, base_rating, joined_at, is_mensalista, monthly_amount_cents)
  VALUES
    (v_pedro,   v_resenha_id, 'admin',  FALSE, 8, NOW() - INTERVAL '70 days', FALSE, 0),
    (v_joao,    v_resenha_id, 'member', FALSE, 9, NOW() - INTERVAL '65 days', FALSE, 0),
    (v_carlos,  v_resenha_id, 'member', FALSE, 7, NOW() - INTERVAL '63 days', FALSE, 0),
    (v_maria,   v_resenha_id, 'member', FALSE, 8, NOW() - INTERVAL '62 days', FALSE, 0),
    (v_roberto, v_resenha_id, 'member', TRUE,  8, NOW() - INTERVAL '61 days', FALSE, 0),
    (v_lucas,   v_resenha_id, 'member', FALSE, 7, NOW() - INTERVAL '61 days', FALSE, 0),
    (v_ana,     v_resenha_id, 'member', FALSE, 8, NOW() - INTERVAL '60 days', FALSE, 0);

  -- Invite Resenha FC
  INSERT INTO invites (group_id, code, created_by, max_uses, used_count, created_at)
  VALUES (v_resenha_id, 'RESENHA-ENTRA', v_pedro, NULL, 6, NOW() - INTERVAL '60 days');

  RAISE NOTICE 'Resenha FC — 7 membros, 1 invite, 1 receiver_profile.';

  -- =================================================
  -- GRUPO 2: Atletica Demo (athletic/parent)
  -- =================================================
  INSERT INTO groups (
    name, description, privacy, group_type,
    created_by, credits_balance, credits_purchased, credits_consumed,
    created_at, updated_at
  ) VALUES (
    'Atletica Demo',
    'Atletica multiesportiva para demonstracao da hierarquia de grupos. Gerencia multiplas modalidades.',
    'private', 'athletic',
    v_pedro, 1200, 1500, 300,
    NOW() - INTERVAL '80 days', NOW()
  )
  RETURNING id INTO v_atletica_id;
  RAISE NOTICE 'Atletica Demo criada: id=%', v_atletica_id;

  -- Membros Atletica
  INSERT INTO group_members (user_id, group_id, role, is_goalkeeper, base_rating, joined_at)
  VALUES
    (v_pedro,  v_atletica_id, 'admin',  FALSE, 8, NOW() - INTERVAL '80 days'),
    (v_joao,   v_atletica_id, 'admin',  FALSE, 9, NOW() - INTERVAL '75 days'),
    (v_carlos, v_atletica_id, 'member', FALSE, 7, NOW() - INTERVAL '70 days');

  -- Invite Atletica
  INSERT INTO invites (group_id, code, created_by, max_uses, used_count, created_at)
  VALUES (v_atletica_id, 'ATLETICA-ENTRA', v_pedro, 50, 3, NOW() - INTERVAL '70 days');

  RAISE NOTICE 'Atletica Demo — 3 membros.';

  -- =================================================
  -- GRUPO 3: Futebol Society - Terca (filho da Atletica)
  -- =================================================
  INSERT INTO groups (
    name, description, privacy, group_type,
    parent_group_id,
    created_by, credits_balance, credits_purchased, credits_consumed,
    created_at, updated_at
  ) VALUES (
    'Futebol Society - Terca',
    'Grupo de futebol society vinculado a Atletica Demo. Administrado pelo Joao, joga toda terca.',
    'private', 'pelada',
    v_atletica_id,
    v_joao, 200, 200, 0,
    NOW() - INTERVAL '40 days', NOW()
  )
  RETURNING id INTO v_society_id;
  RAISE NOTICE 'Futebol Society - Terca criado: id=%', v_society_id;

  -- Membros Society
  INSERT INTO group_members (user_id, group_id, role, is_goalkeeper, base_rating, joined_at)
  VALUES
    (v_joao,   v_society_id, 'admin',  FALSE, 9, NOW() - INTERVAL '40 days'),
    (v_carlos, v_society_id, 'member', FALSE, 7, NOW() - INTERVAL '38 days'),
    (v_maria,  v_society_id, 'member', FALSE, 8, NOW() - INTERVAL '37 days'),
    (v_lucas,  v_society_id, 'member', FALSE, 7, NOW() - INTERVAL '36 days'),
    (v_ana,    v_society_id, 'member', FALSE, 8, NOW() - INTERVAL '35 days');

  -- Invite Society
  INSERT INTO invites (group_id, code, created_by, max_uses, used_count, created_at)
  VALUES (v_society_id, 'SOCIETY-ENTRA', v_joao, 20, 4, NOW() - INTERVAL '35 days');

  RAISE NOTICE 'Futebol Society - Terca — 5 membros.';

  RAISE NOTICE '✅ Grupos criados: Resenha FC (%), Atletica Demo (%), Society (%)',
    v_resenha_id, v_atletica_id, v_society_id;
END $$;
