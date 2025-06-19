
-- Step 1: Delete the association user relationship for the older duplicate association
DELETE FROM association_users 
WHERE association_id = 'b7d70417-e33c-496b-843e-444b9416abf1';

-- Step 2: Delete the older duplicate association record permanently
DELETE FROM associations 
WHERE id = 'b7d70417-e33c-496b-843e-444b9416abf1';

-- Step 3: Verify only one "Gattis Office Condominium Association" remains
-- This query should return only one result after deletion
SELECT id, name, created_at, is_archived 
FROM associations 
WHERE name ILIKE '%gattis%office%condo%' 
OR name ILIKE '%gattis%office%condominium%'
ORDER BY created_at DESC;
