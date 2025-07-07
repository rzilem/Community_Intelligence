-- Create missing tables for payment processing

-- Payment batches table
CREATE TABLE public.payment_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  bank_account_id UUID,
  batch_number TEXT NOT NULL,
  batch_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_count INTEGER NOT NULL DEFAULT 0,
  ach_file_path TEXT,
  notes TEXT,
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Collection actions table
CREATE TABLE public.collection_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  amount NUMERIC,
  outcome TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_date DATE,
  completed_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vendor 1099 records table
CREATE TABLE public.vendor_1099_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  vendor_id UUID,
  vendor_name TEXT NOT NULL,
  vendor_tin TEXT,
  tax_year INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  box_number TEXT,
  form_type TEXT NOT NULL DEFAULT '1099-NEC',
  is_1099_required BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending',
  form_generated BOOLEAN DEFAULT false,
  form_sent BOOLEAN DEFAULT false,
  generated_date DATE,
  sent_date DATE,
  correction_filed BOOLEAN DEFAULT false,
  corrections_count INTEGER DEFAULT 0,
  backup_withholding BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto pay settings table for residents
CREATE TABLE public.auto_pay_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id UUID NOT NULL,
  association_id UUID NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  payment_method_id UUID,
  amount_type TEXT DEFAULT 'full_balance', -- 'full_balance', 'minimum_due', 'fixed_amount'
  fixed_amount NUMERIC,
  process_day INTEGER DEFAULT 1, -- Day of month to process
  next_payment_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_1099_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_pay_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can access payment batches for their associations"
ON public.payment_batches FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access collection actions for their associations"
ON public.collection_actions FOR ALL USING (
  case_id IN (
    SELECT id FROM collection_cases WHERE check_user_association(association_id)
  )
);

CREATE POLICY "Users can access vendor 1099 records for their associations"
ON public.vendor_1099_records FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access auto pay settings for their associations"
ON public.auto_pay_settings FOR ALL USING (check_user_association(association_id));

-- Add update triggers
CREATE TRIGGER update_payment_batches_updated_at
  BEFORE UPDATE ON public.payment_batches FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_actions_updated_at
  BEFORE UPDATE ON public.collection_actions FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_1099_records_updated_at
  BEFORE UPDATE ON public.vendor_1099_records FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auto_pay_settings_updated_at
  BEFORE UPDATE ON public.auto_pay_settings FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();