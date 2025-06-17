
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { CampaignMetrics, EmailCampaign } from '@/types/email-campaign-types';
import { Mail, Eye, MousePointer, Bounce, UserX, TrendingUp } from 'lucide-react';

interface CampaignAnalyticsProps {
  campaign: EmailCampaign;
  metrics: CampaignMetrics;
}

export const CampaignAnalytics: React.FC<CampaignAnalyticsProps> = ({
  campaign,
  metrics
}) => {
  const engagementData = [
    { name: 'Delivered', value: metrics.delivered_count, color: '#22c55e' },
    { name: 'Opened', value: metrics.opened_count, color: '#3b82f6' },
    { name: 'Clicked', value: metrics.clicked_count, color: '#f59e0b' },
    { name: 'Bounced', value: metrics.bounced_count, color: '#ef4444' },
    { name: 'Unsubscribed', value: metrics.unsubscribed_count, color: '#6b7280' }
  ];

  const performanceData = [
    { metric: 'Open Rate', value: metrics.open_rate, target: 25 },
    { metric: 'Click Rate', value: metrics.click_rate, target: 3 },
    { metric: 'Bounce Rate', value: metrics.bounce_rate, target: 2 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'sending': return 'bg-yellow-500';
      case 'draft': return 'bg-gray-500';
      case 'paused': return 'bg-orange-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Campaign Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campaign Overview</CardTitle>
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Mail className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{metrics.total_recipients}</div>
              <div className="text-sm text-muted-foreground">Total Sent</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{metrics.opened_count}</div>
              <div className="text-sm text-muted-foreground">Opened</div>
              <div className="text-xs text-blue-500 font-medium">
                {metrics.open_rate.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MousePointer className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">{metrics.clicked_count}</div>
              <div className="text-sm text-muted-foreground">Clicked</div>
              <div className="text-xs text-yellow-500 font-medium">
                {metrics.click_rate.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Bounce className="h-8 w-8 text-red-500" />
              </div>
              <div className="text-2xl font-bold">{metrics.bounced_count}</div>
              <div className="text-sm text-muted-foreground">Bounced</div>
              <div className="text-xs text-red-500 font-medium">
                {metrics.bounce_rate.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <UserX className="h-8 w-8 text-gray-500" />
              </div>
              <div className="text-2xl font-bold">{metrics.unsubscribed_count}</div>
              <div className="text-sm text-muted-foreground">Unsubscribed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance vs Targets */}
        <Card>
          <CardHeader>
            <CardTitle>Performance vs Industry Benchmarks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceData.map((item) => (
              <div key={item.metric}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.metric}</span>
                  <span>{item.value.toFixed(1)}% / {item.target}%</span>
                </div>
                <Progress 
                  value={(item.value / item.target) * 100} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {item.value > item.target ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Above benchmark
                    </span>
                  ) : (
                    <span className="text-orange-600">
                      Below benchmark
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
