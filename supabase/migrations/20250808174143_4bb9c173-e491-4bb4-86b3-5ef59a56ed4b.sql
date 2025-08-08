BEGIN;

-- Enable RLS and add least-privilege policies for tables flagged by linter

-- 1) bid_communications (scope via parent bid_requests.association_id)
ALTER TABLE public.bid_communications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bid_communications' AND policyname='Members can view bid_communications in their associations'
  ) THEN
    EXECUTE $$
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
    $$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bid_communications' AND policyname='Managers can modify bid_communications in their associations'
  ) THEN
    EXECUTE $$
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
    $$;
  END IF;
END $$;

-- 2) bid_reminders
ALTER TABLE public.bid_reminders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bid_reminders' AND policyname='Members can view bid_reminders in their associations'
  ) THEN
    EXECUTE $$
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
    $$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bid_reminders' AND policyname='Managers can modify bid_reminders in their associations'
  ) THEN
    EXECUTE $$
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
    $$;
  END IF;
END $$;

-- 3) bid_request_files
ALTER TABLE public.bid_request_files ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bid_request_files' AND policyname='Members can view bid_request_files in their associations'
  ) THEN
    EXECUTE $$
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
    $$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bid_request_files' AND policyname='Managers can modify bid_request_files in their associations'
  ) THEN
    EXECUTE $$
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
    $$;
  END IF;
END $$;

-- 4) collection_cases
ALTER TABLE public.collection_cases ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='collection_cases' AND policyname='Members can view collection_cases in their associations'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Members can view collection_cases in their associations"
      ON public.collection_cases
      FOR SELECT
      USING (check_user_association(association_id));
    $$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='collection_cases' AND policyname='Admins can modify collection_cases in their associations'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins can modify collection_cases in their associations"
      ON public.collection_cases
      FOR ALL
      USING (user_has_association_access(association_id, 'admin'))
      WITH CHECK (user_has_association_access(association_id, 'admin'));
    $$;
  END IF;
END $$;

-- 5) collections_activities (scope via parent collection_cases.association_id)
ALTER TABLE public.collections_activities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='collections_activities' AND policyname='Members can view collections_activities in their associations'
  ) THEN
    EXECUTE $$
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
    $$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='collections_activities' AND policyname='Admins can modify collections_activities in their associations'
  ) THEN
    EXECUTE $$
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
    $$;
  END IF;
END $$;

-- 6) email_workflows (system-level: restrict to admins)
ALTER TABLE public.email_workflows ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='email_workflows' AND policyname='Admins manage email_workflows'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins manage email_workflows"
      ON public.email_workflows
      FOR ALL
      USING (get_current_user_role() = 'admin')
      WITH CHECK (get_current_user_role() = 'admin');
    $$;
  END IF;
END $$;

-- 7) gl_accounts_enhanced
ALTER TABLE public.gl_accounts_enhanced ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gl_accounts_enhanced' AND policyname='Members can view gl_accounts_enhanced in their associations'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Members can view gl_accounts_enhanced in their associations"
      ON public.gl_accounts_enhanced
      FOR SELECT
      USING (check_user_association(association_id));
    $$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gl_accounts_enhanced' AND policyname='Admins can modify gl_accounts_enhanced in their associations'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins can modify gl_accounts_enhanced in their associations"
      ON public.gl_accounts_enhanced
      FOR ALL
      USING (user_has_association_access(association_id, 'admin'))
      WITH CHECK (user_has_association_access(association_id, 'admin'));
    $$;
  END IF;
END $$;

-- 8) lead_follow_ups (creator can view; admins manage all)
ALTER TABLE public.lead_follow_ups ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lead_follow_ups' AND policyname='Creators or admins can view lead_follow_ups'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Creators or admins can view lead_follow_ups"
      ON public.lead_follow_ups
      FOR SELECT
      USING (created_by = auth.uid() OR get_current_user_role() = 'admin');
    $$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='lead_follow_ups' AND policyname='Admins manage lead_follow_ups'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins manage lead_follow_ups"
      ON public.lead_follow_ups
      FOR ALL
      USING (get_current_user_role() = 'admin')
      WITH CHECK (get_current_user_role() = 'admin');
    $$;
  END IF;
END $$;

-- 9) payment_allocation_rules
ALTER TABLE public.payment_allocation_rules ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payment_allocation_rules' AND policyname='Members can view payment_allocation_rules in their associations'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Members can view payment_allocation_rules in their associations"
      ON public.payment_allocation_rules
      FOR SELECT
      USING (check_user_association(association_id));
    $$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payment_allocation_rules' AND policyname='Admins can modify payment_allocation_rules in their associations'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins can modify payment_allocation_rules in their associations"
      ON public.payment_allocation_rules
      FOR ALL
      USING (user_has_association_access(association_id, 'admin'))
      WITH CHECK (user_has_association_access(association_id, 'admin'));
    $$;
  END IF;
END $$;

-- 10) project_types (system-level: admins only)
ALTER TABLE public.project_types ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='project_types' AND policyname='Admins manage project_types'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins manage project_types"
      ON public.project_types
      FOR ALL
      USING (get_current_user_role() = 'admin')
      WITH CHECK (get_current_user_role() = 'admin');
    $$;
  END IF;
END $$;

-- 11) purchase_order_line_items (scope via parent purchase_orders.association_id)
ALTER TABLE public.purchase_order_line_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_order_line_items' AND policyname='Members can view purchase_order_line_items in their associations'
  ) THEN
    EXECUTE $$
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
    $$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='purchase_order_line_items' AND policyname='Admins can modify purchase_order_line_items in their associations'
  ) THEN
    EXECUTE $$
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
    $$;
  END IF;
END $$;

-- 12) three_way_matching
ALTER TABLE public.three_way_matching ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='three_way_matching' AND policyname='Members can view three_way_matching in their associations'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Members can view three_way_matching in their associations"
      ON public.three_way_matching
      FOR SELECT
      USING (check_user_association(association_id));
    $$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='three_way_matching' AND policyname='Admins can modify three_way_matching in their associations'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins can modify three_way_matching in their associations"
      ON public.three_way_matching
      FOR ALL
      USING (user_has_association_access(association_id, 'admin'))
      WITH CHECK (user_has_association_access(association_id, 'admin'));
    $$;
  END IF;
END $$;

-- 13) user_hoa_access (user owns rows; admins manage all)
ALTER TABLE public.user_hoa_access ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_hoa_access' AND policyname='Users can view their own hoa_access'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can view their own hoa_access"
      ON public.user_hoa_access
      FOR SELECT
      USING (user_id = auth.uid() OR get_current_user_role() = 'admin');
    $$;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_hoa_access' AND policyname='Admins manage user_hoa_access'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins manage user_hoa_access"
      ON public.user_hoa_access
      FOR ALL
      USING (get_current_user_role() = 'admin')
      WITH CHECK (get_current_user_role() = 'admin');
    $$;
  END IF;
END $$;

-- 14) users (sensitive: restrict to admins only)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users' AND policyname='Admins manage users'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins manage users"
      ON public.users
      FOR ALL
      USING (get_current_user_role() = 'admin')
      WITH CHECK (get_current_user_role() = 'admin');
    $$;
  END IF;
END $$;

-- 15) vendor_project_types (system-level mapping: admins only)
ALTER TABLE public.vendor_project_types ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vendor_project_types' AND policyname='Admins manage vendor_project_types'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins manage vendor_project_types"
      ON public.vendor_project_types
      FOR ALL
      USING (get_current_user_role() = 'admin')
      WITH CHECK (get_current_user_role() = 'admin');
    $$;
  END IF;
END $$;

-- 16) vendor_staging (sensitive import staging: admins only)
ALTER TABLE public.vendor_staging ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vendor_staging' AND policyname='Admins manage vendor_staging'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Admins manage vendor_staging"
      ON public.vendor_staging
      FOR ALL
      USING (get_current_user_role() = 'admin')
      WITH CHECK (get_current_user_role() = 'admin');
    $$;
  END IF;
END $$;

COMMIT;