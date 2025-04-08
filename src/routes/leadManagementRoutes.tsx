
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import LeadManagement from "@/pages/lead-management/LeadManagement";
import LeadsDashboard from "@/pages/lead-management/LeadsDashboard";
import Proposals from "@/pages/lead-management/Proposals";
import EmailCampaigns from "@/pages/lead-management/EmailCampaigns";
import Analytics from "@/pages/lead-management/Analytics";
import OnboardingWizard from "@/pages/lead-management/OnboardingWizard";

// Lead Management Routes
export const leadManagementRoutes: RouteObject[] = [
  {
    path: "/lead-management",
    element: <RequireAuth allowedRoles={['admin', 'manager']}><LeadManagement /></RequireAuth>
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
  }
];
