
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { communityManagementRoutes } from "./communityManagementRoutes";
import { adminRoutes } from "./adminRoutes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Index /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "auth", element: <Auth /> },
      ...communityManagementRoutes,
      ...adminRoutes,
      { path: "*", element: <NotFound /> }
    ]
  }
]);
