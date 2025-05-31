
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import InvitationPage from '@/pages/InvitationPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import ErrorBoundary from '@/components/ErrorBoundary';
import { protectedRoutes } from './routeConfig';

export const AppRouter = () => {
  const location = useLocation();
  
  console.log('🚀 AppRouter: Rendering with location:', location.pathname);
  console.log('🚀 AppRouter: Protected routes count:', protectedRoutes.length);

  return (
    <Routes>
      {/* Public routes - no layout wrapper needed */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/invitation/:token" element={<InvitationPage />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      
      {/* Protected routes - wrapped in AppLayout */}
      <Route path="/*" element={<AppLayout />}>
        {protectedRoutes.map((route, index) => {
          console.log(`🚀 AppRouter: Mapping route ${index}: ${route.path}`);
          return (
            <Route 
              key={`route-${index}-${route.path}`}
              path={route.path} 
              element={route.element} 
            />
          );
        })}
        
        {/* Legacy redirects for backward compatibility */}
        <Route path="properties" element={<Navigate to="/associations" replace />} />
        <Route path="residents" element={<Navigate to="/homeowners" replace />} />
        <Route path="residents/:id" element={<Navigate to="/homeowners/:id" replace />} />
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={
          <ErrorBoundary>
            <NotFound />
          </ErrorBoundary>
        } />
      </Route>
    </Routes>
  );
};
