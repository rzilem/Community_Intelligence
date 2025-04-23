
import React from 'react';
import { Route } from 'react-router-dom';
import HomeownerDashboard from '@/pages/portal/HomeownerDashboard';
import BoardDashboard from '@/pages/portal/BoardDashboard';
import VendorDashboard from '@/pages/portal/VendorDashboard';
import PortalManagement from '@/pages/system/PortalManagement';
import RequireAuth from '@/components/auth/RequireAuth';
import PortalSelection from '@/pages/portal/PortalSelection';
import CollectionsPage from '@/pages/portal/board/CollectionsPage';
import VendorBidsPage from '@/pages/portal/vendor/VendorBidsPage';
import RequestsPage from '@/pages/portal/homeowner/RequestsPage';
import BoardFormsPage from '@/pages/portal/board/FormsPage';
import HomeownerProfilePage from '@/pages/portal/homeowner/ProfilePage';
import BoardProfilePage from '@/pages/portal/board/ProfilePage';
import VendorProfilePage from '@/pages/portal/vendor/ProfilePage';

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
    key="homeowner-requests"
    path="/portal/homeowner/requests"
    element={
      <RequireAuth menuId="homeowner-portal">
        <RequestsPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="homeowner-profile"
    path="/portal/homeowner/profile"
    element={
      <RequireAuth menuId="homeowner-portal">
        <HomeownerProfilePage />
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
    key="board-forms"
    path="/portal/board/forms"
    element={
      <RequireAuth menuId="board-portal">
        <BoardFormsPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="board-profile"
    path="/portal/board/profile"
    element={
      <RequireAuth menuId="board-portal">
        <BoardProfilePage />
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
    key="vendor-bids"
    path="/portal/vendor/bids"
    element={
      <RequireAuth menuId="vendor-portal">
        <VendorBidsPage />
      </RequireAuth>
    }
  />,
  <Route 
    key="vendor-profile"
    path="/portal/vendor/profile"
    element={
      <RequireAuth menuId="vendor-portal">
        <VendorProfilePage />
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
  <Route 
    key="collections-page"
    path="/portal/board/collections"
    element={
      <RequireAuth menuId="board-portal">
        <CollectionsPage />
      </RequireAuth>
    }
  />,
];
