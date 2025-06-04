
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalProperties: number;
  totalResidents: number;
  pendingRequests: number;
  openViolations: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status?: string;
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalResidents: 0,
    pendingRequests: 0,
    openViolations: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, return mock data since the actual tables may not exist
      setStats({
        totalProperties: 45,
        totalResidents: 128,
        pendingRequests: 7,
        openViolations: 3,
      });

      setRecentActivity([
        {
          id: '1',
          type: 'maintenance',
          description: 'New maintenance request submitted',
          timestamp: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          type: 'payment',
          description: 'Payment received for Unit 101',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed'
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
  }, []);

  return {
    stats,
    recentActivity,
    isLoading,
    error,
    refreshData: fetchDashboardData,
  };
};
