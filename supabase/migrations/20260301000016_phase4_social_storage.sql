-- =====================================================
-- Migration: Phase 4 - Social media storage bucket
-- Date: 2026-03-01
-- Description: creates social-media bucket and baseline policies
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'social-media',
  'social-media',
  FALSE,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "social media upload authenticated" ON storage.objects;
CREATE POLICY "social media upload authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'social-media'
);

DROP POLICY IF EXISTS "social media read authenticated" ON storage.objects;
CREATE POLICY "social media read authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'social-media'
);

DROP POLICY IF EXISTS "social media owner update" ON storage.objects;
CREATE POLICY "social media owner update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'social-media'
  AND owner = auth.uid()
)
WITH CHECK (
  bucket_id = 'social-media'
  AND owner = auth.uid()
);

DROP POLICY IF EXISTS "social media owner delete" ON storage.objects;
CREATE POLICY "social media owner delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'social-media'
  AND owner = auth.uid()
);
