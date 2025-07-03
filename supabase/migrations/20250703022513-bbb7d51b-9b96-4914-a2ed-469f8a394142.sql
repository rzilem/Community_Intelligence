-- Phase 2: Core Accounting Operations
-- Enhanced GL Accounts with industry standard chart of accounts
CREATE TABLE IF NOT EXISTS gl_accounts_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  account_subtype TEXT NOT NULL CHECK (account_subtype IN (
    'current_asset', 'fixed_asset', 'other_asset',
    'current_liability', 'long_term_liability', 'other_liability',
    'member_equity', 'retained_earnings',
    'assessment_income', 'other_income', 'interest_income',
    'operating_expense', 'maintenance_expense', 'administrative_expense', 'reserve_expense'
  )),
  parent_account_id UUID REFERENCES gl_accounts_enhanced(id),
  is_active BOOLEAN DEFAULT true,
  is_system_account BOOLEAN DEFAULT false,
  normal_balance TEXT NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
  current_balance DECIMAL(12,2) DEFAULT 0,
  ytd_balance DECIMAL(12,2) DEFAULT 0,
  description TEXT,
  tax_line_mapping TEXT,
  budget_account BOOLEAN DEFAULT true,
  cash_flow_category TEXT CHECK (cash_flow_category IN ('operating', 'investing', 'financing')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(association_id, account_code)
);

-- Accounts Payable system
CREATE TABLE IF NOT EXISTS accounts_payable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  vendor_id UUID,
  invoice_id UUID,
  ap_number TEXT UNIQUE NOT NULL,
  vendor_name TEXT NOT NULL,
  invoice_number TEXT,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_terms TEXT,
  original_amount DECIMAL(10,2) NOT NULL,
  current_balance DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  withholding_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partial', 'paid', 'void', 'on_hold')),
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'requires_approval')),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  gl_account_code TEXT,
  description TEXT,
  purchase_order_number TEXT,
  reference_number TEXT,
  aging_days INTEGER DEFAULT 0,
  aging_bucket TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN aging_days <= 30 THEN 'current'
      WHEN aging_days <= 60 THEN '31-60'
      WHEN aging_days <= 90 THEN '61-90'
      ELSE 'over_90'
    END
  ) STORED,
  payment_batch_id UUID,
  is_recurring BOOLEAN DEFAULT false,
  recurring_schedule JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Three-way matching system
CREATE TABLE IF NOT EXISTS three_way_matching (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  purchase_order_id UUID,
  receiving_record_id UUID,
  invoice_id UUID,
  ap_id UUID REFERENCES accounts_payable(id),
  matching_status TEXT NOT NULL DEFAULT 'unmatched' CHECK (matching_status IN ('unmatched', 'partial', 'matched', 'exception')),
  exception_reasons JSONB DEFAULT '[]',
  quantity_variance DECIMAL(10,2) DEFAULT 0,
  price_variance DECIMAL(10,2) DEFAULT 0,
  total_variance DECIMAL(10,2) DEFAULT 0,
  tolerance_exceeded BOOLEAN DEFAULT false,
  matched_by UUID,
  matched_at TIMESTAMPTZ,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  auto_matched BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  po_number TEXT UNIQUE NOT NULL,
  vendor_id UUID,
  vendor_name TEXT NOT NULL,
  po_date DATE NOT NULL,
  requested_by UUID,
  approved_by UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'issued', 'partial_received', 'fully_received', 'closed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_terms TEXT,
  delivery_date DATE,
  shipping_address TEXT,
  billing_address TEXT,
  notes TEXT,
  terms_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Purchase Order Line Items
CREATE TABLE IF NOT EXISTS purchase_order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id),
  line_number INTEGER NOT NULL,
  item_description TEXT NOT NULL,
  item_code TEXT,
  quantity DECIMAL(10,3) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  unit_of_measure TEXT,
  gl_account_code TEXT,
  delivery_date DATE,
  received_quantity DECIMAL(10,3) DEFAULT 0,
  invoiced_quantity DECIMAL(10,3) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(po_id, line_number)
);