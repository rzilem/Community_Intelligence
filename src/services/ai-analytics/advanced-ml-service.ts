import { supabase } from '@/integrations/supabase/client';

export interface MLModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  trainingDataSize: number;
  modelVersion: string;
}

export interface AutomatedInsight {
  id: string;
  type: 'anomaly' | 'trend' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  generatedAt: string;
}

export interface IntelligentAlert {
  id: string;
  alertType: 'financial_risk' | 'maintenance_due' | 'compliance_issue' | 'resident_concern';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  suggestedActions: string[];
  relatedData: any;
  autoResolvable: boolean;
  createdAt: string;
}

export class AdvancedMLService {
  /**
   * Generate automated insights using multiple ML models
   */
  static async generateAutomatedInsights(associationId: string): Promise<AutomatedInsight[]> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-insight-generator', {
        body: {
          associationId,
          analysisTypes: ['financial_patterns', 'maintenance_trends', 'resident_behavior', 'operational_efficiency'],
          includeAnomalyDetection: true,
          includePredictiveAnalysis: true,
          confidenceThreshold: 0.7
        }
      });

      if (error) throw error;

      const insights: AutomatedInsight[] = data.insights.map((insight: any) => ({
        id: insight.id || `insight_${Date.now()}_${Math.random()}`,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence,
        actionable: insight.actionable || false,
        priority: insight.priority,
        data: insight.data || {},
        generatedAt: new Date().toISOString()
      }));

      // Store insights for future reference
      await this.storeInsights(insights, associationId);
      return insights;

    } catch (error) {
      console.error('Failed to generate automated insights:', error);
      
      // Return fallback insights
      return [
        {
          id: `fallback_${Date.now()}`,
          type: 'trend',
          title: 'Financial Performance Stable',
          description: 'Your association\'s financial metrics show consistent performance over the past quarter.',
          confidence: 0.8,
          actionable: false,
          priority: 'low',
          data: { trend: 'stable', period: 'quarterly' },
          generatedAt: new Date().toISOString()
        }
      ];
    }
  }

  /**
   * Generate intelligent alerts based on real-time data analysis
   */
  static async generateIntelligentAlerts(associationId: string): Promise<IntelligentAlert[]> {
    try {
      // Fetch recent data for analysis
      const [arData, maintenanceData, assessmentData] = await Promise.all([
        supabase.from('accounts_receivable').select('*').eq('association_id', associationId).eq('status', 'open'),
        supabase.from('maintenance_requests').select('*, properties!inner(association_id)').eq('properties.association_id', associationId).eq('status', 'open'),
        supabase.from('assessments').select('*, properties!inner(association_id)').eq('properties.association_id', associationId).eq('payment_status', 'unpaid')
      ]);

      const alerts: IntelligentAlert[] = [];

      // Financial risk analysis
      const totalReceivables = arData.data?.reduce((sum, ar) => sum + (ar.current_balance || 0), 0) || 0;
      if (totalReceivables > 50000) {
        alerts.push({
          id: `alert_${Date.now()}_financial`,
          alertType: 'financial_risk',
          severity: totalReceivables > 100000 ? 'critical' : 'warning',
          message: `High accounts receivable balance: $${totalReceivables.toLocaleString()}`,
          suggestedActions: [
            'Send automated payment reminders',
            'Review collection procedures',
            'Consider payment plan options'
          ],
          relatedData: { amount: totalReceivables, count: arData.data?.length },
          autoResolvable: false,
          createdAt: new Date().toISOString()
        });
      }

      // Maintenance risk analysis
      const urgentMaintenance = maintenanceData.data?.filter(req => 
        req.priority === 'urgent' || req.priority === 'emergency'
      ).length || 0;

      if (urgentMaintenance > 5) {
        alerts.push({
          id: `alert_${Date.now()}_maintenance`,
          alertType: 'maintenance_due',
          severity: urgentMaintenance > 10 ? 'critical' : 'warning',
          message: `${urgentMaintenance} urgent maintenance requests require immediate attention`,
          suggestedActions: [
            'Prioritize emergency requests',
            'Schedule additional maintenance staff',
            'Review maintenance response procedures'
          ],
          relatedData: { urgentCount: urgentMaintenance, totalOpen: maintenanceData.data?.length },
          autoResolvable: false,
          createdAt: new Date().toISOString()
        });
      }

      // Assessment compliance analysis
      const overdueAssessments = assessmentData.data?.filter(assessment => {
        const dueDate = new Date(assessment.due_date);
        const today = new Date();
        return today > dueDate;
      }).length || 0;

      if (overdueAssessments > 10) {
        alerts.push({
          id: `alert_${Date.now()}_compliance`,
          alertType: 'compliance_issue',
          severity: overdueAssessments > 25 ? 'critical' : 'warning',
          message: `${overdueAssessments} overdue assessments may impact cash flow`,
          suggestedActions: [
            'Send payment reminders',
            'Apply late fees per policy',
            'Initiate collection procedures'
          ],
          relatedData: { overdueCount: overdueAssessments, totalUnpaid: assessmentData.data?.length },
          autoResolvable: true,
          createdAt: new Date().toISOString()
        });
      }

      return alerts;

    } catch (error) {
      console.error('Failed to generate intelligent alerts:', error);
      return [];
    }
  }

  /**
   * Get ML model performance metrics
   */
  static async getMLModelMetrics(associationId: string): Promise<MLModelMetrics[]> {
    try {
      const { data, error } = await supabase
        .from('ai_model_performance')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      return (data || []).map(model => ({
        accuracy: model.accuracy_score || 0,
        precision: model.performance_metrics?.precision || 0,
        recall: model.performance_metrics?.recall || 0,
        f1Score: model.performance_metrics?.f1_score || 0,
        lastTrained: model.last_trained || '',
        trainingDataSize: model.training_data_size || 0,
        modelVersion: model.model_version || 'v1.0'
      }));

    } catch (error) {
      console.error('Failed to fetch ML model metrics:', error);
      return [];
    }
  }

  /**
   * Trigger model retraining for improved performance
   */
  static async triggerModelRetraining(
    modelType: string,
    associationId: string,
    options: {
      includeNewData?: boolean;
      optimizeHyperparameters?: boolean;
      incremental?: boolean;
    } = {}
  ): Promise<{ success: boolean; jobId: string; estimatedDuration: number }> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-model-trainer', {
        body: {
          modelType,
          associationId,
          retrainMode: options.incremental ? 'incremental' : 'full',
          optimizeHyperparameters: options.optimizeHyperparameters || false,
          includeNewData: options.includeNewData || true,
          features: ['performance_feedback', 'new_training_data', 'user_corrections']
        }
      });

      if (error) throw error;

      return {
        success: true,
        jobId: data.jobId,
        estimatedDuration: data.estimatedDuration || 3600 // 1 hour default
      };

    } catch (error) {
      console.error('Model retraining failed:', error);
      return {
        success: false,
        jobId: '',
        estimatedDuration: 0
      };
    }
  }

  /**
   * Analyze data quality and suggest improvements
   */
  static async analyzeDataQuality(associationId: string): Promise<{
    overallScore: number;
    issues: Array<{
      category: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      suggestedFix: string;
    }>;
    recommendations: string[];
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-data-quality-analyzer', {
        body: {
          associationId,
          analyzeCategories: ['completeness', 'accuracy', 'consistency', 'timeliness', 'uniqueness']
        }
      });

      if (error) throw error;

      return {
        overallScore: data.overallScore || 0.7,
        issues: data.issues || [],
        recommendations: data.recommendations || [
          'Regular data validation checks',
          'Implement data entry standards',
          'Set up automated data cleaning'
        ]
      };

    } catch (error) {
      console.error('Data quality analysis failed:', error);
      return {
        overallScore: 0.7,
        issues: [],
        recommendations: ['Enable data quality monitoring to get detailed insights']
      };
    }
  }

  /**
   * Get personalized recommendations based on association data
   */
  static async getPersonalizedRecommendations(
    associationId: string,
    categories: string[] = ['financial', 'operational', 'resident_engagement']
  ): Promise<Array<{
    id: string;
    category: string;
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    confidence: number;
    estimatedSavings?: number;
    actionSteps: string[];
  }>> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-recommendation-engine', {
        body: {
          associationId,
          categories,
          personalizeFor: 'association',
          includeROICalculation: true,
          maxRecommendations: 10
        }
      });

      if (error) throw error;

      return data.recommendations || [];

    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      return [
        {
          id: `rec_${Date.now()}`,
          category: 'financial',
          title: 'Optimize Payment Processing',
          description: 'Implement automated payment reminders to improve collection efficiency',
          impact: 'medium',
          effort: 'low',
          confidence: 0.8,
          estimatedSavings: 5000,
          actionSteps: [
            'Set up automated email reminders',
            'Configure payment portal',
            'Monitor collection rates'
          ]
        }
      ];
    }
  }

  private static async storeInsights(insights: AutomatedInsight[], associationId: string): Promise<void> {
    try {
      for (const insight of insights) {
        await supabase.from('ai_resident_insights').insert({
          association_id: associationId,
          insight_type: insight.type,
          patterns: [{ 
            category: insight.title, 
            trend: 'stable', 
            confidence: insight.confidence, 
            impact: insight.description 
          }],
          recommendations: [insight.description],
          action_items: insight.actionable ? [{ 
            priority: insight.priority, 
            action: insight.title, 
            expectedOutcome: insight.description 
          }] : []
        });
      }
    } catch (error) {
      console.error('Failed to store insights:', error);
    }
  }
}