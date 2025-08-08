-- Secure calendar_events with RLS and association-scoped policies
-- 1) Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- 2) Policies
-- View: members of the association can read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'calendar_events' 
      AND policyname = 'Users can view calendar events in their associations'
  ) THEN
    CREATE POLICY "Users can view calendar events in their associations"
    ON public.calendar_events
    FOR SELECT
    USING (check_user_association(association_id));
  END IF;
END$$;

-- Insert: users with association access can insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'calendar_events' 
      AND policyname = 'Users can create calendar events in their associations'
  ) THEN
    CREATE POLICY "Users can create calendar events in their associations"
    ON public.calendar_events
    FOR INSERT
    WITH CHECK (user_has_association_access(association_id));
  END IF;
END$$;

-- Update: users with association access can update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'calendar_events' 
      AND policyname = 'Users can update calendar events in their associations'
  ) THEN
    CREATE POLICY "Users can update calendar events in their associations"
    ON public.calendar_events
    FOR UPDATE
    USING (user_has_association_access(association_id))
    WITH CHECK (user_has_association_access(association_id));
  END IF;
END$$;

-- Delete: only admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'calendar_events' 
      AND policyname = 'Only admins can delete calendar events in their associations'
  ) THEN
    CREATE POLICY "Only admins can delete calendar events in their associations"
    ON public.calendar_events
    FOR DELETE
    USING (user_has_association_access(association_id, 'admin'));
  END IF;
END$$;