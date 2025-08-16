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

      // Fetch residents count (from profiles with associations)
      const { count: residentsCount } = await supabase
        .from('association_users')
        .select('*', { count: 'exact', head: true })
        .in('association_id', associationIds)
        .neq('role', 'admin');

      // Fetch pending homeowner requests
      const { count: pendingRequestsCount } = await supabase
        .from('homeowner_requests')
        .select('*', { count: 'exact', head: true })
        .in('association_id', associationIds)
        .eq('status', 'pending');

      // Fetch open compliance violations
      const { count: openViolationsCount } = await supabase
        .from('compliance_violations')
        .select('*', { count: 'exact', head: true })
        .in('association_id', associationIds)
        .eq('status', 'open');

      // Calculate assessment metrics
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .in('association_id', associationIds);
      
      const propertyIds = properties?.map(p => p.id) || [];
      
      const { data: assessments } = await supabase
        .from('assessments')
        .select('amount, paid')
        .in('property_id', propertyIds);

      const totalAssessments = assessments?.reduce((sum, a) => sum + Number(a.amount), 0) || 0;
      const paidAssessments = assessments?.filter(a => a.paid).reduce((sum, a) => sum + Number(a.amount), 0) || 0;
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

      // Fetch recent activity
      const { data: recentRequests } = await supabase
        .from('homeowner_requests')
        .select(`
          id,
          title,
          description,
          created_at,
          associations!inner(name)
        `)
        .in('association_id', associationIds)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentPayments } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          created_at,
          properties!inner(
            unit_number,
            associations!inner(name)
          )
        `)
        .in('association_id', associationIds)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: recentViolations } = await supabase
        .from('compliance_violations')
        .select(`
          id,
          violation_type,
          description,
          created_at,
          associations!inner(name)
        `)
        .in('association_id', associationIds)
        .order('created_at', { ascending: false })
        .limit(2);

      const activities: ActivityItem[] = [];

      // Add maintenance requests
      if (recentRequests) {
        activities.push(...recentRequests.map(req => ({
          id: req.id,
          title: req.title || 'New maintenance request',
          description: req.description || 'Maintenance request submitted',
          timeAgo: getTimeAgo(req.created_at),
          association: (req.associations as any)?.name || 'Unknown Association',
          iconName: 'Shield'
        })));
      }

      // Add payments
      if (recentPayments) {
        activities.push(...recentPayments.map(payment => ({
          id: payment.id,
          title: 'Payment received',
          description: `Payment of $${payment.amount} received from ${(payment.properties as any)?.unit_number || 'unit'}`,
          timeAgo: getTimeAgo(payment.created_at),
          association: (payment.properties as any)?.associations?.name || 'Unknown Association',
          iconName: 'FileText'
        })));
      }

      // Add violations
      if (recentViolations) {
        activities.push(...recentViolations.map(violation => ({
          id: violation.id,
          title: 'Compliance violation reported',
          description: `${violation.violation_type}: ${violation.description}`,
          timeAgo: getTimeAgo(violation.created_at),
          association: (violation.associations as any)?.name || 'Unknown Association',
          iconName: 'AlertTriangle'
        })));
      }

      // Sort all activities by most recent
      activities.sort((a, b) => {
        const timeA = parseTimeAgo(a.timeAgo);
        const timeB = parseTimeAgo(b.timeAgo);
        return timeA - timeB;
      });

      setRecentActivity(activities.slice(0, 10));

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