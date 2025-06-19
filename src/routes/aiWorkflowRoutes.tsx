
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import AIWorkflowDashboard from "@/pages/ai-workflow/AIWorkflowDashboard";

export const aiWorkflowRoutes: RouteObject[] = [
  {
    path: "/ai-workflow",
    element: (
      <RequireAuth allowedRoles={['admin', 'manager']}>
        <AIWorkflowDashboard associationId="default-association-id" />
      </RequireAuth>
    )
  }
];
