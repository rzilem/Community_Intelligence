import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Eye, 
  Target,
  Zap,
  BarChart3,
  Users,
  Wrench,
  DollarSign,
  Shield
} from 'lucide-react';
import { PredictiveAnalyticsEngine, FinancialForecast, MaintenancePrediction, ResidentBehaviorInsight } from '@/services/ai-workflow/predictive-analytics-engine-mock';
import { IntelligentDocumentProcessor, DocumentProcessingResult, VisionAnalysisResult } from '@/services/ai-analytics/intelligent-document-processor';
import { DecisionSupportService, SmartRecommendation } from '@/services/ai-analytics/decision-support-service';
import { useAuth } from '@/contexts/AuthContext';

interface AIAnalyticsDashboardProps {
  className?: string;
}

export const AIAnalyticsDashboard: React.FC<AIAnalyticsDashboardProps> = ({ className }) => {
  const { currentAssociation } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // State for AI insights
  const [forecasts, setForecasts] = useState<FinancialForecast[]>([]);
  const [maintenancePredictions, setMaintenancePredictions] = useState<MaintenancePrediction[]>([]);
  const [residentInsights, setResidentInsights] = useState<ResidentBehaviorInsight[]>([]);
  const [documentResults, setDocumentResults] = useState<DocumentProcessingResult[]>([]);
  const [visionAnalyses, setVisionAnalyses] = useState<VisionAnalysisResult[]>([]);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);

  useEffect(() => {
    if (currentAssociation?.id) {
      loadAIInsights();
    }
  }, [currentAssociation?.id]);

  const loadAIInsights = async () => {
    if (!currentAssociation?.id) return;
    
    setIsLoading(true);
    try {
      const [
        cashFlowForecast,
        delinquencyForecast,
        behaviorInsights,
        docHistory,
        smartRecs
      ] = await Promise.all([
        PredictiveAnalyticsEngine.generateFinancialForecast(currentAssociation.id, 'cash_flow'),
        PredictiveAnalyticsEngine.generateFinancialForecast(currentAssociation.id, 'delinquency'),
        PredictiveAnalyticsEngine.analyzeResidentBehavior(currentAssociation.id),
        IntelligentDocumentProcessor.getProcessingHistory(currentAssociation.id),
        DecisionSupportService.getAllRecommendations(currentAssociation.id)
      ]);

      setForecasts([...cashFlowForecast, ...delinquencyForecast]);
      setResidentInsights(behaviorInsights);
      setDocumentResults(docHistory);
      setRecommendations(smartRecs);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'resident': return <Users className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'vision': return <Eye className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-success';
    if (confidence >= 0.7) return 'bg-warning';
    return 'bg-destructive';
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Predictions Active</CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecasts.length + maintenancePredictions.length + residentInsights.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Across financial, maintenance & resident insights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentResults.length}</div>
            <p className="text-xs text-muted-foreground">
              {documentResults.filter(d => d.confidence > 0.9).length} high confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Smart Recommendations</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              ${recommendations.reduce((sum, r) => sum + (r.potentialSavings || 0), 0).toLocaleString()} potential savings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(forecasts.reduce((sum, f) => sum + (f.confidence || 0), 0) / (forecasts.length || 1) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all models
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="residents">Residents</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Key AI Insights
                </CardTitle>
                <CardDescription>
                  Most important findings from AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    {getInsightIcon(rec.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(rec.confidence * 100)}% confidence
                        </Badge>
                        {rec.potentialSavings && (
                          <Badge variant="secondary" className="text-xs">
                            ${rec.potentialSavings.toLocaleString()} savings
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Processing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Recent AI Processing
                </CardTitle>
                <CardDescription>
                  Latest document processing and analysis results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {documentResults.slice(0, 4).map((result) => (
                  <div key={result.id} className="flex items-center gap-3 p-2 rounded border">
                    <FileText className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">
                        {result.documentType.replace('_', ' ')} Document
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.metadata.language.toUpperCase()} • {result.metadata.pageCount} pages
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={result.confidence * 100} 
                        className="w-12 h-2"
                      />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="grid gap-6">
            {forecasts.map((forecast, index) => (
              <Card key={forecast.id || index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {forecast.period} Forecast
                  </CardTitle>
                  <CardDescription>
                    AI prediction with {Math.round((forecast.confidence || 0) * 100)}% confidence
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-primary">
                        ${forecast.predictedRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-primary">
                        ${forecast.predictedExpenses.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Expenses</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-primary">
                        ${forecast.cashFlow.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Cash Flow</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">AI Recommendations:</h4>
                    {forecast.recommendations?.slice(0, 2).map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                        <Badge variant="secondary" className="mt-0.5">
                          High
                        </Badge>
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Predictive Maintenance
              </CardTitle>
              <CardDescription>
                AI-powered maintenance predictions and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {maintenancePredictions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No maintenance predictions available yet.</p>
                  <p className="text-sm">Predictions will appear as we gather more data.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenancePredictions.map((pred, index) => (
                    <div key={pred.id || index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold capitalize">
                          {pred.equipment_type?.replace('_', ' ')} - {pred.prediction_type?.replace('_', ' ')}
                        </h4>
                        <Badge variant={pred.confidence > 0.7 ? 'destructive' : pred.confidence > 0.4 ? 'default' : 'secondary'}>
                          {Math.round(pred.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Expected: {pred.predicted_date || 'Soon'}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Estimated Cost</h5>
                          <p className="text-sm">${pred.estimated_cost?.toLocaleString() || 'TBD'}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Recommendations</h5>
                          <ul className="text-xs space-y-1">
                            {pred.recommendations?.slice(0, 2).map((action, i) => (
                              <li key={i}>• {action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="residents" className="space-y-4">
          <div className="grid gap-6">
            {residentInsights.map((insight, index) => (
              <Card key={insight.id || index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <Users className="h-5 w-5 text-primary" />
                    {insight.insight_type?.replace('_', ' ')} Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Key Pattern</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="capitalize">
                            {insight.pattern}
                          </Badge>
                          <span>{insight.category}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <div className="space-y-2">
                        {insight.recommendations?.slice(0, 3).map((item, index) => (
                          <div key={index} className="text-sm p-2 rounded border">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary">
                                Medium
                              </Badge>
                            </div>
                            <p className="text-sm">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Document Processing
              </CardTitle>
              <CardDescription>
                AI-powered document analysis and processing results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No processed documents available yet.</p>
                  <p className="text-sm">Documents will appear as they are processed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documentResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold capitalize">
                          {result.documentType.replace('_', ' ')} Document
                        </h4>
                        <Badge variant={result.confidence > 0.9 ? 'default' : result.confidence > 0.7 ? 'secondary' : 'destructive'}>
                          {Math.round(result.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Language: {result.metadata.language.toUpperCase()} • Pages: {result.metadata.pageCount}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Extracted Data</h5>
                          <p className="text-xs">{Object.keys(result.extractedData).length} fields extracted</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-1">Processing Status</h5>
                          <p className="text-xs">Completed recently</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                Smart Recommendations
              </CardTitle>
              <CardDescription>
                AI-generated recommendations for optimal association management
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recommendations available yet.</p>
                  <p className="text-sm">Recommendations will appear as AI analyzes your data.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            High
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(rec.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {rec.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-1">Category</h5>
                          <p className="text-sm capitalize">{rec.type.replace('_', ' ')}</p>
                        </div>
                        {rec.potentialSavings && (
                          <div>
                            <h5 className="font-medium text-sm mb-1">Potential Savings</h5>
                            <p className="text-sm font-medium text-green-600">
                              ${rec.potentialSavings.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <h5 className="font-medium text-sm mb-2">Action Items:</h5>
                        <ul className="text-xs space-y-1">
                          <li className="flex items-start gap-1">
                            <span className="text-primary">•</span>
                            <span>Review and implement recommendation</span>
                          </li>
                        </ul>
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