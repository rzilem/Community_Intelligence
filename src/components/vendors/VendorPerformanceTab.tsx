
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { vendorExtendedService } from "@/services/vendor-extended-service";
import { useAuth } from "@/contexts/auth";
import { TrendingUp, Clock, Star, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface VendorPerformanceTabProps {
  vendorId: string;
}

const VendorPerformanceTab: React.FC<VendorPerformanceTabProps> = ({ vendorId }) => {
  const { currentAssociation } = useAuth();

  const { data: performanceMetrics = [], isLoading } = useQuery({
    queryKey: ['vendor-performance-metrics', vendorId, currentAssociation?.id],
    queryFn: () => vendorExtendedService.getVendorPerformanceMetrics(vendorId, currentAssociation?.id),
  });

  const getPerformanceScore = (value?: number) => {
    if (!value) return { color: 'text-gray-500', label: 'N/A' };
    if (value >= 0.9) return { color: 'text-green-600', label: 'Excellent' };
    if (value >= 0.8) return { color: 'text-blue-600', label: 'Good' };
    if (value >= 0.7) return { color: 'text-yellow-600', label: 'Fair' };
    return { color: 'text-red-600', label: 'Poor' };
  };

  const getCompletionRate = (completed: number, total: number) => {
    if (total === 0) return 0;
    return (completed / total) * 100;
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading performance data...</div>;
  }

  // Calculate overall metrics from all periods
  const overallMetrics = performanceMetrics.reduce(
    (acc, metric) => ({
      totalJobs: acc.totalJobs + metric.total_jobs,
      completedJobs: acc.completedJobs + metric.completed_jobs,
      cancelledJobs: acc.cancelledJobs + metric.cancelled_jobs,
      avgCompletionDays: acc.avgCompletionDays + (metric.average_completion_days || 0),
      avgSatisfaction: acc.avgSatisfaction + (metric.customer_satisfaction_score || 0),
      avgOnTimeRate: acc.avgOnTimeRate + (metric.on_time_completion_rate || 0),
      avgBudgetAdherence: acc.avgBudgetAdherence + (metric.budget_adherence_rate || 0),
      avgQualityScore: acc.avgQualityScore + (metric.quality_score || 0),
      periods: acc.periods + 1,
    }),
    {
      totalJobs: 0,
      completedJobs: 0,
      cancelledJobs: 0,
      avgCompletionDays: 0,
      avgSatisfaction: 0,
      avgOnTimeRate: 0,
      avgBudgetAdherence: 0,
      avgQualityScore: 0,
      periods: 0,
    }
  );

  // Calculate averages
  if (overallMetrics.periods > 0) {
    overallMetrics.avgCompletionDays /= overallMetrics.periods;
    overallMetrics.avgSatisfaction /= overallMetrics.periods;
    overallMetrics.avgOnTimeRate /= overallMetrics.periods;
    overallMetrics.avgBudgetAdherence /= overallMetrics.periods;
    overallMetrics.avgQualityScore /= overallMetrics.periods;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Performance Metrics</h3>

      {/* Overall Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {overallMetrics.totalJobs > 0 
                    ? `${getCompletionRate(overallMetrics.completedJobs, overallMetrics.totalJobs).toFixed(1)}%`
                    : 'N/A'
                  }
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Completion Time</p>
                <p className="text-2xl font-bold">
                  {overallMetrics.avgCompletionDays > 0 
                    ? `${overallMetrics.avgCompletionDays.toFixed(1)} days`
                    : 'N/A'
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Customer Satisfaction</p>
                <p className="text-2xl font-bold">
                  {overallMetrics.avgSatisfaction > 0 
                    ? `${(overallMetrics.avgSatisfaction * 100).toFixed(1)}%`
                    : 'N/A'
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Budget Adherence</p>
                <p className="text-2xl font-bold">
                  {overallMetrics.avgBudgetAdherence > 0 
                    ? `${(overallMetrics.avgBudgetAdherence * 100).toFixed(1)}%`
                    : 'N/A'
                  }
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">On-Time Completion</p>
              <div className={`text-3xl font-bold ${getPerformanceScore(overallMetrics.avgOnTimeRate).color}`}>
                {overallMetrics.avgOnTimeRate > 0 
                  ? `${(overallMetrics.avgOnTimeRate * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </div>
              <Badge variant="outline" className="mt-2">
                {getPerformanceScore(overallMetrics.avgOnTimeRate).label}
              </Badge>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Quality Score</p>
              <div className={`text-3xl font-bold ${getPerformanceScore(overallMetrics.avgQualityScore).color}`}>
                {overallMetrics.avgQualityScore > 0 
                  ? `${(overallMetrics.avgQualityScore * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </div>
              <Badge variant="outline" className="mt-2">
                {getPerformanceScore(overallMetrics.avgQualityScore).label}
              </Badge>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Overall Rating</p>
              <div className={`text-3xl font-bold ${getPerformanceScore((overallMetrics.avgOnTimeRate + overallMetrics.avgQualityScore + overallMetrics.avgBudgetAdherence) / 3).color}`}>
                {overallMetrics.avgOnTimeRate > 0 && overallMetrics.avgQualityScore > 0 && overallMetrics.avgBudgetAdherence > 0
                  ? `${(((overallMetrics.avgOnTimeRate + overallMetrics.avgQualityScore + overallMetrics.avgBudgetAdherence) / 3) * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </div>
              <Badge variant="outline" className="mt-2">
                {getPerformanceScore((overallMetrics.avgOnTimeRate + overallMetrics.avgQualityScore + overallMetrics.avgBudgetAdherence) / 3).label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Performance */}
      {performanceMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historical Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.map((metric) => (
                <div key={metric.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">
                      {format(new Date(metric.period_start), 'MMM yyyy')} - {format(new Date(metric.period_end), 'MMM yyyy')}
                    </h4>
                    <Badge variant="outline">
                      {metric.completed_jobs}/{metric.total_jobs} jobs
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Completion Rate</p>
                      <p className="font-medium">
                        {getCompletionRate(metric.completed_jobs, metric.total_jobs).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Avg Days</p>
                      <p className="font-medium">
                        {metric.average_completion_days?.toFixed(1) || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">On-Time Rate</p>
                      <p className="font-medium">
                        {metric.on_time_completion_rate 
                          ? `${(metric.on_time_completion_rate * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Satisfaction</p>
                      <p className="font-medium">
                        {metric.customer_satisfaction_score 
                          ? `${(metric.customer_satisfaction_score * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {performanceMetrics.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No performance data available</p>
            <p className="text-sm text-gray-400 mt-2">
              Performance metrics will appear here after jobs are completed
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorPerformanceTab;
