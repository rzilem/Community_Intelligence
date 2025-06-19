
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  Brain, 
  Target,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Zap,
  RefreshCw
} from 'lucide-react';
import { AIPrediction } from '@/types/ai-workflow-types';
import { predictiveAnalyticsEngine } from '@/services/ai-workflow/predictive-analytics-engine';
import { toast } from 'sonner';

interface PredictiveAnalyticsDashboardProps {
  associationId: string;
}

const PredictiveAnalyticsDashboard: React.FC<PredictiveAnalyticsDashboardProps> = ({
  associationId
}) => {
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<AIPrediction | null>(null);

  useEffect(() => {
    loadPredictions();
  }, [associationId]);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const data = await predictiveAnalyticsEngine.getAllPredictions(associationId);
      setPredictions(data);
    } catch (error) {
      console.error('Failed to load predictions:', error);
      toast.error('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const generateNewPredictions = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        predictiveAnalyticsEngine.generateMaintenanceCostForecast(associationId),
        predictiveAnalyticsEngine.generateVendorPerformancePrediction(associationId),
        predictiveAnalyticsEngine.generateCommunityHealthScore(associationId),
        predictiveAnalyticsEngine.generateBudgetVariancePrediction(associationId)
      ]);
      
      await loadPredictions();
      toast.success('New predictions generated successfully');
    } catch (error: any) {
      toast.error(`Failed to generate predictions: ${error.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const getPredictionsByType = (type: string) => {
    return predictions.filter(p => p.prediction_type === type);
  };

  const getLatestPrediction = (type: string) => {
    const typePredictions = getPredictionsByType(type);
    return typePredictions.length > 0 ? typePredictions[0] : null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge variant="default" className="bg-green-500">High Confidence</Badge>;
    } else if (confidence >= 0.6) {
      return <Badge variant="secondary">Medium Confidence</Badge>;
    } else {
      return <Badge variant="outline">Low Confidence</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  const maintenancePrediction = getLatestPrediction('maintenance_cost_forecast');
  const vendorPrediction = getLatestPrediction('vendor_performance');
  const healthPrediction = getLatestPrediction('community_health_score');
  const budgetPrediction = getLatestPrediction('budget_variance');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            Predictive Analytics Dashboard
          </h2>
          <p className="text-gray-600">AI-powered insights and forecasting for your community</p>
        </div>
        <Button 
          onClick={generateNewPredictions} 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Generating...' : 'Refresh Predictions'}
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Community Health</p>
                <div className="text-2xl font-bold text-green-600">
                  {healthPrediction ? `${healthPrediction.prediction_data.overall_score}%` : 'N/A'}
                </div>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-80" />
            </div>
            {healthPrediction && (
              <div className="mt-2">
                {getConfidenceBadge(healthPrediction.confidence_level)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Variance</p>
                <div className="text-2xl font-bold text-blue-600">
                  {budgetPrediction ? 
                    formatPercentage(budgetPrediction.prediction_data.predicted_variance) : 'N/A'}
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
            {budgetPrediction && (
              <div className="mt-2">
                {getConfidenceBadge(budgetPrediction.confidence_level)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendor Performance</p>
                <div className="text-2xl font-bold text-purple-600">
                  {vendorPrediction ? `${vendorPrediction.prediction_data.overall_score}%` : 'N/A'}
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
            {vendorPrediction && (
              <div className="mt-2">
                {getConfidenceBadge(vendorPrediction.confidence_level)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Predictions</p>
                <div className="text-2xl font-bold text-orange-600">
                  {predictions.length}
                </div>
              </div>
              <Zap className="h-8 w-8 text-orange-500 opacity-80" />
            </div>
            <div className="mt-2">
              <Badge variant="outline">
                {predictions.filter(p => p.confidence_level > 0.7).length} High Quality
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="maintenance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="maintenance">
            <DollarSign className="h-4 w-4 mr-2" />
            Maintenance Costs
          </TabsTrigger>
          <TabsTrigger value="vendor">
            <Users className="h-4 w-4 mr-2" />
            Vendor Performance
          </TabsTrigger>
          <TabsTrigger value="health">  
            <CheckCircle className="h-4 w-4 mr-2" />
            Community Health
          </TabsTrigger>
          <TabsTrigger value="budget">
            <TrendingUp className="h-4 w-4 mr-2" />
            Budget Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="space-y-4">
          {maintenancePrediction ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Monthly Forecast
                  </CardTitle>
                  <CardDescription>
                    Predicted maintenance costs for the next 12 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {maintenancePrediction.prediction_data.monthly_forecast?.slice(0, 6).map((forecast: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{forecast.month}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{formatCurrency(forecast.predicted_cost)}</span>
                          <Progress value={forecast.confidence * 100} className="w-16 h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Patterns</CardTitle>
                  <CardDescription>
                    Historical maintenance cost variations by season
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(maintenancePrediction.prediction_data.seasonal_patterns || {}).map(([season, pattern]: [string, any]) => (
                      <div key={season} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{season}</p>
                          <p className="text-sm text-gray-600">{pattern.reason}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{pattern.multiplier}x</span>
                          <p className="text-sm text-gray-600">vs average</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Cost Drivers & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Top Cost Drivers</h4>
                      <div className="space-y-2">
                        {maintenancePrediction.prediction_data.cost_drivers?.map((driver: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">{driver}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {maintenancePrediction.prediction_data.recommendations?.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No maintenance cost predictions available</p>
                  <Button onClick={generateNewPredictions} className="mt-4">
                    Generate Predictions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vendor" className="space-y-4">
          {vendorPrediction ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    AI-predicted vendor performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={vendorPrediction.prediction_data.overall_score} className="w-20" />
                        <span className="text-sm font-bold">{vendorPrediction.prediction_data.overall_score}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Reliability</span>
                      <div className="flex items-center gap-2">
                        <Progress value={vendorPrediction.prediction_data.reliability_score} className="w-20" />
                        <span className="text-sm font-bold">{vendorPrediction.prediction_data.reliability_score}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cost Effectiveness</span>
                      <div className="flex items-center gap-2">
                        <Progress value={vendorPrediction.prediction_data.cost_effectiveness} className="w-20" />
                        <span className="text-sm font-bold">{vendorPrediction.prediction_data.cost_effectiveness}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Quality Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={vendorPrediction.prediction_data.quality_score} className="w-20" />
                        <span className="text-sm font-bold">{vendorPrediction.prediction_data.quality_score}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>
                    Potential risks and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Risk Factors</h4>
                      <div className="space-y-2">
                        {vendorPrediction.prediction_data.risk_factors?.length > 0 ? 
                          vendorPrediction.prediction_data.risk_factors.map((risk: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">{risk}</span>
                            </div>
                          )) : (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">No significant risks identified</span>  
                            </div>
                          )
                        }
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <div className="space-y-2">
                        {vendorPrediction.prediction_data.recommendations?.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No vendor performance predictions available</p>
                  <Button onClick={generateNewPredictions} className="mt-4">
                    Generate Predictions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          {healthPrediction ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Health Score: {healthPrediction.prediction_data.overall_score}%
                  </CardTitle>
                  <CardDescription>
                    Overall community health assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Health Score</span>
                        <span className="text-sm font-bold">{healthPrediction.prediction_data.overall_score}%</span>
                      </div>
                      <Progress value={healthPrediction.prediction_data.overall_score} className="h-3" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Contributing Factors</h4>
                      <div className="space-y-2">
                        {healthPrediction.prediction_data.contributing_factors?.map((factor: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Improvement Areas</CardTitle>
                  <CardDescription>
                    Areas requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Areas for Improvement</h4>
                      <div className="space-y-2">
                        {healthPrediction.prediction_data.improvement_areas?.length > 0 ?
                          healthPrediction.prediction_data.improvement_areas.map((area: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">{area}</span>
                            </div>
                          )) : (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">No critical improvement areas identified</span>
                            </div>
                          )
                        }
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Community Strengths</h4>
                      <div className="space-y-2">
                        {healthPrediction.prediction_data.strengths?.map((strength: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                  <CardDescription>
                    Personalized suggestions to improve community health
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {healthPrediction.prediction_data.recommendations?.map((rec: string, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <Brain className="w-5 h-5 text-purple-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">AI Recommendation</p>
                            <p className="text-sm text-gray-600 mt-1">{rec}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No community health predictions available</p>
                  <Button onClick={generateNewPredictions} className="mt-4">
                    Generate Predictions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          {budgetPrediction ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTrendIcon(budgetPrediction.prediction_data.predicted_variance > 0 ? 'increasing' : 'decreasing')}
                    Budget Variance Analysis
                  </CardTitle>
                  <CardDescription>
                    Predicted vs actual budget performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPercentage(budgetPrediction.prediction_data.predicted_variance)}
                        </div>
                        <p className="text-sm text-gray-600">Predicted Year-End Variance</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Category Forecasts</h4>
                      <div className="space-y-2">
                        {budgetPrediction.prediction_data.category_forecasts?.map((forecast: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium capitalize">{forecast.category}</span>
                            <span className={`text-sm font-bold ${
                              forecast.predicted_year_end_variance > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {formatPercentage(forecast.predicted_year_end_variance)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optimization Opportunities</CardTitle>
                  <CardDescription>
                    AI-identified cost savings opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Cost Optimization</h4>
                      <div className="space-y-2">
                        {budgetPrediction.prediction_data.cost_optimization_opportunities?.map((opp: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <DollarSign className="w-4 h-4 text-green-500 mt-0.5" />
                            <span className="text-sm">{opp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <div className="space-y-2">
                        {budgetPrediction.prediction_data.recommendations?.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <Brain className="w-4 h-4 text-purple-500 mt-0.5" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium">Risk Level: {budgetPrediction.prediction_data.risk_level}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No budget variance predictions available</p>
                  <Button onClick={generateNewPredictions} className="mt-4">
                    Generate Predictions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;
