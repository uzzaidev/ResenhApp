-- =====================================================
-- DEMO SEED 01 — Usuários
-- =====================================================
-- Cria 7 usuários demo em public.users (NextAuth).
-- NÃO cria profiles (FK depende de auth.users que está vazio).
--
-- Logins:
--   pedro@demo.resenhapp.com   / Demo@1234  (organizer)
--   joao@demo.resenhapp.com    / Demo@1234  (artilheiro)
--   carlos@demo.resenhapp.com  / Demo@1234  (defensor)
--   maria@demo.resenhapp.com   / Demo@1234  (meia)
--   roberto@demo.resenhapp.com / Demo@1234  (goleiro)
--   lucas@demo.resenhapp.com   / Demo@1234  (lateral)
--   ana@demo.resenhapp.com     / Demo@1234  (ponta)
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
  v_hash    TEXT;
BEGIN

  -- Gerar hash bcrypt para Demo@1234
  v_hash := crypt('Demo@1234', gen_salt('bf', 10));

  INSERT INTO users (id, name, email, password_hash, onboarding_completed, created_at, updated_at)
  VALUES
    (v_pedro,   'Pedro Organizer',    'pedro@demo.resenhapp.com',   v_hash, TRUE, NOW() - INTERVAL '70 days', NOW()),
    (v_joao,    'Joao Artilheiro',    'joao@demo.resenhapp.com',    v_hash, TRUE, NOW() - INTERVAL '65 days', NOW()),
    (v_carlos,  'Carlos Defensor',    'carlos@demo.resenhapp.com',  v_hash, TRUE, NOW() - INTERVAL '63 days', NOW()),
    (v_maria,   'Maria Meia',         'maria@demo.resenhapp.com',   v_hash, TRUE, NOW() - INTERVAL '62 days', NOW()),
    (v_roberto, 'Roberto Goleiro',    'roberto@demo.resenhapp.com', v_hash, TRUE, NOW() - INTERVAL '61 days', NOW()),
    (v_lucas,   'Lucas Lateral',      'lucas@demo.resenhapp.com',   v_hash, TRUE, NOW() - INTERVAL '61 days', NOW()),
    (v_ana,     'Ana Ponta',          'ana@demo.resenhapp.com',     v_hash, TRUE, NOW() - INTERVAL '60 days', NOW())
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        password_hash = EXCLUDED.password_hash,
        onboarding_completed = EXCLUDED.onboarding_completed;

  RAISE NOTICE '✅ 7 usuários demo criados. Login: pedro@demo.resenhapp.com / Demo@1234';
END $$;
