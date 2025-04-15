
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Associations from "@/pages/Associations";
import Homeowners from "@/pages/Homeowners";
import HomeownerRequests from "@/pages/HomeownerRequests";
import Compliance from "@/pages/Compliance";
import BidRequests from "@/pages/BidRequests";

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
    element: <RequireAuth><HomeownerRequests /></RequireAuth>
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
