
import { zipParserService } from './zip-parser-service';
import { aiContentAnalyzer } from './ai-content-analyzer';
import { aiMappingService } from './ai-mapping-service';
import { templateService } from './template-service';
import { enhancedDataImportService } from './enhanced-data-import-service';
import { devLog } from '@/utils/dev-logger';
import { SmartImportResult, ImportResult } from '@/types/import-types';
import type { MappingOption } from '@/components/data-import/types/mapping-types';

export interface SmartImportOptions {
  associationId: string;
  autoImportThreshold?: number; // 0-1, default 0.85
  batchConfidenceThreshold?: number; // 0-1, default 0.75
  dryRun?: boolean;
  userId?: string;
}

function toMappingOptions(template: Record<string, string>): MappingOption[] {
  return Object.entries(template).map(([value, label]) => ({ label, value }));
}

export const smartImportService = {
  async processZipFile(zipFile: File, options: SmartImportOptions): Promise<SmartImportResult> {
    const { associationId, autoImportThreshold = 0.85, batchConfidenceThreshold = 0.75, dryRun, userId } = options;

    devLog.info('[SmartImport] Starting ZIP processing', { name: zipFile.name, size: zipFile.size });

    const aggregate: SmartImportResult = {
      success: false,
      totalFiles: 0,
      processedFiles: 0,
      skippedFiles: 0,
      totalRecords: 0,
      importedRecords: 0,
      totalProcessed: 0,
      successfulImports: 0,
      failedImports: 0,
      details: [],
      errors: [],
      warnings: []
    };

    try {
      // 1) Parse ZIP
      const zipAnalysis = await zipParserService.parseZipFile(zipFile);
      aggregate.totalFiles = zipAnalysis.files.length;
      aggregate.totalRecords = zipAnalysis.totalRecords;

      if (zipAnalysis.files.length === 0) {
        aggregate.errors.push('No supported data files found in archive');
        return aggregate;
      }

      // 2) AI content analysis
      const batch = await aiContentAnalyzer.analyzeBatch(zipAnalysis.files);
      if (batch.overallConfidence < batchConfidenceThreshold) {
        aggregate.warnings.push('Overall analysis confidence is low; manual review recommended');
      }

      // 3) For each file: build mappings and optionally auto-import
      for (const file of zipAnalysis.files) {
        const dataType = file.detectedType;
        const data = file.data || [];
        const columns = Object.keys(data[0] || {});
        const systemTemplate = templateService.getImportTemplate(dataType);
        const systemFields = toMappingOptions(systemTemplate);

        // Generate mapping suggestions (AI + enhanced fallback)
        let suggestions: Record<string, { fieldValue: string; confidence: number }> = {};
        try {
          suggestions = await aiMappingService.generateMappingSuggestions(
            columns,
            systemFields,
            data.slice(0, 5),
            dataType,
            associationId
          );
        } catch (e) {
          devLog.warn('[SmartImport] Mapping suggestion generation failed, continuing with empty suggestions');
        }

        // Convert to plain mappings the import service expects
        const mappings: Record<string, string> = {};
        const confidences: number[] = [];
        Object.entries(suggestions).forEach(([col, s]) => {
          if (s.fieldValue) {
            mappings[col] = s.fieldValue;
            if (typeof s.confidence === 'number') confidences.push(s.confidence);
          }
        });

        // Derive a mapping confidence for decision; fall back to file confidence
        const avgMappingConf = confidences.length
          ? confidences.reduce((a, b) => a + b, 0) / confidences.length
          : file.confidence || 0.5;

        const readyForAuto = avgMappingConf >= autoImportThreshold;

        if (!dryRun && readyForAuto && data.length > 0) {
          try {
            const result: ImportResult = await enhancedDataImportService.importData({
              associationId,
              dataType,
              data,
              mappings,
              userId
            });

            // Update aggregates
            aggregate.totalProcessed += data.length;
            aggregate.successfulImports += result.successfulImports;
            aggregate.failedImports += result.failedImports;
            aggregate.importedRecords += result.successfulImports;
            aggregate.processedFiles += 1;

            // Merge details/errors/warnings
            aggregate.details.push(
              ...result.details.map(d => ({
                filename: file.filename,
                status: d.status,
                recordsProcessed: d.recordsProcessed,
                message: d.message
              }))
            );
            aggregate.errors.push(...(result.errors || []));
            aggregate.warnings.push(...(result.warnings || []));
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown import error';
            aggregate.failedImports += data.length;
            aggregate.errors.push(`Import failed for ${file.filename}: ${msg}`);
          }
        } else {
          // Skip for manual mapping
          aggregate.skippedFiles += 1;
          if (!aggregate.warnings.includes('Manual review required - confidence below threshold')) {
            aggregate.warnings.push('Manual review required - confidence below threshold');
          }
        }
      }

      // Determine overall success
      aggregate.success = aggregate.failedImports === 0 && aggregate.successfulImports > 0;

      devLog.info('[SmartImport] Completed', {
        files: aggregate.totalFiles,
        processedFiles: aggregate.processedFiles,
        skippedFiles: aggregate.skippedFiles,
        importedRecords: aggregate.importedRecords,
        warnings: aggregate.warnings.length,
        errors: aggregate.errors.length
      });

      return aggregate;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      devLog.error('[SmartImport] Fatal error', error);
      return {
        success: false,
        totalFiles: 0,
        processedFiles: 0,
        skippedFiles: 0,
        totalRecords: 0,
        importedRecords: 0,
        totalProcessed: 0,
        successfulImports: 0,
        failedImports: 0,
        details: [],
        errors: [errorMessage],
        warnings: []
      };
    }
  }
};

