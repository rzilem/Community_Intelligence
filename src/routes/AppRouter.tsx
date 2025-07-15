
import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { mainRoutes } from './mainRoutes';
import { communityManagementRoutes } from './communityManagementRoutes';
import { accountingRoutes } from './accountingRoutes';
import { communicationsRoutes } from './communicationsRoutes';
import { leadManagementRoutes } from './leadManagementRoutes';
import { operationsRoutes } from './operationsRoutes';
import { recordsReportsRoutes } from './recordsReportsRoutes';
import { resaleManagementRoutes } from './resaleManagementRoutes';
import { systemRoutes } from './systemRoutes';
import { aiWorkflowRoutes } from './aiWorkflowRoutes';
import { enhancedEmailCampaignsRoutes } from './enhancedEmailCampaignsRoutes';

/**
 * Main application router component that consolidates all routes
 */
export const AppRouter = () => {
  const location = useLocation();
  
  // Log routing for debugging purposes
  useEffect(() => {
    console.log('Route changed:', location.pathname);
  }, [location.pathname]);

  const renderRoute = (route: any, index: number, prefix: string) => {
    try {
      return (
        <Route 
          key={`${prefix}-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      );
    } catch (error) {
      console.error(`Error rendering route ${route.path}:`, error);
      return (
        <Route 
          key={`${prefix}-error-route-${index}`} 
          path={route.path} 
          element={
            <div className="p-8 text-center">
              <h2 className="text-xl font-bold text-red-600 mb-4">Route Error</h2>
              <p>Error loading route: {route.path}</p>
            </div>
          } 
        />
      );
    }
  };

  return (
    <Routes>
      {/* Main routes */}
      {mainRoutes.map((route, index) => renderRoute(route, index, 'main'))}
      
      {/* Community Management routes */}
      {communityManagementRoutes.map((route, index) => renderRoute(route, index, 'community-mgmt'))}
      
      {/* Accounting routes */}
      {accountingRoutes.map((route, index) => renderRoute(route, index, 'accounting'))}
      
      {/* Communications routes */}
      {communicationsRoutes.map((route, index) => renderRoute(route, index, 'communications'))}
      
      {/* Lead Management routes */}
      {leadManagementRoutes.map((route, index) => renderRoute(route, index, 'lead-mgmt'))}
      
      {/* Operations routes */}
      {operationsRoutes.map((route, index) => renderRoute(route, index, 'operations'))}
      
      {/* Records & Reports routes */}
      {recordsReportsRoutes.map((route, index) => renderRoute(route, index, 'records-reports'))}
      
      {/* Resale Management routes */}
      {resaleManagementRoutes.map((route, index) => renderRoute(route, index, 'resale-mgmt'))}
      
      {/* System routes */}
      {systemRoutes.map((route, index) => renderRoute(route, index, 'system'))}
      
      {/* AI Workflow routes */}
      {aiWorkflowRoutes.map((route, index) => renderRoute(route, index, 'ai-workflow'))}
      
      {/* Enhanced Email Campaigns routes */}
      {enhancedEmailCampaignsRoutes.map((route, index) => renderRoute(route, index, 'enhanced-email-campaigns'))}
      
      {/* Redirect routes for legacy/mismatched paths */}
      <Route path="/proposals" element={<Navigate to="/lead-management/proposals" replace />} />
      <Route path="/workflows" element={<Navigate to="/operations/workflows" replace />} />
      <Route path="/vendors" element={<Navigate to="/operations/vendors" replace />} />
      <Route path="/documents" element={<Navigate to="/records-reports/documents" replace />} />
      <Route path="/reports" element={<Navigate to="/records-reports/reports" replace />} />
      <Route path="/invoices" element={<Navigate to="/accounting/invoices" replace />} />
      <Route path="/accounts-receivable" element={<Navigate to="/accounting/accounts-receivable" replace />} />
      <Route path="/accounts-payable" element={<Navigate to="/accounting/accounts-payable" replace />} />
      <Route path="/general-ledger" element={<Navigate to="/accounting/general-ledger" replace />} />
      <Route path="/chart-of-accounts" element={<Navigate to="/accounting/chart-of-accounts" replace />} />
      <Route path="/financial-reports" element={<Navigate to="/accounting/financial-reports" replace />} />
      <Route path="/assessment-schedules" element={<Navigate to="/accounting/assessment-schedules" replace />} />
      <Route path="/leads" element={<Navigate to="/lead-management/leads" replace />} />
      <Route path="/lead-follow-ups" element={<Navigate to="/lead-management/lead-follow-ups" replace />} />
      <Route path="/work-orders" element={<Navigate to="/operations/work-orders" replace />} />
      <Route path="/inspections" element={<Navigate to="/operations/inspections" replace />} />
      <Route path="/backup-archive" element={<Navigate to="/records-reports/backup-archive" replace />} />
      
      {/* Catch-all route for undefined paths */}
      <Route 
        path="*" 
        element={
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Page Not Found</h2>
            <p className="mb-4">The page you're looking for doesn't exist.</p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </button>
          </div>
        } 
      />
    </Routes>
  );
};
