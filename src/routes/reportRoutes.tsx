
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Reports from "@/pages/Reports";
import PollsPage from "@/pages/community/PollsPage";
import FinancialReports from "@/pages/accounting/FinancialReports";
import AssessmentReportPage from "@/pages/accounting/AssessmentReportPage";
import InvoiceReportPage from "@/pages/accounting/InvoiceReportPage";
import FinancialDashboardPage from "@/pages/accounting/FinancialDashboardPage";

export const reportRoutes: RouteObject[] = [
  {
    path: "/reports",
    element: <RequireAuth><Reports /></RequireAuth>
  },
  {
    path: "/community/polls",
    element: <RequireAuth><PollsPage /></RequireAuth>
  },
  {
    path: "/financial-reports",
    element: <RequireAuth><FinancialReports /></RequireAuth>
  },
  {
    path: "/financial-reports/assessments",
    element: <RequireAuth><AssessmentReportPage /></RequireAuth>
  },
  {
    path: "/financial-reports/invoices",
    element: <RequireAuth><InvoiceReportPage /></RequireAuth>
  },
  {
    path: "/financial-reports/dashboard",
    element: <RequireAuth><FinancialDashboardPage /></RequireAuth>
  }
];
