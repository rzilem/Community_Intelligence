
import React from 'react';
import { Profile } from '@/types/app-types';
import CalendarTab from '@/components/dashboard/CalendarTab';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import MessagesFeed from '@/components/dashboard/MessagesFeed';
import TreasurerDashboard from '@/components/dashboard/TreasurerDashboard';

// Import specific dashboard components for different roles
import AdminDashboardContent from '@/components/dashboard/roles/AdminDashboardContent';
import ManagerDashboardContent from '@/components/dashboard/roles/ManagerDashboardContent';
import ResidentDashboardContent from '@/components/dashboard/roles/ResidentDashboardContent';
import MaintenanceDashboardContent from '@/components/dashboard/roles/MaintenanceDashboardContent';
import AccountantDashboardContent from '@/components/dashboard/roles/AccountantDashboardContent';
import BoardMemberDashboardContent from '@/components/dashboard/roles/BoardMemberDashboardContent';
import VendorDashboardContent from '@/components/dashboard/roles/VendorDashboardContent';

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
        return <AdminDashboardContent />;
      case 'manager':
        return <ManagerDashboardContent />;
      case 'treasurer':
        return <TreasurerDashboard />;
      case 'resident':
        return <ResidentDashboardContent />;
      case 'maintenance':
        return <MaintenanceDashboardContent />;
      case 'accountant':
        return <AccountantDashboardContent />;
      case 'board-member':
        return <BoardMemberDashboardContent />;
      case 'vendor':
        return <VendorDashboardContent />;
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
