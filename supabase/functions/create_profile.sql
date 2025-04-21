
CREATE OR REPLACE FUNCTION public.create_profile(
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_role TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
  result JSONB;
BEGIN
  -- Generate a new UUID for the profile
  SELECT gen_random_uuid() INTO new_id;
  
  -- Insert the new profile
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    email,
    role
  ) VALUES (
    new_id,
    p_first_name,
    p_last_name,
    p_email,
    p_role
  )
  RETURNING jsonb_build_object(
    'id', id,
    'first_name', first_name,
    'last_name', last_name,
    'email', email
  ) INTO result;
  
  RETURN result;
END;
$$;
