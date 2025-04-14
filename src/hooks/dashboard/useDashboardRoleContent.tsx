
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { DashboardStats } from './useDashboardData';

// Define role-specific content configurations
export const useDashboardRoleContent = (stats?: DashboardStats | null) => {
  const { userRole } = useAuth();
  
  // Role-specific dashboard titles
  const dashboardTitle = React.useMemo(() => {
    switch (userRole) {
      case 'admin':
        return 'Administrator Dashboard';
      case 'manager':
        return 'Property Manager Dashboard';
      case 'accountant':
        return 'Financial Dashboard';
      case 'maintenance':
        return 'Maintenance Dashboard';
      case 'resident':
        return 'Resident Portal';
      default:
        return 'Dashboard';
    }
  }, [userRole]);
  
  // Role-specific dashboard stats to highlight
  const priorityStats = React.useMemo(() => {
    if (!stats) return [];
    
    switch (userRole) {
      case 'admin':
        return [
          { label: 'Properties', value: stats.propertyCount, change: null },
          { label: 'Residents', value: stats.residentCount, change: null },
          { label: 'Collections', value: `${stats.collectionRate}%`, change: stats.collectionTrend },
          { label: 'Compliance', value: stats.complianceCount, change: stats.complianceTrend }
        ];
      case 'manager':
        return [
          { label: 'Properties', value: stats.propertyCount, change: null },
          { label: 'Compliance', value: stats.complianceCount, change: stats.complianceTrend },
          { label: 'Residents', value: stats.residentCount, change: null },
          { label: 'Notifications', value: stats.notificationCount, change: null }
        ];
      case 'accountant':
        return [
          { label: 'Assessments', value: `$${stats.assessmentAmount.toLocaleString()}`, change: null },
          { label: 'Collection Rate', value: `${stats.collectionRate}%`, change: stats.collectionTrend },
          { label: 'Properties', value: stats.propertyCount, change: null },
          { label: 'Residents', value: stats.residentCount, change: null }
        ];
      case 'maintenance':
        return [
          { label: 'Properties', value: stats.propertyCount, change: null },
          { label: 'Compliance', value: stats.complianceCount, change: stats.complianceTrend },
          { label: 'Notifications', value: stats.notificationCount, change: null }
        ];
      case 'resident':
        return [
          { label: 'Notifications', value: stats.notificationCount, change: null },
          { label: 'Compliance', value: stats.complianceCount, change: stats.complianceTrend }
        ];
      default:
        return [
          { label: 'Properties', value: stats.propertyCount, change: null },
          { label: 'Residents', value: stats.residentCount, change: null }
        ];
    }
  }, [stats, userRole]);
  
  // Default tab to show first based on role
  const defaultTab = React.useMemo(() => {
    switch (userRole) {
      case 'admin':
      case 'manager':
        return 'activity';
      case 'accountant':
        return 'messages';
      case 'maintenance':
        return 'activity';
      case 'resident':
        return 'calendar';
      default:
        return 'calendar';
    }
  }, [userRole]);
  
  return {
    dashboardTitle,
    priorityStats,
    defaultTab
  };
};
