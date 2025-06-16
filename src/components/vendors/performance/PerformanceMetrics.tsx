
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Star, TrendingUp, TrendingDown } from "lucide-react";

interface PerformanceMetricsProps {
  metrics: any;
  averageRating: number;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics, averageRating }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metrics.completed_jobs / metrics.total_jobs * 100)}`}>
                {((metrics.completed_jobs / metrics.total_jobs) * 100).toFixed(1)}%
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
                {metrics.average_completion_days?.toFixed(1) || 'N/A'} days
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
              <p className={`text-2xl font-bold ${getPerformanceColor(metrics.on_time_completion_rate || 0)}`}>
                {metrics.on_time_completion_rate?.toFixed(1) || 'N/A'}%
              </p>
            </div>
            {getPerformanceIcon(metrics.on_time_completion_rate || 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMetrics;
