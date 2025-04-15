
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Associations from "@/pages/Associations";
import Homeowners from "@/pages/Homeowners";
import HomeownerRequestsPage from "@/pages/homeowners/HomeownerRequestsPage";
import Compliance from "@/pages/Compliance";
import BidRequests from "@/pages/community-management/BidRequests";

// Community Management Routes
export const communityManagementRoutes: RouteObject[] = [
  {
    path: "/associations",
    element: <RequireAuth><Associations /></RequireAuth>
  },
  {
    path: "/homeowners",
    element: <RequireAuth><Homeowners /></RequireAuth>
  },
  {
    path: "/community-management/homeowner-requests",
    element: <RequireAuth><HomeownerRequestsPage /></RequireAuth>
  },
  {
    path: "/compliance",
    element: <RequireAuth><Compliance /></RequireAuth>
  },
  {
    path: "/bid-requests",
    element: <RequireAuth><BidRequests /></RequireAuth>
  }
];
