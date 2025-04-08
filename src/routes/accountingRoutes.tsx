
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import AccountingDashboard from "@/pages/accounting/AccountingDashboard";
import BankAccounts from "@/pages/accounting/BankAccounts";
import InvoiceQueue from "@/pages/accounting/InvoiceQueue";
import Transactions from "@/pages/accounting/Transactions";
import Payments from "@/pages/accounting/Payments";
import JournalEntries from "@/pages/accounting/JournalEntries";
import GLAccounts from "@/pages/accounting/GLAccounts";
import FinancialReports from "@/pages/accounting/FinancialReports";
import BudgetPlanning from "@/pages/accounting/BudgetPlanning";

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
    path: "/accounting/transactions",
    element: <RequireAuth><Transactions /></RequireAuth>
  },
  {
    path: "/accounting/payments",
    element: <RequireAuth><Payments /></RequireAuth>
  },
  {
    path: "/accounting/journal-entries",
    element: <RequireAuth><JournalEntries /></RequireAuth>
  },
  {
    path: "/accounting/gl-accounts",
    element: <RequireAuth><GLAccounts /></RequireAuth>
  },
  {
    path: "/accounting/financial-reports",
    element: <RequireAuth><FinancialReports /></RequireAuth>
  },
  {
    path: "/accounting/budget-planning",
    element: <RequireAuth><BudgetPlanning /></RequireAuth>
  }
];
