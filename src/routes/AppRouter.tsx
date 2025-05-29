
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import RequireAuth from '@/components/auth/RequireAuth';
import ErrorBoundary from '@/components/ErrorBoundary';

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
                <BidRequests />
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
        
        {/* Catch-all routes */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};
