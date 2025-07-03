-- Week 6: Advanced Financial Operations Tables

-- GL Account Balances for period tracking
CREATE TABLE IF NOT EXISTS gl_account_balances (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id uuid NOT NULL REFERENCES associations(id),
  gl_account_id uuid NOT NULL REFERENCES gl_accounts(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  opening_balance numeric(15,2) NOT NULL DEFAULT 0,
  closing_balance numeric(15,2) NOT NULL DEFAULT 0,
  total_debits numeric(15,2) NOT NULL DEFAULT 0,
  total_credits numeric(15,2) NOT NULL DEFAULT 0,
  ytd_balance numeric(15,2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Financial Periods for period management
CREATE TABLE IF NOT EXISTS financial_periods (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id uuid NOT NULL REFERENCES associations(id),
  period_name text NOT NULL,
  period_type text NOT NULL DEFAULT 'monthly',
  start_date date NOT NULL,
  end_date date NOT NULL,
  fiscal_year integer NOT NULL,
  is_closed boolean DEFAULT false,
  closed_by uuid REFERENCES profiles(id),
  closed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Budget Entries for detailed budget management
CREATE TABLE IF NOT EXISTS budget_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id uuid NOT NULL REFERENCES associations(id),
  gl_account_id uuid NOT NULL REFERENCES gl_accounts(id),
  budget_year integer NOT NULL,
  period_type text NOT NULL DEFAULT 'monthly',
  period_number integer NOT NULL,
  budgeted_amount numeric(15,2) NOT NULL DEFAULT 0,
  actual_amount numeric(15,2) NOT NULL DEFAULT 0,
  variance_amount numeric(15,2) GENERATED ALWAYS AS (actual_amount - budgeted_amount) STORED,
  variance_percent numeric(5,2) GENERATED ALWAYS AS (
    CASE WHEN budgeted_amount != 0 THEN ((actual_amount - budgeted_amount) / budgeted_amount) * 100 ELSE 0 END
  ) STORED,
  notes text,
  created_by uuid REFERENCES profiles(id),
  updated_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Cash Flow Forecasts
CREATE TABLE IF NOT EXISTS cash_flow_forecasts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id uuid NOT NULL REFERENCES associations(id),
  forecast_date date NOT NULL,
  forecast_type text NOT NULL DEFAULT 'monthly',
  opening_balance numeric(15,2) NOT NULL DEFAULT 0,
  projected_receipts numeric(15,2) NOT NULL DEFAULT 0,
  projected_disbursements numeric(15,2) NOT NULL DEFAULT 0,
  projected_balance numeric(15,2) NOT NULL DEFAULT 0,
  actual_receipts numeric(15,2) DEFAULT 0,
  actual_disbursements numeric(15,2) DEFAULT 0,
  actual_balance numeric(15,2) DEFAULT 0,
  variance_receipts numeric(15,2) GENERATED ALWAYS AS (actual_receipts - projected_receipts) STORED,
  variance_disbursements numeric(15,2) GENERATED ALWAYS AS (actual_disbursements - projected_disbursements) STORED,
  confidence_level numeric(3,1) DEFAULT 85.0,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Financial Reports (templates and cache)
CREATE TABLE IF NOT EXISTS financial_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id uuid NOT NULL REFERENCES associations(id),
  report_type text NOT NULL,
  report_name text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  report_data jsonb NOT NULL DEFAULT '{}',
  template_config jsonb DEFAULT '{}',
  is_cached boolean DEFAULT false,
  generated_by uuid REFERENCES profiles(id),
  generated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- KPI Definitions and Tracking
CREATE TABLE IF NOT EXISTS kpi_definitions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id uuid NOT NULL REFERENCES associations(id),
  kpi_name text NOT NULL,
  kpi_category text NOT NULL,
  calculation_formula text NOT NULL,
  target_value numeric(15,2),
  warning_threshold numeric(15,2),
  critical_threshold numeric(15,2),
  unit_of_measure text DEFAULT 'currency',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- KPI Values (historical tracking)
CREATE TABLE IF NOT EXISTS kpi_values (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  kpi_definition_id uuid NOT NULL REFERENCES kpi_definitions(id),
  measurement_date date NOT NULL,
  actual_value numeric(15,2) NOT NULL,
  target_value numeric(15,2),
  variance_amount numeric(15,2) GENERATED ALWAYS AS (actual_value - target_value) STORED,
  variance_percent numeric(5,2) GENERATED ALWAYS AS (
    CASE WHEN target_value != 0 THEN ((actual_value - target_value) / target_value) * 100 ELSE 0 END
  ) STORED,
  performance_status text GENERATED ALWAYS AS (
    CASE 
      WHEN target_value IS NULL THEN 'no_target'
      WHEN actual_value >= target_value THEN 'on_target'
      WHEN actual_value >= (target_value * 0.9) THEN 'warning'
      ELSE 'critical'
    END
  ) STORED,
  created_at timestamp with time zone DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_gl_account_balances_account_period ON gl_account_balances(gl_account_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_financial_periods_association_year ON financial_periods(association_id, fiscal_year);
CREATE INDEX IF NOT EXISTS idx_budget_entries_account_year_period ON budget_entries(gl_account_id, budget_year, period_number);
CREATE INDEX IF NOT EXISTS idx_cash_flow_forecasts_association_date ON cash_flow_forecasts(association_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_financial_reports_association_type ON financial_reports(association_id, report_type);
CREATE INDEX IF NOT EXISTS idx_kpi_values_definition_date ON kpi_values(kpi_definition_id, measurement_date);

-- Add unique constraints
ALTER TABLE gl_account_balances ADD CONSTRAINT unique_account_period 
UNIQUE (gl_account_id, period_start, period_end);

ALTER TABLE financial_periods ADD CONSTRAINT unique_association_period 
UNIQUE (association_id, period_name, fiscal_year);

ALTER TABLE budget_entries ADD CONSTRAINT unique_budget_entry 
UNIQUE (association_id, gl_account_id, budget_year, period_number);

ALTER TABLE kpi_definitions ADD CONSTRAINT unique_kpi_name 
UNIQUE (association_id, kpi_name);