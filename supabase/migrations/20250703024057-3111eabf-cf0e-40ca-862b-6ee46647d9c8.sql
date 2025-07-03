-- Phase 2A: Core Operations Database Tables
-- Journal Entries for double-entry bookkeeping
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  entry_number TEXT UNIQUE NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_number TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('manual', 'ap', 'ar', 'bank', 'assessment', 'adjustment')),
  source_id UUID,
  total_amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
  posted_at TIMESTAMPTZ,
  posted_by UUID,
  reversed_at TIMESTAMPTZ,
  reversed_by UUID,
  reversal_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Journal Entry Line Items
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  gl_account_id UUID NOT NULL REFERENCES gl_accounts_enhanced(id),
  description TEXT,
  debit_amount DECIMAL(12,2) DEFAULT 0,
  credit_amount DECIMAL(12,2) DEFAULT 0,
  property_id UUID,
  vendor_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(journal_entry_id, line_number),
  CHECK (debit_amount >= 0 AND credit_amount >= 0),
  CHECK (NOT (debit_amount > 0 AND credit_amount > 0))
);

-- Bank Reconciliation System
CREATE TABLE IF NOT EXISTS bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
  reconciliation_date DATE NOT NULL,
  statement_date DATE NOT NULL,
  beginning_balance DECIMAL(12,2) NOT NULL,
  ending_balance DECIMAL(12,2) NOT NULL,
  statement_balance DECIMAL(12,2) NOT NULL,
  reconciled_balance DECIMAL(12,2) NOT NULL,
  difference DECIMAL(12,2) GENERATED ALWAYS AS (statement_balance - reconciled_balance) STORED,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'approved')),
  reconciled_by UUID,
  reconciled_at TIMESTAMPTZ,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bank Reconciliation Items (cleared/outstanding)
CREATE TABLE IF NOT EXISTS bank_reconciliation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_id UUID NOT NULL REFERENCES bank_reconciliations(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('bank_transaction', 'gl_transaction', 'adjustment')),
  bank_transaction_id UUID REFERENCES bank_transactions(id),
  gl_transaction_id UUID,
  amount DECIMAL(12,2) NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_number TEXT,
  status TEXT NOT NULL DEFAULT 'outstanding' CHECK (status IN ('outstanding', 'cleared', 'voided')),
  cleared_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enhanced Assessment Types with more detailed configuration
ALTER TABLE assessment_types_enhanced 
ADD COLUMN IF NOT EXISTS calculation_formula TEXT,
ADD COLUMN IF NOT EXISTS proration_method TEXT CHECK (proration_method IN ('daily', 'monthly', 'none')),
ADD COLUMN IF NOT EXISTS auto_generate BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_threshold DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_terms_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS grace_period_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS late_fee_type TEXT CHECK (late_fee_type IN ('fixed', 'percentage', 'tiered')),
ADD COLUMN IF NOT EXISTS late_fee_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS compound_late_fees BOOLEAN DEFAULT false;

-- Assessment Billing Cycles
CREATE TABLE IF NOT EXISTS assessment_billing_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  cycle_name TEXT NOT NULL,
  cycle_type TEXT NOT NULL CHECK (cycle_type IN ('monthly', 'quarterly', 'semi_annual', 'annual', 'special')),
  assessment_types JSONB NOT NULL DEFAULT '[]',
  billing_day INTEGER NOT NULL DEFAULT 1,
  due_day INTEGER NOT NULL DEFAULT 30,
  grace_period_days INTEGER DEFAULT 0,
  late_fee_day INTEGER,
  auto_generate BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  next_billing_date DATE,
  last_generated_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Assessment Billing History
CREATE TABLE IF NOT EXISTS assessment_billing_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  billing_cycle_id UUID NOT NULL REFERENCES assessment_billing_cycles(id),
  run_date DATE NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  total_assessments_generated INTEGER DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'failed', 'cancelled')),
  error_details TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Late Fee Configuration and Tracking
CREATE TABLE IF NOT EXISTS late_fee_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  assessment_type_id UUID REFERENCES assessment_types_enhanced(id),
  rule_name TEXT NOT NULL,
  trigger_days_past_due INTEGER NOT NULL,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('fixed', 'percentage', 'daily', 'monthly')),
  fee_amount DECIMAL(10,2) NOT NULL,
  maximum_fee DECIMAL(10,2),
  compound_fees BOOLEAN DEFAULT false,
  applies_to_partial_payments BOOLEAN DEFAULT true,
  waiver_threshold DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_association ON journal_entries(association_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_gl_account ON journal_entry_lines(gl_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_reconciliations_account ON bank_reconciliations(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_reconciliation_items_reconciliation ON bank_reconciliation_items(reconciliation_id);
CREATE INDEX IF NOT EXISTS idx_assessment_billing_cycles_association ON assessment_billing_cycles(association_id);
CREATE INDEX IF NOT EXISTS idx_late_fee_rules_association ON late_fee_rules(association_id);

-- Add RLS policies
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_billing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_billing_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE late_fee_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access journal entries for their associations" ON journal_entries
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access journal entry lines for their associations" ON journal_entry_lines
  FOR ALL USING (journal_entry_id IN (
    SELECT id FROM journal_entries WHERE check_user_association(association_id)
  ));

CREATE POLICY "Users can access bank reconciliations for their associations" ON bank_reconciliations
  FOR ALL USING (bank_account_id IN (
    SELECT id FROM bank_accounts WHERE check_user_association(association_id)
  ));

CREATE POLICY "Users can access bank reconciliation items for their associations" ON bank_reconciliation_items
  FOR ALL USING (reconciliation_id IN (
    SELECT br.id FROM bank_reconciliations br 
    JOIN bank_accounts ba ON br.bank_account_id = ba.id 
    WHERE check_user_association(ba.association_id)
  ));

CREATE POLICY "Users can access assessment billing cycles for their associations" ON assessment_billing_cycles
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access assessment billing runs for their associations" ON assessment_billing_runs
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access late fee rules for their associations" ON late_fee_rules
  FOR ALL USING (check_user_association(association_id));