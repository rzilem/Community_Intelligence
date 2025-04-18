
-- Add pdf_url column to invoices table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices' 
        AND column_name = 'pdf_url'
    ) THEN
        ALTER TABLE public.invoices ADD COLUMN pdf_url TEXT;
    END IF;
END $$;
