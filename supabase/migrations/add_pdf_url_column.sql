
-- Add pdf_url column to invoices table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE invoices ADD COLUMN pdf_url TEXT;
  END IF;
END
$$;

-- Add source_document column to invoices table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'source_document'
  ) THEN
    ALTER TABLE invoices ADD COLUMN source_document TEXT;
  END IF;
END
$$;

-- Remove association_type column from invoices table if it exists
-- Commented out to prevent data loss - only uncomment if certain the column is causing issues
-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT FROM information_schema.columns 
--     WHERE table_name = 'invoices' AND column_name = 'association_type'
--   ) THEN
--     ALTER TABLE invoices DROP COLUMN association_type;
--   END IF;
-- END
-- $$;
