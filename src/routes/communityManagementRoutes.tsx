
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import CommunityManagement from "@/pages/community-management/CommunityManagement";
import Properties from "@/pages/Properties";
import BidRequests from "@/pages/community-management/BidRequests";
import CompliancePage from "@/pages/Compliance";
import ResidentListPage from "@/pages/residents/ResidentListPage";

// Community Management Routes
export const communityManagementRoutes: RouteObject[] = [
  {
    path: "/community-management",
    element: <RequireAuth><CommunityManagement /></RequireAuth>
  },
  {
    path: "/properties",
    element: <RequireAuth><Properties /></RequireAuth>
  },
  {
    path: "/homeowners",
    element: <RequireAuth><ResidentListPage /></RequireAuth>
  },
  {
    path: "/compliance",
    element: <RequireAuth><CompliancePage /></RequireAuth>
  },
  {
    path: "/bid-requests",
    element: <RequireAuth><BidRequests /></RequireAuth>
  }
];
