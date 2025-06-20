
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import AIWorkflowDashboard from "@/pages/ai-workflow/AIWorkflowDashboard";
import AIAnalytics from "@/pages/AIAnalytics";

export const aiWorkflowRoutes: RouteObject[] = [
  {
    path: "/ai-workflow",
    element: (
      <RequireAuth allowedRoles={['admin', 'manager']}>
        <AIWorkflowDashboard associationId="default-association-id" />
      </RequireAuth>
    )
  },
  {
    path: "/ai-analytics",
    element: (
      <RequireAuth allowedRoles={["admin", "manager"]}>
        <AIAnalytics />
      </RequireAuth>
    )
  }
];
