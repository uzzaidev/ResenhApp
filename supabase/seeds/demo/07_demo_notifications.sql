-- =====================================================
-- DEMO SEED 07 — Notificações
-- =====================================================
-- Notificações para todos os usuários.
-- Mistura de lidas e não-lidas.
-- IMPORTANTE: code deve ser ÚNICO (NOT NULL UNIQUE).
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
BEGIN

  INSERT INTO notifications (code, user_id, type, title, body, action_url, is_read, read_at, created_at)
  VALUES

    -- Pedro (organizer) — 3 notificações
    ('DEMO-N-001', v_pedro, 'charge_confirmed',
     'Pagamento confirmado',
     'Joao confirmou o pagamento da Pelada #3. R$20,00 recebido.',
     '/financeiro', TRUE, NOW()-INTERVAL '21 days', NOW()-INTERVAL '22 days'),

    ('DEMO-N-002', v_pedro, 'charge_self_reported',
     'Auto-reporte de pagamento',
     'Carlos reportou que pagou a Pelada #3. Aguardando sua confirmacao.',
     '/financeiro', FALSE, NULL, NOW()-INTERVAL '20 days'),

    ('DEMO-N-003', v_pedro, 'event_reminder',
     'Lembrete: Treino amanha',
     'Seu treino no Resenha FC esta marcado para amanha as 09h. 6 confirmados ate agora.',
     '/eventos', FALSE, NULL, NOW()-INTERVAL '1 day'),

    -- Joao (artilheiro) — 3 notificações
    ('DEMO-N-004', v_joao, 'achievement_unlocked',
     'Conquista desbloqueada: Hat-trick!',
     'Parabens! Voce marcou 3 gols na Pelada #1 e desbloqueou a conquista Hat-trick.',
     '/conquistas', TRUE, NOW()-INTERVAL '49 days', NOW()-INTERVAL '50 days'),

    ('DEMO-N-005', v_joao, 'achievement_unlocked',
     'Conquista desbloqueada: Artilheiro!',
     'Voce e o artilheiro do Resenha FC com 4 gols! Conquista lendaria desbloqueada.',
     '/conquistas', TRUE, NOW()-INTERVAL '21 days', NOW()-INTERVAL '22 days'),

    ('DEMO-N-006', v_joao, 'event_reminder',
     'Pelada #4 em 14 dias!',
     'Confirme sua presenca na proxima Pelada Oficial do Resenha FC.',
     '/eventos', FALSE, NULL, NOW()-INTERVAL '1 day'),

    -- Carlos (defensor) — 2 notificações
    ('DEMO-N-007', v_carlos, 'charge_pending',
     'Pagamento pendente — Pelada #3',
     'Seu pagamento de R$20,00 pela Pelada #3 esta aguardando confirmacao do organizador.',
     '/financeiro', FALSE, NULL, NOW()-INTERVAL '20 days'),

    ('DEMO-N-008', v_carlos, 'event_reminder',
     'Proximo treino confirmado!',
     'Voce esta confirmado no treino de amanha. Boa sorte!',
     '/eventos', FALSE, NULL, NOW()-INTERVAL '1 day'),

    -- Maria (meia) — 2 notificações
    ('DEMO-N-009', v_maria, 'achievement_unlocked',
     'Conquista: Primeiro MVP',
     'Voce foi eleita MVP na Pelada #2! Continuidade premiada.',
     '/conquistas', TRUE, NOW()-INTERVAL '39 days', NOW()-INTERVAL '40 days'),

    ('DEMO-N-010', v_maria, 'event_reminder',
     'Treino amanha — Arena Society SP',
     'Lembre-se do treino amanha as 09h. Chegue cedo para aquecer!',
     '/eventos', FALSE, NULL, NOW()-INTERVAL '2 hours'),

    -- Roberto (goleiro) — 2 notificações
    ('DEMO-N-011', v_roberto, 'achievement_unlocked',
     'Conquista: Goleiro Fera!',
     'Com 7 defesas em 3 jogos, voce desbloqueou Goleiro Fera. Incrivel!',
     '/conquistas', TRUE, NOW()-INTERVAL '21 days', NOW()-INTERVAL '22 days'),

    ('DEMO-N-012', v_roberto, 'achievement_unlocked',
     'MVP — Pelada #3',
     'A galera escolheu voce como MVP da Pelada #3! Duas defesas decisivas.',
     '/conquistas', TRUE, NOW()-INTERVAL '21 days', NOW()-INTERVAL '22 days'),

    -- Lucas (lateral) — 2 notificações
    ('DEMO-N-013', v_lucas, 'charge_pending',
     'Cobranca pendente — Pelada #3',
     'Voce ainda nao pagou a Pelada #3 (R$20,00). Vencimento passou. Por favor regularize.',
     '/financeiro', FALSE, NULL, NOW()-INTERVAL '18 days'),

    ('DEMO-N-014', v_lucas, 'event_reminder',
     'Pelada #4 em 14 dias — confirme!',
     'Sua presenca na proxima pelada ainda nao foi confirmada. Confirme agora!',
     '/eventos', FALSE, NULL, NOW()-INTERVAL '6 hours'),

    -- Ana (ponta) — 2 notificações
    ('DEMO-N-015', v_ana, 'achievement_unlocked',
     'Conquista: Pelada Viciado!',
     '100% de presenca em todos os jogos! Voce nunca falta uma pelada.',
     '/conquistas', TRUE, NOW()-INTERVAL '21 days', NOW()-INTERVAL '22 days'),

    ('DEMO-N-016', v_ana, 'event_reminder',
     'Treino amanha — voce esta confirmada!',
     'Sua presenca no treino de amanha esta confirmada. Ate la!',
     '/eventos', FALSE, NULL, NOW()-INTERVAL '1 day')

  ON CONFLICT (code) DO NOTHING;

  RAISE NOTICE '✅ 16 notificacoes demo criadas.';
END $$;
