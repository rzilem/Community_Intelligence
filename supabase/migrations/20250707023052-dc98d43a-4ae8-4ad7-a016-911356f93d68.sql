-- Phase 1: Database Schema Corrections (Corrected) - only add missing fields

-- Fix collection_actions table - add performed_by field if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'collection_actions' 
                   AND column_name = 'performed_by') THEN
        ALTER TABLE public.collection_actions ADD COLUMN performed_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Fix payment_batches table - add notes field if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'payment_batches' 
                   AND column_name = 'notes') THEN
        ALTER TABLE public.payment_batches ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Fix vendor_1099_records table - add missing fields
DO $$ 
BEGIN
    -- Add vendor_name if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendor_1099_records' 
                   AND column_name = 'vendor_name') THEN
        ALTER TABLE public.vendor_1099_records ADD COLUMN vendor_name TEXT;
    END IF;
    
    -- Add vendor_tin if not exists  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendor_1099_records' 
                   AND column_name = 'vendor_tin') THEN
        ALTER TABLE public.vendor_1099_records ADD COLUMN vendor_tin TEXT;
    END IF;
    
    -- Add is_1099_required if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendor_1099_records' 
                   AND column_name = 'is_1099_required') THEN
        ALTER TABLE public.vendor_1099_records ADD COLUMN is_1099_required BOOLEAN DEFAULT true;
    END IF;
    
    -- Add status if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendor_1099_records' 
                   AND column_name = 'status') THEN
        ALTER TABLE public.vendor_1099_records ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
    END IF;
    
    -- Add generated_date if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendor_1099_records' 
                   AND column_name = 'generated_date') THEN
        ALTER TABLE public.vendor_1099_records ADD COLUMN generated_date DATE;
    END IF;
    
    -- Add total_amount if not exists (rename from total_payments)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vendor_1099_records' 
                   AND column_name = 'total_amount') THEN
        ALTER TABLE public.vendor_1099_records ADD COLUMN total_amount NUMERIC DEFAULT 0;
        -- Copy data from total_payments if it exists
        UPDATE public.vendor_1099_records SET total_amount = total_payments WHERE total_payments IS NOT NULL;
    END IF;
END $$;

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

-- Only enable RLS on new tables (check if they exist first)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gl_accounts' AND table_schema = 'public') THEN
        ALTER TABLE public.gl_accounts ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policy for GL accounts
        DROP POLICY IF EXISTS "Users can access GL accounts for their associations" ON public.gl_accounts;
        CREATE POLICY "Users can access GL accounts for their associations"
        ON public.gl_accounts FOR ALL USING (check_user_association(association_id));
        
        -- Add update trigger
        DROP TRIGGER IF EXISTS update_gl_accounts_updated_at ON public.gl_accounts;
        CREATE TRIGGER update_gl_accounts_updated_at
          BEFORE UPDATE ON public.gl_accounts FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entries' AND table_schema = 'public') THEN
        ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can access journal entries for their associations" ON public.journal_entries;
        CREATE POLICY "Users can access journal entries for their associations"
        ON public.journal_entries FOR ALL USING (check_user_association(association_id));
        
        DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON public.journal_entries;
        CREATE TRIGGER update_journal_entries_updated_at
          BEFORE UPDATE ON public.journal_entries FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entry_line_items' AND table_schema = 'public') THEN
        ALTER TABLE public.journal_entry_line_items ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can access journal entry line items for their associations" ON public.journal_entry_line_items;
        CREATE POLICY "Users can access journal entry line items for their associations"
        ON public.journal_entry_line_items FOR ALL USING (
          journal_entry_id IN (
            SELECT id FROM journal_entries WHERE check_user_association(association_id)
          )
        );
        
        DROP TRIGGER IF EXISTS update_journal_entry_line_items_updated_at ON public.journal_entry_line_items;
        CREATE TRIGGER update_journal_entry_line_items_updated_at
          BEFORE UPDATE ON public.journal_entry_line_items FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budgets' AND table_schema = 'public') THEN
        ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can access budgets for their associations" ON public.budgets;
        CREATE POLICY "Users can access budgets for their associations"
        ON public.budgets FOR ALL USING (check_user_association(association_id));
        
        DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
        CREATE TRIGGER update_budgets_updated_at
          BEFORE UPDATE ON public.budgets FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budget_line_items' AND table_schema = 'public') THEN
        ALTER TABLE public.budget_line_items ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can access budget line items for their associations" ON public.budget_line_items;
        CREATE POLICY "Users can access budget line items for their associations"
        ON public.budget_line_items FOR ALL USING (
          budget_id IN (
            SELECT id FROM budgets WHERE check_user_association(association_id)
          )
        );
        
        DROP TRIGGER IF EXISTS update_budget_line_items_updated_at ON public.budget_line_items;
        CREATE TRIGGER update_budget_line_items_updated_at
          BEFORE UPDATE ON public.budget_line_items FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create indexes for performance (only if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gl_accounts' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_gl_accounts_association_id ON public.gl_accounts(association_id);
        CREATE INDEX IF NOT EXISTS idx_gl_accounts_code ON public.gl_accounts(association_id, code);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entries' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_journal_entries_association_id ON public.journal_entries(association_id);
        CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(entry_date);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entry_line_items' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_journal_entry_line_items_journal_id ON public.journal_entry_line_items(journal_entry_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budget_line_items' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_budget_line_items_budget_id ON public.budget_line_items(budget_id);
    END IF;
END $$;