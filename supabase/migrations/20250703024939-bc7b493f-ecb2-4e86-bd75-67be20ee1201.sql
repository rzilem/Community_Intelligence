-- Phase 2B: Advanced AP/AR Operations Database Foundation

-- Enhanced Vendor Management Tables
CREATE TABLE IF NOT EXISTS vendor_management_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id),
  tax_id VARCHAR(20),
  business_type TEXT CHECK (business_type IN ('corporation', 'llc', 'partnership', 'sole_proprietorship', 'other')),
  payment_terms_days INTEGER DEFAULT 30,
  discount_terms_days INTEGER DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  credit_limit DECIMAL(12,2) DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('ach', 'check', 'wire', 'card')) DEFAULT 'check',
  bank_account_name TEXT,
  bank_routing_number VARCHAR(9),
  bank_account_number TEXT,
  w9_on_file BOOLEAN DEFAULT FALSE,
  w9_date_received DATE,
  insurance_cert_on_file BOOLEAN DEFAULT FALSE,
  insurance_expiry_date DATE,
  performance_rating DECIMAL(3,2) DEFAULT 5.00,
  total_invoices_processed INTEGER DEFAULT 0,
  total_amount_paid DECIMAL(12,2) DEFAULT 0,
  average_payment_days DECIMAL(5,2) DEFAULT 0,
  onboarding_status TEXT CHECK (onboarding_status IN ('pending', 'in_progress', 'completed', 'rejected')) DEFAULT 'pending',
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE NOT NULL,
  association_id UUID NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  po_date DATE NOT NULL DEFAULT CURRENT_DATE,
  required_date DATE,
  delivery_address TEXT,
  status TEXT CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'received', 'closed', 'cancelled')) DEFAULT 'draft',
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  notes TEXT,
  terms_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE
);

-- Purchase Order Line Items
CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  gl_account_code TEXT,
  received_quantity DECIMAL(10,2) DEFAULT 0,
  invoiced_quantity DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(po_id, line_number)
);

-- Receipts Table (for 3-way matching)
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  po_id UUID REFERENCES purchase_orders(id),
  association_id UUID NOT NULL,
  received_by UUID REFERENCES auth.users(id),
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  vendor_packing_slip TEXT,
  status TEXT CHECK (status IN ('draft', 'confirmed', 'disputed')) DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipt Line Items
CREATE TABLE IF NOT EXISTS receipt_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  po_line_id UUID REFERENCES purchase_order_lines(id),
  quantity_received DECIMAL(10,2) NOT NULL,
  condition_notes TEXT,
  rejected_quantity DECIMAL(10,2) DEFAULT 0,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Invoice Matching
CREATE TABLE IF NOT EXISTS invoice_matching (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  po_id UUID REFERENCES purchase_orders(id),
  receipt_id UUID REFERENCES receipts(id),
  matching_status TEXT CHECK (matching_status IN ('pending', 'matched', 'exception', 'override')) DEFAULT 'pending',
  price_variance DECIMAL(12,2) DEFAULT 0,
  quantity_variance DECIMAL(10,2) DEFAULT 0,
  tolerance_exceeded BOOLEAN DEFAULT FALSE,
  exception_type TEXT,
  exception_description TEXT,
  override_reason TEXT,
  override_by UUID REFERENCES auth.users(id),
  override_at TIMESTAMP WITH TIME ZONE,
  auto_matched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Authorizations
CREATE TABLE IF NOT EXISTS payment_authorizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  payment_batch_id UUID,
  authorizer_id UUID REFERENCES auth.users(id),
  authorization_level INTEGER NOT NULL,
  amount_threshold DECIMAL(12,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  authorized_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  digital_signature TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Batches
CREATE TABLE IF NOT EXISTS payment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT UNIQUE NOT NULL,
  association_id UUID NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('ach', 'check', 'wire')) NOT NULL,
  batch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'processed', 'cancelled')) DEFAULT 'draft',
  bank_account_id UUID REFERENCES bank_accounts(id),
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  transmission_id TEXT,
  ach_file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_batch_id UUID REFERENCES payment_batches(id),
  vendor_id UUID REFERENCES vendors(id),
  property_id UUID,
  association_id UUID NOT NULL,
  payment_method TEXT NOT NULL,
  payment_type TEXT CHECK (payment_type IN ('vendor_payment', 'refund', 'assessment_payment', 'other')) DEFAULT 'vendor_payment',
  reference_number TEXT,
  check_number TEXT,
  gross_amount DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  withholding_amount DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processed', 'cleared', 'cancelled', 'returned')) DEFAULT 'pending',
  bank_account_id UUID REFERENCES bank_accounts(id),
  memo TEXT,
  void_reason TEXT,
  void_date DATE,
  void_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Payment Allocations (linking payments to invoices)
CREATE TABLE IF NOT EXISTS payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id UUID REFERENCES payment_transactions_enhanced(id),
  accounts_payable_id UUID REFERENCES accounts_payable(id),
  accounts_receivable_id UUID REFERENCES accounts_receivable(id),
  allocated_amount DECIMAL(12,2) NOT NULL,
  allocation_type TEXT CHECK (allocation_type IN ('automatic', 'manual')) DEFAULT 'manual',
  applied_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1099 Tax Reporting
CREATE TABLE IF NOT EXISTS tax_1099_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id),
  association_id UUID NOT NULL,
  tax_year INTEGER NOT NULL,
  form_type TEXT CHECK (form_type IN ('1099-NEC', '1099-MISC')) DEFAULT '1099-NEC',
  box_1_amount DECIMAL(12,2) DEFAULT 0, -- Non-employee compensation
  box_2_amount DECIMAL(12,2) DEFAULT 0, -- Rent
  box_3_amount DECIMAL(12,2) DEFAULT 0, -- Other income
  box_4_amount DECIMAL(12,2) DEFAULT 0, -- Federal income tax withheld
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  submitted_to_irs BOOLEAN DEFAULT FALSE,
  submitted_date DATE,
  correction_form BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, association_id, tax_year)
);

-- Resident Payment Portal
CREATE TABLE IF NOT EXISTS resident_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL,
  payment_type TEXT CHECK (payment_type IN ('bank_account', 'credit_card', 'debit_card')) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  account_nickname TEXT,
  last_four_digits VARCHAR(4),
  expiry_month INTEGER,
  expiry_year INTEGER,
  bank_name TEXT,
  account_type TEXT CHECK (account_type IN ('checking', 'savings')),
  stripe_payment_method_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Plans
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL,
  property_id UUID NOT NULL,
  association_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  down_payment DECIMAL(12,2) DEFAULT 0,
  remaining_balance DECIMAL(12,2) NOT NULL,
  installment_amount DECIMAL(12,2) NOT NULL,
  payment_frequency TEXT CHECK (payment_frequency IN ('weekly', 'biweekly', 'monthly')) DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'defaulted', 'cancelled')) DEFAULT 'active',
  late_fee_waived BOOLEAN DEFAULT FALSE,
  agreement_signed_date DATE,
  agreement_document_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Plan Installments
CREATE TABLE IF NOT EXISTS payment_plan_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_plan_id UUID REFERENCES payment_plans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount_due DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  payment_date DATE,
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue', 'skipped')) DEFAULT 'pending',
  late_fee_assessed DECIMAL(12,2) DEFAULT 0,
  payment_transaction_id UUID REFERENCES payment_transactions_enhanced(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(payment_plan_id, installment_number)
);

-- Collections Management
CREATE TABLE IF NOT EXISTS collections_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  property_id UUID NOT NULL,
  association_id UUID NOT NULL,
  total_amount_owed DECIMAL(12,2) NOT NULL,
  case_type TEXT CHECK (case_type IN ('delinquent_assessment', 'violation_fine', 'legal_fee', 'other')) DEFAULT 'delinquent_assessment',
  status TEXT CHECK (status IN ('open', 'in_progress', 'settled', 'closed', 'legal_action')) DEFAULT 'open',
  severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5) DEFAULT 1,
  first_notice_date DATE,
  final_notice_date DATE,
  legal_referral_date DATE,
  attorney_assigned TEXT,
  settlement_amount DECIMAL(12,2),
  settlement_date DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Audit Logs (Enhanced)
CREATE TABLE IF NOT EXISTS financial_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  association_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- create, update, delete, approve, void, etc.
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Approvals
CREATE TABLE IF NOT EXISTS workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_type TEXT NOT NULL, -- 'payment', 'purchase_order', 'journal_entry', etc.
  record_id UUID NOT NULL,
  association_id UUID NOT NULL,
  approval_level INTEGER NOT NULL,
  required_approver_role TEXT,
  approver_id UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')) DEFAULT 'pending',
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  deadline TIMESTAMP WITH TIME ZONE,
  escalated_to UUID REFERENCES auth.users(id),
  escalated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_management_vendor_id ON vendor_management_enhanced(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_association_id ON purchase_orders(association_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_receipts_po_id ON receipts(po_id);
CREATE INDEX IF NOT EXISTS idx_invoice_matching_invoice_id ON invoice_matching(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_batches_association_id ON payment_batches(association_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_enhanced_association_id ON payment_transactions_enhanced(association_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_payment_id ON payment_allocations(payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_collections_cases_property_id ON collections_cases(property_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_logs_association_id ON financial_audit_logs(association_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_logs_created_at ON financial_audit_logs(created_at);

-- Add RLS policies
ALTER TABLE vendor_management_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_matching ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_1099_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plan_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for association-based access
CREATE POLICY "Users can access vendor management for their associations" ON vendor_management_enhanced
  FOR ALL USING (
    vendor_id IN (
      SELECT v.id FROM vendors v 
      WHERE EXISTS (
        SELECT 1 FROM association_users au 
        WHERE au.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can access purchase orders for their associations" ON purchase_orders
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access purchase order lines via PO access" ON purchase_order_lines
  FOR ALL USING (
    po_id IN (
      SELECT id FROM purchase_orders 
      WHERE check_user_association(association_id)
    )
  );

CREATE POLICY "Users can access receipts for their associations" ON receipts
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access receipt lines via receipt access" ON receipt_lines
  FOR ALL USING (
    receipt_id IN (
      SELECT id FROM receipts 
      WHERE check_user_association(association_id)
    )
  );

CREATE POLICY "Users can access invoice matching for their associations" ON invoice_matching
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE check_user_association(association_id)
    )
  );

CREATE POLICY "Users can access payment authorizations for their associations" ON payment_authorizations
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access payment batches for their associations" ON payment_batches
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access payment transactions for their associations" ON payment_transactions_enhanced
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access payment allocations for their transactions" ON payment_allocations
  FOR ALL USING (
    payment_transaction_id IN (
      SELECT id FROM payment_transactions_enhanced 
      WHERE check_user_association(association_id)
    )
  );

CREATE POLICY "Users can access 1099 records for their associations" ON tax_1099_records
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Residents can access their own payment methods" ON resident_payment_methods
  FOR ALL USING (
    resident_id IN (
      SELECT id FROM residents 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access payment plans for their associations" ON payment_plans
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access payment plan installments via plan access" ON payment_plan_installments
  FOR ALL USING (
    payment_plan_id IN (
      SELECT id FROM payment_plans 
      WHERE check_user_association(association_id)
    )
  );

CREATE POLICY "Users can access collections cases for their associations" ON collections_cases
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access financial audit logs for their associations" ON financial_audit_logs
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access workflow approvals for their associations" ON workflow_approvals
  FOR ALL USING (check_user_association(association_id));

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_vendor_management_enhanced_updated_at
  BEFORE UPDATE ON vendor_management_enhanced
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON receipts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_invoice_matching_updated_at
  BEFORE UPDATE ON invoice_matching
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_payment_batches_updated_at
  BEFORE UPDATE ON payment_batches
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_payment_transactions_enhanced_updated_at
  BEFORE UPDATE ON payment_transactions_enhanced
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_resident_payment_methods_updated_at
  BEFORE UPDATE ON resident_payment_methods
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_payment_plans_updated_at
  BEFORE UPDATE ON payment_plans
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_collections_cases_updated_at
  BEFORE UPDATE ON collections_cases
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Add audit logging trigger to sensitive financial tables
CREATE TRIGGER financial_audit_trigger_payment_transactions
  AFTER INSERT OR UPDATE OR DELETE ON payment_transactions_enhanced
  FOR EACH ROW EXECUTE FUNCTION log_financial_activity();

CREATE TRIGGER financial_audit_trigger_payment_batches
  AFTER INSERT OR UPDATE OR DELETE ON payment_batches
  FOR EACH ROW EXECUTE FUNCTION log_financial_activity();

CREATE TRIGGER financial_audit_trigger_purchase_orders
  AFTER INSERT OR UPDATE OR DELETE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION log_financial_activity();