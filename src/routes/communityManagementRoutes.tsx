
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import CommunityManagement from "@/pages/community-management/CommunityManagement";
import Associations from "@/pages/Associations";
import BidRequests from "@/pages/community-management/BidRequests";
import CompliancePage from "@/pages/Compliance";
import ResidentListPage from "@/pages/residents/ResidentListPage";
import HomeownerDetailPage from "@/pages/HomeownerDetailPage";
import ResidentDetailPage from "@/pages/ResidentDetailPage";
import HomeownerRequestsPage from "@/pages/homeowners/HomeownerRequestsPage";
import HomeownerRequestsQueue from "@/pages/community-management/HomeownerRequestsQueue";
import HomeownerListPage from "@/pages/homeowners/HomeownerListPage";

export const communityManagementRoutes: RouteObject[] = [
  {
    path: "/community-management",
    element: <RequireAuth><CommunityManagement /></RequireAuth>
  },
  {
    path: "/properties",
    element: <RequireAuth><Associations /></RequireAuth>
  },
  {
    path: "/associations",
    element: <RequireAuth><Associations /></RequireAuth>
  },
  {
    path: "/homeowners",
    element: <RequireAuth><HomeownerListPage /></RequireAuth>
  },
  {
    path: "/homeowners/add",
    element: <RequireAuth><HomeownerDetailPage /></RequireAuth>
  },
  {
    path: "/homeowners/:id",
    element: <RequireAuth><HomeownerDetailPage /></RequireAuth>
  },
  {
    path: "/residents",
    element: <RequireAuth><ResidentListPage /></RequireAuth>
  },
  {
    path: "/residents/:id",
    element: <RequireAuth><ResidentDetailPage /></RequireAuth>
  },
  {
    path: "/compliance",
    element: <RequireAuth><CompliancePage /></RequireAuth>
  },
  {
    path: "/bid-requests",
    element: <RequireAuth><BidRequests /></RequireAuth>
  },
  {
    path: "/homeowners/requests",
    element: <RequireAuth><HomeownerRequestsPage /></RequireAuth>
  },
  {
    path: "/community-management/homeowner-requests",
    element: <RequireAuth><HomeownerRequestsQueue /></RequireAuth>
  }
];
