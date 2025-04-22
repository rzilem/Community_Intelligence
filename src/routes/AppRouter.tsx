
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomeownerListPage from '@/pages/homeowners/HomeownerListPage';
import HomeownerDetailPage from '@/pages/HomeownerDetailPage';
import ClientPortal from '@/pages/ClientPortal';
import { portalRoutes } from './portalRoutes';
import { portalPageRoutes } from './portalPageRoutes';
import HomeownerPortalPage from '@/pages/portal/HomeownerPortalPage';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuth } from '@/contexts/auth';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/homeowners" replace />} />
      <Route path="/homeowners" element={<HomeownerListPage />} />
      <Route path="/homeowners/:id" element={<HomeownerDetailPage />} />
      <Route path="/portal/homeowner" element={<HomeownerPortalPage />} />
      
      {/* Client Portal for proposals */}
      <Route path="/proposals/:proposalId" element={<ClientPortal />} />
      
      {/* Include portal routes */}
      {portalRoutes}
      {portalPageRoutes}
      
      {/* Main App Routes (authentication required) */}
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      
      {/* Authentication Routes (no authentication required) */}
      <Route path="/auth" element={<Auth />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
