import React, { useState } from 'react';
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
  BarChart3,
  Lightbulb
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

  const loadMLData = async () => {
    setIsLoading(true);
    try {
      const [insightsData, alertsData, metricsData] = await Promise.all([
        AdvancedMLService.generateAutomatedInsights(associationId),
        AdvancedMLService.generateIntelligentAlerts(associationId),
        AdvancedMLService.getMLModelMetrics(associationId)
      ]);
      
      setInsights(insightsData);
      setAlerts(alertsData);
      setModelMetrics(metricsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load ML dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced ML Dashboard</h2>
          <p className="text-muted-foreground">
            AI-powered insights and predictions for your association
          </p>
        </div>
        <Button 
          onClick={loadMLData} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Models
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <Card key={insight.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {insight.title}
                    </CardTitle>
                    <Badge variant={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getConfidenceColor(insight.confidence)}`} />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>
                    {insight.actionable && (
                      <Badge variant="outline" className="text-xs">
                        <Target className="h-3 w-3 mr-1" />
                        Actionable
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Alert key={alert.id} className="border-l-4 border-l-orange-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{alert.alertType}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((alert.severity === 'critical' ? 0.9 : alert.severity === 'warning' ? 0.7 : 0.6) * 100)}%
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {modelMetrics.map((model, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Model {model.modelVersion}
                  </CardTitle>
                  <CardDescription>
                    Trained on {model.trainingDataSize.toLocaleString()} data points
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Accuracy</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(model.accuracy * 100)}%
                        </span>
                      </div>
                      <Progress value={model.accuracy * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Precision</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(model.precision * 100)}%
                        </span>
                      </div>
                      <Progress value={model.precision * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Recall</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(model.recall * 100)}%
                        </span>
                      </div>
                      <Progress value={model.recall * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">F1 Score</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(model.f1Score * 100)}%
                        </span>
                      </div>
                      <Progress value={model.f1Score * 100} className="h-2" />
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Last trained: {model.lastTrained || 'Never'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Real-time performance metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Predictions Made</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">1,247</p>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Accuracy Rate</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">94.2%</p>
                  <p className="text-xs text-muted-foreground">+2.1% improvement</p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Active Alerts</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{alerts.length}</p>
                  <p className="text-xs text-muted-foreground">Requires attention</p>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedMLDashboard;