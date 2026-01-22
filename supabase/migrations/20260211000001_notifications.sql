-- =====================================================
-- Migration: Notifications System
-- Version: 1.0
-- Date: 2026-02-11
-- Description: Push notifications, email, and WhatsApp
-- =====================================================

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- NOTIF-00001

  -- Recipient
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Notification details
  type notification_type_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,

  -- Related entities (polymorphic)
  related_type TEXT CHECK (related_type IN ('event', 'group', 'charge', 'achievement')),
  related_id BIGINT,

  -- Action URL (deep link)
  action_url TEXT,

  -- Delivery channels
  channels notification_channel_type[] DEFAULT ARRAY['in_app']::notification_channel_type[],

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Delivery tracking
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- Priority (1-5, 5 = highest)
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
CREATE INDEX idx_notifications_code ON notifications(code);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_related ON notifications(related_type, related_id);
CREATE INDEX idx_notifications_deleted_at ON notifications(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- NOTIFICATION_TEMPLATES TABLE
-- =====================================================

CREATE TABLE notification_templates (
  id BIGSERIAL PRIMARY KEY,

  -- Template identification
  template_key TEXT UNIQUE NOT NULL, -- 'event_reminder', 'payment_request', etc.
  template_name TEXT NOT NULL,
  description TEXT,

  -- Template content (supports variables like {{user_name}})
  title_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  email_subject_template TEXT,
  email_body_template TEXT, -- HTML or plain text

  -- Default channels
  default_channels notification_channel_type[] DEFAULT ARRAY['in_app']::notification_channel_type[],

  -- Variables (for documentation)
  available_variables JSONB DEFAULT '[]'::jsonb, -- ['user_name', 'event_title', etc.]

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notification_templates_template_key ON notification_templates(template_key);
CREATE INDEX idx_notification_templates_is_active ON notification_templates(is_active) WHERE is_active = TRUE;

-- =====================================================
-- PUSH_TOKENS TABLE (FCM/APNs)
-- =====================================================

CREATE TABLE push_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Token details
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('web', 'ios', 'android')),

  -- Device info
  device_id TEXT,
  device_name TEXT,
  device_model TEXT,
  os_version TEXT,
  app_version TEXT,

  -- Browser info (for web push)
  browser TEXT,
  user_agent TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),

  -- Failure tracking
  failure_count INTEGER DEFAULT 0,
  last_failure_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, token)
);

-- Indexes
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_token ON push_tokens(token);
CREATE INDEX idx_push_tokens_is_active ON push_tokens(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_push_tokens_platform ON push_tokens(platform);

-- =====================================================
-- EMAIL_QUEUE TABLE (for async email sending)
-- =====================================================

CREATE TABLE email_queue (
  id BIGSERIAL PRIMARY KEY,

  -- Recipient
  to_email TEXT NOT NULL,
  to_name TEXT,

  -- Email content
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,

  -- CC/BCC (optional)
  cc TEXT[],
  bcc TEXT[],

  -- Related notification
  notification_id BIGINT REFERENCES notifications(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'sent', 'failed', 'cancelled')
  ),

  -- Attempts
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Delivery tracking
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- External provider tracking
  provider TEXT, -- 'resend', 'sendgrid', etc.
  external_id TEXT,

  -- Priority
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_user_id ON email_queue(user_id);
CREATE INDEX idx_email_queue_scheduled_for ON email_queue(scheduled_for);
CREATE INDEX idx_email_queue_priority ON email_queue(priority DESC);

-- =====================================================
-- NOTIFICATION_BATCHES TABLE (for bulk sends)
-- =====================================================

CREATE TABLE notification_batches (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- BATCH-00001

  -- Batch details
  name TEXT NOT NULL,
  description TEXT,

  -- Template
  template_key TEXT REFERENCES notification_templates(template_key),

  -- Target audience
  target_type TEXT CHECK (target_type IN ('group', 'event', 'all_users', 'custom')),
  target_id BIGINT,
  target_filters JSONB DEFAULT '{}'::jsonb,

  -- Recipients count
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (
    status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')
  ),

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Created by
  created_by UUID NOT NULL REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notification_batches_code ON notification_batches(code);
CREATE INDEX idx_notification_batches_status ON notification_batches(status);
CREATE INDEX idx_notification_batches_scheduled_for ON notification_batches(scheduled_for);
CREATE INDEX idx_notification_batches_created_by ON notification_batches(created_by);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Generate notification code
CREATE OR REPLACE FUNCTION generate_notification_code()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 7) AS INTEGER)), 0) + 1
  INTO next_num
  FROM notifications
  WHERE code ~ '^NOTIF-\d+$';

  RETURN 'NOTIF-' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate notification code
CREATE OR REPLACE FUNCTION trigger_generate_notification_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_notification_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_notification_code
BEFORE INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_notification_code();

-- Generate batch code
CREATE OR REPLACE FUNCTION generate_batch_code()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 7) AS INTEGER)), 0) + 1
  INTO next_num
  FROM notification_batches
  WHERE code ~ '^BATCH-\d+$';

  RETURN 'BATCH-' || LPAD(next_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate batch code
CREATE OR REPLACE FUNCTION trigger_generate_batch_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_batch_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_batch_code
BEFORE INSERT ON notification_batches
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_batch_code();

-- Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = notification_id AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Mark all notifications as read for user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND is_read = FALSE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Delete old read notifications (cleanup)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE notifications
  SET deleted_at = NOW()
  WHERE is_read = TRUE
  AND read_at < NOW() - (days_to_keep || ' days')::INTERVAL
  AND deleted_at IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS POLICIES (Notifications)
-- =====================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_batches ENABLE ROW LEVEL SECURITY;

-- Notifications: Users can view own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Notifications: Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- Notifications: Users can delete own notifications
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (user_id = auth.uid());

-- Notification Templates: Anyone can view active templates
CREATE POLICY "Active templates are viewable"
ON notification_templates FOR SELECT
USING (is_active = TRUE);

-- Notification Templates: Only admins can manage
CREATE POLICY "Admins can manage templates"
ON notification_templates FOR ALL
USING (has_platform_access(auth.uid()));

-- Push Tokens: Users can manage own tokens
CREATE POLICY "Users can manage own push tokens"
ON push_tokens FOR ALL
USING (user_id = auth.uid());

-- Email Queue: Users can view own emails
CREATE POLICY "Users can view own emails"
ON email_queue FOR SELECT
USING (user_id = auth.uid() OR has_platform_access(auth.uid()));

-- Notification Batches: Admins only
CREATE POLICY "Admins can manage batches"
ON notification_batches FOR ALL
USING (has_platform_access(auth.uid()));

-- =====================================================
-- SEED DATA (Default Templates)
-- =====================================================

INSERT INTO notification_templates (template_key, template_name, title_template, body_template, available_variables) VALUES
('event_created', 'Novo Evento Criado', 'Novo evento: {{event_title}}', '{{event_title}} foi criado para {{event_date}} às {{event_time}}', '["event_title", "event_date", "event_time", "group_name"]'),
('event_reminder', 'Lembrete de Evento', 'Lembrete: {{event_title}}', 'Não esqueça! {{event_title}} é amanhã às {{event_time}}', '["event_title", "event_date", "event_time"]'),
('payment_request', 'Solicitação de Pagamento', 'Pagamento pendente', 'Você tem um pagamento de R$ {{amount}} pendente para {{event_title}}', '["amount", "event_title", "due_date"]'),
('payment_received', 'Pagamento Recebido', 'Pagamento confirmado', 'Seu pagamento de R$ {{amount}} foi confirmado!', '["amount", "event_title"]'),
('team_drawn', 'Times Sorteados', 'Times foram sorteados!', 'Os times para {{event_title}} foram sorteados. Você está no {{team_name}}!', '["event_title", "team_name"]'),
('achievement_unlocked', 'Conquista Desbloqueada!', 'Nova conquista: {{achievement_name}}', 'Parabéns! Você desbloqueou a conquista {{achievement_name}}!', '["achievement_name", "achievement_description"]'),
('waitlist_moved', 'Você saiu da lista de espera!', 'Vaga disponível', 'Uma vaga foi aberta para {{event_title}}. Você está confirmado!', '["event_title", "event_date"]'),
('group_invite', 'Convite para Grupo', 'Você foi convidado!', '{{inviter_name}} convidou você para o grupo {{group_name}}', '["inviter_name", "group_name", "invite_code"]');

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE notifications IS 'Notification system for in-app, push, email, and WhatsApp';
COMMENT ON TABLE notification_templates IS 'Reusable notification templates with variable substitution';
COMMENT ON TABLE push_tokens IS 'Firebase Cloud Messaging (FCM) push tokens per device';
COMMENT ON TABLE email_queue IS 'Async email sending queue';
COMMENT ON TABLE notification_batches IS 'Bulk notification campaigns';
