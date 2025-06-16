
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { vendorAnalyticsService } from "@/services/vendor-analytics-service";
import { TrendingUp, TrendingDown, Clock, DollarSign, Star, Target } from "lucide-react";

interface VendorAnalyticsDashboardProps {
  vendorId: string;
}

const VendorAnalyticsDashboard: React.FC<VendorAnalyticsDashboardProps> = ({
  vendorId
}) => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['vendor-analytics', vendorId],
    queryFn: () => vendorAnalyticsService.getVendorAnalyticsSummary(vendorId),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analyticsData) return null;

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getSuccessRateColor(analyticsData.success_rate)}>
                {analyticsData.success_rate.toFixed(1)}%
              </span>
            </div>
            <Progress value={analyticsData.success_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.average_response_time.toFixed(1)}h
            </div>
            <Badge variant={analyticsData.average_response_time < 24 ? "default" : "destructive"}>
              {analyticsData.average_response_time < 24 ? "Fast" : "Slow"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analyticsData.total_revenue.toLocaleString()}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              YTD Revenue
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.customer_satisfaction.toFixed(1)}/5
            </div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(analyticsData.customer_satisfaction) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.performance_metrics.slice(0, 5).map((metric) => (
              <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">
                    {new Date(metric.reporting_period).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric.completed_jobs}/{metric.total_jobs} jobs completed
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {metric.average_rating ? `${metric.average_rating.toFixed(1)} ⭐` : 'No rating'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${metric.total_revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bid Analytics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bid Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.bid_analytics.slice(0, 5).map((bid) => (
              <div key={bid.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">
                    {bid.bid_amount ? `$${bid.bid_amount.toLocaleString()}` : 'No bid amount'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Response: {bid.response_time_hours ? `${bid.response_time_hours}h` : 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={bid.was_selected ? "default" : "secondary"}>
                    {bid.was_selected ? "Selected" : "Not Selected"}
                  </Badge>
                  {bid.feedback_score && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Score: {bid.feedback_score}/5
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAnalyticsDashboard;
