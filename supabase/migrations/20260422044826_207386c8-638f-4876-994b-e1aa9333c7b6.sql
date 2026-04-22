-- Create public bucket for equipment photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('equipment-photos', 'equipment-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Equipment photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'equipment-photos');

-- Authenticated users can upload to their own folder (folder = auth.uid())
CREATE POLICY "Users can upload their own equipment photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'equipment-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own photos
CREATE POLICY "Users can update their own equipment photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'equipment-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own photos
CREATE POLICY "Users can delete their own equipment photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'equipment-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);