import React from 'react';
import { Route } from 'react-router-dom';
import HomeownerDashboard from '@/pages/portal/HomeownerDashboard';
import BoardDashboard from '@/pages/portal/BoardDashboard';
import VendorDashboard from '@/pages/portal/VendorDashboard';
import PortalManagement from '@/pages/system/PortalManagement';
import RequireAuth from '@/components/auth/RequireAuth';
import PortalSelection from '@/pages/portal/PortalSelection';

export const portalRoutes = [
  <Route 
    key="portal-selection"
    path="/portal"
    element={
      <RequireAuth>
        <PortalSelection />
      </RequireAuth>
    }
  />,
  <Route 
    key="homeowner-portal"
    path="/portal/homeowner"
    element={
      <RequireAuth menuId="homeowner-portal">
        <HomeownerDashboard />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-portal"
    path="/portal/board"
    element={
      <RequireAuth menuId="board-portal">
        <BoardDashboard />
      </RequireAuth>
    }
  />,
  <Route 
    key="vendor-portal"
    path="/portal/vendor"
    element={
      <RequireAuth menuId="vendor-portal">
        <VendorDashboard />
      </RequireAuth>
    }
  />,
  <Route 
    key="portal-management"
    path="/system/portal-management"
    element={
      <RequireAuth menuId="system" submenuId="settings" requiredAccess="full">
        <PortalManagement />
      </RequireAuth>
    }
  />,
];
