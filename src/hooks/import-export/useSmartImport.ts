
import { useState } from 'react';
import { smartImportService, SmartImportOptions, SmartImportResult } from '@/services/import-export/smart-import-service';
import { toast } from 'sonner';
import { devLog } from '@/utils/dev-logger';

export function useSmartImport() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [smartImportResult, setSmartImportResult] = useState<SmartImportResult | null>(null);

  const processZipFile = async (zipFile: File, options: SmartImportOptions) => {
    setIsProcessing(true);
    setSmartImportResult(null);
    
    try {
      devLog.info('Starting smart import process:', zipFile.name);
      const result = await smartImportService.processZipFile(zipFile, options);
      
      setSmartImportResult(result);
      
      if (result.success) {
        toast.success(`Smart import completed! Processed ${result.processedFiles} files with ${result.importedRecords} records.`);
      } else if (result.warnings.includes('Manual review required - confidence below threshold')) {
        toast.warning('Some files need manual review. Please check the mapping modal.');
      } else {
        toast.error(`Smart import failed: ${result.errors.join(', ')}`);
      }
      
      return result;
    } catch (error) {
      devLog.error('Smart import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Smart import failed: ${errorMessage}`);
      
      setSmartImportResult({
        success: false,
        totalFiles: 0,
        processedFiles: 0,
        skippedFiles: 0,
        totalRecords: 0,
        importedRecords: 0,
        errors: [errorMessage],
        warnings: [],
        details: []
      });
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const resetSmartImport = () => {
    setSmartImportResult(null);
    setIsProcessing(false);
  };

  return {
    isProcessing,
    smartImportResult,
    processZipFile,
    resetSmartImport
  };
}
