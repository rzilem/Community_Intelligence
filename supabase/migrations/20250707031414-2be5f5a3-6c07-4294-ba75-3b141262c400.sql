-- Create recurring journal entries table
CREATE TABLE public.recurring_journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'annually')),
  next_run_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bank transactions table for reconciliation
CREATE TABLE public.bank_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_account_id UUID NOT NULL,
  transaction_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  reference_number TEXT,
  transaction_type TEXT NOT NULL,
  matched_journal_entry_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.recurring_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access recurring entries for their associations" 
ON public.recurring_journal_entries 
FOR ALL 
USING (check_user_association(association_id));

CREATE POLICY "Users can access bank transactions for their associations" 
ON public.bank_transactions 
FOR ALL 
USING (bank_account_id IN (
  SELECT id FROM bank_accounts WHERE check_user_association(association_id)
));

-- Add bank_transaction_id to journal_entry_line_items
ALTER TABLE public.journal_entry_line_items 
ADD COLUMN bank_transaction_id UUID;

-- Create collection cases table
CREATE TABLE public.collections_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  property_id UUID NOT NULL,
  case_number TEXT NOT NULL,
  total_amount_owed NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  case_status TEXT NOT NULL DEFAULT 'open' CHECK (case_status IN ('open', 'settled', 'closed')),
  collection_stage TEXT NOT NULL DEFAULT 'notice' CHECK (collection_stage IN ('notice', 'demand', 'legal', 'judgment')),
  opened_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.collections_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access collection cases for their associations" 
ON public.collections_cases 
FOR ALL 
USING (check_user_association(association_id));