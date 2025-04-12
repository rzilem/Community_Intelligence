
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Operations from "@/pages/operations/Operations";
import OperationsDashboard from "@/pages/operations/OperationsDashboard";
import OperationsCalendar from "@/pages/operations/OperationsCalendar";
import Vendors from "@/pages/operations/Vendors";
import VendorProfile from "@/pages/operations/VendorProfile";
import LetterTemplates from "@/pages/operations/LetterTemplates";
import Workflows from "@/pages/operations/Workflows";
import WorkflowDetails from "@/pages/operations/WorkflowDetails";
import PrintQueue from "@/pages/operations/PrintQueue";
import OperationsReports from "@/pages/operations/OperationsReports";

// Operations Routes
export const operationsRoutes: RouteObject[] = [
  {
    path: "/operations",
    element: <RequireAuth><Operations /></RequireAuth>
  },
  {
    path: "/operations/dashboard",
    element: <RequireAuth><OperationsDashboard /></RequireAuth>
  },
  {
    path: "/operations/calendar",
    element: <RequireAuth><OperationsCalendar /></RequireAuth>
  },
  {
    path: "/operations/vendors",
    element: <RequireAuth><Vendors /></RequireAuth>
  },
  {
    path: "/operations/vendors/:id",
    element: <RequireAuth><VendorProfile /></RequireAuth>
  },
  {
    path: "/operations/reports",
    element: <RequireAuth><OperationsReports /></RequireAuth>
  },
  {
    path: "/operations/letter-templates",
    element: <RequireAuth><LetterTemplates /></RequireAuth>
  },
  {
    path: "/operations/workflows",
    element: <RequireAuth><Workflows /></RequireAuth>
  },
  {
    path: "/operations/workflows/:id",
    element: <RequireAuth><WorkflowDetails /></RequireAuth>
  },
  {
    path: "/operations/print-queue",
    element: <RequireAuth><PrintQueue /></RequireAuth>
  }
];
