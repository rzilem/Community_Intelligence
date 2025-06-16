
-- Enhanced vendor insurance tracking
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS insurance_expiry_date DATE;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS insurance_certificate_url TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS bond_amount NUMERIC;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS bond_expiry_date DATE;

-- Vendor documents table
CREATE TABLE IF NOT EXISTS vendor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'insurance', 'license', 'contract', 'certification', 'other'
  file_url TEXT NOT NULL,
  file_size INTEGER,
  expiry_date DATE,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vendor certifications table
CREATE TABLE IF NOT EXISTS vendor_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  issuing_authority TEXT,
  certification_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vendor performance metrics table
CREATE TABLE IF NOT EXISTS vendor_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  association_id UUID NOT NULL REFERENCES associations(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  cancelled_jobs INTEGER DEFAULT 0,
  average_completion_days NUMERIC,
  customer_satisfaction_score NUMERIC,
  on_time_completion_rate NUMERIC,
  budget_adherence_rate NUMERIC,
  quality_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vendor reviews and ratings table
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  association_id UUID NOT NULL REFERENCES associations(id),
  job_reference TEXT, -- Reference to maintenance request or bid request
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date DATE DEFAULT CURRENT_DATE,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vendor availability schedule table
CREATE TABLE IF NOT EXISTS vendor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Vendor emergency contacts table
CREATE TABLE IF NOT EXISTS vendor_emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  relationship TEXT, -- 'primary', 'secondary', 'after_hours'
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_documents_updated_at BEFORE UPDATE ON vendor_documents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vendor_certifications_updated_at BEFORE UPDATE ON vendor_certifications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vendor_performance_metrics_updated_at BEFORE UPDATE ON vendor_performance_metrics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vendor_reviews_updated_at BEFORE UPDATE ON vendor_reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vendor_availability_updated_at BEFORE UPDATE ON vendor_availability FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vendor_emergency_contacts_updated_at BEFORE UPDATE ON vendor_emergency_contacts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE vendor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can access vendors for their associations
CREATE POLICY "Users can view vendor documents for their associations" ON vendor_documents
  FOR SELECT USING (
    vendor_id IN (
      SELECT v.id FROM vendors v
      JOIN association_users au ON v.hoa_id = au.association_id
      WHERE au.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage vendor documents for their associations" ON vendor_documents
  FOR ALL USING (
    vendor_id IN (
      SELECT v.id FROM vendors v
      JOIN association_users au ON v.hoa_id = au.association_id
      WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'manager')
    )
  );

-- Similar policies for other tables
CREATE POLICY "Users can view vendor certifications for their associations" ON vendor_certifications
  FOR SELECT USING (
    vendor_id IN (
      SELECT v.id FROM vendors v
      JOIN association_users au ON v.hoa_id = au.association_id
      WHERE au.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage vendor certifications for their associations" ON vendor_certifications
  FOR ALL USING (
    vendor_id IN (
      SELECT v.id FROM vendors v
      JOIN association_users au ON v.hoa_id = au.association_id
      WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can view vendor performance metrics for their associations" ON vendor_performance_metrics
  FOR SELECT USING (
    association_id IN (
      SELECT association_id FROM association_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage vendor performance metrics for their associations" ON vendor_performance_metrics
  FOR ALL USING (
    association_id IN (
      SELECT association_id FROM association_users
      WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can view vendor reviews for their associations" ON vendor_reviews
  FOR SELECT USING (
    association_id IN (
      SELECT association_id FROM association_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create vendor reviews for their associations" ON vendor_reviews
  FOR INSERT WITH CHECK (
    association_id IN (
      SELECT association_id FROM association_users
      WHERE user_id = auth.uid()
    ) AND reviewer_id = auth.uid()
  );

CREATE POLICY "Users can update their own vendor reviews" ON vendor_reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

CREATE POLICY "Users can view vendor availability for their associations" ON vendor_availability
  FOR SELECT USING (
    vendor_id IN (
      SELECT v.id FROM vendors v
      JOIN association_users au ON v.hoa_id = au.association_id
      WHERE au.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage vendor availability for their associations" ON vendor_availability
  FOR ALL USING (
    vendor_id IN (
      SELECT v.id FROM vendors v
      JOIN association_users au ON v.hoa_id = au.association_id
      WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can view vendor emergency contacts for their associations" ON vendor_emergency_contacts
  FOR SELECT USING (
    vendor_id IN (
      SELECT v.id FROM vendors v
      JOIN association_users au ON v.hoa_id = au.association_id
      WHERE au.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage vendor emergency contacts for their associations" ON vendor_emergency_contacts
  FOR ALL USING (
    vendor_id IN (
      SELECT v.id FROM vendors v
      JOIN association_users au ON v.hoa_id = au.association_id
      WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'manager')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_documents_vendor_id ON vendor_documents(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_documents_type ON vendor_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_vendor_documents_expiry ON vendor_documents(expiry_date);

CREATE INDEX IF NOT EXISTS idx_vendor_certifications_vendor_id ON vendor_certifications(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_certifications_expiry ON vendor_certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_vendor_certifications_status ON vendor_certifications(status);

CREATE INDEX IF NOT EXISTS idx_vendor_performance_vendor_id ON vendor_performance_metrics(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_performance_association_id ON vendor_performance_metrics(association_id);
CREATE INDEX IF NOT EXISTS idx_vendor_performance_period ON vendor_performance_metrics(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor_id ON vendor_reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_association_id ON vendor_reviews(association_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_rating ON vendor_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_vendor_availability_vendor_id ON vendor_availability(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_availability_day ON vendor_availability(day_of_week);

CREATE INDEX IF NOT EXISTS idx_vendor_emergency_contacts_vendor_id ON vendor_emergency_contacts(vendor_id);
