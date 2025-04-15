
-- Add column_preferences column to user_settings if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_settings' 
    AND column_name = 'column_preferences'
  ) THEN
    ALTER TABLE public.user_settings 
    ADD COLUMN column_preferences JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Update the get_user_settings function to include column_preferences
CREATE OR REPLACE FUNCTION public.get_user_settings(user_id_param UUID)
RETURNS SETOF user_settings AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM user_settings WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user_settings function to handle column_preferences
CREATE OR REPLACE FUNCTION public.update_user_settings(
  user_id_param UUID,
  theme_param TEXT DEFAULT NULL,
  notifications_param BOOLEAN DEFAULT NULL,
  column_preferences_param JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE user_settings
  SET 
    theme = COALESCE(theme_param, theme),
    notifications_enabled = COALESCE(notifications_param, notifications_enabled),
    column_preferences = COALESCE(column_preferences_param, column_preferences),
    updated_at = NOW()
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
