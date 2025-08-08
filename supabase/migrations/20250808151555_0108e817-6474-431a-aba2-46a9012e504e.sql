-- Ensure association_id exists and is populated on calendar_events, with sync trigger to mirror legacy hoa_id
-- 1) Add association_id column (idempotent)
ALTER TABLE public.calendar_events
ADD COLUMN IF NOT EXISTS association_id uuid;

-- 2) Backfill association_id from legacy hoa_id when empty
UPDATE public.calendar_events
SET association_id = COALESCE(association_id, hoa_id)
WHERE association_id IS NULL;

-- 3) Index for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_association_id
  ON public.calendar_events (association_id);

-- 4) Attach trigger to keep association_id and hoa_id in sync (function already exists)
DROP TRIGGER IF EXISTS trg_sync_calendar_events_association_columns ON public.calendar_events;
CREATE TRIGGER trg_sync_calendar_events_association_columns
BEFORE INSERT OR UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.sync_calendar_events_association_columns();