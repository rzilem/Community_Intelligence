
-- Milestone 3: Contract Management, Onboarding & Compliance Database Schema (Fixed)

-- Contract Templates table
CREATE TABLE vendor_contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES associations(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('service', 'maintenance', 'emergency', 'annual', 'custom')),
  contract_terms TEXT NOT NULL,
  default_duration_months INTEGER DEFAULT 12,
  auto_renew BOOLEAN DEFAULT false,
  requires_insurance BOOLEAN DEFAULT true,
  requires_license BOOLEAN DEFAULT true,
  template_content TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Vendor Contracts table
CREATE TABLE vendor_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  association_id UUID REFERENCES associations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES vendor_contract_templates(id),
  contract_number TEXT UNIQUE NOT NULL,
  contract_title TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contract_value DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'active', 'expired', 'terminated', 'renewed')),
  contract_terms TEXT,
  auto_renew BOOLEAN DEFAULT false,
  renewal_notice_days INTEGER DEFAULT 30,
  payment_terms TEXT,
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Contract Amendments table
CREATE TABLE vendor_contract_amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES vendor_contracts(id) ON DELETE CASCADE,
  amendment_number INTEGER NOT NULL,
  amendment_type TEXT NOT NULL CHECK (amendment_type IN ('extension', 'rate_change', 'scope_change', 'termination', 'other')),
  description TEXT NOT NULL,
  effective_date DATE NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vendor Applications table (for onboarding) - Fixed references column name
CREATE TABLE vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES associations(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_address TEXT,
  tax_id TEXT,
  license_number TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  insurance_expiry_date DATE,
  bond_amount DECIMAL(10,2),
  bond_expiry_date DATE,
  specialties TEXT[],
  years_in_business INTEGER,
  business_references JSONB, -- Fixed: renamed from 'references' to 'business_references'
  application_status TEXT NOT NULL DEFAULT 'pending' CHECK (application_status IN ('pending', 'under_review', 'approved', 'rejected', 'requires_info')),
  qualification_score INTEGER,
  background_check_status TEXT DEFAULT 'not_started' CHECK (background_check_status IN ('not_started', 'in_progress', 'completed', 'failed')),
  background_check_date DATE,
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vendor Compliance Items table
CREATE TABLE vendor_compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  association_id UUID REFERENCES associations(id) ON DELETE CASCADE,
  compliance_type TEXT NOT NULL CHECK (compliance_type IN ('insurance', 'license', 'certification', 'background_check', 'bond', 'permit', 'custom')),
  item_name TEXT NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'expired', 'rejected', 'not_applicable')),
  document_url TEXT,
  issue_date DATE,
  expiry_date DATE,
  renewal_notice_days INTEGER DEFAULT 30,
  last_reminder_sent TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vendor Categories (enhanced from specialties)
CREATE TABLE vendor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID REFERENCES associations(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES vendor_categories(id),
  requires_license BOOLEAN DEFAULT false,
  requires_insurance BOOLEAN DEFAULT true,
  minimum_insurance_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(association_id, category_name)
);

-- Vendor Service Areas table
CREATE TABLE vendor_service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  area_name TEXT NOT NULL,
  area_type TEXT NOT NULL CHECK (area_type IN ('city', 'zip_code', 'radius', 'custom')),
  area_value TEXT NOT NULL,
  is_primary_area BOOLEAN DEFAULT false,
  travel_fee DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vendor Capabilities Matrix
CREATE TABLE vendor_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  category_id UUID REFERENCES vendor_categories(id) ON DELETE CASCADE,
  proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  years_experience INTEGER,
  certifications TEXT[],
  preferred_vendor BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vendor_id, category_id)
);

-- Create indexes for performance
CREATE INDEX idx_vendor_contracts_vendor_id ON vendor_contracts(vendor_id);
CREATE INDEX idx_vendor_contracts_association_id ON vendor_contracts(association_id);
CREATE INDEX idx_vendor_contracts_status ON vendor_contracts(status);
CREATE INDEX idx_vendor_contracts_end_date ON vendor_contracts(end_date);
CREATE INDEX idx_vendor_applications_status ON vendor_applications(application_status);
CREATE INDEX idx_vendor_compliance_items_vendor_id ON vendor_compliance_items(vendor_id);
CREATE INDEX idx_vendor_compliance_items_expiry_date ON vendor_compliance_items(expiry_date);
CREATE INDEX idx_vendor_capabilities_vendor_id ON vendor_capabilities(vendor_id);

-- Enable RLS on all tables
ALTER TABLE vendor_contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_contract_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_capabilities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for association-based access
CREATE POLICY "Users can view contract templates for their associations" ON vendor_contract_templates
  FOR SELECT USING (user_is_associated_with_association(association_id));

CREATE POLICY "Users can manage contract templates for their associations" ON vendor_contract_templates
  FOR ALL USING (user_is_associated_with_association(association_id));

CREATE POLICY "Users can view contracts for their associations" ON vendor_contracts
  FOR SELECT USING (user_is_associated_with_association(association_id));

CREATE POLICY "Users can manage contracts for their associations" ON vendor_contracts
  FOR ALL USING (user_is_associated_with_association(association_id));

CREATE POLICY "Users can view contract amendments for their associations" ON vendor_contract_amendments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM vendor_contracts vc 
    WHERE vc.id = contract_id AND user_is_associated_with_association(vc.association_id)
  ));

CREATE POLICY "Users can manage contract amendments for their associations" ON vendor_contract_amendments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM vendor_contracts vc 
    WHERE vc.id = contract_id AND user_is_associated_with_association(vc.association_id)
  ));

CREATE POLICY "Users can view applications for their associations" ON vendor_applications
  FOR SELECT USING (user_is_associated_with_association(association_id));

CREATE POLICY "Users can manage applications for their associations" ON vendor_applications
  FOR ALL USING (user_is_associated_with_association(association_id));

CREATE POLICY "Users can view compliance items for their associations" ON vendor_compliance_items
  FOR SELECT USING (user_is_associated_with_association(association_id));

CREATE POLICY "Users can manage compliance items for their associations" ON vendor_compliance_items
  FOR ALL USING (user_is_associated_with_association(association_id));

CREATE POLICY "Users can view categories for their associations" ON vendor_categories
  FOR SELECT USING (user_is_associated_with_association(association_id));

CREATE POLICY "Users can manage categories for their associations" ON vendor_categories
  FOR ALL USING (user_is_associated_with_association(association_id));

CREATE POLICY "Users can view service areas for vendors in their associations" ON vendor_service_areas
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM vendors v 
    WHERE v.id = vendor_id AND (v.hoa_id IS NULL OR user_is_associated_with_association(v.hoa_id))
  ));

CREATE POLICY "Users can manage service areas for vendors in their associations" ON vendor_service_areas
  FOR ALL USING (EXISTS (
    SELECT 1 FROM vendors v 
    WHERE v.id = vendor_id AND (v.hoa_id IS NULL OR user_is_associated_with_association(v.hoa_id))
  ));

CREATE POLICY "Users can view capabilities for vendors in their associations" ON vendor_capabilities
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM vendors v 
    WHERE v.id = vendor_id AND (v.hoa_id IS NULL OR user_is_associated_with_association(v.hoa_id))
  ));

CREATE POLICY "Users can manage capabilities for vendors in their associations" ON vendor_capabilities
  FOR ALL USING (EXISTS (
    SELECT 1 FROM vendors v 
    WHERE v.id = vendor_id AND (v.hoa_id IS NULL OR user_is_associated_with_association(v.hoa_id))
  ));

-- Update triggers for timestamp maintenance
CREATE TRIGGER update_vendor_contract_templates_updated_at
  BEFORE UPDATE ON vendor_contract_templates
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER update_vendor_contracts_updated_at
  BEFORE UPDATE ON vendor_contracts
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER update_vendor_applications_updated_at
  BEFORE UPDATE ON vendor_applications
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER update_vendor_compliance_items_updated_at
  BEFORE UPDATE ON vendor_compliance_items
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER update_vendor_categories_updated_at
  BEFORE UPDATE ON vendor_categories
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER update_vendor_capabilities_updated_at
  BEFORE UPDATE ON vendor_capabilities
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
