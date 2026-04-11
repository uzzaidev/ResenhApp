-- =====================================================
-- DEMO SEED 08 — Social Feed (Posts, Reações, Comentários)
-- =====================================================
-- Guard: verifica se social_posts existe antes de inserir.
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
  v_e07 UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380007';

  v_resenha_id UUID;

  -- Post UUIDs fixos
  v_post1 UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';
  v_post2 UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02';
  v_post3 UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03';
  v_post4 UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04';

  v_comment1 UUID;
  v_comment2 UUID;
BEGIN

  -- Guard: verificar se tabela social_posts existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'social_posts'
  ) THEN
    RAISE NOTICE 'Tabela social_posts nao existe. Migration Phase 4 nao aplicada.';
    RETURN;
  END IF;

  SELECT id INTO v_resenha_id FROM groups WHERE name = 'Resenha FC' LIMIT 1;
  IF v_resenha_id IS NULL THEN RAISE EXCEPTION 'Grupo Resenha FC nao encontrado.'; END IF;

  RAISE NOTICE 'Inserindo posts demo...';

  -- =================================================
  -- POSTS
  -- =================================================

  -- Post 1: Joao — Hat-trick (training_photo)
  INSERT INTO social_posts (id, author_id, group_id, post_type, content, media_urls,
    event_id, privacy, credits_pending, credits_awarded_at, created_at, updated_at)
  VALUES (
    v_post1, v_joao, v_resenha_id, 'training_photo',
    'Que noite epica! Hat-trick na Pelada #1 do Resenha FC! Obrigado Time Preto por mais uma vitoria arrasadora. Quem aguenta?! #ResenhaFC #HatTrick #BolaNoFundo',
    ARRAY[]::TEXT[],
    v_e02, 'group', FALSE, NOW()-INTERVAL '49 days',
    NOW()-INTERVAL '50 days', NOW()-INTERVAL '50 days'
  ) ON CONFLICT (id) DO NOTHING;

  -- Post 2: Maria — reflexao pos-jogo (text_update)
  INSERT INTO social_posts (id, author_id, group_id, post_type, content, media_urls,
    privacy, credits_pending, credits_awarded_at, created_at, updated_at)
  VALUES (
    v_post2, v_maria, v_resenha_id, 'text_update',
    'Esse grupo e especial demais! Cada pelada e uma historia nova. Semana que vem a gente busca a vitoria! Obrigada galera por mais uma noite incrivel #ResenhaFC',
    ARRAY[]::TEXT[],
    'group', FALSE, NOW()-INTERVAL '21 days',
    NOW()-INTERVAL '22 days', NOW()-INTERVAL '22 days'
  ) ON CONFLICT (id) DO NOTHING;

  -- Post 3: Pedro — resultado oficial (match_result)
  INSERT INTO social_posts (id, author_id, group_id, post_type, content, media_urls,
    event_id, privacy, credits_pending, credits_awarded_at, created_at, updated_at)
  VALUES (
    v_post3, v_pedro, v_resenha_id, 'match_result',
    E'RESULTADO — Pelada #3\n\nTime Azul 2x2 Time Vermelho\n\nDestaques:\nJoao Silva — 1 gol\nPedro Organizer — 1 gol\nAna Ponta — 1 gol\nMaria Meia — 1 gol\nRoberto Goleiro — 2 defesas decisivas!\n\nMVP da noite: Roberto Goleiro\n\nObrigado a todos! Proxima pelada em breve. #ResenhaFC',
    ARRAY[]::TEXT[],
    v_e07, 'group', FALSE, NOW()-INTERVAL '21 days',
    NOW()-INTERVAL '22 days', NOW()-INTERVAL '22 days'
  ) ON CONFLICT (id) DO NOTHING;

  -- Post 4: Ana — conquista (achievement)
  INSERT INTO social_posts (id, author_id, group_id, post_type, content, media_urls,
    privacy, credits_pending, credits_awarded_at, created_at, updated_at)
  VALUES (
    v_post4, v_ana, v_resenha_id, 'achievement',
    'Desbloqueei a conquista Pelada Viciado! 100% de presenca em todos os jogos. Nao perco uma! #ResenhaFC #PeladaViciado',
    ARRAY[]::TEXT[],
    'group', FALSE, NOW()-INTERVAL '21 days',
    NOW()-INTERVAL '22 days', NOW()-INTERVAL '22 days'
  ) ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Posts inseridos.';

  -- =================================================
  -- REACOES
  -- =================================================

  -- Reacoes Post 1 (hat-trick do Joao) — 5 reacoes
  INSERT INTO social_reactions (post_id, user_id, reaction_type, created_at)
  VALUES
    (v_post1, v_pedro,   'fire',    NOW()-INTERVAL '50 days'),
    (v_post1, v_carlos,  'goal',    NOW()-INTERVAL '50 days'),
    (v_post1, v_maria,   'awesome', NOW()-INTERVAL '50 days'),
    (v_post1, v_roberto, 'fire',    NOW()-INTERVAL '50 days'),
    (v_post1, v_ana,     'goal',    NOW()-INTERVAL '50 days')
  ON CONFLICT (post_id, user_id) DO NOTHING;

  -- Reacoes Post 2 (Maria)
  INSERT INTO social_reactions (post_id, user_id, reaction_type, created_at)
  VALUES
    (v_post2, v_pedro,  'like', NOW()-INTERVAL '22 days'),
    (v_post2, v_joao,   'like', NOW()-INTERVAL '22 days'),
    (v_post2, v_lucas,  'like', NOW()-INTERVAL '22 days')
  ON CONFLICT (post_id, user_id) DO NOTHING;

  -- Reacoes Post 3 (resultado) — 6 reacoes
  INSERT INTO social_reactions (post_id, user_id, reaction_type, created_at)
  VALUES
    (v_post3, v_joao,    'awesome', NOW()-INTERVAL '22 days'),
    (v_post3, v_carlos,  'like',    NOW()-INTERVAL '22 days'),
    (v_post3, v_maria,   'like',    NOW()-INTERVAL '22 days'),
    (v_post3, v_roberto, 'fire',    NOW()-INTERVAL '22 days'),
    (v_post3, v_lucas,   'like',    NOW()-INTERVAL '22 days'),
    (v_post3, v_ana,     'awesome', NOW()-INTERVAL '22 days')
  ON CONFLICT (post_id, user_id) DO NOTHING;

  -- Reacoes Post 4 (Ana conquista)
  INSERT INTO social_reactions (post_id, user_id, reaction_type, created_at)
  VALUES
    (v_post4, v_pedro,  'awesome', NOW()-INTERVAL '22 days'),
    (v_post4, v_joao,   'fire',    NOW()-INTERVAL '22 days'),
    (v_post4, v_maria,  'like',    NOW()-INTERVAL '22 days'),
    (v_post4, v_lucas,  'like',    NOW()-INTERVAL '22 days')
  ON CONFLICT (post_id, user_id) DO NOTHING;

  RAISE NOTICE 'Reacoes inseridas.';

  -- =================================================
  -- COMENTARIOS
  -- =================================================

  -- Comentarios no Post 1 (hat-trick)
  INSERT INTO social_comments (post_id, author_id, content, created_at, updated_at)
  VALUES (v_post1, v_pedro, 'Que show! Hat-trick historico no Resenha. Lenda!', NOW()-INTERVAL '50 days', NOW())
  RETURNING id INTO v_comment1;

  INSERT INTO social_comments (post_id, author_id, content, created_at, updated_at)
  VALUES (v_post1, v_carlos, 'Tentei marcar mas e impossivel parar esse cara. Parabens Joao!', NOW()-INTERVAL '50 days', NOW());

  IF v_comment1 IS NOT NULL THEN
    INSERT INTO social_comments (post_id, author_id, parent_comment_id, content, created_at, updated_at)
    VALUES (v_post1, v_joao, v_comment1, 'Haha muito obrigado Pedro! Semana que vem tem mais', NOW()-INTERVAL '49 days', NOW());
  END IF;

  -- Comentarios no Post 3 (resultado)
  INSERT INTO social_comments (post_id, author_id, content, created_at, updated_at)
  VALUES (v_post3, v_roberto, 'Que jogo tenso! Essas 2 defesas foram das melhores que ja fiz', NOW()-INTERVAL '22 days', NOW())
  RETURNING id INTO v_comment2;

  INSERT INTO social_comments (post_id, author_id, content, created_at, updated_at)
  VALUES (v_post3, v_ana, 'Roberto salvou o empate! MVP merecidissimo', NOW()-INTERVAL '22 days', NOW());

  INSERT INTO social_comments (post_id, author_id, content, created_at, updated_at)
  VALUES (v_post3, v_maria, 'Valeu galera! Proxima semana a gente vence', NOW()-INTERVAL '21 days', NOW());

  RAISE NOTICE '✅ Social feed demo criado com sucesso!';

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao inserir social data: %', SQLERRM;
END $$;
