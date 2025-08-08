
-- 1) Extend amenities with image, active flag, and booking settings
ALTER TABLE public.amenities
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS booking_settings jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2) Create amenity_blackouts table
CREATE TABLE IF NOT EXISTS public.amenity_blackouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amenity_id uuid NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful index for queries
CREATE INDEX IF NOT EXISTS idx_amenity_blackouts_amenity_time
  ON public.amenity_blackouts (amenity_id, start_time);

-- 3) Validation trigger to ensure end_time > start_time (use a trigger, not a CHECK)
CREATE OR REPLACE FUNCTION public.validate_amenity_blackout_times()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'end_time must be after start_time';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_validate_amenity_blackout_times ON public.amenity_blackouts;
CREATE TRIGGER trg_validate_amenity_blackout_times
BEFORE INSERT OR UPDATE ON public.amenity_blackouts
FOR EACH ROW
EXECUTE FUNCTION public.validate_amenity_blackout_times();

-- 4) Updated_at trigger
DROP TRIGGER IF EXISTS trg_blackouts_set_updated_at ON public.amenity_blackouts;
CREATE TRIGGER trg_blackouts_set_updated_at
BEFORE UPDATE ON public.amenity_blackouts
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp_column();

-- 5) RLS and policies
ALTER TABLE public.amenity_blackouts ENABLE ROW LEVEL SECURITY;

-- Members can view blackout periods for amenities in their associations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'amenity_blackouts'
      AND policyname = 'Members can view amenity blackouts in their associations'
  ) THEN
    CREATE POLICY "Members can view amenity blackouts in their associations"
    ON public.amenity_blackouts
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.amenities a
        WHERE a.id = amenity_blackouts.amenity_id
          AND check_user_association(a.association_id)
      )
    );
  END IF;
END$$;

-- Managers can create blackout periods
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'amenity_blackouts'
      AND policyname = 'Managers can insert amenity blackouts'
  ) THEN
    CREATE POLICY "Managers can insert amenity blackouts"
    ON public.amenity_blackouts
    FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.amenities a
        WHERE a.id = amenity_blackouts.amenity_id
          AND user_has_association_access(a.association_id, 'manager')
      )
    );
  END IF;
END$$;

-- Managers can update blackout periods
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'amenity_blackouts'
      AND policyname = 'Managers can update amenity blackouts'
  ) THEN
    CREATE POLICY "Managers can update amenity blackouts"
    ON public.amenity_blackouts
    FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.amenities a
        WHERE a.id = amenity_blackouts.amenity_id
          AND user_has_association_access(a.association_id, 'manager')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.amenities a
        WHERE a.id = amenity_blackouts.amenity_id
          AND user_has_association_access(a.association_id, 'manager')
      )
    );
  END IF;
END$$;

-- Admins can delete blackout periods
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'amenity_blackouts'
      AND policyname = 'Admins can delete amenity blackouts'
  ) THEN
    CREATE POLICY "Admins can delete amenity blackouts"
    ON public.amenity_blackouts
    FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.amenities a
        WHERE a.id = amenity_blackouts.amenity_id
          AND user_has_association_access(a.association_id, 'admin')
      )
    );
  END IF;
END$$;
