-- =====================================================
-- DEMO SEED — MASTER SCRIPT
-- ResenhApp v2.0 — Dados de Demonstração Completos
-- =====================================================
-- Execute este arquivo para popular o banco com todos
-- os dados de demonstração em ordem correta.
--
-- REQUISITOS:
--   - Migrations aplicadas (supabase db push)
--   - Conexão direta ao banco (psql ou Supabase SQL Editor)
--   - Role com permissão de INSERT em todas as tabelas
--
-- USO:
--   psql "$DATABASE_URL" -f supabase/seeds/demo/RUN_ALL_DEMO.sql
--
-- OU no Supabase Dashboard:
--   SQL Editor → copiar e colar este arquivo
--
-- LOGINS CRIADOS:
--   pedro@demo.resenhapp.com  / Demo@1234  (admin)
--   joao@demo.resenhapp.com   / Demo@1234  (artilheiro)
--   carlos@demo.resenhapp.com / Demo@1234  (defensor)
--   maria@demo.resenhapp.com  / Demo@1234  (meia)
--   roberto@demo.resenhapp.com/ Demo@1234  (goleiro)
--   lucas@demo.resenhapp.com  / Demo@1234  (lateral)
--   ana@demo.resenhapp.com    / Demo@1234  (ponta)
-- =====================================================

\echo '================================================='
\echo 'ResenhApp Demo Seed — Iniciando...'
\echo '================================================='

-- Limpar dados anteriores de demo (seguro — só apaga emails @demo.resenhapp.com)
\echo '[0/8] Limpando dados de demo anteriores...'
\i 00_demo_cleanup.sql

\echo '[1/8] Criando usuários e perfis...'
\i 01_demo_users.sql

\echo '[2/8] Criando grupos, venues e membros...'
\i 02_demo_groups.sql

\echo '[3/8] Criando eventos e RSVPs...'
\i 03_demo_events.sql

\echo '[4/8] Criando partidas (times, ações, stats)...'
\i 04_demo_partidas.sql

\echo '[5/8] Criando dados financeiros...'
\i 05_demo_financeiro.sql

\echo '[6/8] Criando gamificação (conquistas, rankings)...'
\i 06_demo_gamification.sql

\echo '[7/8] Criando notificações...'
\i 07_demo_notifications.sql

\echo '[8/8] Criando social feed...'
\i 08_demo_social.sql

\echo '================================================='
\echo '✅ Demo seed concluído com sucesso!'
\echo ''
\echo 'Login admin:   pedro@demo.resenhapp.com / Demo@1234'
\echo 'Login jogador: joao@demo.resenhapp.com  / Demo@1234'
\echo '================================================='
