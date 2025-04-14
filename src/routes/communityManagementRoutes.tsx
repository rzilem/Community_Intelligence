
import React from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import CommunityManagement from '@/pages/community-management/CommunityManagement';
import CreateBidRequest from '@/pages/community-management/CreateBidRequest';
import HomeownerRequestsQueue from '@/pages/community-management/HomeownerRequestsQueue';
import BidRequests from '@/pages/community-management/BidRequests';

export const communityManagementRoutes = [
  {
    path: '/community-management',
    element: (
      <RequireAuth>
        <CommunityManagement />
      </RequireAuth>
    ),
  },
  {
    path: '/community-management/homeowner-requests',
    element: (
      <RequireAuth>
        <HomeownerRequestsQueue />
      </RequireAuth>
    ),
  },
  {
    path: '/community-management/create-bid-request',
    element: (
      <RequireAuth>
        <CreateBidRequest />
      </RequireAuth>
    ),
  },
  // Add the new route for bid requests
  {
    path: '/bid-requests',
    element: (
      <RequireAuth>
        <BidRequests />
      </RequireAuth>
    ),
  }
];
