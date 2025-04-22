import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomeownerListPage from '@/pages/homeowners/HomeownerListPage';
import HomeownerDetailPage from '@/pages/HomeownerDetailPage';
import ClientPortal from '@/pages/ClientPortal';
import { portalRoutes } from './portalRoutes';
import { portalPageRoutes } from './portalPageRoutes';
import HomeownerPortalPage from '@/pages/portal/HomeownerPortalPage';
import AssociationListPage from '@/pages/associations/AssociationListPage';
import AssociationDetailPage from '@/pages/associations/AssociationDetailPage';
import SystemSettingsPage from '@/pages/system/SystemSettingsPage';
import UserManagementPage from '@/pages/system/UserManagementPage';
import RoleManagementPage from '@/pages/system/RoleManagementPage';
import AuditLogPage from '@/pages/system/AuditLogPage';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuth } from '@/contexts/auth';
import ResetPassword from '@/pages/auth/ResetPassword';
import { ResalePortalRoutes } from './resalePortalRoutes';
import { MaintenanceRequestRoutes } from './maintenanceRequestRoutes';
import { CommunicationRoutes } from './communicationRoutes';
import { DirectoryRoutes } from './directoryRoutes';
import { DocumentRoutes } from './documentRoutes';
import { CalendarRoutes } from './calendarRoutes';
import { TaskRoutes } from './taskRoutes';
import { VendorRoutes } from './vendorRoutes';
import { FinancialRoutes } from './financialRoutes';
import { ResalePortalPublicRoutes } from './resalePortalPublicRoutes';
import { FormRoutes } from './formRoutes';

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
      
      {/* Resale Portal Public Routes (no authentication required) */}
      {ResalePortalPublicRoutes}

      {/* Resale Portal Routes (authentication required) */}
      {ResalePortalRoutes}

      {/* Main App Routes (authentication required) */}
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/associations" element={<RequireAuth><AssociationListPage /></RequireAuth>} />
      <Route path="/associations/:id" element={<RequireAuth><AssociationDetailPage /></RequireAuth>} />
      <Route path="/system/settings" element={<RequireAuth menuId="system" submenuId="settings" requiredAccess="full"><SystemSettingsPage /></RequireAuth>} />
      <Route path="/system/users" element={<RequireAuth menuId="system" submenuId="users" requiredAccess="full"><UserManagementPage /></RequireAuth>} />
      <Route path="/system/roles" element={<RequireAuth menuId="system" submenuId="roles" requiredAccess="full"><RoleManagementPage /></RequireAuth>} />
      <Route path="/system/audit-log" element={<RequireAuth menuId="system" submenuId="audit-log" requiredAccess="full"><AuditLogPage /></RequireAuth>} />

      {/* Include maintenance request routes */}
      {MaintenanceRequestRoutes}

      {/* Include communication routes */}
      {CommunicationRoutes}

      {/* Include directory routes */}
      {DirectoryRoutes}

      {/* Include document routes */}
      {DocumentRoutes}

      {/* Include calendar routes */}
      {CalendarRoutes}

      {/* Task Routes */}
      {TaskRoutes}

      {/* Vendor Routes */}
      {VendorRoutes}

      {/* Financial Routes */}
      {FinancialRoutes}

      {/* Form Routes */}
      {FormRoutes}

      {/* Authentication Routes (no authentication required) */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
