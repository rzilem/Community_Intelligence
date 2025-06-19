
import { ProcessingPhase } from './processing-phase';
import { ProcessedDocument, EnhancedProcessingOptions } from '../types';
import { trueSandboxService } from '../true-sandbox-service';
import { devLog } from '@/utils/dev-logger';

export class SandboxPhase extends ProcessingPhase {
  getName(): string {
    return 'True Sandbox Simulation';
  }

  isEnabled(options: EnhancedProcessingOptions): boolean {
    return !!options.enterpriseFeatures?.enableSandbox;
  }

  async execute(documents: ProcessedDocument[], options: EnhancedProcessingOptions): Promise<void> {
    this.logPhaseStart(documents.length);
    
    try {
      const associationId = options.associationId || 'unknown';
      const allData = documents.flatMap(doc => doc.data);
      
      if (allData.length > 0) {
        devLog.info('Creating true sandbox environment for simulation...');
        
        // Create isolated sandbox environment
        const sandbox = await trueSandboxService.createSandboxEnvironment(
          associationId,
          `Import_Simulation_${Date.now()}`
        );
        
        // Run comprehensive simulation
        const operations = [
          'validate_data',
          'check_duplicates',
          'run_import',
          'verify_integrity'
        ];
        
        const sandboxResult = await trueSandboxService.runSimulation(
          sandbox.id,
          allData,
          operations
        );
        
        // Add comprehensive sandbox results to document metadata
        if (documents.length > 0) {
          documents[0].metadata.sandboxResults = {
            simulationId: sandboxResult.simulationId,
            impactAnalysis: sandboxResult.impactAnalysis,
            rollbackPoints: [sandbox.id],
            changePreview: {
              recordsAffected: sandboxResult.impactAnalysis.recordsAffected,
              tablesModified: sandboxResult.impactAnalysis.tablesModified,
              estimatedProcessingTime: sandboxResult.impactAnalysis.performanceMetrics.processingTime
            },
            recommendations: sandboxResult.recommendations,
            risks: sandboxResult.impactAnalysis.dataIntegrityIssues.length > 0 ? 'high' : 'low',
            readyForProduction: sandboxResult.impactAnalysis.dataIntegrityIssues.length === 0
          };
        }
        
        devLog.info('Sandbox simulation completed:', {
          simulationId: sandboxResult.simulationId,
          recordsAffected: sandboxResult.impactAnalysis.recordsAffected,
          processingTime: sandboxResult.impactAnalysis.performanceMetrics.processingTime
        });
        
        // Clean up sandbox after simulation (optional - could be kept for rollback)
        if (!options.enterpriseFeatures?.keepSandboxAfterSimulation) {
          setTimeout(async () => {
            try {
              await trueSandboxService.cleanupSandbox(sandbox.id);
              devLog.info('Sandbox cleaned up:', sandbox.id);
            } catch (error) {
              devLog.error('Sandbox cleanup failed:', error);
            }
          }, 300000); // Clean up after 5 minutes
        }
        
      } else {
        devLog.warn('No data available for sandbox simulation');
      }
      
    } catch (error) {
      devLog.error('Sandbox simulation failed:', error);
      
      // Add error information to metadata
      if (documents.length > 0) {
        documents[0].metadata.sandboxResults = {
          simulationId: 'failed',
          impactAnalysis: {
            recordsAffected: 0,
            tablesModified: [],
            dataIntegrityIssues: [`Sandbox simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
            performanceMetrics: {
              processingTime: 0,
              memoryUsage: 0,
              queryCount: 0
            }
          },
          rollbackPoints: [],
          recommendations: ['Manual testing recommended due to sandbox failure'],
          risks: 'high',
          readyForProduction: false
        };
      }
    }
    
    this.logPhaseComplete();
  }
}
