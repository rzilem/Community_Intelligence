
-- Rename hoa_id column to association_id in properties table for consistency
ALTER TABLE properties RENAME COLUMN hoa_id TO association_id;

-- Update any indexes that might reference the old column name
-- (This will automatically handle most cases, but we're being explicit)
