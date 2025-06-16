
-- Add the current user to all associations as admin
-- This will give you access to all 101 associations in the system
INSERT INTO association_users (association_id, user_id, role)
SELECT 
  a.id as association_id,
  '5ef15db6-a666-46e8-82b0-d91e7db8ce3c' as user_id,
  'admin' as role
FROM associations a
WHERE a.id NOT IN (
  SELECT association_id 
  FROM association_users 
  WHERE user_id = '5ef15db6-a666-46e8-82b0-d91e7db8ce3c'
)
ORDER BY a.name;
