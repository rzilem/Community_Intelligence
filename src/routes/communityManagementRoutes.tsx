
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Associations from "@/pages/Associations";
import Homeowners from "@/pages/Homeowners";
import HomeownerRequestsQueue from "@/pages/community-management/HomeownerRequestsQueue";
import Compliance from "@/pages/Compliance";
import BidRequests from "@/pages/community-management/BidRequests";
import CreateBidRequest from "@/pages/community-management/CreateBidRequest";
import HomeownerDetailPage from "@/pages/HomeownerDetailPage";
import Amenities from "@/pages/Amenities";
import Events from "@/pages/Events";

// Community Management Routes
export const communityManagementRoutes: RouteObject[] = [
  // Redirect routes for legacy paths
  {
    path: "/bid-requests",
    element: <RequireAuth><BidRequests /></RequireAuth>
  },
  {
    path: "/associations",
    element: <RequireAuth><Associations /></RequireAuth>
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
    path: "/community-management/homeowner-requests",
    element: <RequireAuth><HomeownerRequestsQueue /></RequireAuth>
  },
  {
    path: "/compliance",
    element: <RequireAuth><Compliance /></RequireAuth>
  },
  {
    path: "/amenities",
    element: <RequireAuth><Amenities /></RequireAuth>
  },
  {
    path: "/events",
    element: <RequireAuth><Events /></RequireAuth>
  },
  {
    path: "/community-management/bid-requests",
    element: <RequireAuth><BidRequests /></RequireAuth>
  },
  {
    path: "/community-management/create-bid-request",
    element: <RequireAuth><CreateBidRequest /></RequireAuth>
  }
];
