
-- First, let's check if the vendors table exists and what data is in it
SELECT COUNT(*) as total_vendors FROM vendors;

-- Check the structure of the vendors table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'vendors' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any existing RLS policies on the vendors table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'vendors';

-- Check if RLS is enabled on the vendors table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'vendors';

-- If vendors exist, let's see a sample to understand the structure
SELECT * FROM vendors LIMIT 5;

-- Check if vendors are associated with HOAs/associations
SELECT DISTINCT hoa_id FROM vendors WHERE hoa_id IS NOT NULL LIMIT 10;
