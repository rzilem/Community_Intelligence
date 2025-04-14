
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT, params JSONB DEFAULT '[]'::jsonb)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql_query
  INTO result
  USING (SELECT array_agg(x) FROM jsonb_array_elements(params) AS x);
  
  RETURN result;
END;
$$;
