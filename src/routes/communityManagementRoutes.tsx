
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import CommunityManagement from "@/pages/community-management/CommunityManagement";
import BidRequests from "@/pages/community-management/BidRequests";
import Homeowners from "@/pages/Homeowners";
import HomeownerDetailPage from "@/pages/HomeownerDetailPage";

// Community Management Routes
export const communityManagementRoutes: RouteObject[] = [
  {
    path: "/community-management",
    element: <RequireAuth><CommunityManagement /></RequireAuth>
  },
  {
    path: "/homeowners",
    element: <RequireAuth><Homeowners /></RequireAuth>
  },
  {
    path: "/homeowners/:id",
    element: <RequireAuth><HomeownerDetailPage /></RequireAuth>
  },
  {
    path: "/bid-requests",
    element: <RequireAuth><BidRequests /></RequireAuth>
  }
];
