
import React from 'react';
import { AnalyticsSummary } from '@/types/analytics-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Percent, Clock, TrendingUp } from 'lucide-react';

interface AnalyticsSummaryCardsProps {
  data: AnalyticsSummary;
  className?: string;
}

const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({ 
  data,
  className
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.total_leads}</div>
          <p className="text-xs text-muted-foreground">
            All time leads in the system
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Leads This Month</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.leads_this_month}</div>
          <p className="text-xs text-muted-foreground">
            {data.leads_this_month > 0 
              ? `${((data.leads_this_month / data.total_leads) * 100).toFixed(1)}% of total leads` 
              : 'No new leads this month'
            }
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.conversion_rate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Leads converted to clients
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Time to Convert</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(data.average_time_to_convert)} days</div>
          <p className="text-xs text-muted-foreground">
            From lead creation to conversion
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSummaryCards;
