
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import LeadManagement from "@/pages/lead-management/LeadManagement";
import LeadsDashboard from "@/pages/lead-management/LeadsDashboard";
import Proposals from "@/pages/lead-management/Proposals";
import EmailCampaigns from "@/pages/lead-management/EmailCampaigns";
import Analytics from "@/pages/lead-management/Analytics";
import OnboardingWizard from "@/pages/lead-management/OnboardingWizard";
import Templates from "@/pages/lead-management/Templates";
import LeadDetailPage from "@/components/leads/LeadDetailPage";
import TemplateDetails from "@/components/onboarding/TemplateDetails";
import ClientPortal from "@/pages/ClientPortal";
import LeadFollowUps from "@/pages/lead-management/LeadFollowUps";
import Leads from "@/pages/lead-management/Leads";

// Lead Management Routes
export const leadManagementRoutes: RouteObject[] = [
  {
    path: "/leads",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><LeadsDashboard /></RequireAuth>
  },
  {
    path: "/lead-management",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><LeadManagement /></RequireAuth>
  },
  {
    path: "/lead-management/leads",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><Leads /></RequireAuth>
  },
  {
    path: "/lead-management/dashboard",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><LeadsDashboard /></RequireAuth>
  },
  {
    path: "/lead-management/proposals",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><Proposals /></RequireAuth>
  },
  {
    path: "/lead-management/email-campaigns",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><EmailCampaigns /></RequireAuth>
  },
  {
    path: "/lead-management/analytics",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><Analytics /></RequireAuth>
  },
  {
    path: "/lead-management/onboarding",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><OnboardingWizard /></RequireAuth>
  },
  {
    path: "/lead-management/onboarding/:projectId",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><OnboardingWizard /></RequireAuth>
  },
  {
    path: "/lead-management/onboarding/templates/:templateId",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><TemplateDetails /></RequireAuth>
  },
  {
    path: "/lead-management/templates",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><Templates /></RequireAuth>
  },
  {
    path: "/lead-management/lead-follow-ups",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><LeadFollowUps /></RequireAuth>
  },
  {
    path: "/lead-management/leads/:leadId",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><LeadDetailPage /></RequireAuth>
  },
  // Client portal route - no authentication required
  {
    path: "/client-portal/proposals/:proposalId",
    element: <ClientPortal />
  }
];
