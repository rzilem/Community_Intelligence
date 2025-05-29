
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import ProjectTypeManagement from "@/pages/admin/ProjectTypeManagement";

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin/project-types",
    element: <RequireAuth><ProjectTypeManagement /></RequireAuth>
  }
];
