
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Card } from '@/components/ui/card';

export const AppDiagnostics: React.FC = () => {
  const { user, profile, loading, isAuthenticated, currentAssociation, userAssociations } = useAuth();

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">App Diagnostics</h3>
      
      <div className="space-y-2">
        <div><strong>Auth Loading:</strong> {loading ? 'Yes' : 'No'}</div>
        <div><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
        <div><strong>User ID:</strong> {user?.id || 'None'}</div>
        <div><strong>User Email:</strong> {user?.email || 'None'}</div>
        <div><strong>Profile Loaded:</strong> {profile ? 'Yes' : 'No'}</div>
        <div><strong>User Role:</strong> {profile?.role || 'None'}</div>
        <div><strong>Current Association:</strong> {currentAssociation?.name || 'None'}</div>
        <div><strong>User Associations Count:</strong> {userAssociations?.length || 0}</div>
        <div><strong>Current Route:</strong> {window.location.pathname}</div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium">Console Logs</h4>
        <p className="text-sm text-gray-600">Check browser console for detailed authentication flow logs</p>
      </div>
    </Card>
  );
};
