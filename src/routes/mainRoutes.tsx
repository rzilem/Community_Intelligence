
import { Navigate } from "react-router-dom";
import { RouteObject } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import Residents from "@/pages/Residents";
import ResidentProfile from "@/pages/ResidentProfile";
import CalendarPage from "@/pages/CalendarPage";
import Accounting from "@/pages/Accounting";
import Compliance from "@/pages/Compliance";
import Reports from "@/pages/Reports";
import Communications from "@/pages/Communications";
import SettingsPage from "@/pages/Settings";
import Help from "@/pages/Help";
import NotFound from "@/pages/NotFound";
import { RequireAuth } from "@/components/auth/RequireAuth";

// Main application routes
export const mainRoutes: RouteObject[] = [
  // Public Routes
  {
    path: "/",
    element: <Index />
  },
  {
    path: "/auth",
    element: <Auth />
  },
  
  // Protected Dashboard Route
  {
    path: "/dashboard",
    element: <RequireAuth><Dashboard /></RequireAuth>
  },
  
  // Original Pages that need authentication
  {
    path: "/properties",
    element: <RequireAuth><Properties /></RequireAuth>
  },
  {
    path: "/residents",
    element: <RequireAuth><Residents /></RequireAuth>
  },
  {
    path: "/residents/:id",
    element: <RequireAuth><ResidentProfile /></RequireAuth>
  },
  {
    path: "/calendar",
    element: <RequireAuth><CalendarPage /></RequireAuth>
  },
  {
    path: "/accounting",
    element: <RequireAuth><Accounting /></RequireAuth>
  },
  {
    path: "/compliance",
    element: <RequireAuth><Compliance /></RequireAuth>
  },
  {
    path: "/reports",
    element: <RequireAuth><Reports /></RequireAuth>
  },
  {
    path: "/communications",
    element: <RequireAuth><Communications /></RequireAuth>
  },
  {
    path: "/settings",
    element: <RequireAuth><SettingsPage /></RequireAuth>
  },
  {
    path: "/help",
    element: <RequireAuth><Help /></RequireAuth>
  },
  
  // Catch-all Route
  {
    path: "*",
    element: <NotFound />
  },
];
