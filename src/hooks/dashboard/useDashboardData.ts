
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shield, FileText, AlertTriangle } from 'lucide-react';

export interface DashboardStats {
  propertyCount: number;
  residentCount: number;
  assessmentAmount: number;
  collectionRate: number;
  collectionTrend: number;
  complianceCount: number;
  complianceDelta: number;
  complianceTrend: number;
  notificationCount: number;
}

export interface ActivityItem {
  title: string;
  description: string;
  association: string;
  timeAgo: string;
  icon?: React.ReactNode;
  type: 'compliance' | 'document' | 'payment' | 'maintenance' | 'other';
}

export function useDashboardData(associationId?: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      
      try {
        // Fetch association stats
        const statsPromises = [
          fetchPropertyCount(associationId),
          fetchResidentCount(associationId),
          fetchAssessmentData(associationId),
          fetchComplianceData(associationId),
        ];
        
        const [
          propertyCount, 
          residentCount, 
          { assessmentAmount, collectionRate, collectionTrend }, 
          { complianceCount, complianceDelta, complianceTrend }
        ] = await Promise.all(statsPromises);
        
        setStats({
          propertyCount,
          residentCount,
          assessmentAmount,
          collectionRate,
          collectionTrend,
          complianceCount,
          complianceDelta,
          complianceTrend,
          notificationCount: 12 // Placeholder for now
        });
        
        // Fetch activity data
        const activity = await fetchRecentActivity(associationId);
        setRecentActivity(activity);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [associationId]);
  
  return { stats, recentActivity, loading, error };
}

async function fetchPropertyCount(associationId?: string): Promise<number> {
  const query = supabase.from('properties').select('id', { count: 'exact' });
  if (associationId) query.eq('association_id', associationId);
  
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

async function fetchResidentCount(associationId?: string): Promise<number> {
  const query = supabase.from('residents').select('id', { count: 'exact' });
  if (associationId) {
    // If we have an association ID, we need to join through properties
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('association_id', associationId);
      
    if (propError) throw propError;
    if (!properties.length) return 0;
    
    query.in('property_id', properties.map(p => p.id));
  }
  
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

async function fetchAssessmentData(associationId?: string): Promise<{
  assessmentAmount: number;
  collectionRate: number;
  collectionTrend: number;
}> {
  // This would normally join through properties to get association-specific data
  // For now, return placeholder data
  return {
    assessmentAmount: 43250,
    collectionRate: 92,
    collectionTrend: 3
  };
}

async function fetchComplianceData(associationId?: string): Promise<{
  complianceCount: number;
  complianceDelta: number;
  complianceTrend: number;
}> {
  let query = supabase
    .from('compliance_issues')
    .select('*', { count: 'exact' })
    .eq('status', 'open');
    
  if (associationId) {
    query = query.eq('association_id', associationId);
  }
  
  const { count, error } = await query;
  
  if (error) throw error;
  
  // In a real implementation, you would calculate the delta and trend
  // by comparing with historical data
  return {
    complianceCount: count || 0,
    complianceDelta: -9, // Mock data - 9 fewer issues than last month
    complianceTrend: -33 // Mock data - 33% improvement
  };
}

async function fetchRecentActivity(associationId?: string): Promise<ActivityItem[]> {
  // This would normally fetch real activity data from various tables
  // For now, return mock data
  return [
    {
      title: 'New compliance issue reported',
      description: 'Resident reported improper trash disposal at property #45',
      association: 'Oakridge Estates',
      timeAgo: '2 hours ago',
      icon: <Shield className="h-5 w-5" />,
      type: 'compliance'
    },
    {
      title: 'Document uploaded',
      description: 'New HOA bylaws document has been uploaded to the document repository',
      association: 'Sunset Gardens',
      timeAgo: '4 hours ago',
      icon: <FileText className="h-5 w-5" />,
      type: 'document'
    },
    {
      title: 'Maintenance request escalated',
      description: 'Water leak in unit 23B requires immediate attention',
      association: 'Parkview Commons',
      timeAgo: '1 day ago',
      icon: <AlertTriangle className="h-5 w-5" />,
      type: 'maintenance'
    }
  ];
}
