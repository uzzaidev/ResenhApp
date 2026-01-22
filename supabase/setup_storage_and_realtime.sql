-- =====================================================
-- Script de Configuração: Storage Buckets + Realtime
-- ResenhApp V2.0 - Supabase
-- =====================================================
-- Execute este script no SQL Editor do Supabase para:
-- 1. Criar Storage buckets
-- 2. Configurar políticas de Storage
-- 3. Habilitar Realtime nas tabelas necessárias
-- =====================================================

-- =====================================================
-- 1. CRIAR STORAGE BUCKETS
-- =====================================================

-- Bucket: avatars (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: group-photos (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'group-photos',
  'group-photos',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: venue-photos (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'venue-photos',
  'venue-photos',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: receipts (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. POLÍTICAS DE STORAGE - AVATARS
-- =====================================================

-- Usuários podem fazer upload do próprio avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- Usuários podem atualizar próprio avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- Qualquer um pode visualizar avatares (bucket público)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Usuários podem deletar próprio avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- =====================================================
-- 3. POLÍTICAS DE STORAGE - GROUP-PHOTOS
-- =====================================================

-- Admins de grupo podem fazer upload de fotos do grupo
CREATE POLICY "Group admins can upload group photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'group-photos' AND
  EXISTS (
    SELECT 1 FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'admin')
    AND g.code = (storage.foldername(name))[1]
    AND gm.is_active = TRUE
  )
);

-- Qualquer um pode visualizar fotos de grupos (bucket público)
CREATE POLICY "Anyone can view group photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'group-photos');

-- Admins de grupo podem deletar fotos do grupo
CREATE POLICY "Group admins can delete group photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'group-photos' AND
  EXISTS (
    SELECT 1 FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'admin')
    AND g.code = (storage.foldername(name))[1]
    AND gm.is_active = TRUE
  )
);

-- =====================================================
-- 4. POLÍTICAS DE STORAGE - VENUE-PHOTOS
-- =====================================================

-- Qualquer usuário autenticado pode fazer upload de fotos de venues
CREATE POLICY "Authenticated users can upload venue photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'venue-photos' AND
  auth.uid() IS NOT NULL
);

-- Qualquer um pode visualizar fotos de venues (bucket público)
CREATE POLICY "Anyone can view venue photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'venue-photos');

-- Usuários podem deletar próprias fotos de venues
CREATE POLICY "Users can delete own venue photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'venue-photos' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- =====================================================
-- 5. POLÍTICAS DE STORAGE - RECEIPTS (PRIVADO)
-- =====================================================

-- Usuários podem fazer upload de próprios comprovantes
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- Usuários podem visualizar apenas próprios comprovantes
CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- Admins de grupo podem visualizar comprovantes do grupo (para validação)
CREATE POLICY "Group admins can view group receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  EXISTS (
    SELECT 1 FROM charge_splits cs
    JOIN charges c ON c.id = cs.charge_id
    JOIN group_members gm ON gm.group_id = c.group_id
    WHERE gm.user_id = auth.uid()
    AND gm.role IN ('owner', 'admin')
    AND cs.payment_proof_url LIKE '%' || storage.objects.name
    AND gm.is_active = TRUE
  )
);

-- Usuários podem deletar próprios comprovantes
CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts' AND
  auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- =====================================================
-- 6. HABILITAR REALTIME NAS TABELAS
-- =====================================================

-- Habilitar Realtime para events
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Habilitar Realtime para event_attendance
ALTER PUBLICATION supabase_realtime ADD TABLE event_attendance;

-- Habilitar Realtime para event_actions
ALTER PUBLICATION supabase_realtime ADD TABLE event_actions;

-- Habilitar Realtime para notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Habilitar Realtime para teams
ALTER PUBLICATION supabase_realtime ADD TABLE teams;

-- Habilitar Realtime para team_members (opcional, mas útil)
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;

-- =====================================================
-- 7. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar buckets criados
SELECT 
  id AS bucket_id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets
WHERE id IN ('avatars', 'group-photos', 'venue-photos', 'receipts')
ORDER BY id;

-- Verificar políticas de Storage
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS operacao
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY policyname;

-- Verificar tabelas com Realtime habilitado
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('events', 'event_attendance', 'event_actions', 'notifications', 'teams', 'team_members')
ORDER BY tablename;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Após executar este script:
-- 1. Verifique se os 4 buckets foram criados
-- 2. Verifique se as políticas foram aplicadas
-- 3. Verifique se o Realtime está habilitado nas 6 tabelas
-- =====================================================

