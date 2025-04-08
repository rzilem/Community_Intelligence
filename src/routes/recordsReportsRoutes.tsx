
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import RecordsReports from "@/pages/records-reports/RecordsReports";
import Records from "@/pages/records-reports/Records";
import Documents from "@/pages/records-reports/Documents";
import ReportsPage from "@/pages/records-reports/ReportsPage";

// Records & Reports Routes
export const recordsReportsRoutes: RouteObject[] = [
  {
    path: "/records-reports",
    element: <RequireAuth><RecordsReports /></RequireAuth>
  },
  {
    path: "/records-reports/records",
    element: <RequireAuth><Records /></RequireAuth>
  },
  {
    path: "/records-reports/documents",
    element: <RequireAuth><Documents /></RequireAuth>
  },
  {
    path: "/records-reports/reports",
    element: <RequireAuth><ReportsPage /></RequireAuth>
  }
];
