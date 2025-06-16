import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { BarChart, LineChart, PieChart, TrendingUp, TrendingDown, DollarSign, Clock, Star, Award } from 'lucide-react';
import { Vendor } from '@/types/vendor-types';

interface PerformanceMetric {
  vendor: Vendor;
  metrics: {
    totalProjects: number;
    completionRate: number;
    averageRating: number;
    onTimeDelivery: number;
    costEfficiency: number;
    responsiveness: number;
    repeatBusinessRate: number;
    revenueGenerated: number;
  };
  trends: {
    ratingTrend: 'up' | 'down' | 'stable';
    costTrend: 'up' | 'down' | 'stable';
    performanceTrend: 'up' | 'down' | 'stable';
  };
  riskScore: number;
  recommendations: string[];
}

interface VendorPerformanceReportsProps {
  vendors: Vendor[];
  dateRange: { start: Date; end: Date };
}

const VendorPerformanceReports: React.FC<VendorPerformanceReportsProps> = ({
  vendors,
  dateRange
}) => {
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [reportType, setReportType] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generatePerformanceData();
  }, [vendors, dateRange]);

  const generatePerformanceData = async () => {
    setLoading(true);
    
    // Simulate performance data generation
    const data: PerformanceMetric[] = vendors.map(vendor => {
      const baseMetrics = {
        totalProjects: vendor.completed_jobs || 0,
        completionRate: Math.min(95, 75 + Math.random() * 20),
        averageRating: vendor.rating || 3 + Math.random() * 2,
        onTimeDelivery: Math.min(98, 80 + Math.random() * 18),
        costEfficiency: Math.min(95, 70 + Math.random() * 25),
        responsiveness: vendor.average_response_time ? 
          Math.max(60, 100 - (vendor.average_response_time * 2)) : 75,
        repeatBusinessRate: Math.min(85, 40 + Math.random() * 45),
        revenueGenerated: Math.round((vendor.completed_jobs || 0) * (2000 + Math.random() * 8000))
      };

      const riskScore = calculateRiskScore(baseMetrics);
      
      return {
        vendor,
        metrics: baseMetrics,
        trends: {
          ratingTrend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
          costTrend: Math.random() > 0.5 ? 'up' : Math.random() > 0.25 ? 'stable' : 'down',
          performanceTrend: Math.random() > 0.7 ? 'up' : Math.random() > 0.4 ? 'stable' : 'down'
        },
        riskScore,
        recommendations: generateRecommendations(baseMetrics, riskScore)
      };
    });

    setPerformanceData(data);
    setLoading(false);
  };

  const calculateRiskScore = (metrics: PerformanceMetric['metrics']): number => {
    const weights = {
      completionRate: 0.25,
      averageRating: 0.20,
      onTimeDelivery: 0.20,
      responsiveness: 0.15,
      costEfficiency: 0.10,
      repeatBusinessRate: 0.10
    };

    let score = 0;
    score += (100 - metrics.completionRate) * weights.completionRate;
    score += (5 - metrics.averageRating) / 5 * 100 * weights.averageRating;
    score += (100 - metrics.onTimeDelivery) * weights.onTimeDelivery;
    score += (100 - metrics.responsiveness) * weights.responsiveness;
    score += (100 - metrics.costEfficiency) * weights.costEfficiency;
    score += (100 - metrics.repeatBusinessRate) * weights.repeatBusinessRate;

    return Math.round(Math.max(0, Math.min(100, score)));
  };

  const generateRecommendations = (metrics: PerformanceMetric['metrics'], riskScore: number): string[] => {
    const recommendations: string[] = [];

    if (metrics.completionRate < 85) {
      recommendations.push('Monitor project completion rates more closely');
    }
    if (metrics.averageRating < 4.0) {
      recommendations.push('Schedule quality improvement discussions');
    }
    if (metrics.onTimeDelivery < 85) {
      recommendations.push('Review project timeline management');
    }
    if (metrics.responsiveness < 70) {
      recommendations.push('Improve communication response times');
    }
    if (riskScore > 60) {
      recommendations.push('Consider vendor performance review meeting');
    }
    if (metrics.repeatBusinessRate < 50) {
      recommendations.push('Investigate client satisfaction issues');
    }

    return recommendations.length > 0 ? recommendations : ['Performance is meeting expectations'];
  };

  const getRiskLevel = (score: number): { level: string; color: string } => {
    if (score <= 30) return { level: 'Low', color: 'text-green-600' };
    if (score <= 60) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'High', color: 'text-red-600' };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const filteredData = selectedVendor === 'all' 
    ? performanceData 
    : performanceData.filter(p => p.vendor.id === selectedVendor);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="h-8 w-8 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2">Generating performance reports...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Vendor Performance Analytics
          </CardTitle>
          <div className="flex gap-4">
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map(vendor => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Performance Overview</SelectItem>
                <SelectItem value="detailed">Detailed Analysis</SelectItem>
                <SelectItem value="comparison">Vendor Comparison</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={reportType} onValueChange={(value: any) => setReportType(value)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold">
                      {(filteredData.reduce((sum, d) => sum + d.metrics.averageRating, 0) / filteredData.length).toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                    <p className="text-2xl font-bold">
                      {Math.round(filteredData.reduce((sum, d) => sum + d.metrics.onTimeDelivery, 0) / filteredData.length)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      ${(filteredData.reduce((sum, d) => sum + d.metrics.revenueGenerated, 0) / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">
                      {Math.round(filteredData.reduce((sum, d) => sum + d.metrics.completionRate, 0) / filteredData.length)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vendor Performance Cards */}
          <div className="grid gap-4">
            {filteredData.slice(0, 6).map(data => {
              const riskLevel = getRiskLevel(data.riskScore);
              return (
                <Card key={data.vendor.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{data.vendor.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {data.metrics.totalProjects} completed projects
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={riskLevel.color}>{riskLevel.level} Risk</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Risk Score: {data.riskScore}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {getTrendIcon(data.trends.ratingTrend)}
                        </div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <p className="font-semibold">{data.metrics.averageRating.toFixed(1)}</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="h-4 w-4 text-blue-500" />
                          {getTrendIcon(data.trends.performanceTrend)}
                        </div>
                        <p className="text-sm text-muted-foreground">On-Time</p>
                        <p className="font-semibold">{Math.round(data.metrics.onTimeDelivery)}%</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          {getTrendIcon(data.trends.costTrend)}
                        </div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="font-semibold">${(data.metrics.revenueGenerated / 1000).toFixed(0)}K</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Award className="h-4 w-4 text-purple-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">Completion</p>
                        <p className="font-semibold">{Math.round(data.metrics.completionRate)}%</p>
                      </div>
                    </div>

                    {data.recommendations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Recommendations:</p>
                        <div className="flex flex-wrap gap-1">
                          {data.recommendations.slice(0, 2).map((rec, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {rec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {selectedVendor !== 'all' && filteredData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{filteredData[0].vendor.name} - Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(filteredData[0].metrics).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    const isPercentage = key !== 'totalProjects' && key !== 'revenueGenerated';
                    const displayValue = isPercentage && key !== 'averageRating' ? 
                      Math.round(value as number) : value;
                    
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-sm font-medium">{label}</Label>
                          <span className="text-sm font-semibold">
                            {key === 'revenueGenerated' ? `$${((value as number) / 1000).toFixed(0)}K` :
                             key === 'averageRating' ? (value as number).toFixed(1) :
                             isPercentage ? `${displayValue}%` : displayValue}
                          </span>
                        </div>
                        {isPercentage && key !== 'averageRating' && (
                          <Progress value={value as number} className="h-2" />
                        )}
                        {key === 'averageRating' && (
                          <Progress value={(value as number) * 20} className="h-2" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium mb-3">Action Items & Recommendations</h4>
                  <div className="space-y-2">
                    {filteredData[0].recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          {/* Vendor Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Vendor Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Vendor</th>
                      <th className="text-center p-2">Rating</th>
                      <th className="text-center p-2">Projects</th>
                      <th className="text-center p-2">On-Time %</th>
                      <th className="text-center p-2">Revenue</th>
                      <th className="text-center p-2">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData
                      .sort((a, b) => b.metrics.averageRating - a.metrics.averageRating)
                      .map(data => {
                        const riskLevel = getRiskLevel(data.riskScore);
                        return (
                          <tr key={data.vendor.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <div>
                                <p className="font-medium">{data.vendor.name}</p>
                                <p className="text-xs text-muted-foreground">{data.vendor.contact_person}</p>
                              </div>
                            </td>
                            <td className="text-center p-2">
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                {data.metrics.averageRating.toFixed(1)}
                              </div>
                            </td>
                            <td className="text-center p-2">{data.metrics.totalProjects}</td>
                            <td className="text-center p-2">{Math.round(data.metrics.onTimeDelivery)}%</td>
                            <td className="text-center p-2">${(data.metrics.revenueGenerated / 1000).toFixed(0)}K</td>
                            <td className="text-center p-2">
                              <Badge className={riskLevel.color}>{riskLevel.level}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorPerformanceReports;
