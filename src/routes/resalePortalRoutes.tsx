
import React from 'react';
import { Route } from 'react-router-dom';
import ResalePortal from '@/pages/resale/ResalePortal';
import ResaleOrderProcess from '@/pages/resale/ResaleOrderProcess';
import ResaleOrderDetail from '@/pages/resale/ResaleOrderDetail';
import ResaleAccountSettings from '@/pages/resale/ResaleAccountSettings';
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
  />,
  <Route 
    key="resale-order-process"
    path="/resale-portal/order"
    element={
      <RequireAuth>
        <ResaleOrderProcess />
      </RequireAuth>
    }
  />,
  <Route 
    key="resale-order-detail"
    path="/resale-portal/orders/:orderId"
    element={
      <RequireAuth>
        <ResaleOrderDetail />
      </RequireAuth>
    }
  />,
  <Route 
    key="resale-account-settings"
    path="/resale-portal/settings"
    element={
      <RequireAuth>
        <ResaleAccountSettings />
      </RequireAuth>
    }
  />
];
