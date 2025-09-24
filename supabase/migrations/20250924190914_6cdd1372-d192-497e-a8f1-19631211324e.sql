-- Create missing vendor_workflow_automations table
CREATE TABLE public.vendor_workflow_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  action_type TEXT NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_workflow_automations ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor_workflow_automations
CREATE POLICY "Users can view vendor workflow automations" 
ON public.vendor_workflow_automations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert vendor workflow automations" 
ON public.vendor_workflow_automations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update vendor workflow automations" 
ON public.vendor_workflow_automations 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete vendor workflow automations" 
ON public.vendor_workflow_automations 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Add missing columns to vendors table
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS specialties TEXT[],
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS insurance_info JSONB;

-- Add missing columns to vendor_contracts table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendor_contracts') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_contracts' AND column_name = 'contract_title') THEN
      ALTER TABLE public.vendor_contracts ADD COLUMN contract_title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_contracts' AND column_name = 'auto_renew') THEN
      ALTER TABLE public.vendor_contracts ADD COLUMN auto_renew BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_contracts' AND column_name = 'renewal_notice_days') THEN
      ALTER TABLE public.vendor_contracts ADD COLUMN renewal_notice_days INTEGER;
    END IF;
  END IF;
END $$;

-- Add missing columns to vendor_compliance table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendor_compliance') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_compliance' AND column_name = 'verified_at') THEN
      ALTER TABLE public.vendor_compliance ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
    END IF;
  END IF;
END $$;