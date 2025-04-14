
import { RouteObject } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';
import CommunityManagement from '@/pages/community-management/CommunityManagement';
import BidRequests from '@/pages/community-management/BidRequests';
import CreateBidRequest from '@/pages/community-management/CreateBidRequest';
import HomeownerRequestsQueue from '@/pages/community-management/HomeownerRequestsQueue';

export const communityManagementRoutes: RouteObject[] = [
  {
    path: '/community-management',
    element: <RequireAuth><CommunityManagement /></RequireAuth>
  },
  {
    path: '/community-management/bid-requests',
    element: <RequireAuth><BidRequests /></RequireAuth>
  },
  {
    path: '/community-management/create-bid-request',
    element: <RequireAuth><CreateBidRequest /></RequireAuth>
  },
  {
    path: '/community-management/homeowner-requests',
    element: <RequireAuth><HomeownerRequestsQueue /></RequireAuth>
  }
];
