-- Fix the database schema issues causing errors

-- Fix leads table column name mismatch (createdat vs created_at)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now();

-- Update existing data if createdat exists
UPDATE leads 
SET created_at = createdat 
WHERE created_at IS NULL AND createdat IS NOT NULL;

-- Create missing tables that are causing 404 errors

-- Create resale_events table
CREATE TABLE IF NOT EXISTS resale_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id),
  association_id uuid REFERENCES associations(id),
  event_type text NOT NULL DEFAULT 'sale',
  event_date timestamp with time zone NOT NULL,
  sale_price numeric,
  buyer_name text,
  seller_name text,
  agent_name text,
  agent_contact text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS on resale_events
ALTER TABLE resale_events ENABLE ROW LEVEL SECURITY;

-- Create policies for resale_events
CREATE POLICY "Users can view resale events" 
ON resale_events 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert resale events" 
ON resale_events 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own resale events" 
ON resale_events 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own resale events" 
ON resale_events 
FOR DELETE 
USING (created_by = auth.uid());

-- Create homeowner_requests table
CREATE TABLE IF NOT EXISTS homeowner_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id),
  association_id uuid REFERENCES associations(id),
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,
  request_type text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  assigned_to uuid,
  resolution_notes text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS on homeowner_requests
ALTER TABLE homeowner_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for homeowner_requests
CREATE POLICY "Users can view homeowner requests" 
ON homeowner_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert homeowner requests" 
ON homeowner_requests 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own homeowner requests" 
ON homeowner_requests 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own homeowner requests" 
ON homeowner_requests 
FOR DELETE 
USING (created_by = auth.uid());

-- Create update triggers for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers if they don't exist
DROP TRIGGER IF EXISTS update_resale_events_updated_at ON resale_events;
CREATE TRIGGER update_resale_events_updated_at
  BEFORE UPDATE ON resale_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_homeowner_requests_updated_at ON homeowner_requests;
CREATE TRIGGER update_homeowner_requests_updated_at
  BEFORE UPDATE ON homeowner_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();