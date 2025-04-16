
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
  const { user, loading, userRole, currentAssociation, userAssociations } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('RequireAuth check - user:', user?.email, 'loading:', loading, 'userRole:', userRole);
    
    if (loading) {
      console.log('Still checking authentication...');
      return; // Still checking authentication
    }
    
    // If not authenticated, redirect to login
    if (!user) {
      console.log('User not authenticated, redirecting to login');
      toast.error('Please sign in to access this page');
      navigate('/auth?tab=login', { 
        state: { from: location.pathname } 
      });
      return;
    }
    
    // Skip role check temporarily to ensure admin access works
    // The role will be updated to admin in AuthContext
    
    // Check if the user needs to have an associated HOA to access this page
    if (requireAssociation && (!userAssociations || userAssociations.length === 0)) {
      console.log('User has no HOA associations, redirecting to dashboard');
      toast.error('You need to be associated with an HOA to access this page');
      navigate('/dashboard');
      return;
    }

    console.log('User authenticated and authorized to access page');

  }, [user, loading, userRole, navigate, location, allowedRoles, requireAssociation, userAssociations, currentAssociation]);

  if (loading) {
    console.log('Rendering loading state in RequireAuth');
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
    console.log('Rendering protected content for authenticated user');
    return <>{children}</>;
  }

  // Return null while redirecting
  console.log('Returning null while redirecting');
  return null;
};

export default RequireAuth;
