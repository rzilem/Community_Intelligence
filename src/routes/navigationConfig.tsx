
import { Route } from './types';
import { protectedRoutes } from './routeConfig';

// Get unique navigation items from all routes
export const navigationItems: Route[] = protectedRoutes.filter(route => 
  route.label && route.icon && !route.path.includes(':') && !route.path.includes('/')
).sort((a, b) => {
  // Sort order for main navigation items
  const order = [
    'dashboard',
    'homeowners', 
    'associations',
    'amenities',
    'customer-service',
    'accounting',
    'billing',
    'lead-management',
    'onboarding',
    'communication-templates',
    'events',
    'portfolio',
    'reports',
    'ai-query',
    'admin',
    'settings'
  ];
  
  const aIndex = order.indexOf(a.path);
  const bIndex = order.indexOf(b.path);
  
  if (aIndex === -1 && bIndex === -1) return 0;
  if (aIndex === -1) return 1;
  if (bIndex === -1) return -1;
  
  return aIndex - bIndex;
});
