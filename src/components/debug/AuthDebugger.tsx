
import React from 'react';
import { useAuth } from '@/contexts/auth';

export const AuthDebugger: React.FC = () => {
  const { user, profile, loading, isAuthenticated, currentAssociation, userAssociations } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {loading ? 'YES' : 'NO'}</div>
        <div>Authenticated: {isAuthenticated ? 'YES' : 'NO'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <div>User Email: {user?.email || 'None'}</div>
        <div>Profile: {profile ? 'Loaded' : 'None'}</div>
        <div>Role: {profile?.role || 'None'}</div>
        <div>Current Route: {window.location.pathname}</div>
        <div>Associations: {userAssociations?.length || 0}</div>
        <div>Current Assoc: {currentAssociation?.name || 'None'}</div>
      </div>
    </div>
  );
};
