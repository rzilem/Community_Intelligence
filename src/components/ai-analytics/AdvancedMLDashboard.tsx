import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain,
  AlertTriangle,
  TrendingUp,
  Target,
  Zap,
  RefreshCw,
  CheckCircle,
  Clock,
  BarChart3,
  Lightbulb,
  Shield,
  Database
} from 'lucide-react';
import { AdvancedMLService, AutomatedInsight, IntelligentAlert, MLModelMetrics } from '@/services/ai-analytics/advanced-ml-service';
import { useToast } from '@/hooks/use-toast';

interface AdvancedMLDashboardProps {
  associationId: string;
  className?: string;
}

export const AdvancedMLDashboard: React.FC<AdvancedMLDashboardProps> = ({ 
  associationId, 
  className 
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('insights');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for ML components
  const [insights, setInsights] = useState<AutomatedInsight[]>([]);
  const [alerts, setAlerts] = useState<IntelligentAlert[]>([]);
  const [modelMetrics, setModelMetrics] = useState<MLModelMetrics[]>([]);
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    loadMLData();
  }, [associationId]);

  const loadMLData = async () => {
    setIsLoading(true);
    try {
      const [
        automatedInsights,
        intelligentAlerts,
        mlMetrics,
        dataQualityAnalysis,
        personalizedRecs
      ] = await Promise.all([
        AdvancedMLService.generateAutomatedInsights(associationId),
        AdvancedMLService.generateIntelligentAlerts(associationId),
        AdvancedMLService.getMLModelMetrics(associationId),
        AdvancedMLService.analyzeDataQuality(associationId),
        AdvancedMLService.getPersonalizedRecommendations(associationId)
      ]);

      setInsights(automatedInsights);
      setAlerts(intelligentAlerts);
      setModelMetrics(mlMetrics);
      setDataQuality(dataQualityAnalysis);
      setRecommendations(personalizedRecs);

    } catch (error) {
      console.error('Failed to load ML data:', error);
      toast({
        title: "Error Loading ML Data",
        description: "Failed to load AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerModelRetraining = async (modelType: string) => {
    setIsLoading(true);
    try {
      const result = await AdvancedMLService.triggerModelRetraining(modelType, associationId, {
        includeNewData: true,
        optimizeHyperparameters: true,
        incremental: false
      });

      if (result.success) {
        toast({
          title: "Model Retraining Started",
          description: `Training job ${result.jobId} started. Estimated duration: ${Math.round(result.estimatedDuration / 60)} minutes.`,
        });
      } else {
        throw new Error('Retraining failed');
      }
    } catch (error) {
      toast({
        title: "Retraining Failed",
        description: "Failed to start model retraining. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'trend': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'prediction': return <Brain className="h-4 w-4 text-purple-500" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-green-500" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Insights</CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">
              {insights.filter(i => i.actionable).length} actionable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(a => a.severity === 'critical').length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Performance</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(modelMetrics.reduce((sum, m) => sum + m.accuracy, 0) / modelMetrics.length * 100) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((dataQuality?.overallScore || 0) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Quality score
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="quality">Data Quality</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <Button 
            onClick={loadMLData} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Refresh AI Analysis
          </Button>
        </div>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Automated AI Insights
              </CardTitle>
              <CardDescription>
                AI-generated insights from your association data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    No insights available yet. The AI will generate insights as more data becomes available.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="flex items-start gap-3 p-4 rounded-lg border">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge variant={getPriorityBadgeVariant(insight.priority)}>
                            {insight.priority}
                          </Badge>
                          {insight.actionable && (
                            <Badge variant="outline">Actionable</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                          <span>Type: {insight.type}</span>
                          <span>Generated: {new Date(insight.generatedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Intelligent Alerts
              </CardTitle>
              <CardDescription>
                AI-powered alerts requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No alerts at this time. Your association data looks healthy!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-4 rounded-lg border">
                      {getAlertIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold capitalize">
                            {alert.alertType.replace('_', ' ')}
                          </h4>
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                            {alert.severity}
                          </Badge>
                          {alert.autoResolvable && (
                            <Badge variant="outline">Auto-resolvable</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                        
                        <div className="mb-2">
                          <h5 className="text-sm font-medium mb-1">Suggested Actions:</h5>
                          <ul className="text-sm space-y-1">
                            {alert.suggestedActions.map((action, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(alert.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                ML Model Performance
              </CardTitle>
              <CardDescription>
                Performance metrics for all active ML models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modelMetrics.length === 0 ? (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Model metrics will be available after the first training cycle completes.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {modelMetrics.map((model, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{model.modelVersion}</h4>
                        <Button
                          onClick={() => triggerModelRetraining(`model_${index}`)}
                          disabled={isLoading}
                          variant="outline"
                          size="sm"
                        >
                          Retrain Model
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-sm font-medium">Accuracy</div>
                          <div className="text-2xl font-bold">{(model.accuracy * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Precision</div>
                          <div className="text-2xl font-bold">{(model.precision * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Recall</div>
                          <div className="text-2xl font-bold">{(model.recall * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">F1 Score</div>
                          <div className="text-2xl font-bold">{(model.f1Score * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span>Training Data Size: </span>
                          <span className="font-medium">{model.trainingDataSize.toLocaleString()}</span>
                        </div>
                        <div>
                          <span>Last Trained: </span>
                          <span className="font-medium">
                            {model.lastTrained ? new Date(model.lastTrained).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Data Quality Analysis
              </CardTitle>
              <CardDescription>
                Assessment of data quality and suggestions for improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dataQuality && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-sm font-medium">Overall Quality Score</div>
                      <div className="text-3xl font-bold">
                        {Math.round(dataQuality.overallScore * 100)}%
                      </div>
                    </div>
                    <div className="flex-1">
                      <Progress value={dataQuality.overallScore * 100} className="h-3" />
                    </div>
                  </div>

                  {dataQuality.issues && dataQuality.issues.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Data Quality Issues</h4>
                      <div className="space-y-2">
                        {dataQuality.issues.map((issue: any, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-3 rounded border">
                            <Badge variant={getPriorityBadgeVariant(issue.severity)}>
                              {issue.severity}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-medium">{issue.category}</p>
                              <p className="text-sm text-muted-foreground">{issue.description}</p>
                              <p className="text-xs text-green-600 mt-1">
                                <strong>Fix:</strong> {issue.suggestedFix}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {dataQuality.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Lightbulb className="w-3 h-3 text-yellow-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Personalized Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered recommendations tailored to your association
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Personalized recommendations will be generated based on your association's data patterns.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{rec.title}</h4>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {rec.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">Impact: {rec.impact}</div>
                          <div className={`text-sm ${getEffortColor(rec.effort)}`}>
                            Effort: {rec.effort}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                      
                      {rec.estimatedSavings && (
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">
                            Potential Savings: ${rec.estimatedSavings.toLocaleString()}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(rec.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      )}
                      
                      <div>
                        <h5 className="text-sm font-medium mb-1">Action Steps:</h5>
                        <ol className="text-sm space-y-1">
                          {rec.actionSteps.map((step: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                                {index + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedMLDashboard;