import { supabase } from '@/integrations/supabase/client';
import JSZip from 'jszip';
import { devLog } from '@/utils/dev-logger';
import { intelligentUnitParser } from './intelligent-unit-parser';
import { enhancedPropertyMatcher } from './enhanced-property-matcher';

export interface DocumentStorageResult {
  success: boolean;
  associationId: string;
  associationName: string;
  documentsImported: number;
  documentsSkipped: number;
  totalFiles: number;
  createdProperties: Array<{
    id: string;
    address: string;
    unitNumber: string;
  }>;
  createdOwners: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
  }>;
  errors: string[];
  warnings: string[];
  processingTime: number;
}

export interface ProcessingProgress {
  stage: 'analyzing' | 'creating_properties' | 'uploading' | 'complete' | 'error';
  message: string;
  progress: number;
  filesProcessed: number;
  totalFiles: number;
  unitsProcessed: number;
  totalUnits: number;
  canResume?: boolean;
}

export const documentStorageProcessor = {
  progressCallback: null as ((progress: ProcessingProgress) => void) | null,
  shouldCancel: false,

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  },

  cancel() {
    this.shouldCancel = true;
  },

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    this.shouldCancel = false;
    const startTime = Date.now();
    devLog.info('Starting hierarchical ZIP processing:', zipFile.name);

    try {
      // Load and analyze ZIP structure
      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipFile);
      
      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing ZIP structure and extracting file information...',
        progress: 10,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      // Extract file structure and metadata
      const fileStructure = await this.analyzeZipStructure(zipData);
      const associationName = this.extractAssociationName(fileStructure);
      
      devLog.info('ZIP analysis complete:', {
        totalFiles: fileStructure.length,
        associationName,
        samplePaths: fileStructure.slice(0, 5).map(f => f.path)
      });

      // Find or create association
      const association = await this.findOrCreateAssociation(associationName);
      
      this.updateProgress({
        stage: 'creating_properties',
        message: `Processing documents for ${associationName}...`,
        progress: 20,
        filesProcessed: 0,
        totalFiles: fileStructure.length,
        unitsProcessed: 0,
        totalUnits: this.countUniqueUnits(fileStructure)
      });

      // Load existing properties for matching
      const existingProperties = await enhancedPropertyMatcher.loadExistingProperties(association.id);
      
      // Process documents with intelligent property matching
      const processingResults = await this.processDocumentsWithIntelligentMatching(
        fileStructure,
        association.id,
        existingProperties
      );

      const result: DocumentStorageResult = {
        success: true,
        associationId: association.id,
        associationName: association.name,
        documentsImported: processingResults.imported,
        documentsSkipped: processingResults.skipped,
        totalFiles: fileStructure.length,
        createdProperties: processingResults.createdProperties,
        createdOwners: [],
        errors: processingResults.errors,
        warnings: processingResults.warnings,
        processingTime: Date.now() - startTime
      };

      this.updateProgress({
        stage: 'complete',
        message: `Import complete! Imported ${processingResults.imported} documents, created ${processingResults.createdProperties.length} properties`,
        progress: 100,
        filesProcessed: fileStructure.length,
        totalFiles: fileStructure.length,
        unitsProcessed: processingResults.createdProperties.length,
        totalUnits: this.countUniqueUnits(fileStructure)
      });

      devLog.info('Document import completed:', result);
      return result;

    } catch (error) {
      devLog.error('Document processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        associationId: '',
        associationName: '',
        documentsImported: 0,
        documentsSkipped: 0,
        totalFiles: 0,
        createdProperties: [],
        createdOwners: [],
        errors: [errorMessage],
        warnings: [],
        processingTime: Date.now() - startTime
      };
    }
  },

  async processDocumentsWithIntelligentMatching(
    fileStructure: any[],
    associationId: string,
    existingProperties: any[]
  ) {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    const warnings: string[] = [];
    const createdProperties: any[] = [];
    const matchingStats = {
      exact: 0,
      fuzzy: 0,
      created: 0,
      failed: 0
    };

    for (let i = 0; i < fileStructure.length; i++) {
      if (this.shouldCancel) {
        warnings.push('Import cancelled by user');
        break;
      }

      const file = fileStructure[i];
      
      try {
        // Find or create property using intelligent matching
        const matchResult = await enhancedPropertyMatcher.findOrCreateProperty(
          file.path,
          associationId,
          existingProperties
        );

        // Update statistics
        matchingStats[matchResult.matchType]++;

        if (matchResult.property) {
          // Track created properties
          if (matchResult.created) {
            createdProperties.push({
              id: matchResult.property.id,
              address: matchResult.property.address,
              unitNumber: matchResult.property.unit_number
            });
          }

          // Upload document and link to property
          const documentData = await this.uploadDocument(file, associationId, matchResult.property.id);
          if (documentData) {
            imported++;
            devLog.info(`Successfully imported document: ${file.filename} -> Property: ${matchResult.property.unit_number}`);
          } else {
            skipped++;
            warnings.push(`Failed to upload document: ${file.filename}`);
          }
        } else {
          skipped++;
          errors.push(`Could not match property for ${file.filename}: ${matchResult.reason}`);
          devLog.warn(`Skipped document ${file.filename}: ${matchResult.reason}`);
        }

        // Update progress
        this.updateProgress({
          stage: 'uploading',
          message: `Processing documents... (${i + 1}/${fileStructure.length})`,
          progress: 20 + Math.floor((i + 1) / fileStructure.length * 70),
          filesProcessed: i + 1,
          totalFiles: fileStructure.length,
          unitsProcessed: createdProperties.length,
          totalUnits: this.countUniqueUnits(fileStructure)
        });

      } catch (error) {
        skipped++;
        const errorMsg = `Failed to process ${file.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        devLog.error(errorMsg, error);
      }
    }

    // Add detailed matching statistics to warnings
    warnings.push(`Matching Statistics: Exact: ${matchingStats.exact}, Fuzzy: ${matchingStats.fuzzy}, Created: ${matchingStats.created}, Failed: ${matchingStats.failed}`);

    devLog.info('Document processing complete:', {
      imported,
      skipped,
      createdProperties: createdProperties.length,
      matchingStats
    });

    return {
      imported,
      skipped,
      errors,
      warnings,
      createdProperties
    };
  },

  updateProgress(progress: ProcessingProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
      localStorage.setItem('documentImportProgress', JSON.stringify(progress));
    }
  },

  async analyzeZipStructure(zipData: JSZip): Promise<any[]> {
    const fileStructure: any[] = [];

    for (const [filename, zipObject] of Object.entries(zipData.files)) {
      if (zipObject.dir) continue;

      try {
        const fileData = await zipObject.async('blob');
        const file = new File([fileData], filename);
        const url = URL.createObjectURL(file);

        fileStructure.push({
          filename: filename.split('/').pop() || filename,
          path: filename,
          url: url,
          size: file.size,
          type: file.type
        });
      } catch (error) {
        devLog.error(`Error processing file ${filename}:`, error);
      }
    }

    return fileStructure;
  },

  async findOrCreateAssociation(associationName: string): Promise<any> {
    // Check if association exists
    let { data: existingAssociation, error: selectError } = await supabase
      .from('associations')
      .select('*')
      .eq('name', associationName)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      devLog.error('Error checking for existing association:', selectError);
      throw new Error(`Failed to check for existing association: ${selectError.message}`);
    }

    if (existingAssociation) {
      devLog.info('Association already exists:', existingAssociation);
      return existingAssociation;
    }

    // Create association if it doesn't exist
    const { data: newAssociation, error: insertError } = await supabase
      .from('associations')
      .insert([{ name: associationName, status: 'active' }])
      .select('*')
      .single();

    if (insertError) {
      devLog.error('Error creating association:', insertError);
      throw new Error(`Failed to create association: ${insertError.message}`);
    }

    devLog.info('Created new association:', newAssociation);
    return newAssociation;
  },

  async uploadDocument(file: any, associationId: string, propertyId: string): Promise<any | null> {
    try {
      // Parse document category from filename
      const category = this.categorizeDocument(file.filename);
      
      const documentData = {
        association_id: associationId,
        property_id: propertyId,
        name: file.filename,
        url: file.url || `documents/${file.filename}`,
        file_type: file.type || this.getFileType(file.filename),
        file_size: file.size || 0,
        category: category,
        folder_path: file.path,
        is_public: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select('*')
        .single();

      if (error) {
        devLog.error('Failed to insert document:', error);
        return null;
      }

      return data;
    } catch (error) {
      devLog.error('Document upload error:', error);
      return null;
    }
  },

  categorizeDocument(filename: string): string {
    const name = filename.toLowerCase();
    
    if (name.includes('lease')) return 'lease';
    if (name.includes('insurance')) return 'insurance';
    if (name.includes('maintenance') || name.includes('repair')) return 'maintenance';
    if (name.includes('inspection')) return 'inspection';
    if (name.includes('legal') || name.includes('contract')) return 'legal';
    if (name.includes('financial') || name.includes('invoice')) return 'financial';
    if (name.includes('bylaw') || name.includes('rule')) return 'governance';
    
    return 'general';
  },

  getFileType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'jpg': case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      default: return 'application/octet-stream';
    }
  },

  countUniqueUnits(fileStructure: any[]): number {
    const units = new Set();
    fileStructure.forEach(file => {
      const parsedInfo = intelligentUnitParser.parseUnitFromPath(file.path);
      if (parsedInfo?.unitNumber) {
        units.add(parsedInfo.unitNumber);
      }
    });
    return units.size;
  },

  extractAssociationName(fileStructure: any[]): string {
    if (fileStructure.length === 0) return 'Unknown Association';
    
    const associationName = intelligentUnitParser.extractAssociationName(fileStructure[0].path);
    return associationName || 'Unknown Association';
  },

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    // For now, just restart the process
    // In a full implementation, we'd restore from saved state
    return this.processHierarchicalZip(zipFile);
  }
};
