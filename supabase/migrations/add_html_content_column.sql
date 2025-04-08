
-- Add html_content column to leads table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'html_content'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN html_content TEXT;
    END IF;
END $$;
