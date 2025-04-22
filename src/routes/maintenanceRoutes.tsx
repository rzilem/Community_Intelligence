
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import MaintenancePage from "@/pages/maintenance/MaintenancePage";

export const maintenanceRoutes: RouteObject[] = [
  {
    path: "/maintenance",
    element: <RequireAuth><MaintenancePage /></RequireAuth>
  }
];
