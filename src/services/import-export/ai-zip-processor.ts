
import JSZip from 'jszip';
import { parseService } from './parse-service';
import { openaiContentAnalyzer } from './openai-content-analyzer';
import { associationAutoCreationService } from './association-auto-creation-service';
import { progressTrackingService, type ProgressCallback } from './progress-tracking-service';
import { dataImportService } from './data-import-service';
import { devLog } from '@/utils/dev-logger';

export interface AIZipProcessorResult {
  totalFiles: number;
  associations: Set<string>;
  properties: number;
  owners: number;
  financials: number;
  documents: number;
  processingTime: number;
  errors: string[];
}

export class AIZipProcessor {
  private progressCallback?: ProgressCallback;

  setProgressCallback(callback: ProgressCallback) {
    this.progressCallback = callback;
  }

  async processZipFile(zipFile: File): Promise<AIZipProcessorResult> {
    const startTime = Date.now();
    devLog.info('Starting AI ZIP processing for:', zipFile.name);

    try {
      // Extract ZIP contents
      const zip = await JSZip.loadAsync(zipFile);
      const files = Object.keys(zip.files).filter(name => 
        !zip.files[name].dir && 
        /\.(csv|xlsx?|txt)$/i.test(name)
      );

      const tracker = progressTrackingService.createProgressTracker(files.length, 0);
      if (this.progressCallback) {
        tracker.setCallback(this.progressCallback);
      }

      tracker.updateProgress({
        stage: 'analyzing',
        message: `Analyzing ${files.length} files...`
      });

      // Parse all files
      const parsedFiles = [];
      for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        try {
          const file = zip.files[fileName];
          const content = await file.async('text');
          const parsed = await parseService.parseFileContent(content, fileName);
          
          if (parsed.data && parsed.data.length > 0) {
            parsedFiles.push({
              filename: fileName,
              folderName: this.extractFolderName(fileName),
              headers: Object.keys(parsed.data[0]),
              sampleData: parsed.data.slice(0, 5),
              fullData: parsed.data
            });
          }

          tracker.updateProgress({
            filesProcessed: i + 1,
            message: `Analyzed ${fileName}`,
            currentFile: fileName
          });
        } catch (error) {
          devLog.error(`Failed to parse ${fileName}:`, error);
          tracker.updateProgress({
            errors: [...tracker.getProgress().errors, `Failed to parse ${fileName}`]
          });
        }
      }

      // Update total records count
      const totalRecords = parsedFiles.reduce((sum, file) => sum + file.fullData.length, 0);
      const newTracker = progressTrackingService.createProgressTracker(files.length, totalRecords);
      if (this.progressCallback) {
        newTracker.setCallback(this.progressCallback);
      }

      newTracker.updateProgress({
        stage: 'mapping',
        filesProcessed: files.length,
        message: 'AI analyzing content and mapping fields...'
      });

      // AI content analysis
      const aiAnalysis = await openaiContentAnalyzer.analyzeBatch(parsedFiles);

      newTracker.updateProgress({
        stage: 'validating',
        message: 'Detecting and creating associations...'
      });

      // Auto-detect and create associations
      const folderNames = [...new Set(parsedFiles.map(f => f.folderName).filter(Boolean))];
      const fileNames = parsedFiles.map(f => f.filename);
      const allData = parsedFiles.flatMap(f => f.fullData);

      const associationCandidates = await associationAutoCreationService.detectAssociationCandidates(
        folderNames,
        fileNames,
        allData
      );

      const createdAssociations = await associationAutoCreationService.createOrFindAssociations(
        associationCandidates
      );

      newTracker.updateProgress({
        stage: 'importing',
        message: `Importing data for ${createdAssociations.length} associations...`
      });

      // Process imports
      let processedRecords = 0;
      const results = {
        totalFiles: parsedFiles.length,
        associations: new Set(createdAssociations.map(a => a.name)),
        properties: 0,
        owners: 0,
        financials: 0,
        documents: 0,
        processingTime: 0,
        errors: []
      };

      for (const file of parsedFiles) {
        try {
          const analysis = aiAnalysis.fileAnalyses[file.filename];
          if (!analysis) continue;

          // Find appropriate association
          const association = createdAssociations.find(a => 
            file.folderName?.toLowerCase().includes(a.name.toLowerCase()) ||
            file.filename.toLowerCase().includes(a.name.toLowerCase())
          ) || createdAssociations[0]; // Fallback to first association

          if (!association) {
            results.errors.push(`No association found for ${file.filename}`);
            continue;
          }

          // Import the data
          const importResult = await progressTrackingService.withRetry(
            () => dataImportService.importData({
              associationId: association.id,
              dataType: analysis.dataType,
              data: file.fullData,
              mappings: analysis.fieldMappings
            }),
            3
          );

          // Update counters
          switch (analysis.dataType) {
            case 'properties':
            case 'properties_owners':
              results.properties += importResult.successfulImports;
              break;
            case 'owners':
              results.owners += importResult.successfulImports;
              break;
            case 'financial':
            case 'assessments':
              results.financials += importResult.successfulImports;
              break;
          }

          processedRecords += file.fullData.length;
          newTracker.updateProgress({
            recordsProcessed: processedRecords,
            message: `Imported ${file.filename} (${importResult.successfulImports} records)`,
            currentFile: file.filename
          });

        } catch (error) {
          const errorMsg = `Failed to import ${file.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          devLog.error(errorMsg, error);
        }
      }

      results.processingTime = Date.now() - startTime;

      newTracker.updateProgress({
        stage: 'complete',
        percentage: 100,
        message: `Import complete! Processed ${results.totalFiles} files in ${(results.processingTime / 1000).toFixed(1)}s`
      });

      devLog.info('AI ZIP processing complete:', results);
      return results;

    } catch (error) {
      devLog.error('AI ZIP processing failed:', error);
      
      if (this.progressCallback) {
        this.progressCallback({
          stage: 'error',
          filesProcessed: 0,
          totalFiles: 0,
          recordsProcessed: 0,
          totalRecords: 0,
          percentage: 0,
          message: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: []
        });
      }

      throw error;
    }
  }

  private extractFolderName(filePath: string): string | null {
    const parts = filePath.split('/');
    return parts.length > 1 ? parts[parts.length - 2] : null;
  }
}
