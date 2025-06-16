
-- Phase 1: Enable RLS and implement missing policies for critical tables

-- 1. Enable RLS on tables that don't have it
ALTER TABLE public.communications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_request_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

-- 2. Communications Log - restrict to association members
CREATE POLICY "Users can view communications in their associations" 
  ON public.communications_log 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.association_users 
      WHERE association_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert communications" 
  ON public.communications_log 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Email Templates - restrict to authenticated users
CREATE POLICY "Authenticated users can view email templates" 
  ON public.email_templates 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage email templates" 
  ON public.email_templates 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- 4. Email Campaigns - restrict to authenticated users  
CREATE POLICY "Authenticated users can view email campaigns" 
  ON public.email_campaigns 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage email campaigns" 
  ON public.email_campaigns 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- 5. Bid Requests - restrict to association members
CREATE POLICY "Users can view bid requests in their associations" 
  ON public.bid_requests 
  FOR SELECT 
  USING (
    user_has_association_access(association_id)
  );

CREATE POLICY "Users can manage bid requests in their associations" 
  ON public.bid_requests 
  FOR ALL 
  USING (
    user_has_association_access(association_id)
  );

-- 6. Bid Request Vendors - restrict based on bid request access
CREATE POLICY "Users can view bid request vendors for accessible bid requests" 
  ON public.bid_request_vendors 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests 
      WHERE bid_requests.id = bid_request_vendors.bid_request_id
      AND user_has_association_access(bid_requests.association_id)
    )
  );

CREATE POLICY "Users can manage bid request vendors for accessible bid requests" 
  ON public.bid_request_vendors 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests 
      WHERE bid_requests.id = bid_request_vendors.bid_request_id
      AND user_has_association_access(bid_requests.association_id)
    )
  );

-- 7. Calendar Events - restrict to association members
CREATE POLICY "Users can view calendar events in their associations" 
  ON public.calendar_events 
  FOR SELECT 
  USING (
    user_has_association_access(hoa_id)
  );

CREATE POLICY "Users can manage calendar events in their associations" 
  ON public.calendar_events 
  FOR ALL 
  USING (
    user_has_association_access(hoa_id)
  );

-- 8. Compliance Issues - restrict to association members
CREATE POLICY "Users can view compliance issues in their associations" 
  ON public.compliance_issues 
  FOR SELECT 
  USING (
    user_has_association_access(association_id)
  );

CREATE POLICY "Users can manage compliance issues in their associations" 
  ON public.compliance_issues 
  FOR ALL 
  USING (
    user_has_association_access(association_id)
  );

-- 9. Documents - restrict to association members
CREATE POLICY "Users can view documents in their associations" 
  ON public.documents 
  FOR SELECT 
  USING (
    user_has_association_access(association_id)
  );

CREATE POLICY "Users can manage documents in their associations" 
  ON public.documents 
  FOR ALL 
  USING (
    user_has_association_access(association_id)
  );

-- 10. Amenities - restrict to association members
CREATE POLICY "Users can view amenities in their associations" 
  ON public.amenities 
  FOR SELECT 
  USING (
    user_has_association_access(association_id)
  );

CREATE POLICY "Users can manage amenities in their associations" 
  ON public.amenities 
  FOR ALL 
  USING (
    user_has_association_access(association_id)
  );

-- 11. Bank Accounts - restrict to association admins/managers
CREATE POLICY "Association admins can view bank accounts" 
  ON public.bank_accounts 
  FOR SELECT 
  USING (
    user_has_association_access(association_id, 'manager')
  );

CREATE POLICY "Association admins can manage bank accounts" 
  ON public.bank_accounts 
  FOR ALL 
  USING (
    user_has_association_access(association_id, 'admin')
  );

-- 12. Bank Statements - restrict to association admins/managers
CREATE POLICY "Association managers can view bank statements" 
  ON public.bank_statements 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bank_accounts 
      WHERE bank_accounts.id = bank_statements.bank_account_id
      AND user_has_association_access(bank_accounts.association_id, 'manager')
    )
  );

CREATE POLICY "Association admins can manage bank statements" 
  ON public.bank_statements 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.bank_accounts 
      WHERE bank_accounts.id = bank_statements.bank_account_id
      AND user_has_association_access(bank_accounts.association_id, 'admin')
    )
  );

-- 13. Bank Transactions - restrict to association admins/managers
CREATE POLICY "Association managers can view bank transactions" 
  ON public.bank_transactions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bank_statements 
      JOIN public.bank_accounts ON bank_accounts.id = bank_statements.bank_account_id
      WHERE bank_statements.id = bank_transactions.statement_id
      AND user_has_association_access(bank_accounts.association_id, 'manager')
    )
  );

CREATE POLICY "Association admins can manage bank transactions" 
  ON public.bank_transactions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.bank_statements 
      JOIN public.bank_accounts ON bank_accounts.id = bank_statements.bank_account_id
      WHERE bank_statements.id = bank_transactions.statement_id
      AND user_has_association_access(bank_accounts.association_id, 'admin')
    )
  );

-- 14. Strengthen association_users policies
DROP POLICY IF EXISTS "Users can view their own association memberships" ON public.association_users;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.association_users;

CREATE POLICY "Users can view their own association memberships" 
  ON public.association_users 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    user_has_association_access(association_id, 'admin')
  );

CREATE POLICY "Only admins can manage association memberships" 
  ON public.association_users 
  FOR INSERT 
  WITH CHECK (
    user_has_association_access(association_id, 'admin')
  );

CREATE POLICY "Only admins can update association memberships" 
  ON public.association_users 
  FOR UPDATE 
  USING (
    user_has_association_access(association_id, 'admin')
  );

CREATE POLICY "Only admins can delete association memberships" 
  ON public.association_users 
  FOR DELETE 
  USING (
    user_has_association_access(association_id, 'admin')
  );
