
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

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
    if (loading) {
      return; // Still checking authentication
    }
    
    // If not authenticated, redirect to login
    if (!user) {
      toast.error('Please sign in to access this page');
      navigate('/auth?tab=login', { 
        state: { from: location.pathname },
        replace: true
      });
      return;
    }
    
    // Check if the user needs to have an associated HOA to access this page
    if (requireAssociation && (!userAssociations || userAssociations.length === 0)) {
      toast.error('You need to be associated with an HOA to access this page');
      navigate('/dashboard');
      return;
    }

    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
      toast.error('You do not have permission to access this page');
      navigate('/dashboard');
      return;
    }
  }, [user, loading, userRole, navigate, location, allowedRoles, requireAssociation, userAssociations, currentAssociation]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }
  
  return <>{children}</>;
};

export default RequireAuth;
