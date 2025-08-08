-- Add association_id to calendar_events and keep it in sync with legacy hoa_id
-- This migration is backward-compatible and does not remove hoa_id

-- 1) Add new column
ALTER TABLE public.calendar_events
ADD COLUMN IF NOT EXISTS association_id uuid;

-- 2) Backfill from existing hoa_id values
UPDATE public.calendar_events
SET association_id = hoa_id
WHERE association_id IS NULL AND hoa_id IS NOT NULL;

-- 3) Add FK to associations (soft behavior on delete)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'calendar_events_association_id_fkey'
  ) THEN
    ALTER TABLE public.calendar_events
    ADD CONSTRAINT calendar_events_association_id_fkey
    FOREIGN KEY (association_id)
    REFERENCES public.associations(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- 4) Index for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_association_id
ON public.calendar_events(association_id);

-- 5) Trigger to keep columns in sync for compatibility
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_calendar_events_association_columns ON public.calendar_events;
CREATE TRIGGER trg_sync_calendar_events_association_columns
BEFORE INSERT OR UPDATE ON public.calendar_events
FOR EACH ROW EXECUTE FUNCTION public.sync_calendar_events_association_columns();