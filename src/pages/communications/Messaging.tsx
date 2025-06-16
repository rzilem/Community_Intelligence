
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';

const Messaging = () => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log('[Messaging] Component render:', {
    user: user?.email,
    loading,
    isAuthenticated,
    currentPath: window.location.pathname
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to view messaging.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Messaging</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Messaging functionality is being developed.</p>
          <p className="text-sm text-muted-foreground mt-2">
            This page will allow you to send messages to residents and staff.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messaging;
