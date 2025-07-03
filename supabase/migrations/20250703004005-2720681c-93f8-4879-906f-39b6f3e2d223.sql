-- Continue Phase 1 tables
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