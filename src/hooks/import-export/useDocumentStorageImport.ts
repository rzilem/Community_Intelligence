
import { useState } from 'react';
import { documentStorageProcessor, DocumentStorageResult } from '@/services/import-export/document-storage-processor';
import { toast } from 'sonner';
import { devLog } from '@/utils/dev-logger';

export interface DocumentStorageProgress {
  stage: 'analyzing' | 'processing' | 'storing' | 'complete' | 'error';
  message: string;
  progress: number;
  currentUnit?: string;
  currentCategory?: string;
}

export function useDocumentStorageImport() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<DocumentStorageProgress | null>(null);
  const [result, setResult] = useState<DocumentStorageResult | null>(null);

  const processDocumentZip = async (zipFile: File) => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      setProgress({
        stage: 'analyzing',
        message: 'Analyzing ZIP file structure...',
        progress: 10
      });

      const importResult = await documentStorageProcessor.processHierarchicalZip(zipFile);
      
      setProgress({
        stage: 'complete',
        message: `Successfully imported ${importResult.documentsImported} documents`,
        progress: 100
      });

      setResult(importResult);
      
      if (importResult.success) {
        toast.success(
          `Document import complete! Imported ${importResult.documentsImported} documents for ${importResult.associationName}`
        );
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
        progress: 0
      });
      
      toast.error(`Document import failed: ${errorMessage}`);
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setResult(null);
    setProgress(null);
    setIsProcessing(false);
  };

  return {
    isProcessing,
    progress,
    result,
    processDocumentZip,
    resetImport
  };
}
