
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import ResaleManagement from "@/pages/resale-management/ResaleManagement";
import ResaleCertificate from "@/pages/resale-management/ResaleCertificate";
import ResaleCertificateDetail from "@/pages/resale-management/ResaleCertificateDetail";
import CondoQuestionnaire from "@/pages/resale-management/CondoQuestionnaire";
import OrderQueue from "@/pages/resale-management/OrderQueue";
import ResaleAnalytics from "@/pages/resale-management/ResaleAnalytics";
import ResaleCalendar from "@/pages/resale-management/ResaleCalendar";

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
    path: "/resale-management/calendar",
    element: <RequireAuth><ResaleCalendar /></RequireAuth>
  },
  {
    path: "/resale-management/order-queue",
    element: <RequireAuth><OrderQueue /></RequireAuth>
  },
  {
    path: "/resale-management/analytics",
    element: <RequireAuth><ResaleAnalytics /></RequireAuth>
  }
];
