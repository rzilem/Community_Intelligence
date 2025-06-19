
import { useState } from 'react';
import { documentStorageProcessor, DocumentStorageResult, ProcessingProgress } from '@/services/import-export/document-storage-processor';
import { toast } from 'sonner';
import { devLog } from '@/utils/dev-logger';

export function useDocumentStorageImport() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [result, setResult] = useState<DocumentStorageResult | null>(null);

  const processDocumentZip = async (zipFile: File) => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      // Set up progress tracking
      documentStorageProcessor.setProgressCallback((progressUpdate) => {
        setProgress(progressUpdate);
      });

      setProgress({
        stage: 'analyzing',
        message: 'Starting document analysis...',
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const importResult = await documentStorageProcessor.processHierarchicalZip(zipFile);
      
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
        totalUnits: 0
      });
      
      toast.error(`Document import failed: ${errorMessage}`);
      
      return null;
    } finally {
      setIsProcessing(false);
    }
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
      totalUnits: 0
    });
    toast.info('Document import cancelled');
  };

  const resetImport = () => {
    setResult(null);
    setProgress(null);
    setIsProcessing(false);
    documentStorageProcessor.cancel();
  };

  return {
    isProcessing,
    progress,
    result,
    processDocumentZip,
    cancelImport,
    resetImport
  };
}
