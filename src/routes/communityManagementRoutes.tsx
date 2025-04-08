
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import CommunityManagement from "@/pages/community-management/CommunityManagement";
import BidRequests from "@/pages/community-management/BidRequests";

// Community Management Routes
export const communityManagementRoutes: RouteObject[] = [
  {
    path: "/community-management",
    element: <RequireAuth><CommunityManagement /></RequireAuth>
  },
  {
    path: "/bid-requests",
    element: <RequireAuth><BidRequests /></RequireAuth>
  }
];
