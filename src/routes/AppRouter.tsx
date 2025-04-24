
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ForumPage from '../pages/forum/ForumPage';
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

export const AppRouter = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    console.log('Route changed:', location.pathname);
  }, [location]);

  return (
    <Routes>
      {/* Main routes */}
      {mainRoutes && mainRoutes.map((route, index) => (
        <Route 
          key={`main-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Add Forum Route */}
      <Route path="/forum" element={<ForumPage />} />
      
      {/* Portal routes - these are already Route elements */}
      {portalRoutes && portalRoutes.map((route, index) => React.cloneElement(route, { key: `portal-route-${index}` }))}
      
      {/* Portal page routes - these are already Route elements */}
      {portalPageRoutes && portalPageRoutes.map((route, index) => React.cloneElement(route, { key: `portal-page-route-${index}` }))}
      
      {/* Resale Portal routes - these are already Route elements */}
      {resalePortalRoutes && resalePortalRoutes.map((route, index) => React.cloneElement(route, { key: `resale-portal-route-${index}` }))}
      
      {/* Community Management routes */}
      {communityManagementRoutes && communityManagementRoutes.map((route, index) => (
        <Route 
          key={`community-mgmt-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Accounting routes */}
      {accountingRoutes && accountingRoutes.map((route, index) => (
        <Route 
          key={`accounting-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Communications routes */}
      {communicationsRoutes && communicationsRoutes.map((route, index) => (
        <Route 
          key={`communications-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Lead Management routes */}
      {leadManagementRoutes && leadManagementRoutes.map((route, index) => (
        <Route 
          key={`lead-mgmt-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Operations routes */}
      {operationsRoutes && operationsRoutes.map((route, index) => (
        <Route 
          key={`operations-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Records & Reports routes */}
      {recordsReportsRoutes && recordsReportsRoutes.map((route, index) => (
        <Route 
          key={`records-reports-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* Resale Management routes */}
      {resaleManagementRoutes && resaleManagementRoutes.map((route, index) => (
        <Route 
          key={`resale-mgmt-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
      
      {/* System routes */}
      {systemRoutes && systemRoutes.map((route, index) => (
        <Route 
          key={`system-route-${index}`} 
          path={route.path} 
          element={route.element} 
        />
      ))}
    </Routes>
  );
};
