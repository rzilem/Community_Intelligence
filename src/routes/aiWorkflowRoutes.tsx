
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import AIWorkflowDashboard from "@/pages/ai-workflow/AIWorkflowDashboard";
import MLTrainingDashboard from "@/pages/ai-workflow/MLTrainingDashboard";
import AIAnalytics from "@/pages/AIAnalytics";
import RealTimeAnalyticsDashboard from "@/pages/ai-workflow/RealTimeAnalyticsDashboard";
import MobilePWAManagement from "@/pages/ai-workflow/MobilePWAManagement";
import BusinessIntelligenceDashboard from "@/pages/ai-workflow/BusinessIntelligenceDashboard";
import IoTIntegrationDashboard from "@/pages/ai-workflow/IoTIntegrationDashboard";

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
        <MLTrainingDashboard associationId="default-association-id" />
      </RequireAuth>
    )
  },
  {
    path: "/ai-workflow/analytics",
    element: (
      <RequireAuth allowedRoles={['admin', 'manager']}>
        <RealTimeAnalyticsDashboard />
      </RequireAuth>
    )
  },
  {
    path: "/ai-workflow/iot",
    element: (
      <RequireAuth allowedRoles={['admin', 'manager']}>
        <IoTIntegrationDashboard />
      </RequireAuth>
    )
  },
  {
    path: "/ai-workflow/mobile",
    element: (
      <RequireAuth allowedRoles={['admin', 'manager']}>
        <MobilePWAManagement associationId="default-association-id" />
      </RequireAuth>
    )
  },
  {
    path: "/ai-workflow/bi",
    element: (
      <RequireAuth allowedRoles={['admin', 'manager']}>
        <BusinessIntelligenceDashboard associationId="default-association-id" />
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
