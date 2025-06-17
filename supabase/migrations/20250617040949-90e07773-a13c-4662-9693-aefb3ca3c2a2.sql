
-- Add account_number field to residents table if it doesn't exist
ALTER TABLE residents ADD COLUMN IF NOT EXISTS account_number TEXT;

-- Add index for performance on account_number lookups
CREATE INDEX IF NOT EXISTS idx_residents_account_number ON residents(account_number);

-- Add homeowner_id field to properties table if it doesn't exist  
ALTER TABLE properties ADD COLUMN IF NOT EXISTS homeowner_id TEXT;

-- Add index for homeowner_id
CREATE INDEX IF NOT EXISTS idx_properties_homeowner_id ON properties(homeowner_id);

-- Create function to generate unique account numbers
CREATE OR REPLACE FUNCTION generate_account_number(p_association_id UUID, p_prefix TEXT DEFAULT 'ACC')
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_number INTEGER;
  v_account_number TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 5-digit number
    v_number := floor(random() * 90000 + 10000)::INTEGER;
    v_account_number := p_prefix || v_number::TEXT;
    
    -- Check if this account number already exists in the association
    SELECT EXISTS(
      SELECT 1 FROM properties 
      WHERE association_id = p_association_id 
      AND account_number = v_account_number
    ) INTO v_exists;
    
    -- If it doesn't exist, we can use it
    IF NOT v_exists THEN
      RETURN v_account_number;
    END IF;
  END LOOP;
END;
$$;
