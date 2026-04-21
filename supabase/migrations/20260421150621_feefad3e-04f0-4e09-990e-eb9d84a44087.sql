
-- Create talukas table
CREATE TABLE public.talukas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(district_id, name)
);

ALTER TABLE public.talukas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talukas are viewable by everyone"
  ON public.talukas FOR SELECT USING (true);

CREATE INDEX idx_talukas_district ON public.talukas(district_id);

-- Add taluka_id to villages
ALTER TABLE public.villages ADD COLUMN taluka_id UUID REFERENCES public.talukas(id) ON DELETE CASCADE;
CREATE INDEX idx_villages_taluka ON public.villages(taluka_id);

-- Add taluka_id to equipment
ALTER TABLE public.equipment ADD COLUMN taluka_id UUID REFERENCES public.talukas(id) ON DELETE SET NULL;
CREATE INDEX idx_equipment_taluka ON public.equipment(taluka_id);

-- Migrate existing villages into talukas:
-- treat each existing "village" entry as a taluka, then keep the village row pointing to that new taluka.
INSERT INTO public.talukas (district_id, name)
SELECT DISTINCT district_id, name FROM public.villages
ON CONFLICT (district_id, name) DO NOTHING;

UPDATE public.villages v
SET taluka_id = t.id
FROM public.talukas t
WHERE v.district_id = t.district_id AND v.name = t.name AND v.taluka_id IS NULL;

-- Seed Igatpuri taluka villages (Nashik district)
DO $$
DECLARE
  igatpuri_taluka UUID;
BEGIN
  SELECT t.id INTO igatpuri_taluka
  FROM public.talukas t
  JOIN public.districts d ON d.id = t.district_id
  WHERE d.name = 'Nashik' AND t.name = 'Igatpuri'
  LIMIT 1;

  IF igatpuri_taluka IS NULL THEN
    INSERT INTO public.talukas (district_id, name)
    SELECT id, 'Igatpuri' FROM public.districts WHERE name = 'Nashik'
    RETURNING id INTO igatpuri_taluka;
  END IF;

  INSERT INTO public.villages (district_id, taluka_id, name)
  SELECT (SELECT id FROM public.districts WHERE name='Nashik'), igatpuri_taluka, v
  FROM (VALUES ('Sakur'),('Murambi'),('Ghoti'),('Wadiware'),('Talegaon'),('Adwan'),('Khed'),('Dhamangaon')) AS x(v)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.villages
    WHERE taluka_id = igatpuri_taluka AND name = x.v
  );
END $$;
