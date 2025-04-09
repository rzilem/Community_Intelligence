
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import System from "@/pages/system/System";
import SystemSettings from "@/pages/system/SystemSettings";
import Integrations from "@/pages/system/Integrations";
import Permissions from "@/pages/system/Permissions";
import DataImportExport from "@/pages/system/DataImportExport";
import Associations from "@/pages/system/Associations";
import AssociationProfile from "@/pages/system/AssociationProfile";
import EmailWorkflows from "@/pages/system/EmailWorkflows";
import WorkflowSchedule from "@/pages/system/WorkflowSchedule";

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
    element: <RequireAuth><Integrations /></RequireAuth>
  },
  {
    path: "/system/permissions",
    element: <RequireAuth><Permissions /></RequireAuth>
  },
  {
    path: "/system/import-export",
    element: <RequireAuth><DataImportExport /></RequireAuth>
  },
  {
    path: "/system/data",
    element: <RequireAuth><DataImportExport /></RequireAuth>
  },
  {
    path: "/system/associations",
    element: <RequireAuth><Associations /></RequireAuth>
  },
  {
    path: "/system/associations/:id",
    element: <RequireAuth><AssociationProfile /></RequireAuth>
  },
  {
    path: "/system/email-workflows",
    element: <RequireAuth><EmailWorkflows /></RequireAuth>
  },
  {
    path: "/system/workflow-schedule",
    element: <RequireAuth><WorkflowSchedule /></RequireAuth>
  }
];
