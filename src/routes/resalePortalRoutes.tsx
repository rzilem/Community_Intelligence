
import React from 'react';
import { Route } from 'react-router-dom';
import ResalePortal from '@/pages/resale/ResalePortal';
import RequireAuth from '@/components/auth/RequireAuth';

export const resalePortalRoutes = [
  <Route 
    key="resale-portal"
    path="/resale-portal"
    element={
      <ResalePortal />
    }
  />,
  <Route 
    key="resale-portal-protected"
    path="/resale-portal/my-orders"
    element={
      <RequireAuth>
        <ResalePortal />
      </RequireAuth>
    }
  />
];
