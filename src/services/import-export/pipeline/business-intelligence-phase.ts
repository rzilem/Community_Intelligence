
import { ProcessingPhase } from './processing-phase';
import { ProcessedDocument, EnhancedProcessingOptions } from '../types';
import { realTimeBusinessIntelligenceService } from '../real-time-bi-service';
import { devLog } from '@/utils/dev-logger';

export class BusinessIntelligencePhase extends ProcessingPhase {
  getName(): string {
    return 'Real-time Business Intelligence';
  }

  isEnabled(options: EnhancedProcessingOptions): boolean {
    return !!options.businessIntelligence?.enableDashboards;
  }

  async execute(documents: ProcessedDocument[], options: EnhancedProcessingOptions): Promise<void> {
    this.logPhaseStart(documents.length);
    
    try {
      const associationId = options.associationId || 'unknown';
      
      // Generate comprehensive business intelligence metrics
      const [dashboard, realTimeMetrics, performanceReport] = await Promise.all([
        realTimeBusinessIntelligenceService.generateExecutiveDashboard(associationId),
        realTimeBusinessIntelligenceService.getRealTimeMetrics(associationId),
        realTimeBusinessIntelligenceService.generatePerformanceOptimizationReport(associationId)
      ]);
      
      // Add business intelligence data to documents
      for (const doc of documents) {
        doc.metadata.businessIntelligence = {
          qualityMetrics: {
            overallScore: dashboard.overview.dataQualityScore,
            completeness: dashboard.qualityMetrics.completeness,
            accuracy: dashboard.qualityMetrics.accuracy,
            consistency: dashboard.qualityMetrics.consistency,
            timeliness: dashboard.qualityMetrics.timeliness
          },
          performanceStats: {
            processingSpeed: dashboard.performanceStats.processingSpeed,
            errorRate: dashboard.performanceStats.errorRate,
            systemLoad: realTimeMetrics.processingRate,
            currentHealth: realTimeMetrics.systemHealth
          },
          predictiveAnalytics: {
            forecasts: dashboard.predictiveAnalytics.forecasts,
            risks: dashboard.predictiveAnalytics.risks.map(risk => ({
              level: risk.level,
              description: risk.description
            })),
            opportunities: dashboard.predictiveAnalytics.opportunities.map(opp => ({
              description: opp.description,
              impact: opp.impact
            }))
          },
          recommendations: dashboard.recommendations.map(rec => ({
            priority: rec.priority,
            category: rec.category,
            action: rec.action,
            benefit: rec.expectedBenefit
          })),
          optimizationInsights: {
            bottlenecks: performanceReport.bottlenecks,
            suggestedOptimizations: performanceReport.optimizations,
            projectedImprovements: performanceReport.projectedImprovements
          }
        };
        
        // Add quality-based processing recommendations
        if (dashboard.overview.dataQualityScore < 0.8) {
          if (!doc.metadata.businessIntelligence.recommendations) {
            doc.metadata.businessIntelligence.recommendations = [];
          }
          doc.metadata.businessIntelligence.recommendations.push({
            priority: 'high',
            category: 'Data Quality',
            action: 'Enable enhanced validation and ML-powered data cleaning',
            benefit: 'Improve data quality score by 15-20%'
          });
        }
        
        // Add performance-based recommendations
        if (dashboard.performanceStats.processingSpeed < 100) {
          if (!doc.metadata.businessIntelligence.recommendations) {
            doc.metadata.businessIntelligence.recommendations = [];
          }
          doc.metadata.businessIntelligence.recommendations.push({
            priority: 'medium',
            category: 'Performance',
            action: 'Implement batch processing and indexing optimizations',
            benefit: 'Double processing speed and reduce resource usage'
          });
        }
      }
      
      devLog.info('Business intelligence analysis completed:', {
        qualityScore: dashboard.overview.dataQualityScore,
        processingSpeed: dashboard.performanceStats.processingSpeed,
        systemHealth: realTimeMetrics.systemHealth,
        recommendationsGenerated: dashboard.recommendations.length
      });
      
    } catch (error) {
      devLog.error('Business intelligence analysis failed:', error);
      
      // Add fallback BI data
      for (const doc of documents) {
        doc.metadata.businessIntelligence = {
          qualityMetrics: {
            overallScore: 0.5,
            completeness: 0.5,
            accuracy: 0.5,
            consistency: 0.5,
            timeliness: 0.5
          },
          performanceStats: {
            processingSpeed: 0,
            errorRate: 1.0,
            systemLoad: 0,
            currentHealth: 'critical'
          },
          predictiveAnalytics: {
            forecasts: {},
            risks: [{ level: 'high', description: 'BI analysis failed - manual review required' }],
            opportunities: []
          },
          recommendations: [{
            priority: 'critical',
            category: 'System',
            action: 'Investigate BI system failure and restore monitoring',
            benefit: 'Restore system visibility and insights'
          }]
        };
      }
    }
    
    this.logPhaseComplete();
  }
}
