BEGIN;

-- 1) bid_communications
ALTER TABLE public.bid_communications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view bid_communications in their associations" ON public.bid_communications;
CREATE POLICY "Members can view bid_communications in their associations"
  ON public.bid_communications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.id = bid_communications.bid_request_id
        AND check_user_association(COALESCE(br.association_id, br.hoa_id))
    )
  );
DROP POLICY IF EXISTS "Managers can modify bid_communications in their associations" ON public.bid_communications;
CREATE POLICY "Managers can modify bid_communications in their associations"
  ON public.bid_communications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.id = bid_communications.bid_request_id
        AND user_has_association_access(COALESCE(br.association_id, br.hoa_id), 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.id = bid_communications.bid_request_id
        AND user_has_association_access(COALESCE(br.association_id, br.hoa_id), 'manager')
    )
  );

-- 2) bid_reminders
ALTER TABLE public.bid_reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view bid_reminders in their associations" ON public.bid_reminders;
CREATE POLICY "Members can view bid_reminders in their associations"
  ON public.bid_reminders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.id = bid_reminders.bid_request_id
        AND check_user_association(COALESCE(br.association_id, br.hoa_id))
    )
  );
DROP POLICY IF EXISTS "Managers can modify bid_reminders in their associations" ON public.bid_reminders;
CREATE POLICY "Managers can modify bid_reminders in their associations"
  ON public.bid_reminders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.id = bid_reminders.bid_request_id
        AND user_has_association_access(COALESCE(br.association_id, br.hoa_id), 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.id = bid_reminders.bid_request_id
        AND user_has_association_access(COALESCE(br.association_id, br.hoa_id), 'manager')
    )
  );

-- 3) bid_request_files
ALTER TABLE public.bid_request_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view bid_request_files in their associations" ON public.bid_request_files;
CREATE POLICY "Members can view bid_request_files in their associations"
  ON public.bid_request_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.id = bid_request_files.bid_request_id
        AND check_user_association(COALESCE(br.association_id, br.hoa_id))
    )
  );
DROP POLICY IF EXISTS "Managers can modify bid_request_files in their associations" ON public.bid_request_files;
CREATE POLICY "Managers can modify bid_request_files in their associations"
  ON public.bid_request_files
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.id = bid_request_files.bid_request_id
        AND user_has_association_access(COALESCE(br.association_id, br.hoa_id), 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bid_requests br
      WHERE br.id = bid_request_files.bid_request_id
        AND user_has_association_access(COALESCE(br.association_id, br.hoa_id), 'manager')
    )
  );

-- 4) collection_cases
ALTER TABLE public.collection_cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view collection_cases in their associations" ON public.collection_cases;
CREATE POLICY "Members can view collection_cases in their associations"
  ON public.collection_cases
  FOR SELECT
  USING (check_user_association(association_id));
DROP POLICY IF EXISTS "Admins can modify collection_cases in their associations" ON public.collection_cases;
CREATE POLICY "Admins can modify collection_cases in their associations"
  ON public.collection_cases
  FOR ALL
  USING (user_has_association_access(association_id, 'admin'))
  WITH CHECK (user_has_association_access(association_id, 'admin'));

-- 5) collections_activities
ALTER TABLE public.collections_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view collections_activities in their associations" ON public.collections_activities;
CREATE POLICY "Members can view collections_activities in their associations"
  ON public.collections_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collection_cases cc
      WHERE cc.id = collections_activities.collections_case_id
        AND check_user_association(cc.association_id)
    )
  );
DROP POLICY IF EXISTS "Admins can modify collections_activities in their associations" ON public.collections_activities;
CREATE POLICY "Admins can modify collections_activities in their associations"
  ON public.collections_activities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.collection_cases cc
      WHERE cc.id = collections_activities.collections_case_id
        AND user_has_association_access(cc.association_id, 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collection_cases cc
      WHERE cc.id = collections_activities.collections_case_id
        AND user_has_association_access(cc.association_id, 'admin')
    )
  );

-- 6) email_workflows (admins only)
ALTER TABLE public.email_workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage email_workflows" ON public.email_workflows;
CREATE POLICY "Admins manage email_workflows"
  ON public.email_workflows
  FOR ALL
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- 7) gl_accounts_enhanced
ALTER TABLE public.gl_accounts_enhanced ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view gl_accounts_enhanced in their associations" ON public.gl_accounts_enhanced;
CREATE POLICY "Members can view gl_accounts_enhanced in their associations"
  ON public.gl_accounts_enhanced
  FOR SELECT
  USING (check_user_association(association_id));
DROP POLICY IF EXISTS "Admins can modify gl_accounts_enhanced in their associations" ON public.gl_accounts_enhanced;
CREATE POLICY "Admins can modify gl_accounts_enhanced in their associations"
  ON public.gl_accounts_enhanced
  FOR ALL
  USING (user_has_association_access(association_id, 'admin'))
  WITH CHECK (user_has_association_access(association_id, 'admin'));

-- 8) lead_follow_ups
ALTER TABLE public.lead_follow_ups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Creators or admins can view lead_follow_ups" ON public.lead_follow_ups;
CREATE POLICY "Creators or admins can view lead_follow_ups"
  ON public.lead_follow_ups
  FOR SELECT
  USING (created_by = auth.uid() OR get_current_user_role() = 'admin');
DROP POLICY IF EXISTS "Admins manage lead_follow_ups" ON public.lead_follow_ups;
CREATE POLICY "Admins manage lead_follow_ups"
  ON public.lead_follow_ups
  FOR ALL
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- 9) payment_allocation_rules
ALTER TABLE public.payment_allocation_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view payment_allocation_rules in their associations" ON public.payment_allocation_rules;
CREATE POLICY "Members can view payment_allocation_rules in their associations"
  ON public.payment_allocation_rules
  FOR SELECT
  USING (check_user_association(association_id));
DROP POLICY IF EXISTS "Admins can modify payment_allocation_rules in their associations" ON public.payment_allocation_rules;
CREATE POLICY "Admins can modify payment_allocation_rules in their associations"
  ON public.payment_allocation_rules
  FOR ALL
  USING (user_has_association_access(association_id, 'admin'))
  WITH CHECK (user_has_association_access(association_id, 'admin'));

-- 10) project_types (admins only)
ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage project_types" ON public.project_types;
CREATE POLICY "Admins manage project_types"
  ON public.project_types
  FOR ALL
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- 11) purchase_order_line_items
ALTER TABLE public.purchase_order_line_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view purchase_order_line_items in their associations" ON public.purchase_order_line_items;
CREATE POLICY "Members can view purchase_order_line_items in their associations"
  ON public.purchase_order_line_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_line_items.po_id
        AND check_user_association(po.association_id)
    )
  );
DROP POLICY IF EXISTS "Admins can modify purchase_order_line_items in their associations" ON public.purchase_order_line_items;
CREATE POLICY "Admins can modify purchase_order_line_items in their associations"
  ON public.purchase_order_line_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_line_items.po_id
        AND user_has_association_access(po.association_id, 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchase_orders po
      WHERE po.id = purchase_order_line_items.po_id
        AND user_has_association_access(po.association_id, 'admin')
    )
  );

-- 12) three_way_matching
ALTER TABLE public.three_way_matching ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view three_way_matching in their associations" ON public.three_way_matching;
CREATE POLICY "Members can view three_way_matching in their associations"
  ON public.three_way_matching
  FOR SELECT
  USING (check_user_association(association_id));
DROP POLICY IF EXISTS "Admins can modify three_way_matching in their associations" ON public.three_way_matching;
CREATE POLICY "Admins can modify three_way_matching in their associations"
  ON public.three_way_matching
  FOR ALL
  USING (user_has_association_access(association_id, 'admin'))
  WITH CHECK (user_has_association_access(association_id, 'admin'));

-- 13) user_hoa_access
ALTER TABLE public.user_hoa_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own hoa_access" ON public.user_hoa_access;
CREATE POLICY "Users can view their own hoa_access"
  ON public.user_hoa_access
  FOR SELECT
  USING (user_id = auth.uid() OR get_current_user_role() = 'admin');
DROP POLICY IF EXISTS "Admins manage user_hoa_access" ON public.user_hoa_access;
CREATE POLICY "Admins manage user_hoa_access"
  ON public.user_hoa_access
  FOR ALL
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- 14) users (admins only)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage users" ON public.users;
CREATE POLICY "Admins manage users"
  ON public.users
  FOR ALL
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- 15) vendor_project_types (admins only)
ALTER TABLE public.vendor_project_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage vendor_project_types" ON public.vendor_project_types;
CREATE POLICY "Admins manage vendor_project_types"
  ON public.vendor_project_types
  FOR ALL
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

-- 16) vendor_staging (admins only)
ALTER TABLE public.vendor_staging ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage vendor_staging" ON public.vendor_staging;
CREATE POLICY "Admins manage vendor_staging"
  ON public.vendor_staging
  FOR ALL
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

COMMIT;