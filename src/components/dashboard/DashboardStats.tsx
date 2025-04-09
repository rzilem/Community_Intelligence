
import React from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Building, Calendar, DollarSign, MessageSquare, Shield, Users2 } from 'lucide-react';
import { DashboardStats } from '@/hooks/dashboard/useDashboardData';

interface DashboardStatsProps {
  stats: DashboardStats | null;
  associationName?: string;
  loading: boolean;
}

export const DashboardStatsSection: React.FC<DashboardStatsProps> = ({
  stats,
  associationName,
  loading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatCard 
        title="Total Properties" 
        value={stats?.propertyCount || 0} 
        icon={Building}
        description={associationName ? `In ${associationName}` : "Across all communities"}
        loading={loading}
      />
      <StatCard 
        title="Active Residents" 
        value={stats?.residentCount || 0} 
        icon={Users2}
        description="Currently registered"
        loading={loading}
      />
      <StatCard 
        title="Assessment Collection" 
        value={stats?.assessmentAmount ? `$${stats.assessmentAmount}` : "$0"} 
        icon={DollarSign}
        description={stats?.collectionRate ? `${stats.collectionRate}% collected this month` : "No data available"}
        trend={stats?.collectionTrend ? { value: stats.collectionTrend, isPositive: stats.collectionTrend > 0 } : undefined}
        loading={loading}
      />
      <StatCard 
        title="Open Compliance Issues" 
        value={stats?.complianceCount || 0} 
        icon={Shield}
        description={stats?.complianceDelta ? `${stats.complianceDelta > 0 ? 'Up' : 'Down'} from last month` : "No previous data"}
        trend={stats?.complianceTrend ? { value: Math.abs(stats.complianceTrend), isPositive: stats.complianceTrend < 0 } : undefined}
        loading={loading}
      />
    </div>
  );
};

export default DashboardStatsSection;
