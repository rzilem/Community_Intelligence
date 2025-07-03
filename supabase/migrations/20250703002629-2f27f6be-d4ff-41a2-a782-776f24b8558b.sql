-- Phase 1: Assessment & Collections Foundation
-- Assessment Management Tables

-- Assessment types with enhanced features
CREATE TABLE IF NOT EXISTS assessment_types_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('regular', 'special', 'late_fee', 'interest', 'legal')),
  base_amount DECIMAL(10,2),
  calculation_method TEXT DEFAULT 'fixed' CHECK (calculation_method IN ('fixed', 'percentage', 'per_unit', 'per_sqft')),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB, -- For complex recurring patterns
  gl_account_code TEXT,
  tax_code TEXT,
  is_active BOOLEAN DEFAULT true,
  effective_date DATE,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Payment methods and processing
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  method_type TEXT NOT NULL CHECK (method_type IN ('ach', 'credit_card', 'check', 'cash', 'wire', 'money_order', 'online')),
  provider TEXT, -- stripe, square, etc.
  is_active BOOLEAN DEFAULT true,
  processing_fee_type TEXT CHECK (processing_fee_type IN ('fixed', 'percentage', 'tiered')),
  processing_fee_amount DECIMAL(5,4),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enhanced payment transactions
CREATE TABLE IF NOT EXISTS payment_transactions_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  association_id UUID NOT NULL,
  payment_method_id UUID,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'chargeback', 'reversal')),
  amount DECIMAL(10,2) NOT NULL,
  processing_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  external_transaction_id TEXT, -- Payment processor ID
  reference_number TEXT,
  payment_date TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  failure_reason TEXT,
  batch_id UUID,
  reconciliation_status TEXT DEFAULT 'unreconciled' CHECK (reconciliation_status IN ('unreconciled', 'reconciled', 'disputed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Collections management
CREATE TABLE IF NOT EXISTS collections_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  association_id UUID NOT NULL,
  case_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'legal', 'written_off')),
  total_amount_due DECIMAL(10,2) NOT NULL,
  original_balance DECIMAL(10,2) NOT NULL,
  current_balance DECIMAL(10,2) NOT NULL,
  last_payment_date DATE,
  days_delinquent INTEGER DEFAULT 0,
  collection_stage TEXT NOT NULL DEFAULT 'notice' CHECK (collection_stage IN ('notice', 'demand', 'legal', 'lien', 'foreclosure')),
  assigned_to UUID,
  external_agency TEXT,
  notes TEXT,
  priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  closed_reason TEXT
);

-- Collections activities and communications
CREATE TABLE IF NOT EXISTS collections_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collections_case_id UUID NOT NULL REFERENCES collections_cases(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('notice_sent', 'call_made', 'email_sent', 'payment_received', 'legal_action', 'lien_filed', 'note_added')),
  description TEXT NOT NULL,
  amount DECIMAL(10,2),
  due_date DATE,
  completed_date DATE,
  assigned_to UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Accounts Receivable with aging
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  association_id UUID NOT NULL,
  invoice_number TEXT,
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('assessment', 'late_fee', 'legal_fee', 'other')),
  original_amount DECIMAL(10,2) NOT NULL,
  current_balance DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  last_payment_date DATE,
  aging_days INTEGER DEFAULT 0,
  aging_bucket TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN aging_days <= 30 THEN 'current'
      WHEN aging_days <= 60 THEN '31-60'
      WHEN aging_days <= 90 THEN '61-90'
      WHEN aging_days <= 120 THEN '91-120'
      ELSE 'over_120'
    END
  ) STORED,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'partial', 'written_off', 'disputed')),
  gl_account_code TEXT,
  is_in_collections BOOLEAN DEFAULT false,
  collections_case_id UUID REFERENCES collections_cases(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payment allocations (how payments are applied to invoices)
CREATE TABLE IF NOT EXISTS payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id UUID NOT NULL REFERENCES payment_transactions_enhanced(id),
  accounts_receivable_id UUID NOT NULL REFERENCES accounts_receivable(id),
  allocated_amount DECIMAL(10,2) NOT NULL,
  allocation_date TIMESTAMPTZ DEFAULT now(),
  allocation_type TEXT DEFAULT 'automatic' CHECK (allocation_type IN ('automatic', 'manual', 'adjustment')),
  notes TEXT,
  created_by UUID
);

-- Credit management
CREATE TABLE IF NOT EXISTS account_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  association_id UUID NOT NULL,
  credit_type TEXT NOT NULL CHECK (credit_type IN ('overpayment', 'refund', 'adjustment', 'discount', 'waiver')),
  amount DECIMAL(10,2) NOT NULL,
  remaining_balance DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_number TEXT,
  credit_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'applied', 'expired', 'voided')),
  gl_account_code TEXT,
  applied_to_invoice_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Enable RLS on all tables
ALTER TABLE assessment_types_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for association-based access
CREATE POLICY "Users can access assessment types for their associations" ON assessment_types_enhanced
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access payment methods for their associations" ON payment_methods
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access payment transactions for their associations" ON payment_transactions_enhanced
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access collections cases for their associations" ON collections_cases
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access collections activities for their associations" ON collections_activities
  FOR ALL USING (collections_case_id IN (
    SELECT id FROM collections_cases WHERE check_user_association(association_id)
  ));

CREATE POLICY "Users can access accounts receivable for their associations" ON accounts_receivable
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access payment allocations for their associations" ON payment_allocations
  FOR ALL USING (payment_transaction_id IN (
    SELECT id FROM payment_transactions_enhanced WHERE check_user_association(association_id)
  ));

CREATE POLICY "Users can access account credits for their associations" ON account_credits
  FOR ALL USING (check_user_association(association_id));

-- Indexes for performance
CREATE INDEX idx_payment_transactions_property ON payment_transactions_enhanced(property_id);
CREATE INDEX idx_payment_transactions_date ON payment_transactions_enhanced(payment_date);
CREATE INDEX idx_payment_transactions_status ON payment_transactions_enhanced(status);
CREATE INDEX idx_collections_cases_property ON collections_cases(property_id);
CREATE INDEX idx_collections_cases_status ON collections_cases(status);
CREATE INDEX idx_accounts_receivable_property ON accounts_receivable(property_id);
CREATE INDEX idx_accounts_receivable_aging ON accounts_receivable(aging_bucket);
CREATE INDEX idx_accounts_receivable_due_date ON accounts_receivable(due_date);

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION update_aging_days()
RETURNS TRIGGER AS $$
BEGIN
  NEW.aging_days = GREATEST(0, EXTRACT(days FROM CURRENT_DATE - NEW.due_date));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ar_aging_trigger
  BEFORE INSERT OR UPDATE ON accounts_receivable
  FOR EACH ROW EXECUTE FUNCTION update_aging_days();

-- Function to automatically allocate payments
CREATE OR REPLACE FUNCTION auto_allocate_payment(p_payment_id UUID)
RETURNS VOID AS $$
DECLARE
  payment_rec RECORD;
  ar_rec RECORD;
  remaining_amount DECIMAL(10,2);
  allocation_amount DECIMAL(10,2);
BEGIN
  -- Get payment details
  SELECT * INTO payment_rec FROM payment_transactions_enhanced WHERE id = p_payment_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;
  
  remaining_amount := payment_rec.net_amount;
  
  -- Allocate to oldest invoices first
  FOR ar_rec IN 
    SELECT * FROM accounts_receivable 
    WHERE property_id = payment_rec.property_id 
    AND status IN ('open', 'partial')
    AND current_balance > 0
    ORDER BY due_date ASC
  LOOP
    EXIT WHEN remaining_amount <= 0;
    
    allocation_amount := LEAST(remaining_amount, ar_rec.current_balance);
    
    -- Create allocation record
    INSERT INTO payment_allocations (
      payment_transaction_id,
      accounts_receivable_id,
      allocated_amount,
      allocation_type
    ) VALUES (
      p_payment_id,
      ar_rec.id,
      allocation_amount,
      'automatic'
    );
    
    -- Update AR balance
    UPDATE accounts_receivable 
    SET 
      current_balance = current_balance - allocation_amount,
      paid_amount = paid_amount + allocation_amount,
      status = CASE 
        WHEN current_balance - allocation_amount = 0 THEN 'paid'
        ELSE 'partial'
      END,
      last_payment_date = payment_rec.payment_date
    WHERE id = ar_rec.id;
    
    remaining_amount := remaining_amount - allocation_amount;
  END LOOP;
  
  -- If there's remaining amount, create credit
  IF remaining_amount > 0 THEN
    INSERT INTO account_credits (
      property_id,
      association_id,
      credit_type,
      amount,
      remaining_balance,
      description,
      credit_date
    ) VALUES (
      payment_rec.property_id,
      payment_rec.association_id,
      'overpayment',
      remaining_amount,
      remaining_amount,
      'Overpayment from transaction ' || payment_rec.reference_number,
      payment_rec.payment_date
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;