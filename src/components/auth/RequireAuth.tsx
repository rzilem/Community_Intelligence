
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import usePermissions from '@/hooks/users/usePermissions';

interface RequireAuthProps {
  children: React.ReactNode;
  menuId?: string;
  submenuId?: string;
  requiredAccess?: 'read' | 'full';
  allowedRoles?: string[];
  requireAssociation?: boolean;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  menuId,
  submenuId,
  requiredAccess = 'read',
  allowedRoles = ['admin', 'manager', 'resident', 'maintenance', 'accountant'],
  requireAssociation = false
}) => {
  const { user, loading, userRole, currentAssociation, userAssociations, isAuthenticated } = useAuth();
  const { checkPermission } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  // Special case for resale portal routes
  const isResalePortalRoute = location.pathname.startsWith('/resale-portal');
  const resalePortalRoles = ['admin', 'manager', 'title-agent', 'real-estate-agent'];
  
  // Use resale portal roles if it's a resale portal route
  const effectiveAllowedRoles = isResalePortalRoute ? resalePortalRoles : allowedRoles;

  console.log('[RequireAuth] Current auth state:', { 
    isAuthenticated, 
    user: user?.email, 
    loading, 
    userRole,
    currentPath: location.pathname,
    effectiveAllowedRoles
  });

  useEffect(() => {
    if (loading) {
      console.log('[RequireAuth] Still checking authentication...');
      return; // Still checking authentication
    }
    
    // If not authenticated, redirect to login
    if (!user) {
      console.log('[RequireAuth] User not authenticated, redirecting to login');
      toast.error('Please sign in to access this page');
      navigate('/auth?tab=login', { 
        state: { from: location.pathname },
        replace: true // Use replace to avoid building up history stack
      });
      return;
    }
    
    // Check if the user needs to have an associated HOA to access this page
    // Skip this check for resale portal routes
    if (!isResalePortalRoute && requireAssociation && (!userAssociations || userAssociations.length === 0)) {
      console.log('[RequireAuth] User has no HOA associations, redirecting to dashboard');
      toast.error('You need to be associated with an HOA to access this page');
      navigate('/dashboard');
      return;
    }

    // Check role-based access
    if (effectiveAllowedRoles.length > 0 && userRole && !effectiveAllowedRoles.includes(userRole)) {
      console.log(`[RequireAuth] User role ${userRole} not in allowed roles (${effectiveAllowedRoles.join(', ')}), redirecting`);
      toast.error('You do not have permission to access this page');
      navigate('/dashboard');
      return;
    }

    // Check menu/submenu permissions if specified
    if (menuId && userRole) {
      const hasAccess = checkPermission(menuId, submenuId, requiredAccess);
      if (!hasAccess) {
        console.log(`[RequireAuth] User lacks permission for ${menuId}/${submenuId || ''}, redirecting`);
        toast.error('You do not have permission to access this page');
        navigate('/dashboard');
        return;
      }
    }

    console.log('[RequireAuth] User authenticated and authorized to access page');
  }, [
    user, 
    loading, 
    userRole, 
    navigate, 
    location, 
    effectiveAllowedRoles, 
    requireAssociation, 
    userAssociations, 
    currentAssociation,
    menuId,
    submenuId,
    requiredAccess,
    checkPermission,
    isResalePortalRoute
  ]);

  if (loading) {
    console.log('[RequireAuth] Rendering loading state in RequireAuth');
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If no authentication check is in progress and we have a user, render the children
  if (!loading && user) {
    console.log('[RequireAuth] Rendering protected content for authenticated user');
    return <>{children}</>;
  }

  // Return null while redirecting
  console.log('[RequireAuth] Returning null while redirecting');
  return null;
};

export default RequireAuth;
