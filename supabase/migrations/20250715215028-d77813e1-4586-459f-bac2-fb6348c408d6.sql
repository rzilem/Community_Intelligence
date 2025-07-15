-- Delete all existing properties for the association to allow clean re-import
-- This will cascade delete any related residents and assessments
DELETE FROM properties 
WHERE association_id = '85bdb4ea-4288-414d-8f17-83b4a33725b8';

-- Verify cleanup
SELECT 
  association_id,
  COUNT(*) as property_count,
  COUNT(DISTINCT account_number) as unique_account_numbers,
  COUNT(CASE WHEN account_number IS NULL THEN 1 END) as null_account_numbers
FROM properties 
WHERE association_id = '85bdb4ea-4288-414d-8f17-83b4a33725b8'
GROUP BY association_id;