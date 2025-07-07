-- Phase 1: Database Schema Corrections for Advanced GL & Payment Features

-- Fix collection_actions table - add performed_by field
ALTER TABLE public.collection_actions 
ADD COLUMN performed_by UUID REFERENCES auth.users(id);

-- Fix payment_batches table - add notes field
ALTER TABLE public.payment_batches 
ADD COLUMN notes TEXT;

-- Fix vendor_1099_records table - add missing fields
ALTER TABLE public.vendor_1099_records 
ADD COLUMN vendor_name TEXT NOT NULL DEFAULT '',
ADD COLUMN vendor_tin TEXT,
ADD COLUMN is_1099_required BOOLEAN DEFAULT true,
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN generated_date DATE,
ADD COLUMN sent_date DATE;

-- Create GL accounts table for advanced features
CREATE TABLE IF NOT EXISTS public.gl_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- asset, liability, equity, revenue, expense
  category TEXT,
  parent_account_id UUID REFERENCES public.gl_accounts(id),
  is_active BOOLEAN DEFAULT true,
  balance NUMERIC(12,2) DEFAULT 0,
  normal_balance TEXT NOT NULL DEFAULT 'debit', -- debit or credit
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(association_id, code)
);

-- Create journal entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL,
  reference TEXT,
  description TEXT NOT NULL,
  total_debit NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_credit NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, posted, reversed
  source_type TEXT DEFAULT 'manual', -- manual, ap, ar, bank, assessment
  created_by UUID,
  posted_by UUID,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(association_id, entry_number)
);

-- Create journal entry line items table
CREATE TABLE IF NOT EXISTS public.journal_entry_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  gl_account_id UUID NOT NULL REFERENCES public.gl_accounts(id),
  line_number INTEGER NOT NULL,
  description TEXT,
  debit_amount NUMERIC(12,2) DEFAULT 0,
  credit_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create budget table for advanced budget management
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID NOT NULL,
  name TEXT NOT NULL,
  budget_year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, approved, active, closed
  total_revenue NUMERIC(12,2) DEFAULT 0,
  total_expenses NUMERIC(12,2) DEFAULT 0,
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(association_id, budget_year)
);

-- Create budget line items table
CREATE TABLE IF NOT EXISTS public.budget_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  gl_account_id UUID NOT NULL REFERENCES public.gl_accounts(id),
  category TEXT,
  description TEXT,
  budgeted_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  actual_amount NUMERIC(12,2) DEFAULT 0,
  variance_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.gl_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_line_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can access GL accounts for their associations"
ON public.gl_accounts FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access journal entries for their associations"
ON public.journal_entries FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access journal entry line items for their associations"
ON public.journal_entry_line_items FOR ALL USING (
  journal_entry_id IN (
    SELECT id FROM journal_entries WHERE check_user_association(association_id)
  )
);

CREATE POLICY "Users can access budgets for their associations"
ON public.budgets FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access budget line items for their associations"
ON public.budget_line_items FOR ALL USING (
  budget_id IN (
    SELECT id FROM budgets WHERE check_user_association(association_id)
  )
);

-- Add update triggers
CREATE TRIGGER update_gl_accounts_updated_at
  BEFORE UPDATE ON public.gl_accounts FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entry_line_items_updated_at
  BEFORE UPDATE ON public.journal_entry_line_items FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_line_items_updated_at
  BEFORE UPDATE ON public.budget_line_items FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_gl_accounts_association_id ON public.gl_accounts(association_id);
CREATE INDEX idx_gl_accounts_code ON public.gl_accounts(association_id, code);
CREATE INDEX idx_journal_entries_association_id ON public.journal_entries(association_id);
CREATE INDEX idx_journal_entries_date ON public.journal_entries(entry_date);
CREATE INDEX idx_journal_entry_line_items_journal_id ON public.journal_entry_line_items(journal_entry_id);
CREATE INDEX idx_budget_line_items_budget_id ON public.budget_line_items(budget_id);