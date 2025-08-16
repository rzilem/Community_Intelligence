
-- 1) Helper: updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2) Workflows table (templates + custom workflows)
CREATE TABLE IF NOT EXISTS public.workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL,                            -- matches UI categories (Financial, Maintenance, etc.)
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,      -- array of step objects
  status text NOT NULL DEFAULT 'active',         -- 'active' | 'draft' | 'inactive' | 'template'
  is_template boolean NOT NULL DEFAULT false,    -- marks reusable templates
  is_popular boolean NOT NULL DEFAULT false,     -- used for recommendations
  created_by uuid NULL,                          -- user who created (nullable for system templates)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_workflows_updated_at ON public.workflows;
CREATE TRIGGER trg_workflows_updated_at
BEFORE UPDATE ON public.workflows
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes to speed up listing templates
CREATE INDEX IF NOT EXISTS idx_workflows_templates ON public.workflows (is_template, is_popular);
CREATE INDEX IF NOT EXISTS idx_workflows_type ON public.workflows (type);

-- 3) Workflow executions (per association runs)
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_template_id uuid NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  association_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  execution_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  performance_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_insights jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_workflow_executions_updated_at ON public.workflow_executions;
CREATE TRIGGER trg_workflow_executions_updated_at
BEFORE UPDATE ON public.workflow_executions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_workflow_exec_association ON public.workflow_executions (association_id);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_status ON public.workflow_executions (status);

-- 4) RLS
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- Allow anyone authenticated to read templates, and creators to see their own customs
DROP POLICY IF EXISTS workflows_select ON public.workflows;
CREATE POLICY workflows_select
ON public.workflows FOR SELECT
USING (
  is_template = true
  OR (created_by IS NOT NULL AND created_by = auth.uid())
);

-- Only creators can insert custom workflows (templates are seeded by system)
DROP POLICY IF EXISTS workflows_insert ON public.workflows;
CREATE POLICY workflows_insert
ON public.workflows FOR INSERT
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS workflows_update ON public.workflows;
CREATE POLICY workflows_update
ON public.workflows FOR UPDATE
USING (created_by = auth.uid());

DROP POLICY IF EXISTS workflows_delete ON public.workflows;
CREATE POLICY workflows_delete
ON public.workflows FOR DELETE
USING (created_by = auth.uid());

-- Executions: restrict by association using existing security definer helper
-- Requires function public.check_user_association(association_uuid uuid) returns boolean
DROP POLICY IF EXISTS workflow_exec_select ON public.workflow_executions;
CREATE POLICY workflow_exec_select
ON public.workflow_executions FOR SELECT
USING (auth.uid() IS NOT NULL AND public.check_user_association(association_id));

DROP POLICY IF EXISTS workflow_exec_insert ON public.workflow_executions;
CREATE POLICY workflow_exec_insert
ON public.workflow_executions FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND public.check_user_association(association_id));

DROP POLICY IF EXISTS workflow_exec_update ON public.workflow_executions;
CREATE POLICY workflow_exec_update
ON public.workflow_executions FOR UPDATE
USING (auth.uid() IS NOT NULL AND public.check_user_association(association_id));

DROP POLICY IF EXISTS workflow_exec_delete ON public.workflow_executions;
CREATE POLICY workflow_exec_delete
ON public.workflow_executions FOR DELETE
USING (auth.uid() IS NOT NULL AND public.check_user_association(association_id));

-- 5) Seed: Top 20 HOA/Condo workflow templates
-- Note: steps use simple JSON structures aligned with the WorkflowStep interface

-- Financial (6)
INSERT INTO public.workflows (name, description, type, steps, status, is_template, is_popular, created_by)
VALUES
('AP: Invoice Processing', 'Standard accounts payable processing with approvals and posting', 'Financial',
'[
  {"id":"capture","name":"Capture Invoice","description":"Receive and digitize invoice","order":1,"notifyRoles":["accountant"],"autoExecute":false},
  {"id":"validate","name":"Validate Vendor & PO","description":"Match to vendor and PO","order":2,"notifyRoles":["accountant"],"autoExecute":true},
  {"id":"approve","name":"Approval Routing","description":"Route by amount thresholds","order":3,"notifyRoles":["manager","treasurer"],"autoExecute":false},
  {"id":"post","name":"Post to Ledger","description":"Create journal entry","order":4,"notifyRoles":["accountant"],"autoExecute":true},
  {"id":"pay","name":"Schedule Payment","description":"Queue ACH or check","order":5,"notifyRoles":["treasurer"],"autoExecute":false}
]'::jsonb, 'active', true, true, NULL),

('Delinquency & Collections', 'Automated statements, notices, and escalation path for past-due owners', 'Financial',
'[
  {"id":"detect","name":"Detect Past Due","description":"Identify delinquent accounts by policy","order":1,"notifyRoles":["accountant"],"autoExecute":true},
  {"id":"notice1","name":"Send Courtesy Notice","description":"Email/mail initial reminder","order":2,"notifyRoles":["manager"],"autoExecute":true},
  {"id":"notice2","name":"Send Formal Notice","description":"Late fee and terms included","order":3,"notifyRoles":["manager","treasurer"],"autoExecute":true},
  {"id":"paymentplan","name":"Offer Payment Plan","description":"Optional structured plan","order":4,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"escalate","name":"Escalate to Collections","description":"Legal/agency escalation when needed","order":5,"notifyRoles":["treasurer","manager"],"autoExecute":false}
]'::jsonb, 'active', true, true, NULL),

('Budget Approval Cycle', 'Draft → Review → Board approval → Publish and implement', 'Financial',
'[
  {"id":"draft","name":"Draft Budget","description":"Initial draft by accounting","order":1,"notifyRoles":["accountant"],"autoExecute":false},
  {"id":"review_mgmt","name":"Management Review","description":"Ops and assumptions review","order":2,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"board_review","name":"Board Review","description":"Board feedback and revisions","order":3,"notifyRoles":["treasurer","board"],"autoExecute":false},
  {"id":"approve","name":"Board Approval","description":"Vote and approve budget","order":4,"notifyRoles":["treasurer","board"],"autoExecute":false},
  {"id":"publish","name":"Publish & Communicate","description":"Share with community","order":5,"notifyRoles":["manager"],"autoExecute":true}
]'::jsonb, 'active', true, true, NULL),

('Reserve Transfer Approval', 'Controls around reserve transfers with approvals and audit trail', 'Financial',
'[
  {"id":"request","name":"Initiate Transfer","description":"Submit transfer request","order":1,"notifyRoles":["treasurer"],"autoExecute":false},
  {"id":"validate","name":"Validate Purpose","description":"Check reserve study alignment","order":2,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"approve","name":"Board/Treasurer Approval","description":"Dual approval controls","order":3,"notifyRoles":["treasurer","board"],"autoExecute":false},
  {"id":"execute","name":"Execute Transfer","description":"Bank transfer and record entry","order":4,"notifyRoles":["accountant"],"autoExecute":true},
  {"id":"audit","name":"Archive Evidence","description":"Store approvals and confirmations","order":5,"notifyRoles":["accountant"],"autoExecute":true}
]'::jsonb, 'active', true, true, NULL),

('Bank Reconciliation', 'Monthly reconciliation of operating and reserve accounts', 'Financial',
'[
  {"id":"import","name":"Import Statements","description":"Pull monthly bank statements","order":1,"notifyRoles":["accountant"],"autoExecute":true},
  {"id":"match","name":"Match Transactions","description":"Auto/Manual matching","order":2,"notifyRoles":["accountant"],"autoExecute":true},
  {"id":"exceptions","name":"Resolve Exceptions","description":"Handle unmatched/duplicates","order":3,"notifyRoles":["accountant"],"autoExecute":false},
  {"id":"review","name":"Management Review","description":"Review reconciliation report","order":4,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"signoff","name":"Treasurer Sign-off","description":"Finalize and archive","order":5,"notifyRoles":["treasurer"],"autoExecute":false}
]'::jsonb, 'active', true, true, NULL),

('Vendor Onboarding & Payment Setup', 'Set up vendor profiles, W-9/COI, payment method and approval routing', 'Financial',
'[
  {"id":"collect","name":"Collect Vendor Docs","description":"W-9/COI, banking info","order":1,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"verify","name":"Verify Compliance","description":"Check COI and tax details","order":2,"notifyRoles":["manager","accountant"],"autoExecute":false},
  {"id":"setup","name":"Configure Payments","description":"ACH/check setup and terms","order":3,"notifyRoles":["accountant"],"autoExecute":true},
  {"id":"approve","name":"Approval Matrix","description":"Route for final approval","order":4,"notifyRoles":["manager","treasurer"],"autoExecute":false}
]'::jsonb, 'active', true, true, NULL);

-- Maintenance (4)
INSERT INTO public.workflows (name, description, type, steps, status, is_template, is_popular, created_by)
VALUES
('Work Order Intake & Triage', 'Standardized intake, classification, and assignment of maintenance requests', 'Maintenance',
'[
  {"id":"intake","name":"Intake Request","description":"Capture details and media","order":1,"notifyRoles":["maintenance","manager"],"autoExecute":true},
  {"id":"triage","name":"Triage Priority","description":"Severity and impact rating","order":2,"notifyRoles":["maintenance"],"autoExecute":true},
  {"id":"assign","name":"Assign Technician/Vendor","description":"Match skills and availability","order":3,"notifyRoles":["maintenance"],"autoExecute":false},
  {"id":"complete","name":"Work Completion","description":"Closeout and capture costs","order":4,"notifyRoles":["maintenance","accountant"],"autoExecute":false}
]'::jsonb, 'active', true, true, NULL),

('Preventive Maintenance Scheduler', 'Recurring PM for assets and common areas with reminders', 'Maintenance',
'[
  {"id":"inventory","name":"Asset Inventory","description":"Catalog equipment and areas","order":1,"notifyRoles":["maintenance"],"autoExecute":false},
  {"id":"plan","name":"PM Plan","description":"Define cadence and tasks","order":2,"notifyRoles":["maintenance"],"autoExecute":false},
  {"id":"schedule","name":"Auto-Schedule","description":"Create recurring work orders","order":3,"notifyRoles":["maintenance"],"autoExecute":true},
  {"id":"review","name":"Compliance Review","description":"Check completion and KPIs","order":4,"notifyRoles":["manager"],"autoExecute":false}
]'::jsonb, 'active', true, true, NULL),

('Emergency Response Protocol', 'Playbook for urgent incidents (water, fire, security)', 'Maintenance',
'[
  {"id":"detect","name":"Intake Emergency","description":"Identify and confirm emergency","order":1,"notifyRoles":["maintenance","manager"],"autoExecute":true},
  {"id":"notify","name":"Notify Stakeholders","description":"Residents, board, vendors","order":2,"notifyRoles":["manager"],"autoExecute":true},
  {"id":"dispatch","name":"Dispatch Team/Vendor","description":"Send appropriate resources","order":3,"notifyRoles":["maintenance"],"autoExecute":false},
  {"id":"stabilize","name":"Stabilize & Remediate","description":"Safety and containment","order":4,"notifyRoles":["maintenance"],"autoExecute":false},
  {"id":"report","name":"After-Action Report","description":"Summary, photos, costs","order":5,"notifyRoles":["manager","treasurer"],"autoExecute":false}
]'::jsonb, 'active', true, true, NULL),

('Common Area Inspection & Remediation', 'Routine inspections with remediation steps and verification', 'Maintenance',
'[
  {"id":"inspect","name":"Perform Inspection","description":"Checklist-based inspection","order":1,"notifyRoles":["maintenance"],"autoExecute":false},
  {"id":"log","name":"Log Findings","description":"Deficiencies and hazards","order":2,"notifyRoles":["maintenance"],"autoExecute":true},
  {"id":"remediate","name":"Remediate Issues","description":"Create tasks/work orders","order":3,"notifyRoles":["maintenance"],"autoExecute":false},
  {"id":"verify","name":"Verify Closure","description":"Confirm remediation","order":4,"notifyRoles":["manager"],"autoExecute":false}
]'::jsonb, 'active', true, true, NULL);

-- Compliance (3)
INSERT INTO public.workflows (name, description, type, steps, status, is_template, is_popular, created_by)
VALUES
('CC&R Violation Notice Sequence', 'Three-stage notice flow with evidence and escalation', 'Compliance',
'[
  {"id":"log","name":"Log Violation","description":"Photos and details","order":1,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"notice1","name":"Courtesy Notice","description":"Friendly reminder","order":2,"notifyRoles":["manager"],"autoExecute":true},
  {"id":"notice2","name":"Formal Notice","description":"Citations and deadlines","order":3,"notifyRoles":["manager","board"],"autoExecute":true},
  {"id":"hearing","name":"Board Hearing","description":"Schedule and conduct hearing","order":4,"notifyRoles":["board","manager"],"autoExecute":false},
  {"id":"fine","name":"Fine/Resolution","description":"Apply fine or close case","order":5,"notifyRoles":["treasurer","manager"],"autoExecute":false}
]'::jsonb, 'active', true, true, NULL),

('Insurance Certificate Management', 'Track vendor COIs, reminders, and holds when expired', 'Compliance',
'[
  {"id":"collect","name":"Collect COI","description":"Request and store COI","order":1,"notifyRoles":["manager"],"autoExecute":true},
  {"id":"validate","name":"Validate Coverage","description":"Limits and endorsements","order":2,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"remind","name":"Expiry Reminders","description":"30/7 day reminders","order":3,"notifyRoles":["manager"],"autoExecute":true},
  {"id":"hold","name":"Place Payment Hold","description":"If expired or non-compliant","order":4,"notifyRoles":["accountant","manager"],"autoExecute":true}
]'::jsonb, 'active', true, true, NULL),

('Board Policy Update Compliance', 'Ensure new or revised policies are published and acknowledged', 'Compliance',
'[
  {"id":"draft","name":"Draft Policy Update","description":"Prepare revision","order":1,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"approve","name":"Board Approval","description":"Review and approve","order":2,"notifyRoles":["board"],"autoExecute":false},
  {"id":"publish","name":"Publish to Portal","description":"Notify residents","order":3,"notifyRoles":["manager"],"autoExecute":true},
  {"id":"ack","name":"Track Acknowledgements","description":"Record confirmations","order":4,"notifyRoles":["manager"],"autoExecute":true}
]'::jsonb, 'active', true, true, NULL);

-- Resident Management & Communication (4)
INSERT INTO public.workflows (name, description, type, steps, status, is_template, is_popular, created_by)
VALUES
('New Resident Onboarding', 'Welcome packet, portal access, auto-draft, and rules acknowledgement', 'Resident Management',
'[
  {"id":"welcome","name":"Send Welcome Packet","description":"Docs and contacts","order":1,"notifyRoles":["manager"],"autoExecute":true},
  {"id":"portal","name":"Portal Access","description":"Invite and setup","order":2,"notifyRoles":["manager"],"autoExecute":true},
  {"id":"billing","name":"Billing Setup","description":"ACH/auto-draft setup","order":3,"notifyRoles":["accountant"],"autoExecute":false},
  {"id":"ack","name":"Rules Acknowledgement","description":"Collect confirmation","order":4,"notifyRoles":["manager"],"autoExecute":true}
]'::jsonb, 'active', true, true, NULL),

('Move-In / Move-Out Management', 'Coordinate elevators, parking, inspections, and deposits', 'Resident Management',
'[
  {"id":"request","name":"Request & Schedule","description":"Gather dates and needs","order":1,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"reserve","name":"Reserve Elevator/Parking","description":"Block resources","order":2,"notifyRoles":["manager"],"autoExecute":true},
  {"id":"inspect","name":"Unit/Common Inspection","description":"Pre/post condition","order":3,"notifyRoles":["maintenance","manager"],"autoExecute":false},
  {"id":"deposit","name":"Deposit Settlement","description":"Return or apply charges","order":4,"notifyRoles":["accountant"],"autoExecute":false}
]'::jsonb, 'active', true, true, NULL),

('Amenity Reservation Approval', 'Request → Approve → Notify → Prepare', 'Resident Management',
'[
  {"id":"request","name":"Submit Reservation","description":"Resident request","order":1,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"approve","name":"Approve/Reject","description":"Policy and schedule check","order":2,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"notify","name":"Notify Resident","description":"Confirmation and rules","order":3,"notifyRoles":["manager"],"autoExecute":true},
  {"id":"prepare","name":"Prepare Amenity","description":"Setup/cleanup tasks","order":4,"notifyRoles":["maintenance"],"autoExecute":false}
]'::jsonb, 'active', true, true, NULL),

('Mass Communication / Newsletter', 'Prepare content, review, and schedule to lists', 'Communication',
'[
  {"id":"draft","name":"Draft Content","description":"Create content","order":1,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"review","name":"Review & Approve","description":"Compliance and tone","order":2,"notifyRoles":["manager","board"],"autoExecute":false},
  {"id":"target","name":"Select Audience","description":"Lists and segments","order":3,"notifyRoles":["manager"],"autoExecute":true},
  {"id":"send","name":"Schedule/Send","description":"Dispatch and log","order":4,"notifyRoles":["manager"],"autoExecute":true}
]'::jsonb, 'active', true, true, NULL);

-- Governance (3)
INSERT INTO public.workflows (name, description, type, steps, status, is_template, is_popular, created_by)
VALUES
('Board Meeting: Agenda → Minutes → Tasks', 'End-to-end governance flow for board meetings', 'Governance',
'[
  {"id":"agenda","name":"Draft Agenda","description":"Collect topics and materials","order":1,"notifyRoles":["manager","board"],"autoExecute":false},
  {"id":"publish","name":"Publish & Notify","description":"Share to stakeholders","order":2,"notifyRoles":["manager"],"autoExecute":true},
  {"id":"minutes","name":"Record Minutes","description":"Decisions and votes","order":3,"notifyRoles":["manager","board"],"autoExecute":false},
  {"id":"tasks","name":"Assign Action Items","description":"Create tasks and deadlines","order":4,"notifyRoles":["manager"],"autoExecute":true}
]'::jsonb, 'active', true, true, NULL),

('ARC/ACC Architectural Request Review', 'Intake, committee review, approval, and closeout', 'Governance',
'[
  {"id":"intake","name":"Intake Request","description":"Plans and specs","order":1,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"review","name":"Committee Review","description":"ACC review","order":2,"notifyRoles":["board"],"autoExecute":false},
  {"id":"approve","name":"Approve/Reject","description":"Decision with conditions","order":3,"notifyRoles":["board","manager"],"autoExecute":false},
  {"id":"closeout","name":"Closeout","description":"Record permit/inspection","order":4,"notifyRoles":["manager"],"autoExecute":true}
]'::jsonb, 'active', true, true, NULL),

('Annual Meeting & Election Prep', 'Ensure compliance notices, quorum, voting, and certification', 'Governance',
'[
  {"id":"calendar","name":"Calendar & Notices","description":"Statutory notice schedule","order":1,"notifyRoles":["manager","board"],"autoExecute":true},
  {"id":"ballots","name":"Ballots & Proxies","description":"Prepare voting materials","order":2,"notifyRoles":["manager"],"autoExecute":false},
  {"id":"run","name":"Run Meeting & Count","description":"Quorum checks and tally","order":3,"notifyRoles":["manager","board"],"autoExecute":false},
  {"id":"certify","name":"Certify Results","description":"Publish and archive","order":4,"notifyRoles":["manager"],"autoExecute":true}
]'::jsonb, 'active', true, true, NULL);
