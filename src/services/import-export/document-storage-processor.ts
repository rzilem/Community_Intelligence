import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

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

export interface DocumentStorageResult {
  success: boolean;
  associationName: string;
  documentsImported: number;
  createdProperties: string[];
  errors: string[];
  warnings: string[];
  totalFiles: number;
  processedFiles: number;
}

interface ZipAnalysis {
  associationName: string;
  units: string[];
  unitFiles: Record<string, string[]>;
  totalFiles: number;
}

export class DocumentStorageProcessor {
  private isCancelled = false;
  private progressCallback?: (progress: ProcessingProgress) => void;

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  cancel() {
    this.isCancelled = true;
  }

  private updateProgress(update: Partial<ProcessingProgress>) {
    if (this.progressCallback) {
      this.progressCallback(update as ProcessingProgress);
    }
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    devLog.info('Starting hierarchical ZIP processing:', zipFile.name);
    
    try {
      this.updateProgress({
        stage: 'analyzing',
        message: 'Loading and analyzing ZIP file structure...',
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipFile);
      
      devLog.info('ZIP loaded successfully, analyzing structure...');
      const analysis = await this.analyzeZipStructure(zipData);
      
      if (this.isCancelled) {
        throw new Error('Import cancelled by user');
      }

      devLog.info('ZIP analysis complete:', analysis);

      this.updateProgress({
        stage: 'creating_properties',
        message: `Creating association "${analysis.associationName}" and ${analysis.units.length} properties...`,
        progress: 10,
        filesProcessed: 0,
        totalFiles: analysis.totalFiles,
        unitsProcessed: 0,
        totalUnits: analysis.units.length
      });

      const associationId = await this.createOrGetAssociation(analysis.associationName);
      const propertyIds = await this.createProperties(associationId, analysis.units);

      this.updateProgress({
        stage: 'uploading',
        message: 'Processing and uploading documents...',
        progress: 30,
        filesProcessed: 0,
        totalFiles: analysis.totalFiles,
        unitsProcessed: analysis.units.length,
        totalUnits: analysis.units.length
      });

      let processedFiles = 0;
      let documentsImported = 0;
      const errors: string[] = [];
      const warnings: string[] = [];

      for (const [filename, zipObject] of Object.entries(zipData.files)) {
        if (this.isCancelled) {
          throw new Error('Import cancelled by user');
        }

        if (zipObject.dir) continue;

        try {
          const result = await this.processDocument(zipObject, filename, analysis, propertyIds, associationId);
          if (result.imported) {
            documentsImported++;
          }
          if (result.warning) {
            warnings.push(result.warning);
          }
        } catch (error) {
          devLog.error(`Error processing document ${filename}:`, error);
          errors.push(`${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        processedFiles++;
        this.updateProgress({
          stage: 'uploading',
          message: `Processing documents... (${processedFiles}/${analysis.totalFiles})`,
          progress: 30 + (processedFiles / analysis.totalFiles) * 60,
          filesProcessed: processedFiles,
          totalFiles: analysis.totalFiles,
          unitsProcessed: analysis.units.length,
          totalUnits: analysis.units.length
        });
      }

      this.updateProgress({
        stage: 'complete',
        message: 'Import completed successfully!',
        progress: 100,
        filesProcessed: analysis.totalFiles,
        totalFiles: analysis.totalFiles,
        unitsProcessed: analysis.units.length,
        totalUnits: analysis.units.length
      });

      return {
        success: errors.length === 0,
        associationName: analysis.associationName,
        documentsImported,
        createdProperties: analysis.units,
        errors,
        warnings,
        totalFiles: analysis.totalFiles,
        processedFiles
      };

    } catch (error) {
      devLog.error('ZIP processing failed:', error);
      throw error;
    }
  }

  private async analyzeZipStructure(zipData: JSZip): Promise<ZipAnalysis> {
    devLog.info('Analyzing ZIP structure...');
    
    const allEntries = Object.keys(zipData.files);
    devLog.info('All ZIP entries:', allEntries);

    // Find top-level folders by looking for entries that are directories
    // and don't contain a parent directory separator
    const topLevelFolders = new Set<string>();
    const allFiles: string[] = [];

    for (const [filename, zipEntry] of Object.entries(zipData.files)) {
      devLog.debug(`Processing entry: "${filename}", isDir: ${zipEntry.dir}`);
      
      // Normalize the path by removing trailing slashes
      const normalizedPath = filename.replace(/\/$/, '');
      const pathParts = normalizedPath.split('/').filter(part => part.length > 0);
      
      devLog.debug(`Normalized path: "${normalizedPath}", parts:`, pathParts);

      // If this is a directory entry or if we can infer it's a directory
      if (zipEntry.dir) {
        // This is explicitly marked as a directory
        if (pathParts.length === 1) {
          // This is a top-level directory
          topLevelFolders.add(pathParts[0]);
          devLog.info(`Found top-level folder (explicit): "${pathParts[0]}"`);
        }
      } else {
        // This is a file - check if it belongs to a top-level folder
        if (pathParts.length > 1) {
          // The first part is the top-level folder containing this file
          topLevelFolders.add(pathParts[0]);
          devLog.debug(`Inferred top-level folder from file: "${pathParts[0]}"`);
        }
        allFiles.push(filename);
      }
    }

    devLog.info('Detected top-level folders:', Array.from(topLevelFolders));

    if (topLevelFolders.size === 0) {
      throw new Error('No top-level folders found in ZIP file. Please ensure your ZIP contains a folder structure.');
    }

    if (topLevelFolders.size > 1) {
      const folderList = Array.from(topLevelFolders).join(', ');
      throw new Error(`ZIP file must contain a single top-level folder representing the association. Found multiple folders: ${folderList}`);
    }

    const associationName = Array.from(topLevelFolders)[0];
    devLog.info(`Association name determined: "${associationName}"`);

    // Now find all unit folders within the association folder
    const units = new Set<string>();
    const unitFiles: Record<string, string[]> = {};

    for (const filename of allFiles) {
      const pathParts = filename.split('/').filter(part => part.length > 0);
      
      // Skip files not in the association folder
      if (pathParts.length < 2 || pathParts[0] !== associationName) {
        continue;
      }

      const unitName = pathParts[1];
      
      // Skip if this appears to be a direct file in the association folder (not in a unit subfolder)
      if (pathParts.length === 2) {
        // This is a file directly in the association folder - treat as "General" unit
        const generalUnit = 'General';
        units.add(generalUnit);
        if (!unitFiles[generalUnit]) {
          unitFiles[generalUnit] = [];
        }
        unitFiles[generalUnit].push(filename);
        devLog.debug(`Added file to General unit: ${filename}`);
      } else {
        // This is a file in a unit subfolder
        units.add(unitName);
        if (!unitFiles[unitName]) {
          unitFiles[unitName] = [];
        }
        unitFiles[unitName].push(filename);
        devLog.debug(`Added file to unit "${unitName}": ${filename}`);
      }
    }

    const unitsArray = Array.from(units);
    devLog.info(`Found ${unitsArray.length} units:`, unitsArray);
    devLog.info('Unit file counts:', Object.fromEntries(
      Object.entries(unitFiles).map(([unit, files]) => [unit, files.length])
    ));

    return {
      associationName,
      units: unitsArray,
      unitFiles,
      totalFiles: allFiles.length
    };
  }

  private async createOrGetAssociation(name: string): Promise<string> {
    devLog.info('Creating or getting association:', name);
    
    try {
      // First, check if association already exists
      const { data: existingAssociation, error: searchError } = await supabase
        .from('associations')
        .select('id')
        .eq('name', name)
        .maybeSingle();

      if (searchError) {
        devLog.error('Error searching for existing association:', searchError);
        throw new Error(`Failed to search for association: ${searchError.message}`);
      }

      if (existingAssociation) {
        devLog.info('Association already exists:', existingAssociation.id);
        return existingAssociation.id;
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Must be authenticated to create association');
      }

      // Create new association
      const { data: newAssociation, error: createError } = await supabase
        .from('associations')
        .insert({
          name,
          status: 'active',
          is_archived: false,
          created_by: user.id
        })
        .select('id')
        .single();

      if (createError) {
        devLog.error('Error creating association:', createError);
        throw new Error(`Failed to create association: ${createError.message}`);
      }

      devLog.info('Association created successfully:', newAssociation.id);

      // Assign current user as admin of the new association
      const { error: assignError } = await supabase
        .from('association_users')
        .insert({
          association_id: newAssociation.id,
          user_id: user.id,
          role: 'admin',
          is_active: true
        });

      if (assignError) {
        devLog.error('Error assigning user to association:', assignError);
        // Don't throw here - association was created successfully
        devLog.warn('Association created but user assignment failed - continuing with import');
      } else {
        devLog.info('User assigned as admin to association:', newAssociation.id);
      }

      // Verify the user assignment was successful
      const { data: userAssignment, error: verifyError } = await supabase
        .from('association_users')
        .select('role')
        .eq('association_id', newAssociation.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (verifyError || !userAssignment) {
        devLog.warn('User assignment verification failed:', verifyError);
      } else {
        devLog.info('User assignment verified:', userAssignment);
      }

      return newAssociation.id;
    } catch (error) {
      devLog.error('Error in createOrGetAssociation:', error);
      throw error;
    }
  }

  private async createProperties(associationId: string, units: string[]): Promise<Record<string, string>> {
    devLog.info('Creating properties for units:', units);
    
    const propertyIds: Record<string, string> = {};
    const errors: string[] = [];

    for (const unit of units) {
      if (this.isCancelled) {
        throw new Error('Import cancelled by user');
      }

      try {
        // Check if property already exists
        const { data: existingProperty, error: searchError } = await supabase
          .from('properties')
          .select('id')
          .eq('association_id', associationId)
          .eq('unit_number', unit)
          .maybeSingle();

        if (searchError) {
          devLog.error(`Error searching for existing property ${unit}:`, searchError);
          errors.push(`Failed to search for property ${unit}: ${searchError.message}`);
          continue;
        }

        if (existingProperty) {
          devLog.info(`Property ${unit} already exists:`, existingProperty.id);
          propertyIds[unit] = existingProperty.id;
          continue;
        }

        // Create new property
        const { data: newProperty, error: createError } = await supabase
          .from('properties')
          .insert({
            association_id: associationId,
            unit_number: unit,
            status: 'active',
            property_type: 'unit'
          })
          .select('id')
          .single();

        if (createError) {
          devLog.error(`Error creating property ${unit}:`, createError);
          errors.push(`Failed to create property ${unit}: ${createError.message}`);
          continue;
        }

        devLog.info(`Property ${unit} created successfully:`, newProperty.id);
        propertyIds[unit] = newProperty.id;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        devLog.error(`Error processing property ${unit}:`, error);
        errors.push(`Error processing property ${unit}: ${errorMessage}`);
      }
    }

    if (errors.length > 0) {
      devLog.warn('Some properties failed to create:', errors);
    }

    devLog.info('Property creation complete. Created/found properties:', Object.keys(propertyIds).length);
    return propertyIds;
  }

  private async processDocument(
    zipObject: JSZip.JSZipObject, 
    filename: string,
    analysis: ZipAnalysis,
    propertyIds: Record<string, string>,
    associationId: string
  ): Promise<{ imported: boolean; warning?: string }> {
    
    // Skip files that are too large or not supported
    if (zipObject._data?.uncompressedSize && zipObject._data.uncompressedSize > 300 * 1024 * 1024) {
      return { 
        imported: false, 
        warning: `${filename}: File too large (${Math.round(zipObject._data.uncompressedSize / 1024 / 1024)}MB > 300MB limit)` 
      };
    }

    const pathParts = filename.split('/').filter(part => part.length > 0);
    
    // Skip files not in the association folder
    if (pathParts.length < 2 || pathParts[0] !== analysis.associationName) {
      return { imported: false, warning: `${filename}: File not in association folder` };
    }

    let unitName: string;
    let fileName: string;

    if (pathParts.length === 2) {
      // File is directly in association folder
      unitName = 'General';
      fileName = pathParts[1];
    } else {
      // File is in a unit subfolder
      unitName = pathParts[1];
      fileName = pathParts[pathParts.length - 1];
    }

    const propertyId = propertyIds[unitName];
    if (!propertyId) {
      return { imported: false, warning: `${filename}: No property found for unit ${unitName}` };
    }

    try {
      // Get file content
      const fileContent = await zipObject.async('blob');
      
      // Determine file type and category
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      const mimeType = this.getMimeType(fileExtension);
      const category = this.categorizeDocument(fileName);

      // Upload to Supabase storage
      const storageFileName = `${Date.now()}_${fileName}`;
      const storagePath = `associations/${associationId}/properties/${propertyId}/${storageFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, fileContent, {
          contentType: mimeType,
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // Create document record with retry logic for RLS issues
      let documentCreated = false;
      let retryCount = 0;
      const maxRetries = 2;

      while (!documentCreated && retryCount < maxRetries) {
        try {
          const { error: documentError } = await supabase
            .from('documents')
            .insert({
              association_id: associationId,
              property_id: propertyId,
              filename: fileName,
              file_path: storagePath,
              file_size: fileContent.size,
              mime_type: mimeType,
              category,
              status: 'active'
            });

          if (documentError) {
            // Check if this is an RLS error
            if (documentError.message.includes('RLS') || documentError.message.includes('permission')) {
              devLog.warn(`RLS error on attempt ${retryCount + 1} for ${filename}:`, documentError);
              
              if (retryCount < maxRetries - 1) {
                // Try to fix the user-association relationship
                await this.ensureUserAssociationAccess(associationId);
                retryCount++;
                continue;
              }
            }
            throw documentError;
          }

          documentCreated = true;
          devLog.info(`Document created successfully: ${filename}`);

        } catch (error) {
          if (retryCount >= maxRetries - 1) {
            throw error;
          }
          retryCount++;
        }
      }

      return { imported: true };

    } catch (error) {
      devLog.error(`Error processing document ${filename}:`, error);
      throw error;
    }
  }

  private async ensureUserAssociationAccess(associationId: string): Promise<void> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        devLog.warn('No user found for association access check');
        return;
      }

      // Check if user already has access
      const { data: existingAccess, error: checkError } = await supabase
        .from('association_users')
        .select('role')
        .eq('association_id', associationId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        devLog.error('Error checking user association access:', checkError);
        return;
      }

      if (existingAccess) {
        devLog.info('User already has association access:', existingAccess.role);
        return;
      }

      // Create the association if it doesn't exist
      const { error: assignError } = await supabase
        .from('association_users')
        .upsert({
          association_id: associationId,
          user_id: user.id,
          role: 'admin',
          is_active: true
        });

      if (assignError) {
        devLog.error('Error ensuring user association access:', assignError);
      } else {
        devLog.info('User association access ensured');
      }
    } catch (error) {
      devLog.error('Error in ensureUserAssociationAccess:', error);
    }
  }

  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  private categorizeDocument(filename: string): string {
    const name = filename.toLowerCase();
    
    if (name.includes('lease') || name.includes('rental')) return 'lease';
    if (name.includes('insurance')) return 'insurance';
    if (name.includes('inspection') || name.includes('report')) return 'inspection';
    if (name.includes('maintenance') || name.includes('repair')) return 'maintenance';
    if (name.includes('financial') || name.includes('statement')) return 'financial';
    if (name.includes('legal') || name.includes('contract')) return 'legal';
    if (name.includes('bylaw') || name.includes('rule')) return 'governance';
    
    return 'other';
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    devLog.info('Resuming document storage processing');
    // For now, just restart the process
    return this.processHierarchicalZip(zipFile);
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
