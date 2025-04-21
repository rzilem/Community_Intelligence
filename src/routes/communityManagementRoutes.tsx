
import { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Associations from "@/pages/Associations";
import Homeowners from "@/pages/Homeowners";
import HomeownerRequestsQueue from "@/pages/community-management/HomeownerRequestsQueue";
import Compliance from "@/pages/Compliance";
import BidRequests from "@/pages/community-management/BidRequests";
import HomeownerDetailPage from "@/pages/HomeownerDetailPage";
import ResaleCertificate from "@/pages/resale-management/ResaleCertificate";
import CreateBidRequest from "@/pages/community-management/CreateBidRequest";

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
    path: "/bid-requests",
    element: <RequireAuth><BidRequests /></RequireAuth>
  },
  {
    path: "/community-management/create-bid-request",
    element: <RequireAuth><CreateBidRequest /></RequireAuth>
  },
  {
    path: "/resale-management/certificate",
    element: <RequireAuth><ResaleCertificate /></RequireAuth>
  }
];
