
import { useState } from 'react';
import { documentStorageProcessor, DocumentStorageResult, ProcessingProgress } from '@/services/import-export/document-storage-processor';
import { toast } from 'sonner';
import { devLog } from '@/utils/dev-logger';

export function useDocumentStorageImport() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [result, setResult] = useState<DocumentStorageResult | null>(null);
  const [canResume, setCanResume] = useState(false);

  const processDocumentZip = async (zipFile: File, resumeFromSaved = false) => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      // Set up progress tracking
      documentStorageProcessor.setProgressCallback((progressUpdate) => {
        setProgress(progressUpdate);
        setCanResume(progressUpdate.canResume || false);
      });

      setProgress({
        stage: 'analyzing',
        message: resumeFromSaved ? 'Resuming document analysis...' : 'Starting document analysis...',
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const importResult = resumeFromSaved 
        ? await documentStorageProcessor.resumeProcessing(zipFile)
        : await documentStorageProcessor.processHierarchicalZip(zipFile);
      
      setResult(importResult);
      
      if (importResult.success) {
        const successMessage = `Document import complete! Imported ${importResult.documentsImported} documents for ${importResult.associationName}`;
        
        if (importResult.warnings.length > 0) {
          toast.success(successMessage, {
            description: `${importResult.warnings.length} files were skipped due to size or type restrictions`
          });
        } else {
          toast.success(successMessage);
        }
      } else {
        toast.error('Document import completed with errors. Please check the results.');
      }
      
      return importResult;
      
    } catch (error) {
      devLog.error('Document storage import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setProgress({
        stage: 'error',
        message: `Import failed: ${errorMessage}`,
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0,
        canResume: true
      });
      
      toast.error(`Document import failed: ${errorMessage}`);
      setCanResume(true);
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const resumeImport = async (zipFile: File) => {
    devLog.info('Resuming import from saved progress');
    return processDocumentZip(zipFile, true);
  };

  const cancelImport = () => {
    documentStorageProcessor.cancel();
    setIsProcessing(false);
    setProgress({
      stage: 'error',
      message: 'Import cancelled by user',
      progress: 0,
      filesProcessed: 0,
      totalFiles: 0,
      unitsProcessed: 0,
      totalUnits: 0,
      canResume: true
    });
    setCanResume(true);
    toast.info('Document import cancelled - you can resume later');
  };

  const resetImport = () => {
    setResult(null);
    setProgress(null);
    setIsProcessing(false);
    setCanResume(false);
    documentStorageProcessor.cancel();
    // Clear any saved progress
    localStorage.removeItem('documentImportProgress');
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
