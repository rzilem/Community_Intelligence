
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import EnhancedEmailCampaignsPage from "@/pages/lead-management/EnhancedEmailCampaigns";

export const enhancedEmailCampaignsRoutes: RouteObject[] = [
  {
    path: "/enhanced-email-campaigns",
    element: (
      <RequireAuth allowedRoles={['admin', 'manager']}>
        <EnhancedEmailCampaignsPage />
      </RequireAuth>
    )
  }
];
