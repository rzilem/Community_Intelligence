
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  allowedRoles = ['admin', 'manager', 'resident', 'maintenance', 'accountant'] 
}) => {
  const { user, isLoading, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return; // Still checking authentication
    
    // If not authenticated, redirect to login
    if (!user) {
      toast.error('Please sign in to access this page');
      navigate('/auth?tab=login', { 
        state: { from: location.pathname } 
      });
      return;
    }
    
    // Check role-based access if allowed roles are provided
    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
      toast.error('You do not have permission to access this page');
      navigate('/dashboard');
      return;
    }
  }, [user, isLoading, userRole, navigate, location, allowedRoles]);

  if (isLoading) {
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
  if (!isLoading && user) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
};

export default RequireAuth;
