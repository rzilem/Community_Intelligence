
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalProperties: number;
  totalResidents: number;
  pendingRequests: number;
  openViolations: number;
  propertyCount: number;
  residentCount: number;
  assessmentAmount?: number;
  collectionRate?: number;
  collectionTrend?: number;
  complianceCount: number;
  complianceDelta?: number;
  complianceTrend?: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  association: string;
  iconName: string;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status?: string;
}

export const useDashboardData = (associationId?: string) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalResidents: 0,
    pendingRequests: 0,
    openViolations: 0,
    propertyCount: 0,
    residentCount: 0,
    complianceCount: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock data since actual tables may not exist
      setStats({
        totalProperties: 45,
        totalResidents: 128,
        pendingRequests: 7,
        openViolations: 3,
        propertyCount: 45,
        residentCount: 128,
        assessmentAmount: 25000,
        collectionRate: 85,
        collectionTrend: 5,
        complianceCount: 3,
        complianceDelta: -2,
        complianceTrend: -1,
      });

      setRecentActivity([
        {
          id: '1',
          title: 'New maintenance request submitted',
          description: 'Pool maintenance requested by Unit 101',
          timeAgo: '2 hours ago',
          association: 'Sunset Gardens HOA',
          iconName: 'Shield'
        },
        {
          id: '2',
          title: 'Payment received',
          description: 'Monthly assessment payment received from Unit 205',
          timeAgo: '4 hours ago',
          association: 'Sunset Gardens HOA',
          iconName: 'FileText'
        },
        {
          id: '3',
          title: 'Compliance violation reported',
          description: 'Landscaping violation at Unit 312',
          timeAgo: '1 day ago',
          association: 'Sunset Gardens HOA',
          iconName: 'AlertTriangle'
        }
      ]);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [associationId]);

  return {
    stats,
    recentActivity,
    isLoading,
    error,
    refreshData: fetchDashboardData,
  };
};
