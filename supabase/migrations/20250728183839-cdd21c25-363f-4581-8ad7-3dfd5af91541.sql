-- Phase 3-6: Create missing tables for work orders, inspections, and lead follow-up sequences

-- Work Orders Table
CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_vendor_id UUID,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  due_date DATE,
  completed_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inspections Table
CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  inspection_type TEXT NOT NULL,
  scheduled_date DATE,
  completed_date DATE,
  inspector_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  findings JSONB DEFAULT '[]'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lead Follow-up Sequences Table
CREATE TABLE IF NOT EXISTS public.lead_follow_up_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  sequence_name TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_step INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Resale Certificates Table
CREATE TABLE IF NOT EXISTS public.resale_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  requested_by TEXT,
  buyer_name TEXT,
  seller_name TEXT,
  closing_date DATE,
  issued_date DATE,
  expiry_date DATE,
  fee_amount DECIMAL(10,2),
  paid BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Transfer Requirements Table
CREATE TABLE IF NOT EXISTS public.transfer_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  association_id UUID NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
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
  association_id UUID NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  content TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_follow_up_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resale_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can access work orders for their associations" ON public.work_orders
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access inspections for their associations" ON public.inspections
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access lead follow-up sequences for their leads" ON public.lead_follow_up_sequences
  FOR ALL USING (lead_id IN (
    SELECT l.id FROM public.leads l 
    JOIN public.association_users au ON l.association_id = au.association_id 
    WHERE au.user_id = auth.uid()
  ));

CREATE POLICY "Users can access resale certificates for their associations" ON public.resale_certificates
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access transfer requirements for their associations" ON public.transfer_requirements
  FOR ALL USING (check_user_association(association_id));

CREATE POLICY "Users can access document templates for their associations" ON public.document_templates
  FOR ALL USING (check_user_association(association_id));

-- Create updated_at triggers
CREATE TRIGGER update_work_orders_updated_at
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON public.inspections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_follow_up_sequences_updated_at
  BEFORE UPDATE ON public.lead_follow_up_sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resale_certificates_updated_at
  BEFORE UPDATE ON public.resale_certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transfer_requirements_updated_at
  BEFORE UPDATE ON public.transfer_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_work_orders_association_id ON public.work_orders(association_id);
CREATE INDEX idx_work_orders_property_id ON public.work_orders(property_id);
CREATE INDEX idx_work_orders_status ON public.work_orders(status);

CREATE INDEX idx_inspections_association_id ON public.inspections(association_id);
CREATE INDEX idx_inspections_property_id ON public.inspections(property_id);
CREATE INDEX idx_inspections_status ON public.inspections(status);

CREATE INDEX idx_lead_follow_up_sequences_lead_id ON public.lead_follow_up_sequences(lead_id);
CREATE INDEX idx_lead_follow_up_sequences_status ON public.lead_follow_up_sequences(status);

CREATE INDEX idx_resale_certificates_association_id ON public.resale_certificates(association_id);
CREATE INDEX idx_resale_certificates_property_id ON public.resale_certificates(property_id);
CREATE INDEX idx_resale_certificates_status ON public.resale_certificates(status);

CREATE INDEX idx_transfer_requirements_association_id ON public.transfer_requirements(association_id);
CREATE INDEX idx_document_templates_association_id ON public.document_templates(association_id);