
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface ProcessingProgress {
  stage: 'analyzing' | 'extracting' | 'creating' | 'uploading' | 'complete' | 'error';
  message: string;
  progress: number;
  filesProcessed: number;
  totalFiles: number;
  unitsProcessed: number;
  totalUnits: number;
  canResume?: boolean;
}

export interface DocumentStorageResult {
  success: boolean;
  associationName: string;
  associationId?: string;
  propertiesCreated: number;
  unitsCreated: number;
  documentsImported: number;
  documentsSkipped: number;
  errors: string[];
  warnings: string[];
  processingTime: number;
}

export interface UnitStructure {
  unitNumber: string;
  unitPath: string;
  documents: Array<{
    name: string;
    path: string;
    file: JSZip.JSZipObject;
    category: string;
  }>;
}

export interface AssociationStructure {
  name: string;
  units: UnitStructure[];
  generalDocuments: Array<{
    name: string;
    path: string;
    file: JSZip.JSZipObject;
    category: string;
  }>;
}

class DocumentStorageProcessor {
  private progressCallback?: (progress: ProcessingProgress) => void;
  private cancelled = false;

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  cancel() {
    this.cancelled = true;
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    const startTime = Date.now();
    this.cancelled = false;

    try {
      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing ZIP structure...',
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      // Load and analyze ZIP structure
      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipFile);
      
      const structure = await this.analyzeZipStructure(zipData);
      
      if (!structure) {
        throw new Error('Could not identify association structure in ZIP file');
      }

      this.updateProgress({
        stage: 'creating',
        message: `Creating association "${structure.name}"...`,
        progress: 20,
        filesProcessed: 0,
        totalFiles: structure.units.reduce((sum, unit) => sum + unit.documents.length, 0) + structure.generalDocuments.length,
        unitsProcessed: 0,
        totalUnits: structure.units.length
      });

      // Create or find association
      const associationId = await this.createOrFindAssociation(structure.name);
      
      // Create properties and units
      const propertiesCreated = await this.createPropertiesAndUnits(associationId, structure);
      
      this.updateProgress({
        stage: 'uploading',
        message: 'Processing and uploading documents...',
        progress: 40,
        filesProcessed: 0,
        totalFiles: structure.units.reduce((sum, unit) => sum + unit.documents.length, 0) + structure.generalDocuments.length,
        unitsProcessed: 0,
        totalUnits: structure.units.length
      });

      // Process documents
      let documentsImported = 0;
      let documentsSkipped = 0;
      let filesProcessed = 0;
      const errors: string[] = [];
      const warnings: string[] = [];

      // Process unit documents
      for (const unit of structure.units) {
        if (this.cancelled) break;

        for (const doc of unit.documents) {
          if (this.cancelled) break;

          try {
            const success = await this.processDocument(doc, associationId, unit.unitNumber);
            if (success) {
              documentsImported++;
            } else {
              documentsSkipped++;
              warnings.push(`Skipped ${doc.name} - unsupported format or too large`);
            }
          } catch (error) {
            documentsSkipped++;
            errors.push(`Failed to process ${doc.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }

          filesProcessed++;
          this.updateProgress({
            stage: 'uploading',
            message: `Processing ${doc.name}...`,
            progress: 40 + (filesProcessed / (structure.units.reduce((sum, unit) => sum + unit.documents.length, 0) + structure.generalDocuments.length)) * 50,
            filesProcessed,
            totalFiles: structure.units.reduce((sum, unit) => sum + unit.documents.length, 0) + structure.generalDocuments.length,
            unitsProcessed: structure.units.indexOf(unit) + 1,
            totalUnits: structure.units.length
          });
        }
      }

      // Process general documents
      for (const doc of structure.generalDocuments) {
        if (this.cancelled) break;

        try {
          const success = await this.processDocument(doc, associationId);
          if (success) {
            documentsImported++;
          } else {
            documentsSkipped++;
            warnings.push(`Skipped ${doc.name} - unsupported format or too large`);
          }
        } catch (error) {
          documentsSkipped++;
          errors.push(`Failed to process ${doc.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        filesProcessed++;
        this.updateProgress({
          stage: 'uploading',
          message: `Processing ${doc.name}...`,
          progress: 40 + (filesProcessed / (structure.units.reduce((sum, unit) => sum + unit.documents.length, 0) + structure.generalDocuments.length)) * 50,
          filesProcessed,
          totalFiles: structure.units.reduce((sum, unit) => sum + unit.documents.length, 0) + structure.generalDocuments.length,
          unitsProcessed: structure.units.length,
          totalUnits: structure.units.length
        });
      }

      this.updateProgress({
        stage: 'complete',
        message: `Import complete! Created ${propertiesCreated} properties, processed ${documentsImported} documents`,
        progress: 100,
        filesProcessed,
        totalFiles: structure.units.reduce((sum, unit) => sum + unit.documents.length, 0) + structure.generalDocuments.length,
        unitsProcessed: structure.units.length,
        totalUnits: structure.units.length
      });

      return {
        success: true,
        associationName: structure.name,
        associationId,
        propertiesCreated,
        unitsCreated: structure.units.length,
        documentsImported,
        documentsSkipped,
        errors,
        warnings,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      devLog.error('Document import failed:', error);
      
      this.updateProgress({
        stage: 'error',
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0,
        canResume: true
      });

      return {
        success: false,
        associationName: '',
        propertiesCreated: 0,
        unitsCreated: 0,
        documentsImported: 0,
        documentsSkipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        processingTime: Date.now() - startTime
      };
    }
  }

  private async analyzeZipStructure(zipData: JSZip): Promise<AssociationStructure | null> {
    const files = Object.keys(zipData.files).filter(name => !zipData.files[name].dir);
    
    // Find the association name from the root folder
    const pathParts = files[0]?.split('/') || [];
    if (pathParts.length < 2) {
      throw new Error('ZIP structure should be: Association/Unit/Documents');
    }
    
    const associationName = pathParts[0];
    const units: UnitStructure[] = [];
    const generalDocuments: Array<{
      name: string;
      path: string;
      file: JSZip.JSZipObject;
      category: string;
    }> = [];

    // Group files by unit
    const unitMap = new Map<string, UnitStructure>();

    for (const filePath of files) {
      const parts = filePath.split('/');
      if (parts.length < 3) continue; // Skip files not in proper structure

      const [assocName, unitNumber, ...docPathParts] = parts;
      if (assocName !== associationName) continue;

      const fileName = docPathParts[docPathParts.length - 1];
      const file = zipData.files[filePath];
      
      if (!file || file.dir) continue;

      // Determine document category
      const category = this.categorizeDocument(fileName);

      // Skip unsupported files
      if (!this.isSupportedFile(fileName)) continue;

      if (unitNumber.toLowerCase().includes('general') || unitNumber.toLowerCase().includes('common')) {
        // General association documents
        generalDocuments.push({
          name: fileName,
          path: filePath,
          file,
          category
        });
      } else {
        // Unit-specific documents
        if (!unitMap.has(unitNumber)) {
          unitMap.set(unitNumber, {
            unitNumber,
            unitPath: `${assocName}/${unitNumber}`,
            documents: []
          });
        }

        unitMap.get(unitNumber)!.documents.push({
          name: fileName,
          path: filePath,
          file,
          category
        });
      }
    }

    units.push(...Array.from(unitMap.values()));

    return {
      name: associationName,
      units,
      generalDocuments
    };
  }

  private async createOrFindAssociation(name: string): Promise<string> {
    // Try to find existing association
    const { data: existing } = await supabase
      .from('associations')
      .select('id')
      .ilike('name', `%${name}%`)
      .limit(1)
      .single();

    if (existing) {
      devLog.info('Found existing association:', existing.id);
      return existing.id;
    }

    // Create new association
    const { data: newAssoc, error } = await supabase
      .from('associations')
      .insert({
        name,
        status: 'active'
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create association: ${error.message}`);
    }

    devLog.info('Created new association:', newAssoc.id);
    return newAssoc.id;
  }

  private async createPropertiesAndUnits(associationId: string, structure: AssociationStructure): Promise<number> {
    let propertiesCreated = 0;

    for (const unit of structure.units) {
      try {
        // Check if property already exists
        const { data: existing } = await supabase
          .from('properties')
          .select('id')
          .eq('association_id', associationId)
          .eq('unit_number', unit.unitNumber)
          .single();

        if (existing) {
          devLog.info(`Property ${unit.unitNumber} already exists`);
          continue;
        }

        // Create new property
        const { error } = await supabase
          .from('properties')
          .insert({
            association_id: associationId,
            unit_number: unit.unitNumber,
            address: `Unit ${unit.unitNumber}`,
            property_type: 'unit'
          });

        if (error) {
          devLog.error(`Failed to create property ${unit.unitNumber}:`, error);
        } else {
          propertiesCreated++;
          devLog.info(`Created property: ${unit.unitNumber}`);
        }
      } catch (error) {
        devLog.error(`Error creating property ${unit.unitNumber}:`, error);
      }
    }

    return propertiesCreated;
  }

  private async processDocument(
    doc: { name: string; path: string; file: JSZip.JSZipObject; category: string },
    associationId: string,
    unitNumber?: string
  ): Promise<boolean> {
    try {
      // Get file content
      const content = await doc.file.async('blob');
      
      // Check file size (300MB limit)
      if (content.size > 300 * 1024 * 1024) {
        devLog.warn(`File ${doc.name} too large: ${content.size} bytes`);
        return false;
      }

      // Create a proper file object
      const file = new File([content], doc.name, { type: content.type });

      // Store document record in database
      const { error } = await supabase
        .from('documents')
        .insert({
          association_id: associationId,
          name: doc.name,
          file_type: this.getFileType(doc.name),
          file_size: content.size,
          category: doc.category,
          url: doc.path, // Temporary - would be storage URL in real implementation
          is_public: false,
          uploaded_by: null // Would be current user in real implementation
        });

      if (error) {
        devLog.error(`Failed to store document ${doc.name}:`, error);
        return false;
      }

      devLog.info(`Successfully processed document: ${doc.name}`);
      return true;

    } catch (error) {
      devLog.error(`Error processing document ${doc.name}:`, error);
      return false;
    }
  }

  private categorizeDocument(fileName: string): string {
    const name = fileName.toLowerCase();
    
    if (name.includes('lease') || name.includes('contract')) return 'legal';
    if (name.includes('insurance') || name.includes('policy')) return 'insurance';
    if (name.includes('maintenance') || name.includes('repair')) return 'maintenance';
    if (name.includes('financial') || name.includes('invoice') || name.includes('receipt')) return 'financial';
    if (name.includes('photo') || name.includes('image') || name.match(/\.(jpg|jpeg|png|gif)$/)) return 'photos';
    if (name.includes('inspection') || name.includes('report')) return 'inspection';
    
    return 'general';
  }

  private isSupportedFile(fileName: string): boolean {
    const supportedExtensions = [
      '.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.bmp',
      '.xls', '.xlsx', '.csv', '.zip', '.rar'
    ];
    
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return supportedExtensions.includes(ext);
  }

  private getFileType(fileName: string): string {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    
    const typeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.csv': 'text/csv'
    };
    
    return typeMap[ext] || 'application/octet-stream';
  }

  private updateProgress(progress: ProcessingProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    // For now, just restart the process
    // In a real implementation, this would check for saved progress
    return this.processHierarchicalZip(zipFile);
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
