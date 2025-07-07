import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Wrench,
  BarChart3,
  Brain,
  Lightbulb,
  Clock,
  Target
} from 'lucide-react';
import { 
  PredictiveAnalyticsService, 
  PredictiveInsight, 
  FinancialForecast, 
  MaintenancePrediction 
} from '@/services/ai-analytics/predictive-analytics-service';
import { useToast } from '@/hooks/use-toast';

interface PredictiveAnalyticsDashboardProps {
  associationId: string;
}

const PredictiveAnalyticsDashboard: React.FC<PredictiveAnalyticsDashboardProps> = ({
  associationId
}) => {
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [forecasts, setForecasts] = useState<FinancialForecast[]>([]);
  const [maintenancePredictions, setMaintenancePredictions] = useState<MaintenancePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPredictiveData();
  }, [associationId]);

  const loadPredictiveData = async () => {
    setLoading(true);
    try {
      const [insightsData, forecastsData, maintenanceData] = await Promise.all([
        PredictiveAnalyticsService.generateRiskAssessment(associationId),
        PredictiveAnalyticsService.generateFinancialForecast(associationId, 6),
        PredictiveAnalyticsService.predictMaintenanceNeeds(associationId)
      ]);

      setInsights(insightsData);
      setForecasts(forecastsData);
      setMaintenancePredictions(maintenanceData);
    } catch (error) {
      console.error('Error loading predictive data:', error);
      toast({
        title: "Error",
        description: "Failed to load predictive analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-8 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">
              AI-generated predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Impact Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {insights.filter(i => i.impact === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                maintenancePredictions.reduce((sum, p) => sum + (p.estimatedCost * 0.3), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Through predictive maintenance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Risk Insights</TabsTrigger>
          <TabsTrigger value="financial">Financial Forecast</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
        </TabsList>

        {/* Risk Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">AI Risk Assessment</h3>
            <Button onClick={loadPredictiveData} size="sm">
              <Brain className="h-4 w-4 mr-2" />
              Refresh Analysis
            </Button>
          </div>

          {insights.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No significant risks detected. Great job!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getImpactIcon(insight.impact)}
                          <CardTitle className="text-base">{insight.title}</CardTitle>
                          <Badge variant={getImpactColor(insight.impact) as any}>
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {Math.round(insight.confidence * 100)}% confidence
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {insight.timeframe}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium mb-2">Recommended Actions:</div>
                        <ul className="text-sm space-y-1">
                          {insight.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Progress value={insight.confidence * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Financial Forecast Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">6-Month Financial Forecast</h3>
            <Badge variant="outline">
              <BarChart3 className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>

          {forecasts.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Insufficient historical data for accurate financial forecasting.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {forecasts.map((forecast, index) => (
                <Card key={forecast.period}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {new Date(forecast.period).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(forecast.predictedRevenue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Expenses</div>
                        <div className="text-lg font-semibold text-red-600">
                          {formatCurrency(forecast.predictedExpenses)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Net Cash Flow</span>
                        <div className="flex items-center gap-1">
                          {forecast.cashFlow > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`font-semibold ${
                            forecast.cashFlow > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(forecast.cashFlow)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        Confidence: {Math.round(forecast.confidence * 100)}%
                      </div>
                      <Progress value={forecast.confidence * 100} className="h-1" />
                      
                      <div className="text-xs text-muted-foreground">
                        Based on: {forecast.factors.join(', ')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Maintenance Predictions Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Predictive Maintenance Schedule</h3>
            <Badge variant="outline">
              <Wrench className="h-3 w-3 mr-1" />
              {maintenancePredictions.length} Predictions
            </Badge>
          </div>

          {maintenancePredictions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No maintenance issues predicted in the near future.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {maintenancePredictions.slice(0, 10).map((prediction, index) => (
                <Card key={`${prediction.propertyId}-${prediction.assetType}`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="font-medium">{prediction.assetType} Maintenance</div>
                        <div className="text-sm text-muted-foreground">
                          Property ID: {prediction.propertyId}
                        </div>
                        <div className="text-sm">
                          Predicted Date: {new Date(prediction.predictedFailureDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-medium text-red-600">
                          Estimated Cost: {formatCurrency(prediction.estimatedCost)}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {Math.round(prediction.confidence * 100)}% confident
                      </Badge>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="text-sm font-medium">Preventive Measures:</div>
                      <ul className="text-sm space-y-1">
                        {prediction.preventiveMeasures.map((measure, measureIndex) => (
                          <li key={measureIndex} className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {measure}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Smart Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">AI-Powered Recommendations</h3>
            <Badge variant="outline">
              <Lightbulb className="h-3 w-3 mr-1" />
              Smart Insights
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cost Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Based on predictive analysis, you could save:
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    maintenancePredictions.reduce((sum, p) => sum + (p.estimatedCost * 0.3), 0)
                  )}
                </div>
                <div className="text-sm">
                  By implementing preventive maintenance for {maintenancePredictions.length} predicted issues
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resource Allocation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  Optimal budget allocation for next quarter:
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Maintenance Reserve</span>
                    <span className="font-medium">40%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Capital Improvements</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Emergency Fund</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Operational Expenses</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;