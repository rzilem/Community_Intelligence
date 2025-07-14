
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
    path: "/ai-workflow/ml-training",
    element: (
      <RequireAuth allowedRoles={['admin', 'manager']}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">ML Training Dashboard</h1>
          <p>Advanced machine learning training interface - Coming soon</p>
        </div>
      </RequireAuth>
    )
  },
  {
    path: "/ai-workflow/analytics",
    element: (
      <RequireAuth allowedRoles={['admin', 'manager']}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Real-time Analytics</h1>
          <p>Real-time analytics dashboard - Coming soon</p>
        </div>
      </RequireAuth>
    )
  },
  {
    path: "/ai-workflow/iot",
    element: (
      <RequireAuth allowedRoles={['admin', 'manager']}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">IoT Integration</h1>
          <p>IoT device management - Coming soon</p>
        </div>
      </RequireAuth>
    )
  },
  {
    path: "/ai-workflow/mobile",
    element: (
      <RequireAuth allowedRoles={['admin', 'manager']}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Mobile PWA Management</h1>
          <p>Progressive Web App configuration - Coming soon</p>
        </div>
      </RequireAuth>
    )
  },
  {
    path: "/ai-workflow/bi",
    element: (
      <RequireAuth allowedRoles={['admin', 'manager']}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Business Intelligence</h1>
          <p>Advanced BI dashboard - Coming soon</p>
        </div>
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
