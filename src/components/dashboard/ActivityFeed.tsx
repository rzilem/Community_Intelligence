
import React from 'react';
import { ActivityItem } from '@/hooks/dashboard/useDashboardData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, FileText, AlertTriangle } from 'lucide-react';

interface ActivityFeedProps {
  recentActivity: ActivityItem[];
  loading: boolean;
  error: any;
}

// Helper function to render icon by name
const getIconByName = (iconName: string) => {
  switch (iconName) {
    case 'Shield':
      return <Shield className="h-5 w-5" />;
    case 'FileText':
      return <FileText className="h-5 w-5" />;
    case 'AlertTriangle':
      return <AlertTriangle className="h-5 w-5" />;
    default:
      return <Shield className="h-5 w-5" />;
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  recentActivity,
  loading,
  error
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          See the latest actions across your HOAs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-start animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6 text-muted-foreground">
            Unable to load activity data
          </div>
        ) : recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-6">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  {getIconByName(activity.iconName)}
                </div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <div className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">{activity.association}</span>
                    <span>•</span>
                    <span className="text-muted-foreground">{activity.timeAgo}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No recent activity to display
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
