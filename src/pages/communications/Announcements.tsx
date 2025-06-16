
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import AnnouncementsDebug from './AnnouncementsDebug';

const Announcements = () => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log('[Announcements] Component render:', {
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
          <p>Please log in to view announcements.</p>
        </CardContent>
      </Card>
    );
  }

  return <AnnouncementsDebug />;
};

export default Announcements;
