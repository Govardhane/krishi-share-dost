ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS phonepe_number text,
  ADD COLUMN IF NOT EXISTS payment_qr_url text;

CREATE POLICY "Signed-in users can view payment QR"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-qr');

CREATE POLICY "Owners can upload their payment QR"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-qr' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can update their payment QR"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'payment-qr' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can delete their payment QR"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'payment-qr' AND auth.uid()::text = (storage.foldername(name))[1]);