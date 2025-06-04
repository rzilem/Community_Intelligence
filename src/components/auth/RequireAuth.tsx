
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAssociation?: boolean;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  allowedRoles = ['admin', 'manager', 'resident', 'maintenance', 'accountant'],
  requireAssociation = false
}) => {
  const { user, loading, userRole, currentAssociation, userAssociations, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('[RequireAuth] Auth state check:', { 
      loading, 
      isAuthenticated, 
      user: !!user, 
      userRole,
      currentPath: location.pathname 
    });

    // Don't do anything while still loading auth state
    if (loading) {
      console.log('[RequireAuth] Still loading auth state');
      return;
    }
    
    // If not authenticated, redirect to login
    if (!user || !isAuthenticated) {
      console.log('[RequireAuth] User not authenticated, redirecting to login');
      toast.error('Please sign in to access this page');
      navigate('/auth?tab=login', { 
        state: { from: location.pathname },
        replace: true
      });
      return;
    }
    
    // Check if the user needs to have an associated HOA to access this page
    if (requireAssociation && (!userAssociations || userAssociations.length === 0)) {
      console.log('[RequireAuth] User has no HOA associations, redirecting to dashboard');
      toast.error('You need to be associated with an HOA to access this page');
      navigate('/dashboard', { replace: true });
      return;
    }

    // Check role permissions (only if allowedRoles is specified and not empty)
    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
      console.log(`[RequireAuth] User role ${userRole} not in allowed roles, redirecting`);
      toast.error('You do not have permission to access this page');
      navigate('/dashboard', { replace: true });
      return;
    }

    console.log('[RequireAuth] User authenticated and authorized to access page');
  }, [user, loading, userRole, navigate, location.pathname, allowedRoles, requireAssociation, userAssociations, isAuthenticated]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If we reach here and user is authenticated, render children
  if (user && isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback loading state (shouldn't normally reach here)
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-16 w-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg">Checking permissions...</p>
      </div>
    </div>
  );
};

export default RequireAuth;
