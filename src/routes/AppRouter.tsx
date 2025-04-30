
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { mainRoutes } from './mainRoutes';
import { communityManagementRoutes } from './communityManagementRoutes';
import { accountingRoutes } from './accountingRoutes';
import { communicationsRoutes } from './communicationsRoutes';
import { leadManagementRoutes } from './leadManagementRoutes';
import { operationsRoutes } from './operationsRoutes';
import { recordsReportsRoutes } from './recordsReportsRoutes';
import { resaleManagementRoutes } from './resaleManagementRoutes';
import { systemRoutes } from './systemRoutes';
import { portalRoutes } from './portalRoutes';
import { portalPageRoutes } from './portalPageRoutes';
import { resalePortalRoutes } from './resalePortalRoutes';

/**
 * Main application router component that consolidates all routes
 */
export const AppRouter = () => {
  const location = useLocation();
  
  // Log routing for debugging purposes
  React.useEffect(() => {
    console.log('Route changed:', location.pathname);
  }, [location]);

  return (
    <Routes>
      {/* Main routes */}
      {mainRoutes.map((route, index) => (
        <Route 
          key={`main-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Portal routes */}
      {portalRoutes}
      
      {/* Portal page routes */}
      {portalPageRoutes}
      
      {/* Resale Portal routes */}
      {resalePortalRoutes}
      
      {/* Community Management routes */}
      {communityManagementRoutes.map((route, index) => (
        <Route 
          key={`community-mgmt-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Accounting routes */}
      {accountingRoutes.map((route, index) => (
        <Route 
          key={`accounting-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Communications routes */}
      {communicationsRoutes.map((route, index) => (
        <Route 
          key={`communications-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Lead Management routes */}
      {leadManagementRoutes.map((route, index) => (
        <Route 
          key={`lead-mgmt-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Operations routes */}
      {operationsRoutes.map((route, index) => (
        <Route 
          key={`operations-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Records & Reports routes */}
      {recordsReportsRoutes.map((route, index) => (
        <Route 
          key={`records-reports-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Resale Management routes */}
      {resaleManagementRoutes.map((route, index) => (
        <Route 
          key={`resale-mgmt-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* System routes */}
      {systemRoutes.map((route, index) => (
        <Route 
          key={`system-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
    </Routes>
  );
};
