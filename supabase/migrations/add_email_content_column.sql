
-- Add email_content column to invoices table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'email_content'
  ) THEN
    ALTER TABLE invoices ADD COLUMN email_content TEXT;
  END IF;
END
$$;
