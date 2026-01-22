-- =====================================================
-- SEED DATA - Peladeiros V2.0 (Supabase)
-- Version: 1.0
-- Date: 2026-01-21
-- Description: Initial seed data for development and testing
-- =====================================================

-- NOTE: This file is for development/testing only
-- DO NOT run this in production without modifications

-- =====================================================
-- SPORT MODALITIES (if needed in future)
-- =====================================================

-- Currently handled by ENUM sport_modality_type
-- Add more modalities as needed in future migrations

-- =====================================================
-- NOTIFICATION TEMPLATES (already seeded in migration)
-- =====================================================

-- Already included in 20260211000001_notifications.sql
-- Listed here for reference:
-- - event_created
-- - event_reminder
-- - payment_request
-- - payment_received
-- - team_drawn
-- - achievement_unlocked
-- - waitlist_moved
-- - group_invite

-- =====================================================
-- ACHIEVEMENT TYPES (already seeded in migration)
-- =====================================================

-- Already included in 20260225000001_gamification.sql
-- 18 default achievements covering:
-- - Goals (5 achievements)
-- - Assists (3 achievements)
-- - Participation (4 achievements)
-- - Streaks (3 achievements)
-- - Special (3 achievements)

-- =====================================================
-- ADDITIONAL ACHIEVEMENT TYPES (Optional)
-- =====================================================

INSERT INTO achievement_types (code, name, description, category, unlock_criteria, rarity, points) VALUES
-- Goalkeeper achievements
('ACH-FIRST-SAVE', 'Primeira Defesa', 'Faça sua primeira defesa como goleiro', 'goals', '{"type": "saves", "threshold": 1}', 'common', 10),
('ACH-CLEAN-SHEET', 'Saldo Limpo', 'Não tome gols em uma partida', 'special', '{"type": "clean_sheet"}', 'rare', 150),
('ACH-SAVES-50', '50 Defesas', 'Faça 50 defesas', 'goals', '{"type": "saves", "threshold": 50}', 'epic', 300),

-- Social achievements
('ACH-INVITER', 'Recrutador', 'Convide 5 amigos para o grupo', 'special', '{"type": "invites", "threshold": 5}', 'uncommon', 50),
('ACH-CREATOR', 'Fundador', 'Crie um grupo', 'special', '{"type": "group_created"}', 'rare', 100),

-- Payment achievements
('ACH-ALWAYS-PAYS', 'Pagador Fiel', 'Pague 10 eventos consecutivos', 'special', '{"type": "payment_streak", "threshold": 10}', 'rare', 150),
('ACH-FIRST-PAYMENT', 'Primeiro Pagamento', 'Faça seu primeiro pagamento via Pix', 'special', '{"type": "pix_payment"}', 'common', 10)

ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- BADGES (Visual badges for groups)
-- =====================================================

INSERT INTO badges (code, name, description, icon_url, color, rarity, earn_criteria) VALUES
('BADGE-FOUNDER', 'Fundador', 'Criou um grupo', '🏆', '#FFD700', 'epic', '{"type": "group_created"}'),
('BADGE-100-GOALS', 'Artilheiro 100', 'Marcou 100 gols', '⚽', '#FF4500', 'legendary', '{"type": "goals", "threshold": 100}'),
('BADGE-MVP', 'MVP', 'Eleito MVP do mês', '⭐', '#FFD700', 'rare', '{"type": "mvp_month"}'),
('BADGE-PERFECT-ATTENDANCE', 'Presença Perfeita', 'Presença perfeita por um mês', '📅', '#32CD32', 'rare', '{"type": "perfect_month"}'),
('BADGE-GOALKEEPER', 'Goleiro Raiz', 'Jogou 20 jogos como goleiro', '🧤', '#1E90FF', 'uncommon', '{"type": "goalkeeper_games", "threshold": 20}'),
('BADGE-CAPTAIN', 'Capitão', 'Foi capitão 10 vezes', '©️', '#FFD700', 'uncommon', '{"type": "captain", "threshold": 10}'),
('BADGE-EARLY-BIRD', 'Madrugador', 'Primeiro a confirmar 20 vezes', '🌅', '#FFA500', 'uncommon', '{"type": "early_bird", "threshold": 20}'),
('BADGE-VETERAN', 'Veterano', 'Participou de 100 peladas', '🎖️', '#CD853F', 'epic', '{"type": "events", "threshold": 100}')

ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- DEMO DATA (for development only)
-- =====================================================

-- WARNING: Only use this section in development environments
-- Comment out or remove for production

-- Demo Users (will be created via Supabase Auth signup)
-- These are just placeholders for profile data after signup

-- Example: Insert demo profile after auth.users is populated
-- INSERT INTO profiles (id, full_name, display_name, platform_role)
-- VALUES
--   ('uuid-from-auth-users-1', 'João Silva', 'João', 'organizer'),
--   ('uuid-from-auth-users-2', 'Maria Santos', 'Maria', 'player'),
--   ('uuid-from-auth-users-3', 'Pedro Oliveira', 'Pedro', 'player')
-- ON CONFLICT (id) DO NOTHING;

-- Demo Group
-- INSERT INTO groups (name, description, sport_modality, created_by)
-- VALUES
--   ('Pelada da Vila', 'Pelada tradicional de terça-feira', 'futsal', 'uuid-from-auth-users-1')
-- ON CONFLICT DO NOTHING;

-- Demo Venue
-- INSERT INTO venues (name, address, city, state, surface_type, has_lighting)
-- VALUES
--   ('Quadra da Vila', 'Rua das Flores, 123', 'São Paulo', 'SP', 'synthetic', true)
-- ON CONFLICT DO NOTHING;

-- =====================================================
-- HELPER QUERIES (for testing and debugging)
-- =====================================================

-- Check if all migrations were applied successfully
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Count total tables created
-- SELECT COUNT(*) as total_tables FROM pg_tables WHERE schemaname = 'public';

-- Check all active achievements
-- SELECT code, name, category, rarity FROM achievement_types WHERE is_active = true ORDER BY category, rarity;

-- Check all notification templates
-- SELECT template_key, template_name FROM notification_templates WHERE is_active = true ORDER BY template_key;

-- Check all badges
-- SELECT code, name, rarity FROM badges WHERE is_active = true ORDER BY rarity;

-- =====================================================
-- INITIAL CONFIGURATION (recommended settings)
-- =====================================================

-- These can be run after initial user signup

-- Example: Set a user as organizer (after signup)
-- UPDATE profiles
-- SET platform_role = 'organizer'
-- WHERE email = 'admin@example.com';

-- Example: Create a default notification template for custom events
-- INSERT INTO notification_templates (
--   template_key,
--   template_name,
--   title_template,
--   body_template,
--   available_variables
-- ) VALUES (
--   'custom_announcement',
--   'Anúncio Personalizado',
--   '{{title}}',
--   '{{message}}',
--   '["title", "message", "sender_name"]'
-- );

-- =====================================================
-- CLEANUP (for development resets)
-- =====================================================

-- WARNING: DESTRUCTIVE OPERATIONS
-- Only use these in development to reset data

-- Drop all user data (keeps schema)
-- TRUNCATE profiles, groups, events CASCADE;

-- Reset all sequences
-- ALTER SEQUENCE groups_id_seq RESTART WITH 1;
-- ALTER SEQUENCE events_id_seq RESTART WITH 1;
-- ... (add more as needed)

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify RLS is enabled on all tables
/*
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
*/

-- Check all RLS policies
/*
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
*/

-- Verify all enums
/*
SELECT
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%_type'
ORDER BY t.typname, e.enumsortorder;
*/

-- =====================================================
-- PERFORMANCE INDEXES VERIFICATION
-- =====================================================

-- List all indexes
/*
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
*/

-- =====================================================
-- END OF SEED FILE
-- =====================================================

-- NOTES FOR DEVELOPERS:
-- 1. This seed file is meant for development/testing
-- 2. Modify demo data as needed for your use case
-- 3. Never run demo data in production
-- 4. Use Supabase Auth for creating real users
-- 5. Verification queries are commented out - uncomment to use

-- NEXT STEPS:
-- 1. Apply migrations: supabase db push
-- 2. Run this seed file (optional, for dev only)
-- 3. Configure Supabase Auth providers
-- 4. Create Storage buckets
-- 5. Deploy Edge Functions
-- 6. Integrate with Next.js frontend

---

-- Created: 2026-01-21
-- Version: 1.0
-- Status: Development Use Only
