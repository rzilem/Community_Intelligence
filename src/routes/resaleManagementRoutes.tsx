
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import ResaleManagement from "@/pages/resale-management/ResaleManagement";
import ResaleCertificate from "@/pages/resale-management/ResaleCertificate";
import ResaleCertificateDetail from "@/pages/resale-management/ResaleCertificateDetail";
import CondoQuestionnaire from "@/pages/resale-management/CondoQuestionnaire";
import PropertyInspection from "@/pages/resale-management/PropertyInspection";
import AccountStatements from "@/pages/resale-management/AccountStatements";
import TRECForms from "@/pages/resale-management/TRECForms";
import OrderQueue from "@/pages/resale-management/OrderQueue";

// Resale Management Routes
export const resaleManagementRoutes: RouteObject[] = [
  {
    path: "/resale-management",
    element: <RequireAuth><ResaleManagement /></RequireAuth>
  },
  {
    path: "/resale-management/certificate",
    element: <RequireAuth><ResaleCertificate /></RequireAuth>
  },
  {
    path: "/resale-management/certificate/:id",
    element: <RequireAuth><ResaleCertificateDetail /></RequireAuth>
  },
  {
    path: "/resale-management/questionnaire",
    element: <RequireAuth><CondoQuestionnaire /></RequireAuth>
  },
  {
    path: "/resale-management/inspection",
    element: <RequireAuth><PropertyInspection /></RequireAuth>
  },
  {
    path: "/resale-management/statements",
    element: <RequireAuth><AccountStatements /></RequireAuth>
  },
  {
    path: "/resale-management/trec-forms",
    element: <RequireAuth><TRECForms /></RequireAuth>
  },
  {
    path: "/resale-management/order-queue",
    element: <RequireAuth><OrderQueue /></RequireAuth>
  }
];
