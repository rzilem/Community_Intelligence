
import React from 'react';
import { Profile } from '@/types/app-types';
import CalendarTab from '@/components/dashboard/CalendarTab';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import MessagesFeed from '@/components/dashboard/MessagesFeed';
import TreasurerDashboard from '@/components/dashboard/TreasurerDashboard';
import { UserRole } from '@/types/user-types';

export const useDashboardRoleContent = (
  user: Profile | null,
  recentActivity: any[] = [],
  loading: boolean = false,
  error: Error | null = null
) => {
  const getContentForRole = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'admin':
      case 'manager':
      case 'resident':
      case 'maintenance':
      case 'accountant':
      case 'user':
      default:
        return (
          <>
            <div className="space-y-4">
              <CalendarTab />
            </div>
          </>
        );
    }
  };
  
  const getActivityContent = () => {
    return (
      <ActivityFeed 
        recentActivity={recentActivity} 
        loading={loading}
        error={error} 
      />
    );
  };
  
  const getMessagesContent = () => {
    return <MessagesFeed />;
  };
  
  return {
    getContentForRole,
    getActivityContent,
    getMessagesContent
  };
};
