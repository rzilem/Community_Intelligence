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

      // Build base query conditions
      const associations = associationId 
        ? supabase.from('associations').select('id, name').eq('id', associationId)
        : supabase.from('associations').select('id, name');

      const { data: associationData, error: assocError } = await associations;
      
      if (assocError) throw assocError;
      
      const targetAssociations = associationData || [];
      const associationIds = targetAssociations.map(a => a.id);
      
      // Fetch properties count
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .in('association_id', associationIds);

      // Use mock data for residents count since association_users table doesn't exist
      const residentsCount = Math.floor(Math.random() * 150) + 50; // Mock: 50-200 residents

      // Use mock data for pending requests since homeowner_requests table doesn't exist
      const pendingRequestsCount = Math.floor(Math.random() * 10) + 1; // Mock: 1-10 requests

      // Use mock data for violations since compliance_violations table doesn't exist  
      const openViolationsCount = Math.floor(Math.random() * 5); // Mock: 0-4 violations

      // Calculate assessment metrics
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .in('association_id', associationIds);
      
      const propertyIds = properties?.map(p => p.id) || [];
      
      // Use mock data for assessments since assessments table doesn't exist
      const totalAssessments = (propertiesCount || 0) * 250; // Mock: $250 per property
      const paidAssessments = totalAssessments * 0.85; // Mock: 85% collection rate
      const collectionRate = totalAssessments > 0 ? Math.round((paidAssessments / totalAssessments) * 100) : 0;

      setStats({
        totalProperties: propertiesCount || 0,
        totalResidents: residentsCount || 0,
        pendingRequests: pendingRequestsCount || 0,
        openViolations: openViolationsCount || 0,
        propertyCount: propertiesCount || 0,
        residentCount: residentsCount || 0,
        assessmentAmount: totalAssessments,
        collectionRate,
        collectionTrend: 5, // Could be calculated from historical data
        complianceCount: openViolationsCount || 0,
        complianceDelta: -2, // Could be calculated from historical data
        complianceTrend: -1,
      });

      // Generate mock recent activity data
      const activities: ActivityItem[] = [
        {
          id: '1',
          title: 'New maintenance request',
          description: 'Pool pump needs repair in Building A',
          timeAgo: '2 hours ago',
          association: targetAssociations[0]?.name || 'Community Association',
          iconName: 'Shield'
        },
        {
          id: '2', 
          title: 'Payment received',
          description: 'Monthly assessment payment received from Unit 205',
          timeAgo: '4 hours ago',
          association: targetAssociations[0]?.name || 'Community Association',
          iconName: 'FileText'
        },
        {
          id: '3',
          title: 'Compliance issue resolved',
          description: 'Parking violation in Building B has been resolved',
          timeAgo: '1 day ago',
          association: targetAssociations[0]?.name || 'Community Association',
          iconName: 'AlertTriangle'
        },
        {
          id: '4',
          title: 'Document uploaded',
          description: 'New board meeting minutes added to documents',
          timeAgo: '2 days ago',
          association: targetAssociations[0]?.name || 'Community Association',
          iconName: 'FileText'
        }
      ];

      setRecentActivity(activities);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const parseTimeAgo = (timeAgo: string): number => {
    if (timeAgo === 'Just now') return 0;
    const match = timeAgo.match(/(\d+)\s+(hour|day)s?\s+ago/);
    if (!match) return 999999;
    const [, num, unit] = match;
    const multiplier = unit === 'hour' ? 1 : 24;
    return parseInt(num) * multiplier;
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