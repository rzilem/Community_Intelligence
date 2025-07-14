
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface SimpleRequireAuthProps {
  children: React.ReactNode;
}

export const SimpleRequireAuth: React.FC<SimpleRequireAuthProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('[SimpleRequireAuth] State:', { 
    loading, 
    isAuthenticated, 
    userExists: !!user, 
    currentPath: location.pathname 
  });

  useEffect(() => {
    // Don't do anything while still loading
    if (loading) {
      console.log('[SimpleRequireAuth] Still loading auth state');
      return;
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      console.log('[SimpleRequireAuth] User not authenticated, redirecting to login');
      navigate('/auth?tab=login', { 
        state: { from: location.pathname },
        replace: true
      });
      return;
    }

    console.log('[SimpleRequireAuth] User authenticated, allowing access');
  }, [user, loading, isAuthenticated, navigate, location.pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary mb-4" />
          <p className="text-lg">Loading...</p>
          <p className="text-sm text-muted-foreground mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // If we reach here and user is authenticated, render children
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // Fallback loading state
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary mb-4" />
        <p className="text-lg">Redirecting...</p>
      </div>
    </div>
  );
};
