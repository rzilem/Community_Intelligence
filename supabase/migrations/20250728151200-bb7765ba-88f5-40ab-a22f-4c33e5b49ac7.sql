-- Fix security issues for existing tables only

-- Enable RLS on remaining unprotected tables (verified to exist)
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homeowner_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resale_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calendar events
CREATE POLICY "Users can view calendar events for their associations"
ON public.calendar_events FOR SELECT
USING (check_user_association(association_id));

CREATE POLICY "Admins can manage calendar events"
ON public.calendar_events FOR ALL
USING (user_has_association_access(association_id, 'admin'::text))
WITH CHECK (user_has_association_access(association_id, 'admin'::text));

-- Create RLS policies for compliance issues
CREATE POLICY "Users can view compliance issues for their associations"
ON public.compliance_issues FOR SELECT
USING (property_id IN (
  SELECT p.id FROM properties p
  JOIN association_users au ON p.association_id = au.association_id
  WHERE au.user_id = auth.uid()
));

CREATE POLICY "Managers can manage compliance issues"
ON public.compliance_issues FOR ALL
USING (property_id IN (
  SELECT p.id FROM properties p
  JOIN association_users au ON p.association_id = au.association_id
  WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'manager')
))
WITH CHECK (property_id IN (
  SELECT p.id FROM properties p
  JOIN association_users au ON p.association_id = au.association_id
  WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'manager')
));

-- Create RLS policies for documents
CREATE POLICY "Users can view documents for their associations"
ON public.documents FOR SELECT
USING (check_user_association(association_id));

CREATE POLICY "Managers can manage documents"
ON public.documents FOR ALL
USING (user_has_association_access(association_id, 'manager'::text))
WITH CHECK (user_has_association_access(association_id, 'manager'::text));

-- Create RLS policies for properties
CREATE POLICY "Users can view properties for their associations"
ON public.properties FOR SELECT
USING (association_id IN (
  SELECT au.association_id FROM association_users au
  WHERE au.user_id = auth.uid()
));

CREATE POLICY "Admins can manage properties"
ON public.properties FOR ALL
USING (user_has_association_access(association_id, 'admin'::text))
WITH CHECK (user_has_association_access(association_id, 'admin'::text));

-- Create RLS policies for residents
CREATE POLICY "Users can view residents for their associations"
ON public.residents FOR SELECT
USING (property_id IN (
  SELECT p.id FROM properties p
  JOIN association_users au ON p.association_id = au.association_id
  WHERE au.user_id = auth.uid()
));

CREATE POLICY "Managers can manage residents"
ON public.residents FOR ALL
USING (property_id IN (
  SELECT p.id FROM properties p
  JOIN association_users au ON p.association_id = au.association_id
  WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'manager')
))
WITH CHECK (property_id IN (
  SELECT p.id FROM properties p
  JOIN association_users au ON p.association_id = au.association_id
  WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'manager')
));

-- Create RLS policies for invoices
CREATE POLICY "Users can view invoices for their associations"
ON public.invoices FOR SELECT
USING (check_user_association(association_id));

CREATE POLICY "Managers can manage invoices"
ON public.invoices FOR ALL
USING (user_has_association_access(association_id, 'manager'::text))
WITH CHECK (user_has_association_access(association_id, 'manager'::text));

-- Create RLS policies for homeowner requests
CREATE POLICY "Users can view homeowner requests for their associations"
ON public.homeowner_requests FOR SELECT
USING (property_id IN (
  SELECT p.id FROM properties p
  JOIN association_users au ON p.association_id = au.association_id
  WHERE au.user_id = auth.uid()
));

CREATE POLICY "Users can create homeowner requests for their properties"
ON public.homeowner_requests FOR INSERT
WITH CHECK (property_id IN (
  SELECT p.id FROM properties p
  JOIN association_users au ON p.association_id = au.association_id
  WHERE au.user_id = auth.uid()
));

CREATE POLICY "Managers can manage homeowner requests"
ON public.homeowner_requests FOR ALL
USING (property_id IN (
  SELECT p.id FROM properties p
  JOIN association_users au ON p.association_id = au.association_id
  WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'manager')
))
WITH CHECK (property_id IN (
  SELECT p.id FROM properties p
  JOIN association_users au ON p.association_id = au.association_id
  WHERE au.user_id = auth.uid() AND au.role IN ('admin', 'manager')
));

-- Create RLS policies for leads
CREATE POLICY "Association users can view leads"
ON public.leads FOR SELECT
USING (association_id IN (
  SELECT au.association_id FROM association_users au
  WHERE au.user_id = auth.uid()
));

CREATE POLICY "Managers can manage leads"
ON public.leads FOR ALL
USING (user_has_association_access(association_id, 'manager'::text))
WITH CHECK (user_has_association_access(association_id, 'manager'::text));