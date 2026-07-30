ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS hp INTEGER,
  ADD COLUMN IF NOT EXISTS tractor_class TEXT,
  ADD COLUMN IF NOT EXISTS year_of_purchase INTEGER,
  ADD COLUMN IF NOT EXISTS condition TEXT,
  ADD COLUMN IF NOT EXISTS features TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS payment_modes TEXT[] NOT NULL DEFAULT '{advance_cash}',
  ADD COLUMN IF NOT EXISTS advance_percent INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS upi_id TEXT,
  ADD COLUMN IF NOT EXISTS rating NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  renter_user_id UUID NOT NULL,
  owner_user_id UUID,
  renter_name TEXT NOT NULL,
  renter_phone TEXT NOT NULL,
  start_date DATE NOT NULL,
  duration_unit TEXT NOT NULL DEFAULT 'day',
  duration_value NUMERIC NOT NULL DEFAULT 1,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  advance_amount NUMERIC NOT NULL DEFAULT 0,
  payment_mode TEXT NOT NULL DEFAULT 'advance_cash',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_ref TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Renters can create their own bookings"
  ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = renter_user_id);

CREATE POLICY "Renters and owners can view bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = renter_user_id OR auth.uid() = owner_user_id);

CREATE POLICY "Renters and owners can update bookings"
  ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = renter_user_id OR auth.uid() = owner_user_id);

CREATE POLICY "Renters can delete their own bookings"
  ON public.bookings FOR DELETE TO authenticated
  USING (auth.uid() = renter_user_id);

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();