
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vendorExtendedService } from "@/services/vendor-extended-service";
import { useAuth } from "@/contexts/auth";
import { BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PerformanceMetrics from "./performance/PerformanceMetrics";
import PerformanceCharts from "./performance/PerformanceCharts";

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
          <PerformanceMetrics metrics={latestMetrics} averageRating={averageRating} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceCharts 
              performanceData={performanceData} 
              jobStatusData={jobStatusData} 
            />

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
        </>
      )}
    </div>
  );
};

export default VendorPerformanceTab;
