
import { createBrowserRouter } from "react-router-dom";
import { documentRoutes } from "./documentRoutes";
import { maintenanceRoutes } from "./maintenanceRoutes";
import { amenityRoutes } from "./amenityRoutes";
import { accountingRoutes } from "./accountingRoutes";
import { reportRoutes } from "./reportRoutes";
import { communityRoutes } from "./communityRoutes";
import { financialRoutes } from "./financialRoutes";
import { communicationsRoutes } from "./communicationsRoutes";
import ResidentListPage from "@/pages/residents/ResidentListPage";
import HomeownerListPage from "@/pages/homeowners/HomeownerListPage";
import HomeownerDetailPage from "@/pages/HomeownerDetailPage";
import HomeownerPortalPage from "@/pages/portal/HomeownerPortalPage";
import HomeownersPage from "@/pages/portal/board/HomeownersPage";
import ReportsPage from "@/pages/portal/board/ReportsPage";
import FormBuilder from "@/pages/system/FormBuilder";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RequireAuth><HomeownerListPage /></RequireAuth>,
  },
  {
    path: "/homeowners",
    element: <RequireAuth><HomeownerListPage /></RequireAuth>,
  },
  {
    path: "/homeowners/:id",
    element: <RequireAuth><HomeownerDetailPage /></RequireAuth>,
  },
  {
    path: "/residents",
    element: <RequireAuth><ResidentListPage /></RequireAuth>,
  },
  {
    path: "/portal/homeowner",
    element: <RequireAuth><HomeownerPortalPage /></RequireAuth>,
  },
  {
    path: "/portal/board/homeowners",
    element: <RequireAuth><HomeownersPage /></RequireAuth>,
  },
  {
    path: "/portal/board/reports",
    element: <RequireAuth><ReportsPage /></RequireAuth>,
  },
  {
    path: "/system/form-builder",
    element: <RequireAuth><FormBuilder /></RequireAuth>,
  },
  ...documentRoutes,
  ...maintenanceRoutes,
  ...amenityRoutes,
  ...accountingRoutes,
  ...reportRoutes,
  ...communityRoutes,
  ...financialRoutes,
  ...communicationsRoutes,
]);
