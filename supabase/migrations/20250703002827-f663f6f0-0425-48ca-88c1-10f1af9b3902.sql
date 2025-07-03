-- Phase 1: Assessment & Collections Foundation - Fixed
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