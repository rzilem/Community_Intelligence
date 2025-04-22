
import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';

interface RequireAuthProps {
  children: ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // For now, just render the children directly to bypass authentication
    // This is temporary to debug the loading issue
    setShouldRender(true);
  }, [user, isLoading]);

  // Debug logging
  useEffect(() => {
    console.log("Auth state:", { user, isLoading, shouldRender });
  }, [user, isLoading, shouldRender]);

  // Temporary fix: bypass auth check to see if pages load
  return <>{children}</>;

  // Original authentication logic (commented out for debugging)
  /*
  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
  */
};
