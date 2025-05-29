
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import RequireAuth from '@/components/auth/RequireAuth';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import all route collections
import { communityManagementRoutes } from './communityManagementRoutes';
import { operationsRoutes } from './operationsRoutes';
import { accountingRoutes } from './accountingRoutes';
import { resaleManagementRoutes } from './resaleManagementRoutes';
import { recordsReportsRoutes } from './recordsReportsRoutes';
import { leadManagementRoutes } from './leadManagementRoutes';
import { systemRoutes } from './systemRoutes';
import { communicationsRoutes } from './communicationsRoutes';
import { adminRoutes } from './adminRoutes';

// Lazy load route components for better performance
const CommunityManagement = React.lazy(() => import('@/pages/community-management/CommunityManagement'));
const CreateBidRequest = React.lazy(() => import('@/pages/community-management/CreateBidRequest'));
const BidRequests = React.lazy(() => import('@/pages/community-management/BidRequests'));

const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <React.Suspense fallback={
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  }>
    {children}
  </React.Suspense>
);

// Helper function to create route elements with proper wrapping
const createRouteElement = (element: React.ReactElement, allowedRoles?: string[]) => (
  <RequireAuth allowedRoles={allowedRoles}>
    <SuspenseWrapper>
      <ErrorBoundary>
        {element}
      </ErrorBoundary>
    </SuspenseWrapper>
  </RequireAuth>
);

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Index />} />
        <Route path="auth" element={<Auth />} />
        
        {/* Protected Routes */}
        <Route path="dashboard" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } />
        
        {/* Community Management Routes */}
        <Route path="community-management" element={
          <RequireAuth allowedRoles={['admin', 'manager']}>
            <SuspenseWrapper>
              <ErrorBoundary>
                <CommunityManagement />
              </ErrorBoundary>
            </SuspenseWrapper>
          </RequireAuth>
        } />
        
        <Route path="community-management/bid-requests" element={
          <RequireAuth allowedRoles={['admin', 'manager']}>
            <SuspenseWrapper>
              <ErrorBoundary>
                <BidRequests associationId="default" />
              </ErrorBoundary>
            </SuspenseWrapper>
          </RequireAuth>
        } />
        
        <Route path="community-management/bid-requests/new" element={
          <RequireAuth allowedRoles={['admin', 'manager']}>
            <SuspenseWrapper>
              <ErrorBoundary>
                <CreateBidRequest />
              </ErrorBoundary>
            </SuspenseWrapper>
          </RequireAuth>
        } />

        {/* Add all missing route collections */}
        {communityManagementRoutes.map((route, index) => (
          <Route 
            key={`community-${index}`} 
            path={route.path} 
            element={route.element} 
          />
        ))}

        {operationsRoutes.map((route, index) => (
          <Route 
            key={`operations-${index}`} 
            path={route.path} 
            element={createRouteElement(route.element, ['admin', 'manager', 'maintenance'])} 
          />
        ))}

        {accountingRoutes.map((route, index) => (
          <Route 
            key={`accounting-${index}`} 
            path={route.path} 
            element={route.element} 
          />
        ))}

        {resaleManagementRoutes.map((route, index) => (
          <Route 
            key={`resale-${index}`} 
            path={route.path} 
            element={route.element} 
          />
        ))}

        {recordsReportsRoutes.map((route, index) => (
          <Route 
            key={`records-${index}`} 
            path={route.path} 
            element={createRouteElement(route.element, ['admin', 'manager', 'resident'])} 
          />
        ))}

        {leadManagementRoutes.map((route, index) => (
          <Route 
            key={`lead-${index}`} 
            path={route.path} 
            element={route.element} 
          />
        ))}

        {systemRoutes.map((route, index) => (
          <Route 
            key={`system-${index}`} 
            path={route.path} 
            element={route.element} 
          />
        ))}

        {communicationsRoutes.map((route, index) => (
          <Route 
            key={`communications-${index}`} 
            path={route.path} 
            element={route.element} 
          />
        ))}

        {adminRoutes.map((route, index) => (
          <Route 
            key={`admin-${index}`} 
            path={route.path} 
            element={route.element} 
          />
        ))}
        
        {/* Catch-all routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
