-- Fix the existing schema conflicts
-- Drop any existing conflicting constraints first
DO $$ 
BEGIN
    -- Add any missing columns to existing tables if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='associations' AND column_name='property_type') THEN
        ALTER TABLE associations ADD COLUMN property_type VARCHAR(50) DEFAULT 'hoa';
    END IF;
END $$;