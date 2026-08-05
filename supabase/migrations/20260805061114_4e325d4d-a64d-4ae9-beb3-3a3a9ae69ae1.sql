CREATE OR REPLACE FUNCTION public.apply_booking_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  used numeric;
  qty integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT quantity INTO qty FROM public.equipment WHERE id = NEW.equipment_id;
    IF qty IS NULL THEN
      RETURN NEW;
    END IF;

    SELECT COALESCE(count(*), 0) INTO used
    FROM public.bookings
    WHERE equipment_id = NEW.equipment_id
      AND status IN ('pending', 'confirmed');

    IF used >= qty THEN
      UPDATE public.equipment SET available = false WHERE id = NEW.equipment_id;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE or DELETE: recompute availability
  SELECT quantity INTO qty FROM public.equipment
  WHERE id = COALESCE(NEW.equipment_id, OLD.equipment_id);

  SELECT COALESCE(count(*), 0) INTO used
  FROM public.bookings
  WHERE equipment_id = COALESCE(NEW.equipment_id, OLD.equipment_id)
    AND status IN ('pending', 'confirmed')
    AND id <> COALESCE(OLD.id, NEW.id);

  IF TG_OP = 'UPDATE' AND NEW.status IN ('pending', 'confirmed') THEN
    used := used + 1;
  END IF;

  UPDATE public.equipment
  SET available = (used < COALESCE(qty, 1))
  WHERE id = COALESCE(NEW.equipment_id, OLD.equipment_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION public.apply_booking_availability() FROM anon, authenticated, public;

DROP TRIGGER IF EXISTS bookings_availability_ins ON public.bookings;
CREATE TRIGGER bookings_availability_ins
AFTER INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.apply_booking_availability();

DROP TRIGGER IF EXISTS bookings_availability_upd ON public.bookings;
CREATE TRIGGER bookings_availability_upd
AFTER UPDATE OF status ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.apply_booking_availability();

DROP TRIGGER IF EXISTS bookings_availability_del ON public.bookings;
CREATE TRIGGER bookings_availability_del
AFTER DELETE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.apply_booking_availability();