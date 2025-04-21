
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import System from "@/pages/system/System";
import SystemSettings from "@/pages/system/SystemSettings";
import Permissions from "@/pages/system/Permissions";
import DataManagement from "@/pages/system/DataManagement";
import AssociationProfile from "@/pages/system/AssociationProfile";
import EmailWorkflows from "@/pages/system/EmailWorkflows";
import WorkflowSchedule from "@/pages/system/WorkflowSchedule";
import { Navigate } from "react-router-dom";
import FinancialReportMapping from "@/pages/accounting/FinancialReportMapping";

// System Management Routes
export const systemRoutes: RouteObject[] = [
  {
    path: "/system",
    element: <RequireAuth menuId="system"><System /></RequireAuth>
  },
  {
    path: "/system/settings",
    element: <RequireAuth menuId="system" submenuId="settings" requiredAccess="full"><SystemSettings /></RequireAuth>
  },
  {
    path: "/system/integrations",
    element: <Navigate to="/system/settings" replace />
  },
  {
    path: "/system/permissions",
    element: <RequireAuth menuId="system" submenuId="permissions" requiredAccess="full"><Permissions /></RequireAuth>
  },
  {
    path: "/system/data-management",
    element: <RequireAuth menuId="system" submenuId="data-management"><DataManagement /></RequireAuth>
  },
  {
    path: "/system/import-export",
    element: <Navigate to="/system/data-management" replace />
  },
  {
    path: "/system/data",
    element: <Navigate to="/system/data-management" replace />
  },
  {
    path: "/system/financial-report-mapping",
    element: <RequireAuth menuId="system" submenuId="financial-report-mapping"><FinancialReportMapping /></RequireAuth>
  },
  {
    path: "/system/associations",
    element: <Navigate to="/system/data-management" replace />
  },
  {
    path: "/system/associations/:id",
    element: <RequireAuth menuId="system"><AssociationProfile /></RequireAuth>
  },
  {
    path: "/system/email-workflows",
    element: <RequireAuth menuId="system" submenuId="email-workflows"><EmailWorkflows /></RequireAuth>
  },
  {
    path: "/system/workflow-schedule",
    element: <RequireAuth menuId="system" submenuId="workflow-schedule"><WorkflowSchedule /></RequireAuth>
  }
];
