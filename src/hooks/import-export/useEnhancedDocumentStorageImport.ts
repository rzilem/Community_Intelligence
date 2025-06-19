
import { useState } from 'react';
import { enhancedDocumentStorageProcessor, DocumentStorageResult, ProcessingProgress } from '@/services/import-export/enhanced-document-storage-processor';
import { toast } from 'sonner';
import { devLog } from '@/utils/dev-logger';

export function useEnhancedDocumentStorageImport() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [result, setResult] = useState<DocumentStorageResult | null>(null);
  const [canResume, setCanResume] = useState(false);

  const processDocumentZip = async (zipFile: File, resumeFromSaved = false) => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      // Set up progress tracking
      enhancedDocumentStorageProcessor.setProgressCallback((progressUpdate) => {
        devLog.info('Progress update:', progressUpdate);
        setProgress(progressUpdate);
        setCanResume(progressUpdate.canResume || false);
      });

      setProgress({
        stage: 'analyzing',
        message: resumeFromSaved ? 'Resuming document analysis...' : 'Starting enhanced document analysis...',
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const importResult = resumeFromSaved 
        ? await enhancedDocumentStorageProcessor.resumeProcessing(zipFile)
        : await enhancedDocumentStorageProcessor.processHierarchicalZip(zipFile);
      
      setResult(importResult);
      
      if (importResult.success) {
        let successMessage = `Enhanced import complete! Imported ${importResult.documentsImported} documents`;
        
        if (importResult.createdProperties.length > 0) {
          successMessage += ` and created ${importResult.createdProperties.length} properties`;
        }
        
        successMessage += ` for ${importResult.associationName}`;
        
        if (importResult.warnings.length > 0) {
          toast.success(successMessage, {
            description: `${importResult.warnings.length} files were skipped due to size or processing restrictions`
          });
        } else {
          toast.success(successMessage);
        }
        
        devLog.info('Enhanced import completed successfully:', importResult);
      } else {
        toast.error('Enhanced document import completed with errors. Please check the results.');
        devLog.error('Enhanced import completed with errors:', importResult.errors);
      }
      
      return importResult;
      
    } catch (error) {
      devLog.error('Enhanced document storage import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setProgress({
        stage: 'error',
        message: `Enhanced import failed: ${errorMessage}`,
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0,
        canResume: true
      });
      
      toast.error(`Enhanced document import failed: ${errorMessage}`);
      setCanResume(true);
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const resumeImport = async (zipFile: File) => {
    devLog.info('Resuming enhanced import from saved progress');
    return processDocumentZip(zipFile, true);
  };

  const cancelImport = () => {
    enhancedDocumentStorageProcessor.cancel();
    setIsProcessing(false);
    setProgress({
      stage: 'error',
      message: 'Enhanced import cancelled by user',
      progress: 0,
      filesProcessed: 0,
      totalFiles: 0,
      unitsProcessed: 0,
      totalUnits: 0,
      canResume: true
    });
    setCanResume(true);
    toast.info('Enhanced document import cancelled - you can resume later');
  };

  const resetImport = () => {
    setResult(null);
    setProgress(null);
    setIsProcessing(false);
    setCanResume(false);
    enhancedDocumentStorageProcessor.cancel();
    // Clear any saved progress
    localStorage.removeItem('enhancedDocumentImportProgress');
  };

  return {
    isProcessing,
    progress,
    result,
    canResume,
    processDocumentZip,
    resumeImport,
    cancelImport,
    resetImport
  };
}
