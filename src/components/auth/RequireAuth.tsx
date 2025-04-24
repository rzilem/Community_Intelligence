
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import usePermissions from '@/hooks/users/usePermissions';
import { TwoFactorVerification } from './two-factor/TwoFactorVerification';
import { getRoleBasedRedirect, canAccessPath } from '@/utils/role-redirects';
import { Profile } from '@/types/profile-types';

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
  const { user, loading, userRole, currentAssociation, userAssociations, isAuthenticated, requiresTwoFactor, verify2FA } = useAuth();
  const { checkPermission } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [showingTwoFactor, setShowingTwoFactor] = useState(false);

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
    effectiveAllowedRoles,
    requiresTwoFactor
  });

  // Handle 2FA verification if required
  useEffect(() => {
    if (requiresTwoFactor && !showingTwoFactor) {
      setShowingTwoFactor(true);
    }
  }, [requiresTwoFactor]);

  // Handle verification for 2FA
  const handleVerify = async (token: string): Promise<boolean> => {
    const success = await verify2FA(token);
    if (success) {
      setShowingTwoFactor(false);
    }
    return success;
  };

  useEffect(() => {
    if (loading) {
      console.log('[RequireAuth] Still checking authentication...');
      return; // Still checking authentication
    }
    
    // If 2FA verification is needed, show the verification UI
    if (requiresTwoFactor) {
      console.log('[RequireAuth] Two-factor verification required');
      return; // Show 2FA verification UI instead
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
      
      // Redirect to role-specific page based on user role
      if (user && userRole) {
        navigate(getRoleBasedRedirect({ id: user.id, role: userRole } as Profile));
      } else {
        navigate('/dashboard');
      }
      return;
    }

    // Check path access based on role
    if (userRole && !canAccessPath(userRole, location.pathname)) {
      console.log(`[RequireAuth] User role ${userRole} cannot access ${location.pathname}, redirecting`);
      toast.error('You do not have permission to access this page');
      navigate(getRoleBasedRedirect({ id: user.id, role: userRole } as Profile));
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
    isResalePortalRoute,
    requiresTwoFactor
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

  // Show 2FA verification UI if required
  if (requiresTwoFactor && user?.email) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <TwoFactorVerification 
          email={user.email}
          onVerify={handleVerify}
          onCancel={() => navigate('/auth?tab=login')}
          onRecoveryOption={() => navigate('/auth/recovery')}
        />
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
