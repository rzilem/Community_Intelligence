
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vendorExtendedService } from "@/services/vendor-extended-service";
import { useAuth } from "@/contexts/auth";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, TrendingDown, Clock, CheckCircle, DollarSign, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VendorPerformanceTabProps {
  vendorId: string;
}

const VendorPerformanceTab: React.FC<VendorPerformanceTabProps> = ({ vendorId }) => {
  const { currentAssociation } = useAuth();

  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['vendor-performance-metrics', vendorId, currentAssociation?.id],
    queryFn: () => vendorExtendedService.getVendorPerformanceMetrics(vendorId, currentAssociation?.id),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['vendor-reviews', vendorId],
    queryFn: () => vendorExtendedService.getVendorReviews(vendorId),
  });

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading performance metrics...</div>;
  }

  const latestMetrics = metrics[0];
  
  const performanceData = metrics.map(metric => ({
    period: `${metric.period_start} to ${metric.period_end}`,
    completionRate: metric.completed_jobs / metric.total_jobs * 100,
    avgDays: metric.average_completion_days,
    satisfaction: metric.customer_satisfaction_score,
    onTimeRate: metric.on_time_completion_rate,
  }));

  const jobStatusData = latestMetrics ? [
    { name: 'Completed', value: latestMetrics.completed_jobs, color: '#10b981' },
    { name: 'Cancelled', value: latestMetrics.cancelled_jobs, color: '#ef4444' },
  ] : [];

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 90) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (score >= 80) return <Clock className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Performance Metrics</h3>

      {!latestMetrics ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BarChart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No performance metrics available</p>
            <p className="text-sm text-gray-400">Performance data will be available after job completions</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completion Rate</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(latestMetrics.completed_jobs / latestMetrics.total_jobs * 100)}`}>
                      {((latestMetrics.completed_jobs / latestMetrics.total_jobs) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg. Completion Time</p>
                    <p className="text-2xl font-bold">
                      {latestMetrics.average_completion_days?.toFixed(1) || 'N/A'} days
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Customer Rating</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    </div>
                  </div>
                  <Star className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">On-Time Rate</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(latestMetrics.on_time_completion_rate || 0)}`}>
                      {latestMetrics.on_time_completion_rate?.toFixed(1) || 'N/A'}%
                    </p>
                  </div>
                  {getPerformanceIcon(latestMetrics.on_time_completion_rate || 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends */}
          {performanceData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="completionRate" 
                      stroke="#10b981" 
                      name="Completion Rate %" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="onTimeRate" 
                      stroke="#3b82f6" 
                      name="On-Time Rate %" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="satisfaction" 
                      stroke="#f59e0b" 
                      name="Customer Satisfaction" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Job Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={jobStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {jobStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Quality Score</span>
                  <Badge variant="outline" className={getPerformanceColor(latestMetrics.quality_score || 0)}>
                    {latestMetrics.quality_score?.toFixed(1) || 'N/A'}/10
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Budget Adherence</span>
                  <Badge variant="outline" className={getPerformanceColor(latestMetrics.budget_adherence_rate || 0)}>
                    {latestMetrics.budget_adherence_rate?.toFixed(1) || 'N/A'}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Customer Satisfaction</span>
                  <Badge variant="outline" className={getPerformanceColor(latestMetrics.customer_satisfaction_score || 0)}>
                    {latestMetrics.customer_satisfaction_score?.toFixed(1) || 'N/A'}/10
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Reviews</span>
                  <Badge variant="outline">
                    {reviews.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reviews Summary */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {review.reviewer?.first_name && review.reviewer?.last_name
                                ? `${review.reviewer.first_name} ${review.reviewer.last_name}`
                                : 'Anonymous'
                              }
                            </span>
                          </div>
                          {review.review_text && (
                            <p className="text-sm text-gray-700">{review.review_text}</p>
                          )}
                          {review.job_reference && (
                            <p className="text-xs text-gray-500 mt-1">Job: {review.job_reference}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default VendorPerformanceTab;
