
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import System from "@/pages/system/System";
import SystemSettings from "@/pages/system/SystemSettings";
import Permissions from "@/pages/system/Permissions";
import DataManagement from "@/pages/system/DataManagement";
import AssociationProfile from "@/pages/system/AssociationProfile";
import AssociationPropertyTypes from "@/pages/system/AssociationPropertyTypes";
import EmailWorkflows from "@/pages/system/EmailWorkflows";
import WorkflowSchedule from "@/pages/system/WorkflowSchedule";
import { Navigate } from "react-router-dom";
import FinancialReportMapping from "@/pages/accounting/FinancialReportMapping";
import UserManagement from "@/pages/system/UserManagement";
import AuditLogs from "@/pages/system/AuditLogs";
import ApiKeys from "@/pages/system/ApiKeys";

// System Management Routes
export const systemRoutes: RouteObject[] = [
  {
    path: "/system",
    element: <RequireAuth><System /></RequireAuth>
  },
  {
    path: "/system/settings",
    element: <RequireAuth><SystemSettings /></RequireAuth>
  },
  {
    path: "/system/integrations",
    element: <Navigate to="/system/settings" replace />
  },
  {
    path: "/system/permissions",
    element: <RequireAuth><Permissions /></RequireAuth>
  },
  {
    path: "/system/data-management",
    element: <RequireAuth><DataManagement /></RequireAuth>
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
    element: <RequireAuth><FinancialReportMapping /></RequireAuth>
  },
  {
    path: "/system/associations",
    element: <Navigate to="/system/data-management" replace />
  },
  {
    path: "/system/associations/:id",
    element: <RequireAuth><AssociationProfile /></RequireAuth>
  },
  {
    path: "/system/property-types",
    element: <RequireAuth><AssociationPropertyTypes /></RequireAuth>
  },
  {
    path: "/system/email-workflows",
    element: <RequireAuth><EmailWorkflows /></RequireAuth>
  },
  {
    path: "/system/workflow-schedule",
    element: <RequireAuth><WorkflowSchedule /></RequireAuth>
  },
  {
    path: "/system/users",
    element: <RequireAuth><UserManagement /></RequireAuth>
  },
  {
    path: "/system/audit-logs",
    element: <RequireAuth><AuditLogs /></RequireAuth>
  },
  {
    path: "/system/api-keys",
    element: <RequireAuth><ApiKeys /></RequireAuth>
  }
];
