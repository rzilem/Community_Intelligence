-- Harden function by setting explicit search_path
CREATE OR REPLACE FUNCTION public.sync_calendar_events_association_columns()
RETURNS trigger AS $$
BEGIN
  -- If new association_id missing but hoa_id present, mirror it
  IF NEW.association_id IS NULL AND NEW.hoa_id IS NOT NULL THEN
    NEW.association_id := NEW.hoa_id;
  END IF;

  -- If legacy hoa_id missing but association_id present, mirror it
  IF NEW.hoa_id IS NULL AND NEW.association_id IS NOT NULL THEN
    NEW.hoa_id := NEW.association_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;