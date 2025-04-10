
-- Function to get user settings
CREATE OR REPLACE FUNCTION public.get_user_settings(user_id_param UUID)
RETURNS SETOF user_settings AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM user_settings WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user settings exist
CREATE OR REPLACE FUNCTION public.check_user_settings_exist(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_settings WHERE user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user settings
CREATE OR REPLACE FUNCTION public.update_user_settings(
  user_id_param UUID,
  theme_param TEXT DEFAULT NULL,
  notifications_param BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE user_settings
  SET 
    theme = COALESCE(theme_param, theme),
    notifications_enabled = COALESCE(notifications_param, notifications_enabled),
    updated_at = NOW()
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user settings
CREATE OR REPLACE FUNCTION public.create_user_settings(
  user_id_param UUID,
  theme_param TEXT DEFAULT 'system',
  notifications_param BOOLEAN DEFAULT TRUE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_settings (user_id, theme, notifications_enabled)
  VALUES (user_id_param, theme_param, notifications_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
