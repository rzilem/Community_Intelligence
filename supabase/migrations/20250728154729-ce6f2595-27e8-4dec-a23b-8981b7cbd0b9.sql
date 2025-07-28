-- Add missing severity column to violations table
ALTER TABLE violations ADD COLUMN IF NOT EXISTS severity text DEFAULT 'medium';

-- Create ai_agent_chains table
CREATE TABLE IF NOT EXISTS ai_agent_chains (
  id text PRIMARY KEY,
  name text NOT NULL,
  association_id uuid NOT NULL REFERENCES associations(id),
  tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_task_index integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'running',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on ai_agent_chains
ALTER TABLE ai_agent_chains ENABLE ROW LEVEL SECURITY;

-- Create policy for ai_agent_chains
CREATE POLICY "Users can access agent chains for their associations" 
ON ai_agent_chains 
FOR ALL 
USING (check_user_association(association_id));

-- Create notices table  
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

-- Enable RLS on notices
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Create policy for notices
CREATE POLICY "Users can access notices for their associations" 
ON notices 
FOR ALL 
USING (check_user_association(association_id));

-- Create trigger for updated_at on ai_agent_chains
CREATE OR REPLACE FUNCTION update_ai_agent_chains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_agent_chains_updated_at
  BEFORE UPDATE ON ai_agent_chains
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_agent_chains_updated_at();

-- Create trigger for updated_at on notices
CREATE OR REPLACE FUNCTION update_notices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW
  EXECUTE FUNCTION update_notices_updated_at();