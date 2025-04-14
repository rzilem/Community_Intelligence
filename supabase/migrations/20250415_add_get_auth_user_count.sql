
-- Function to get the count of users in auth.users table
CREATE OR REPLACE FUNCTION public.get_auth_user_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count users in auth.users table
  SELECT COUNT(*) INTO user_count FROM auth.users;
  RETURN user_count;
END;
$$;

-- Update the sync_missing_profiles function to improve debugging
CREATE OR REPLACE FUNCTION public.sync_missing_profiles()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user RECORD;
  profile_exists BOOLEAN;
  created_count INTEGER := 0;
  result json;
BEGIN
  -- Log function start
  RAISE NOTICE 'Starting sync_missing_profiles function';
  
  -- Loop through all auth users
  FOR auth_user IN 
    SELECT id, email, raw_user_meta_data 
    FROM auth.users
  LOOP
    -- Check if user has a profile
    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth_user.id
    ) INTO profile_exists;
    
    -- If no profile exists, create one
    IF NOT profile_exists THEN
      RAISE NOTICE 'Creating profile for user: % (%)', auth_user.email, auth_user.id;
      
      INSERT INTO public.profiles (
        id, 
        email, 
        first_name, 
        last_name, 
        role
      ) VALUES (
        auth_user.id, 
        auth_user.email, 
        COALESCE(auth_user.raw_user_meta_data->>'first_name', ''),
        COALESCE(auth_user.raw_user_meta_data->>'last_name', ''),
        'user'
      );
      
      created_count := created_count + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Sync completed: % profiles created', created_count;
  
  -- Return result as JSON
  SELECT json_build_object(
    'success', true,
    'created_count', created_count
  ) INTO result;
  
  RETURN result;
END;
$$;
