-- Update admin user profile
UPDATE public.profiles 
SET role = 'admin', 
    first_name = 'Admin', 
    last_name = 'User',
    updated_at = now()
WHERE email = 'rzilem@gmail.com';

-- Create auth user if not exists with admin role
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) 
SELECT 
  '00000000-0000-0000-0000-000000000000',
  'afb9e05b-ae2f-47c7-96ca-60b526afdcc4',
  'authenticated',
  'authenticated',
  'rzilem@gmail.com',
  crypt('CommunityIntel2024!Admin', gen_salt('bf')),
  now(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Admin", "last_name": "User", "role": "admin"}',
  false,
  now(),
  now(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'rzilem@gmail.com'
);

-- Update existing auth user password
UPDATE auth.users 
SET encrypted_password = crypt('CommunityIntel2024!Admin', gen_salt('bf')),
    raw_user_meta_data = '{"first_name": "Admin", "last_name": "User", "role": "admin"}',
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'rzilem@gmail.com';