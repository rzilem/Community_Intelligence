-- Add missing severity column to violations table
ALTER TABLE violations ADD COLUMN IF NOT EXISTS severity text DEFAULT 'medium';

-- Create notices table if it doesn't exist
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id uuid NOT NULL REFERENCES associations(id),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  priority text NOT NULL DEFAULT 'normal',
  recipient_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notices if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notices' AND policyname = 'Users can access notices for their associations'
  ) THEN
    ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can access notices for their associations" 
    ON notices 
    FOR ALL 
    USING (check_user_association(association_id));
  END IF;
END $$;