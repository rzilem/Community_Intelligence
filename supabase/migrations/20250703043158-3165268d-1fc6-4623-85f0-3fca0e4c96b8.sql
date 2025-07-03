-- Week 5: Advanced Payment Processing Tables (Fixed)

-- Payment Batches table for bulk payment processing
CREATE TABLE IF NOT EXISTS payment_batches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id uuid NOT NULL REFERENCES associations(id),
  batch_number text NOT NULL,
  batch_type text NOT NULL DEFAULT 'ach', -- ach, check, wire
  batch_status text NOT NULL DEFAULT 'draft',
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  payment_count integer NOT NULL DEFAULT 0,
  batch_date date NOT NULL,
  scheduled_date date,
  processed_date date,
  created_by uuid REFERENCES profiles(id),
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamp with time zone,
  file_generated boolean DEFAULT false,
  file_path text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Payment Methods for residents
CREATE TABLE IF NOT EXISTS resident_payment_methods (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  resident_id uuid NOT NULL REFERENCES residents(id),
  payment_type text NOT NULL, -- ach, card, bank_transfer
  account_nickname text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  bank_name text,
  account_type text, -- checking, savings
  last_four_digits text,
  routing_number_encrypted text,
  account_number_encrypted text,
  stripe_payment_method_id text,
  billing_address jsonb,
  verification_status text DEFAULT 'pending',
  verification_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Payment Plans for installment management
CREATE TABLE IF NOT EXISTS payment_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id uuid NOT NULL REFERENCES associations(id),
  property_id uuid NOT NULL REFERENCES properties(id),
  resident_id uuid REFERENCES residents(id),
  plan_name text NOT NULL,
  original_balance numeric(10,2) NOT NULL,
  remaining_balance numeric(10,2) NOT NULL,
  monthly_payment numeric(10,2) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  next_payment_date date NOT NULL,
  plan_status text NOT NULL DEFAULT 'active',
  auto_pay_enabled boolean DEFAULT false,
  payment_method_id uuid REFERENCES resident_payment_methods(id),
  late_fee_waived boolean DEFAULT false,
  setup_fee numeric(10,2) DEFAULT 0,
  interest_rate numeric(5,2) DEFAULT 0,
  created_by uuid REFERENCES profiles(id),
  approved_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Collection Cases for advanced collections management
CREATE TABLE IF NOT EXISTS collection_cases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id uuid NOT NULL REFERENCES associations(id),
  property_id uuid NOT NULL REFERENCES properties(id),
  resident_id uuid REFERENCES residents(id),
  case_number text NOT NULL,
  case_status text NOT NULL DEFAULT 'open',
  total_amount_owed numeric(10,2) NOT NULL,
  original_balance numeric(10,2) NOT NULL,
  collection_stage text NOT NULL DEFAULT 'notice', -- notice, demand, legal, closed
  escalation_date date,
  last_contact_date date,
  next_action_date date,
  attorney_assigned text,
  court_case_number text,
  settlement_amount numeric(10,2),
  collection_fees numeric(10,2) DEFAULT 0,
  attorney_fees numeric(10,2) DEFAULT 0,
  court_costs numeric(10,2) DEFAULT 0,
  payment_plan_id uuid REFERENCES payment_plans(id),
  notes text,
  created_by uuid REFERENCES profiles(id),
  assigned_to uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 1099 Management for tax reporting
CREATE TABLE IF NOT EXISTS vendor_1099_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id uuid NOT NULL REFERENCES associations(id),
  vendor_id uuid NOT NULL REFERENCES vendors(id),
  tax_year integer NOT NULL,
  total_payments numeric(12,2) NOT NULL DEFAULT 0,
  form_type text NOT NULL DEFAULT '1099-NEC', -- 1099-NEC, 1099-MISC
  box_number text,
  tax_id text,
  tax_id_type text, -- ssn, ein
  backup_withholding boolean DEFAULT false,
  form_generated boolean DEFAULT false,
  form_sent boolean DEFAULT false,
  sent_date date,
  correction_filed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Payment Allocation Rules for intelligent payment distribution
CREATE TABLE IF NOT EXISTS payment_allocation_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id uuid NOT NULL REFERENCES associations(id),
  rule_name text NOT NULL,
  priority_order integer NOT NULL,
  allocation_type text NOT NULL, -- oldest_first, assessment_type, custom
  charge_types jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes only after tables are created
CREATE INDEX IF NOT EXISTS idx_payment_batches_association_id ON payment_batches(association_id);
CREATE INDEX IF NOT EXISTS idx_resident_payment_methods_resident_id ON resident_payment_methods(resident_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_property_id ON payment_plans(property_id);
CREATE INDEX IF NOT EXISTS idx_collection_cases_property_id ON collection_cases(property_id);
CREATE INDEX IF NOT EXISTS idx_vendor_1099_records_vendor_id ON vendor_1099_records(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_1099_records_tax_year ON vendor_1099_records(tax_year);