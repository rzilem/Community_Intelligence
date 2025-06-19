
import { useState, useCallback } from 'react';
import { multiFormatProcessor } from '@/services/import-export/multi-format-processor';
import { enhancedDuplicateDetectionService } from '@/services/import-export/enhanced-duplicate-detection-service';
import { dataQualityService } from '@/services/import-export/data-quality-service';
import { toast } from 'sonner';

export interface EnhancedImportWorkflowState {
  isProcessing: boolean;
  currentStep: string;
  progress: number;
  results: {
    processedDocuments: any[];
    duplicateResults: any;
    qualityResults: any;
    recommendations: string[];
  } | null;
  error: string | null;
}

export function useEnhancedImportWorkflow() {
  const [state, setState] = useState<EnhancedImportWorkflowState>({
    isProcessing: false,
    currentStep: '',
    progress: 0,
    results: null,
    error: null
  });

  const processFiles = useCallback(async (
    files: File[],
    options: {
      enableOCR?: boolean;
      enableDuplicateDetection?: boolean;
      enableQualityAssessment?: boolean;
      enableAutoFix?: boolean;
    } = {}
  ) => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      currentStep: 'Initializing...',
      progress: 0,
      error: null
    }));

    try {
      // Step 1: Process files
      setState(prev => ({ ...prev, currentStep: 'Processing files...', progress: 20 }));
      
      const results = await multiFormatProcessor.processWithEnhancedAnalysis(files, {
        enableOCR: options.enableOCR,
        enableDuplicateDetection: options.enableDuplicateDetection,
        enableQualityAssessment: options.enableQualityAssessment,
        enableAutoFix: options.enableAutoFix,
        fallbackToOCR: true
      });

      setState(prev => ({ ...prev, progress: 100, results }));
      
      toast.success(`Successfully processed ${files.length} files`);
      
      if (results.recommendations.length > 0) {
        toast.info(`Review ${results.recommendations.length} recommendations`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      toast.error(`Processing failed: ${errorMessage}`);
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      currentStep: '',
      progress: 0,
      results: null,
      error: null
    });
  }, []);

  return {
    state,
    processFiles,
    reset
  };
}
