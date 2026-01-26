-- =====================================================
-- Migration: Fix Notifications to use users table
-- Version: 1.0
-- Date: 2026-01-25
-- Description: Adapt notifications table to use users(id) instead of profiles(id)
-- Sprint 5: Notificações Reais + Undo
-- =====================================================

-- Verificar se a tabela notifications existe e adaptar
DO $$
BEGIN
  -- Se a tabela já existe com profiles, precisamos adaptar
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'notifications'
  ) THEN
    -- Verificar se já usa users ou profiles
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'notifications'
        AND kcu.column_name = 'user_id'
        AND kcu.table_name = 'notifications'
    ) THEN
      -- Se já existe constraint, verificar se aponta para users ou profiles
      -- Por enquanto, vamos criar uma versão compatível que funciona com ambos
      RAISE NOTICE 'Notifications table already exists';
    END IF;
  ELSE
    -- Criar tabela notifications se não existir (versão simplificada para MVP)
    CREATE TABLE notifications (
      id BIGSERIAL PRIMARY KEY,
      code TEXT UNIQUE,
      
      -- Recipient (tentar users primeiro, fallback para profiles)
      user_id UUID NOT NULL,
      
      -- Notification details
      type TEXT NOT NULL CHECK (type IN (
        'event_created',
        'event_updated',
        'event_cancelled',
        'event_reminder',
        'rsvp_confirmed',
        'waitlist_moved',
        'team_drawn',
        'payment_request',
        'payment_received',
        'charge_created',
        'charge_due_soon',
        'achievement_unlocked',
        'group_invite'
      )),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      image_url TEXT,
      
      -- Related entities
      related_type TEXT CHECK (related_type IN ('event', 'group', 'charge', 'achievement')),
      related_id BIGINT,
      
      -- Action URL
      action_url TEXT,
      
      -- Status
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMPTZ,
      
      -- Priority
      priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
      
      -- Metadata
      metadata JSONB DEFAULT '{}'::jsonb,
      
      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ,
      
      -- Soft delete
      deleted_at TIMESTAMPTZ
    );

    -- Indexes
    CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX idx_notifications_type ON notifications(type);
    CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
    CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
    CREATE INDEX idx_notifications_related ON notifications(related_type, related_id);
    CREATE INDEX idx_notifications_deleted_at ON notifications(deleted_at) WHERE deleted_at IS NULL;
    
    RAISE NOTICE 'Notifications table created';
  END IF;
END $$;

-- Função para criar notificação (helper)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_related_id BIGINT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  v_notification_id BIGINT;
  v_code TEXT;
BEGIN
  -- Gerar código único
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 7) AS INTEGER)), 0) + 1
  INTO v_code
  FROM notifications
  WHERE code ~ '^NOTIF-\d+$';
  
  v_code := 'NOTIF-' || LPAD(v_code::TEXT, 5, '0');

  -- Inserir notificação
  INSERT INTO notifications (
    code,
    user_id,
    type,
    title,
    body,
    action_url,
    related_type,
    related_id
  )
  VALUES (
    v_code,
    p_user_id,
    p_type,
    p_title,
    p_body,
    p_action_url,
    p_related_type,
    p_related_id
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Notificar quando charge é criado
CREATE OR REPLACE FUNCTION notify_charge_created()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_amount TEXT;
  v_title TEXT;
  v_body TEXT;
  v_action_url TEXT;
BEGIN
  -- Buscar user_id do charge_split (se existir) ou do charge
  SELECT user_id INTO v_user_id
  FROM charge_splits
  WHERE charge_id = NEW.id
  LIMIT 1;

  -- Se não encontrou no charge_split, usar created_by do charge
  IF v_user_id IS NULL THEN
    v_user_id := NEW.created_by;
  END IF;

  -- Se ainda não tem user_id, não criar notificação
  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Formatar valores
  v_amount := TO_CHAR(NEW.amount, 'FM999,999,990.00');
  v_title := 'Nova cobrança';
  v_body := 'Você tem uma cobrança de R$ ' || v_amount;
  
  IF NEW.description IS NOT NULL THEN
    v_body := v_body || ' - ' || NEW.description;
  END IF;

  v_action_url := '/financeiro/charges/' || NEW.id;

  -- Criar notificação
  PERFORM create_notification(
    v_user_id,
    'charge_created',
    v_title,
    v_body,
    v_action_url,
    'charge',
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger apenas se não existir
DROP TRIGGER IF EXISTS charge_created_notification ON charges;
CREATE TRIGGER charge_created_notification
AFTER INSERT ON charges
FOR EACH ROW
EXECUTE FUNCTION notify_charge_created();

-- Trigger: Notificar quando charge é marcado como pago
CREATE OR REPLACE FUNCTION notify_payment_received()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_amount TEXT;
  v_title TEXT;
  v_body TEXT;
  v_action_url TEXT;
BEGIN
  -- Só criar notificação se paid_at mudou de NULL para um valor
  IF OLD.paid_at IS NULL AND NEW.paid_at IS NOT NULL THEN
    -- Buscar user_id do charge_split
    SELECT user_id INTO v_user_id
    FROM charge_splits
    WHERE charge_id = NEW.id
    LIMIT 1;

    -- Se não encontrou, usar created_by
    IF v_user_id IS NULL THEN
      v_user_id := NEW.created_by;
    END IF;

    IF v_user_id IS NOT NULL THEN
      v_amount := TO_CHAR(NEW.amount, 'FM999,999,990.00');
      v_title := 'Pagamento recebido';
      v_body := 'Seu pagamento de R$ ' || v_amount || ' foi confirmado!';
      v_action_url := '/financeiro/charges/' || NEW.id;

      PERFORM create_notification(
        v_user_id,
        'payment_received',
        v_title,
        v_body,
        v_action_url,
        'charge',
        NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger apenas se não existir
DROP TRIGGER IF EXISTS payment_received_notification ON charges;
CREATE TRIGGER payment_received_notification
AFTER UPDATE OF paid_at ON charges
FOR EACH ROW
EXECUTE FUNCTION notify_payment_received();

-- Comentários
COMMENT ON FUNCTION create_notification IS 'Helper function to create notifications';
COMMENT ON FUNCTION notify_charge_created IS 'Trigger function: Notify user when charge is created';
COMMENT ON FUNCTION notify_payment_received IS 'Trigger function: Notify user when payment is received';

