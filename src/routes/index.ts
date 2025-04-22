
import { createBrowserRouter } from "react-router-dom";
import { documentRoutes } from "./documentRoutes";
import { maintenanceRoutes } from "./maintenanceRoutes";
import { amenityRoutes } from "./amenityRoutes";
import ResidentListPage from "@/pages/residents/ResidentListPage";
import HomeownerListPage from "@/pages/homeowners/HomeownerListPage";
import HomeownerDetailPage from "@/pages/HomeownerDetailPage";
import HomeownerPortalPage from "@/pages/portal/HomeownerPortalPage";
import HomeownersPage from "@/pages/portal/board/HomeownersPage";
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
    element: <RequireAuth><HomeownerPortalPage /></RequireAuth>
  },
  {
    path: "/portal/board/homeowners",
    element: <RequireAuth><HomeownersPage /></RequireAuth>
  },
  ...documentRoutes,
  ...maintenanceRoutes,
  ...amenityRoutes,
]);
