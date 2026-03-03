
-- Districts table for Maharashtra
CREATE TABLE public.districts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL DEFAULT 'Maharashtra',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Villages table
CREATE TABLE public.villages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, district_id)
);

-- Equipment listings table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tractor', 'rotavator', 'harvester', 'cultivator', 'sprayer', 'plough', 'seed_drill', 'thresher')),
  description TEXT,
  price_per_hour NUMERIC NOT NULL CHECK (price_per_hour > 0),
  price_per_day NUMERIC NOT NULL CHECK (price_per_day > 0),
  owner_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  village_id UUID NOT NULL REFERENCES public.villages(id),
  district_id UUID NOT NULL REFERENCES public.districts(id),
  available BOOLEAN NOT NULL DEFAULT true,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Everyone can read districts and villages
CREATE POLICY "Districts are viewable by everyone" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Villages are viewable by everyone" ON public.villages FOR SELECT USING (true);

-- Equipment: everyone can read, anyone can insert
CREATE POLICY "Equipment is viewable by everyone" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Anyone can list equipment" ON public.equipment FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update equipment" ON public.equipment FOR UPDATE USING (true);

-- Indexes
CREATE INDEX idx_equipment_type ON public.equipment(type);
CREATE INDEX idx_equipment_district ON public.equipment(district_id);
CREATE INDEX idx_equipment_village ON public.equipment(village_id);
CREATE INDEX idx_equipment_available ON public.equipment(available);
CREATE INDEX idx_villages_district ON public.villages(district_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
