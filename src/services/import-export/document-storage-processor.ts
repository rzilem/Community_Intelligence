import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface ProcessingProgress {
  stage: 'analyzing' | 'processing' | 'creating_properties' | 'uploading' | 'complete' | 'error';
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
  associationId: string;
  documentsImported: number;
  documentsSkipped: number;
  totalFiles: number;
  createdProperties: any[];
  createdOwners: any[];
  processingTime: number;
  warnings: string[];
  errors: string[];
}

export class DocumentStorageProcessor {
  private progressCallback: ((progress: ProcessingProgress) => void) | null = null;
  private isCancelled: boolean = false;

  constructor() {}

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  cancel() {
    this.isCancelled = true;
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult | null> {
    // TODO: Implement resume logic
    console.warn('Resume processing not implemented yet');
    return null;
  }

  private updateProgress(progress: ProcessingProgress) {
    devLog.info('Progress update:', progress);
    this.progressCallback?.(progress);
    localStorage.setItem('documentImportProgress', JSON.stringify(progress));
  }

  private async analyzeZipStructure(zip: JSZip): Promise<{
    associationName: string;
    units: string[];
    totalFiles: number;
  }> {
    const topLevelFolders = [];
    let totalFiles = 0;

    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir) {
        totalFiles++;
      }

      const parts = relativePath.split('/');
      if (parts.length === 1 && zipEntry.dir) {
        topLevelFolders.push(parts[0]);
      }
    });

    if (topLevelFolders.length !== 1) {
      throw new Error('ZIP file must contain a single top-level folder representing the association.');
    }

    const associationName = topLevelFolders[0];
    const units: string[] = [];

    zip.folder(associationName)?.forEach((relativePath, zipEntry) => {
      const parts = relativePath.split('/');
      if (parts.length === 1 && zipEntry.dir) {
        units.push(parts[0]);
      }
    });

    return { associationName, units, totalFiles };
  }

  private extractUnitFromPath(filePath: string): string | null {
    const parts = filePath.split('/');
    if (parts.length >= 2) {
      return parts[1]; // Assuming the unit is the second level folder
    }
    return null;
  }

  private extractFileName(filePath: string): string {
    const parts = filePath.split('/');
    return parts[parts.length - 1];
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }

  private categorizeDocument(filename: string): string {
    const lowerFilename = filename.toLowerCase();

    if (lowerFilename.includes('lease')) {
      return 'Lease Agreement';
    } else if (lowerFilename.includes('insurance')) {
      return 'Insurance Policy';
    } else if (lowerFilename.includes('inspection')) {
      return 'Inspection Report';
    } else if (lowerFilename.includes('bylaws')) {
      return 'Bylaws';
    } else {
      return 'Other';
    }
  }

  private async createProperties(associationId: string, units: string[]): Promise<Map<string, any>> {
    const propertyMap: Map<string, any> = new Map();

    for (const unit of units) {
      try {
        const unitNumber = unit.replace('Unit ', '');
        const { data: property, error } = await supabase
          .from('properties')
          .insert({
            association_id: associationId,
            address: 'Unknown', // You might want to extract address from file name or content
            unit_number: unitNumber,
            property_type: 'Condo', // Default type
            is_active: true
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        propertyMap.set(unit, property);
      } catch (error) {
        devLog.error(`Failed to create property for unit ${unit}:`, error);
      }
    }

    return propertyMap;
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    const startTime = Date.now();
    this.isCancelled = false;
    
    try {
      this.updateProgress({
        stage: 'analyzing',
        message: 'Loading and analyzing ZIP file...',
        progress: 5,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const zip = await JSZip.loadAsync(zipFile);
      const zipStructure = await this.analyzeZipStructure(zip);
      
      this.updateProgress({
        stage: 'processing',
        message: `Processing ${zipStructure.associationName}...`,
        progress: 15,
        filesProcessed: 0,
        totalFiles: zipStructure.totalFiles,
        unitsProcessed: 0,
        totalUnits: zipStructure.units.length
      });

      // Create or get association and ensure user access
      const associationId = await this.createOrGetAssociation(zipStructure.associationName);
      
      this.updateProgress({
        stage: 'creating_properties',
        message: 'Creating properties and setting up access...',
        progress: 25,
        filesProcessed: 0,
        totalFiles: zipStructure.totalFiles,
        unitsProcessed: 0,
        totalUnits: zipStructure.units.length
      });

      // Create properties for each unit
      const propertyMap = await this.createProperties(associationId, zipStructure.units);
      
      this.updateProgress({
        stage: 'uploading',
        message: 'Processing and uploading documents...',
        progress: 40,
        filesProcessed: 0,
        totalFiles: zipStructure.totalFiles,
        unitsProcessed: zipStructure.units.length,
        totalUnits: zipStructure.units.length
      });

      // Process documents with better error handling
      const documentResults = await this.processDocumentsWithRetry(
        zip, 
        associationId, 
        propertyMap, 
        zipStructure
      );

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      const result: DocumentStorageResult = {
        success: documentResults.errors.length === 0,
        associationName: zipStructure.associationName,
        associationId,
        documentsImported: documentResults.imported,
        documentsSkipped: documentResults.skipped,
        totalFiles: zipStructure.totalFiles,
        createdProperties: Array.from(propertyMap.values()),
        createdOwners: [], // Will be populated when we add owner creation
        processingTime,
        warnings: documentResults.warnings,
        errors: documentResults.errors
      };

      this.updateProgress({
        stage: 'complete',
        message: 'Document import completed successfully!',
        progress: 100,
        filesProcessed: zipStructure.totalFiles,
        totalFiles: zipStructure.totalFiles,
        unitsProcessed: zipStructure.units.length,
        totalUnits: zipStructure.units.length
      });

      return result;

    } catch (error) {
      devLog.error('Document processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      this.updateProgress({
        stage: 'error',
        message: `Import failed: ${errorMessage}`,
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0,
        canResume: true
      });

      throw error;
    }
  }

  private async createOrGetAssociation(associationName: string): Promise<string> {
    try {
      // First, try to find existing association
      const { data: existingAssociation, error: searchError } = await supabase
        .from('associations')
        .select('id')
        .eq('name', associationName)
        .maybeSingle();

      if (searchError) {
        devLog.error('Error searching for existing association:', searchError);
      }

      if (existingAssociation) {
        devLog.info('Found existing association:', existingAssociation.id);
        return existingAssociation.id;
      }

      // Create new association using the security definer function
      devLog.info('Creating new association:', associationName);
      
      const { data: newAssociationId, error: createError } = await supabase
        .rpc('create_association_with_admin', {
          p_name: associationName,
          p_address: null,
          p_contact_email: null,
          p_city: null,
          p_state: null,
          p_zip: null,
          p_phone: null,
          p_property_type: 'mixed',
          p_total_units: null
        });

      if (createError) {
        devLog.error('Error creating association:', createError);
        throw new Error(`Failed to create association: ${createError.message}`);
      }

      if (!newAssociationId) {
        throw new Error('Failed to create association: No ID returned');
      }

      devLog.info('Successfully created association with ID:', newAssociationId);
      
      // Verify user assignment was successful
      const { data: userAssignment, error: assignmentError } = await supabase
        .from('association_users')
        .select('role')
        .eq('association_id', newAssociationId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (assignmentError) {
        devLog.warn('Could not verify user assignment:', assignmentError);
      } else if (!userAssignment) {
        devLog.warn('User was not assigned to the new association');
        // Try to assign manually as fallback
        const { error: manualAssignError } = await supabase
          .rpc('assign_user_to_association', {
            p_association_id: newAssociationId,
            p_user_id: (await supabase.auth.getUser()).data.user?.id,
            p_role: 'admin'
          });
        
        if (manualAssignError) {
          devLog.error('Failed to manually assign user:', manualAssignError);
        } else {
          devLog.info('Successfully assigned user manually');
        }
      } else {
        devLog.info('User successfully assigned with role:', userAssignment.role);
      }

      return newAssociationId;

    } catch (error) {
      devLog.error('Association creation/retrieval failed:', error);
      throw error;
    }
  }

  private async processDocumentsWithRetry(
    zip: JSZip, 
    associationId: string, 
    propertyMap: Map<string, any>, 
    zipStructure: any
  ): Promise<{ imported: number; skipped: number; warnings: string[]; errors: string[] }> {
    const results = {
      imported: 0,
      skipped: 0,
      warnings: [],
      errors: []
    };

    let filesProcessed = 0;
    const allFiles = Object.values(zip.files).filter(file => !file.dir);

    for (const file of allFiles) {
      if (this.isCancelled) {
        throw new Error('Import was cancelled');
      }

      try {
        // Determine which property/unit this file belongs to
        const unitName = this.extractUnitFromPath(file.name);
        const property = unitName ? propertyMap.get(unitName) : null;

        // Get file content as Uint8Array
        const fileContent = await file.async('uint8array');
        const fileBlob = new Blob([fileContent]);

        // Determine file category
        const category = this.categorizeDocument(file.name);

        // Upload to Supabase storage (if storage is configured)
        // For now, we'll create a placeholder URL
        const fileUrl = `storage/${associationId}/${file.name}`;

        // Insert document record with retry logic
        await this.insertDocumentWithRetry({
          association_id: associationId,
          name: this.extractFileName(file.name),
          file_name: file.name,
          file_type: this.getFileExtension(file.name),
          file_size: fileBlob.size,
          url: fileUrl,
          category: category,
          is_public: false,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

        results.imported++;
        filesProcessed++;

        this.updateProgress({
          stage: 'uploading',
          message: `Processed ${filesProcessed} of ${allFiles.length} files`,
          progress: 40 + (filesProcessed / allFiles.length) * 50,
          filesProcessed,
          totalFiles: zipStructure.totalFiles,
          unitsProcessed: zipStructure.units.length,
          totalUnits: zipStructure.units.length
        });

      } catch (error) {
        devLog.error(`Error processing file ${file.name}:`, error);
        results.errors.push(`Failed to process ${file.name}: ${error.message}`);
        results.skipped++;
        filesProcessed++;
      }
    }

    return results;
  }

  private async insertDocumentWithRetry(documentData: any, maxRetries: number = 3): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { error } = await supabase
          .from('documents')
          .insert(documentData);

        if (error) {
          throw error;
        }

        // Success - exit retry loop
        return;

      } catch (error) {
        lastError = error as Error;
        devLog.warn(`Document insert attempt ${attempt} failed:`, error);

        // If it's an RLS error, check user association status
        if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
          const { data: user } = await supabase.auth.getUser();
          if (user?.user) {
            const { data: association } = await supabase
              .from('association_users')
              .select('role')
              .eq('association_id', documentData.association_id)
              .eq('user_id', user.user.id)
              .maybeSingle();

            if (!association) {
              devLog.error('User not associated with the association - attempting to fix');
              await supabase.rpc('assign_user_to_association', {
                p_association_id: documentData.association_id,
                p_user_id: user.user.id,
                p_role: 'admin'
              });
            }
          }
        }

        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
