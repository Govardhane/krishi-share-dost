-- Profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  whatsapp TEXT,
  district_id UUID REFERENCES public.districts(id),
  taluka_id UUID REFERENCES public.talukas(id),
  village_id UUID REFERENCES public.villages(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create empty profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, whatsapp)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tighten equipment policies: only authenticated users can insert, only owner can update
-- Add owner_user_id to equipment
ALTER TABLE public.equipment ADD COLUMN owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX idx_equipment_owner_user ON public.equipment(owner_user_id);

DROP POLICY IF EXISTS "Anyone can list equipment" ON public.equipment;
DROP POLICY IF EXISTS "Anyone can update equipment" ON public.equipment;

CREATE POLICY "Authenticated users can list equipment"
  ON public.equipment FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update their equipment"
  ON public.equipment FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can delete their equipment"
  ON public.equipment FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_user_id);