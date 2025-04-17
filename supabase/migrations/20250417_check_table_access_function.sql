
-- Function to check if a table exists and is accessible
CREATE OR REPLACE FUNCTION public.check_table_access(table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = check_table_access.table_name
  );
END;
$$;
