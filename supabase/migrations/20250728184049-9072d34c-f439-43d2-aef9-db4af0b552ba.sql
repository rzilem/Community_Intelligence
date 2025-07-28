-- Create essential missing tables for Phases 3-6

-- Work Orders Table
CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  property_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  due_date DATE,
  completed_date DATE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inspections Table
CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  property_id UUID,
  inspection_type TEXT NOT NULL,
  scheduled_date DATE,
  completed_date DATE,
  inspector_id UUID,
  status TEXT DEFAULT 'scheduled',
  findings JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resale Certificates Table
CREATE TABLE IF NOT EXISTS public.resale_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  property_id UUID NOT NULL,
  certificate_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  requested_by TEXT,
  buyer_name TEXT,
  seller_name TEXT,
  closing_date DATE,
  issued_date DATE,
  expiry_date DATE,
  fee_amount DECIMAL(10,2),
  paid BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Transfer Requirements Table
CREATE TABLE IF NOT EXISTS public.transfer_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  requirement_name TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Document Templates Table
CREATE TABLE IF NOT EXISTS public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  content TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resale_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (simplified)
CREATE POLICY "work_orders_access" ON public.work_orders FOR ALL USING (true);
CREATE POLICY "inspections_access" ON public.inspections FOR ALL USING (true);
CREATE POLICY "resale_certificates_access" ON public.resale_certificates FOR ALL USING (true);
CREATE POLICY "transfer_requirements_access" ON public.transfer_requirements FOR ALL USING (true);
CREATE POLICY "document_templates_access" ON public.document_templates FOR ALL USING (true);