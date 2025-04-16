
-- Create comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  parent_type TEXT NOT NULL, -- 'resident', 'property', etc.
  user_id UUID, -- can be null for system-generated comments
  user_name TEXT, -- to display the name even if user is deleted
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_comments_updated_at'
  ) THEN
    CREATE TRIGGER set_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comments_updated_at();
  END IF;
END
$$;

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS comments_parent_type_idx ON public.comments(parent_type);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments(created_at);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to select any comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' AND policyname = 'comments_select_policy'
  ) THEN
    CREATE POLICY comments_select_policy ON public.comments
    FOR SELECT USING (true);
  END IF;
END
$$;

-- Create a policy that allows only authenticated users to insert comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' AND policyname = 'comments_insert_policy'
  ) THEN
    CREATE POLICY comments_insert_policy ON public.comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END
$$;

-- Create a policy that allows users to update only their own comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' AND policyname = 'comments_update_policy'
  ) THEN
    CREATE POLICY comments_update_policy ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create a policy that allows users to delete only their own comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' AND policyname = 'comments_delete_policy'
  ) THEN
    CREATE POLICY comments_delete_policy ON public.comments
    FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;
