
-- Update associations with property types based on their names
UPDATE associations 
SET property_type = 'Condominium'
WHERE (LOWER(name) LIKE '%condominium%' OR LOWER(name) LIKE '%condo%') 
AND property_type IS NULL;

UPDATE associations 
SET property_type = 'HOA'
WHERE (LOWER(name) LIKE '%hoa%' OR LOWER(name) LIKE '%homeowner%' OR LOWER(name) LIKE '%home owner%')
AND property_type IS NULL;

-- Set remaining associations to a default type if they don't match patterns
UPDATE associations 
SET property_type = 'Community Association'
WHERE property_type IS NULL;
