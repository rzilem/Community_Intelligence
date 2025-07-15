-- Clear existing properties for the association that has duplicates
-- This will cascade delete any related residents and assessments

-- Delete all properties for the association with duplicate account numbers
DELETE FROM properties 
WHERE association_id IN (
  SELECT association_id 
  FROM properties 
  GROUP BY association_id, account_number 
  HAVING COUNT(*) > 1 
  AND account_number IS NOT NULL
);

-- Also delete any properties with NULL account numbers for the same associations
DELETE FROM properties 
WHERE association_id IN (
  SELECT DISTINCT association_id 
  FROM properties 
  WHERE account_number IS NULL
);

-- Reset any sequences if needed (this handles auto-increment counters)
-- The properties table uses UUID so no sequence reset needed

-- Verify cleanup
SELECT 
  association_id,
  COUNT(*) as property_count,
  COUNT(DISTINCT account_number) as unique_account_numbers,
  COUNT(CASE WHEN account_number IS NULL THEN 1 END) as null_account_numbers
FROM properties 
GROUP BY association_id
ORDER BY property_count DESC;