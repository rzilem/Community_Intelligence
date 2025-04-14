import React from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import CommunityManagement from '@/pages/community-management/CommunityManagement';
import CreateBidRequest from '@/pages/community-management/CreateBidRequest';
import HomeownerRequestsQueue from '@/pages/community-management/HomeownerRequestsQueue';
import BidRequests from '@/pages/community-management/BidRequests';
import ProposalRequest from '@/pages/community-management/ProposalRequest';

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
  {
    path: '/community-management/proposal-request',
    element: (
      <RequireAuth>
        <ProposalRequest />
      </RequireAuth>
    ),
  },
  {
    path: '/bid-requests',
    element: (
      <RequireAuth>
        <BidRequests />
      </RequireAuth>
    ),
  }
];
