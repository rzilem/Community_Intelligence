
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
import PortalSelection from '../pages/portal/PortalSelection';
import Index from '../pages/Index';
import RequireAuth from '../components/auth/RequireAuth';

const renderRoutes = (routes, keyPrefix) => {
  if (!routes) return null;
  
  return routes.map((route, index) => {
    if (React.isValidElement(route)) {
      return React.cloneElement(route, { key: `${keyPrefix}-route-${index}` });
    }
    
    const RouteElement = route.protected ? (
      <Route 
        key={`${keyPrefix}-route-${index}`} 
        path={route.path} 
        element={<RequireAuth>{route.element}</RequireAuth>} 
      />
    ) : (
      <Route 
        key={`${keyPrefix}-route-${index}`} 
        path={route.path} 
        element={route.element} 
      />
    );
    
    return RouteElement;
  });
};

export const AppRouter = () => {
  const location = useLocation();
  
  React.useEffect(() => {
    console.log('Route changed:', location.pathname);
  }, [location]);

  return (
    <Routes>
      {/* Root route for the landing page */}
      <Route path="/" element={<Index />} />
      
      {renderRoutes(mainRoutes, 'main')}
      
      <Route path="/forum" element={<ForumPage />} />
      
      {renderRoutes(portalRoutes, 'portal')}
      
      {renderRoutes(portalPageRoutes, 'portal-page')}
      
      {renderRoutes(resalePortalRoutes, 'resale-portal')}
      
      {renderRoutes(communityManagementRoutes, 'community-mgmt')}
      
      {renderRoutes(accountingRoutes, 'accounting')}
      
      {renderRoutes(communicationsRoutes, 'communications')}
      
      {renderRoutes(leadManagementRoutes, 'lead-mgmt')}
      
      {renderRoutes(operationsRoutes, 'operations')}
      
      {renderRoutes(recordsReportsRoutes, 'records-reports')}
      
      {renderRoutes(resaleManagementRoutes, 'resale-mgmt')}
      
      {renderRoutes(systemRoutes, 'system')}
      
      <Route path="/portal" element={<PortalSelection />} />
    </Routes>
  );
};
