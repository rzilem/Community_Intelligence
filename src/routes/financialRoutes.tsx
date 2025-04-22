
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import FinancialReports from "@/pages/accounting/FinancialReports";
import AssessmentReportPage from "@/pages/accounting/AssessmentReportPage";
import InvoiceReportPage from "@/pages/accounting/InvoiceReportPage";
import FinancialDashboardPage from "@/pages/accounting/FinancialDashboardPage";

export const financialRoutes: RouteObject[] = [
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
