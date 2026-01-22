-- =====================================================
-- Migration: Initial Schema (Extensions + Enums)
-- Version: 1.0
-- Date: 2026-01-27
-- Description: Enable PostgreSQL extensions and create base enums
-- =====================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram text search
CREATE EXTENSION IF NOT EXISTS "postgis";        -- Geolocation support

-- =====================================================
-- ENUMS
-- =====================================================

-- User platform roles
CREATE TYPE platform_role_type AS ENUM (
  'player',       -- Jogador comum
  'organizer',    -- Organizador (pode criar múltiplos grupos)
  'admin',        -- Admin da plataforma
  'super_admin'   -- Super admin
);

-- Group member roles
CREATE TYPE group_role_type AS ENUM (
  'owner',      -- Dono do grupo
  'admin',      -- Administrador
  'moderator',  -- Moderador
  'member'      -- Membro comum
);

-- Event privacy types
CREATE TYPE event_privacy_type AS ENUM (
  'private',  -- Privado (apenas membros do grupo)
  'public'    -- Público (qualquer um pode ver)
);

-- RSVP status types
CREATE TYPE rsvp_status_type AS ENUM (
  'yes',       -- Confirmado
  'no',        -- Não vai
  'maybe',     -- Talvez
  'waitlist'   -- Lista de espera
);

-- Player positions
CREATE TYPE player_position_type AS ENUM (
  'goalkeeper',      -- Goleiro
  'defender',        -- Zagueiro
  'midfielder',      -- Meio-campo
  'forward',         -- Atacante
  'versatile'        -- Versátil
);

-- Event action types
CREATE TYPE event_action_type AS ENUM (
  'goal',           -- Gol
  'assist',         -- Assistência
  'own_goal',       -- Gol contra
  'yellow_card',    -- Cartão amarelo
  'red_card',       -- Cartão vermelho
  'save',           -- Defesa
  'penalty_scored', -- Pênalti convertido
  'penalty_missed'  -- Pênalti perdido
);

-- Payment status
CREATE TYPE payment_status_type AS ENUM (
  'pending',    -- Pendente
  'paid',       -- Pago
  'cancelled',  -- Cancelado
  'refunded'    -- Reembolsado
);

-- Transaction types
CREATE TYPE transaction_type_type AS ENUM (
  'charge',      -- Cobrança
  'payment',     -- Pagamento
  'refund',      -- Reembolso
  'adjustment'   -- Ajuste
);

-- Notification channels
CREATE TYPE notification_channel_type AS ENUM (
  'in_app',    -- In-app
  'email',     -- Email
  'push',      -- Push notification
  'whatsapp'   -- WhatsApp (futuro)
);

-- Notification types
CREATE TYPE notification_type_type AS ENUM (
  'event_created',        -- Evento criado
  'event_updated',        -- Evento atualizado
  'event_cancelled',      -- Evento cancelado
  'event_reminder',       -- Lembrete de evento
  'rsvp_confirmed',       -- RSVP confirmado
  'waitlist_moved',       -- Movido da lista de espera
  'team_drawn',           -- Times sorteados
  'payment_request',      -- Solicitação de pagamento
  'payment_received',     -- Pagamento recebido
  'achievement_unlocked', -- Conquista desbloqueada
  'group_invite'          -- Convite para grupo
);

-- Pix key types
CREATE TYPE pix_key_type AS ENUM (
  'cpf',    -- CPF
  'cnpj',   -- CNPJ
  'email',  -- Email
  'phone',  -- Telefone
  'random'  -- Chave aleatória
);

-- Achievement categories
CREATE TYPE achievement_category_type AS ENUM (
  'goals',         -- Gols
  'assists',       -- Assistências
  'participation', -- Participação
  'streak',        -- Sequência
  'special'        -- Especial
);

-- Sport modalities (futuro - multi-sport)
CREATE TYPE sport_modality_type AS ENUM (
  'futsal',      -- Futsal
  'futebol',     -- Futebol
  'society',     -- Society
  'beach_soccer' -- Futebol de areia
);

-- =====================================================
-- HELPER FUNCTIONS (used by generated columns)
-- =====================================================

-- Function to check if user can create groups based on role
CREATE OR REPLACE FUNCTION can_create_groups_check(role platform_role_type)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN role IN ('organizer', 'admin', 'super_admin');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if user can manage platform
CREATE OR REPLACE FUNCTION can_manage_platform_check(role platform_role_type)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN role IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions';
COMMENT ON EXTENSION "pgcrypto" IS 'Cryptographic functions for secure data';
COMMENT ON EXTENSION "pg_trgm" IS 'Trigram matching for fuzzy text search';
COMMENT ON EXTENSION "postgis" IS 'Geographic objects support for venue locations';

COMMENT ON TYPE platform_role_type IS 'User roles at platform level';
COMMENT ON TYPE group_role_type IS 'User roles within a group';
COMMENT ON TYPE event_privacy_type IS 'Event visibility settings';
COMMENT ON TYPE rsvp_status_type IS 'RSVP confirmation status';
COMMENT ON TYPE player_position_type IS 'Player field positions';
COMMENT ON TYPE event_action_type IS 'In-game actions (goals, cards, etc)';
COMMENT ON TYPE payment_status_type IS 'Payment transaction status';
COMMENT ON TYPE notification_channel_type IS 'Notification delivery channels';
COMMENT ON TYPE notification_type_type IS 'Notification event types';
COMMENT ON TYPE pix_key_type IS 'Brazilian Pix key types';
COMMENT ON TYPE achievement_category_type IS 'Achievement classification';
COMMENT ON TYPE sport_modality_type IS 'Sport types (multi-sport support)';
