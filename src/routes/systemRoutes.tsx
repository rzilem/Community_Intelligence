
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import System from "@/pages/system/System";
import Integrations from "@/pages/system/Integrations";
import SystemSettings from "@/pages/system/SystemSettings";
import EmailWorkflows from "@/pages/system/EmailWorkflows";
import DataImportExport from "@/pages/system/DataImportExport";
import WorkflowSchedule from "@/pages/system/WorkflowSchedule";
import Associations from "@/pages/system/Associations";
import Permissions from "@/pages/system/Permissions";

// System Routes
export const systemRoutes: RouteObject[] = [
  {
    path: "/system",
    element: <RequireAuth allowedRoles={['admin']}><System /></RequireAuth>
  },
  {
    path: "/system/integrations",
    element: <RequireAuth allowedRoles={['admin']}><Integrations /></RequireAuth>
  },
  {
    path: "/system/settings",
    element: <RequireAuth allowedRoles={['admin']}><SystemSettings /></RequireAuth>
  },
  {
    path: "/system/email-workflows",
    element: <RequireAuth allowedRoles={['admin']}><EmailWorkflows /></RequireAuth>
  },
  {
    path: "/system/data",
    element: <RequireAuth allowedRoles={['admin']}><DataImportExport /></RequireAuth>
  },
  {
    path: "/system/workflow-schedule",
    element: <RequireAuth allowedRoles={['admin']}><WorkflowSchedule /></RequireAuth>
  },
  {
    path: "/system/associations",
    element: <RequireAuth allowedRoles={['admin']}><Associations /></RequireAuth>
  },
  {
    path: "/system/permissions",
    element: <RequireAuth allowedRoles={['admin']}><Permissions /></RequireAuth>
  }
];
