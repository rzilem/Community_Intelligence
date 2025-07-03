
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import AccountingDashboard from "@/pages/accounting/AccountingDashboard";
import BankAccounts from "@/pages/accounting/BankAccounts";
import InvoiceQueue from "@/pages/accounting/InvoiceQueue";
import InvoiceDetail from "@/pages/accounting/InvoiceDetail";
import TransactionsAndPayments from "@/pages/accounting/TransactionsAndPayments";
import GLAccounts from "@/pages/accounting/GLAccounts";
import BudgetPlanning from "@/pages/accounting/BudgetPlanning";
import AssessmentManagement from "@/pages/accounting/AssessmentManagement";
import AccountsPayable from "@/pages/accounting/AccountsPayable";
import FinancialStatements from "@/pages/accounting/FinancialStatements";

// Accounting Routes
export const accountingRoutes: RouteObject[] = [
  {
    path: "/accounting/dashboard",
    element: <RequireAuth><AccountingDashboard /></RequireAuth>
  },
  {
    path: "/accounting/bank-accounts",
    element: <RequireAuth><BankAccounts /></RequireAuth>
  },
  {
    path: "/accounting/invoice-queue",
    element: <RequireAuth><InvoiceQueue /></RequireAuth>
  },
  {
    path: "/accounting/invoice-queue/:id",
    element: <RequireAuth><InvoiceDetail /></RequireAuth>
  },
  {
    path: "/accounting/transactions-payments",
    element: <RequireAuth><TransactionsAndPayments /></RequireAuth>
  },
  {
    path: "/accounting/gl-accounts",
    element: <RequireAuth><GLAccounts /></RequireAuth>
  },
  {
    path: "/accounting/budget-planning",
    element: <RequireAuth><BudgetPlanning /></RequireAuth>
  },
  {
    path: "/accounting/assessment-management",
    element: <RequireAuth><AssessmentManagement /></RequireAuth>
  },
  {
    path: "/accounting/accounts-payable",
    element: <RequireAuth><AccountsPayable /></RequireAuth>
  },
  {
    path: "/accounting/financial-statements",
    element: <RequireAuth><FinancialStatements /></RequireAuth>
  }
];
