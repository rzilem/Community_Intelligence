
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface DocumentStorageResult {
  success: boolean;
  associationName: string;
  associationId: string;
  totalFiles: number;
  documentsImported: number;
  documentsSkipped: number;
  createdProperties: Array<{
    id: string;
    address: string;
    unitNumber: string;
  }>;
  createdOwners: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    propertyId: string;
  }>;
  processingTime: number;
  errors: string[];
  warnings: string[];
}

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

class DocumentStorageProcessor {
  private progressCallback?: (progress: ProcessingProgress) => void;
  private cancelled = false;

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  cancel() {
    this.cancelled = true;
  }

  private updateProgress(update: Partial<ProcessingProgress>) {
    if (this.progressCallback) {
      const progress: ProcessingProgress = {
        stage: 'analyzing',
        message: '',
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0,
        ...update
      };
      this.progressCallback(progress);
    }
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    const startTime = Date.now();
    const result: DocumentStorageResult = {
      success: false,
      associationName: '',
      associationId: '',
      totalFiles: 0,
      documentsImported: 0,
      documentsSkipped: 0,
      createdProperties: [],
      createdOwners: [],
      processingTime: 0,
      errors: [],
      warnings: []
    };

    try {
      this.updateProgress({
        stage: 'analyzing',
        message: 'Loading ZIP file...',
        progress: 5
      });

      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipFile);

      this.updateProgress({
        stage: 'extracting',
        message: 'Analyzing file structure...',
        progress: 15
      });

      // Extract association name from top-level folder
      const entries = Object.keys(zipContent.files);
      const topLevelFolders = entries.filter(path => 
        path.includes('/') && !path.startsWith('__MACOSX')
      ).map(path => path.split('/')[0]).filter((folder, index, arr) => arr.indexOf(folder) === index);

      if (topLevelFolders.length === 0) {
        throw new Error('No valid folder structure found in ZIP file');
      }

      const associationName = topLevelFolders[0];
      result.associationName = associationName;

      // Create or find association
      let associationId: string;
      const { data: existingAssociation } = await supabase
        .from('associations')
        .select('id')
        .eq('name', associationName)
        .maybeSingle();

      if (existingAssociation) {
        associationId = existingAssociation.id;
        devLog.info(`Found existing association: ${associationName}`);
      } else {
        const { data: newAssociation, error } = await supabase
          .from('associations')
          .insert({
            name: associationName,
            address: `${associationName} Community`,
            city: 'Gattis School',
            state: 'TX',
            zip: '78626',
            status: 'active'
          })
          .select('id')
          .single();

        if (error) throw error;
        associationId = newAssociation.id;
        devLog.info(`Created new association: ${associationName}`);
      }

      result.associationId = associationId;

      this.updateProgress({
        stage: 'creating',
        message: 'Creating properties and extracting information...',
        progress: 30
      });

      // Process unit folders
      const unitFolders = entries.filter(path => 
        path.includes('/') && 
        !path.startsWith('__MACOSX') &&
        path.split('/').length === 2 &&
        path.split('/')[1] === ''
      ).map(path => path.split('/')[0]);

      const propertyFolders = unitFolders.filter(folder => 
        folder !== associationName && folder.toLowerCase().includes('unit')
      );

      result.totalFiles = entries.filter(path => !path.endsWith('/')).length;
      this.updateProgress({
        totalFiles: result.totalFiles,
        totalUnits: propertyFolders.length
      });

      let processedUnits = 0;
      let processedFiles = 0;

      for (const unitFolder of propertyFolders) {
        if (this.cancelled) break;

        const unitNumber = unitFolder.replace(/[^\d]/g, '') || '1';
        const streetAddress = `${unitNumber} Gattis School Dr`;
        
        // Create property
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .insert({
            association_id: associationId,
            unit_number: unitNumber,
            address: streetAddress,
            city: 'Gattis School',
            state: 'TX',
            zip_code: '78626',
            property_type: 'residential',
            status: 'active'
          })
          .select('id')
          .single();

        if (propertyError) {
          result.errors.push(`Failed to create property for ${unitFolder}: ${propertyError.message}`);
          continue;
        }

        result.createdProperties.push({
          id: property.id,
          address: streetAddress,
          unitNumber: unitNumber
        });

        // Generate owner information
        const ownerName = `Owner ${unitNumber}`;
        const ownerEmail = `owner${unitNumber}@gattis.community`;
        const ownerPhone = `512-555-${unitNumber.padStart(4, '0')}`;

        const { data: resident, error: residentError } = await supabase
          .from('residents')
          .insert({
            property_id: property.id,
            first_name: ownerName.split(' ')[0],
            last_name: ownerName.split(' ')[1] || '',
            email: ownerEmail,
            phone: ownerPhone,
            resident_type: 'owner',
            move_in_date: new Date().toISOString().split('T')[0]
          })
          .select('id')
          .single();

        if (!residentError) {
          result.createdOwners.push({
            id: resident.id,
            name: ownerName,
            email: ownerEmail,
            phone: ownerPhone,
            propertyId: property.id
          });
        }

        // Process documents in this unit folder
        const unitFiles = entries.filter(path => 
          path.startsWith(`${unitFolder}/`) && 
          !path.endsWith('/') &&
          !path.includes('__MACOSX')
        );

        for (const filePath of unitFiles) {
          if (this.cancelled) break;

          try {
            const file = zipContent.files[filePath];
            const fileName = filePath.split('/').pop() || filePath;
            const fileExtension = fileName.split('.').pop()?.toLowerCase();
            
            if (!['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'].includes(fileExtension || '')) {
              result.documentsSkipped++;
              result.warnings.push(`Skipped ${fileName}: unsupported file type`);
              continue;
            }

            const fileData = await file.async('blob');
            
            if (fileData.size > 10 * 1024 * 1024) { // 10MB limit
              result.documentsSkipped++;
              result.warnings.push(`Skipped ${fileName}: file too large`);
              continue;
            }

            // Upload to Supabase Storage
            const storagePath = `${associationId}/${property.id}/${fileName}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('documents')
              .upload(storagePath, fileData);

            if (uploadError) {
              result.errors.push(`Failed to upload ${fileName}: ${uploadError.message}`);
              continue;
            }

            // Create document record
            const { error: docError } = await supabase
              .from('documents')
              .insert({
                association_id: associationId,
                name: fileName,
                file_type: fileExtension,
                file_size: fileData.size,
                url: uploadData.path,
                category: this.categorizeDocument(fileName),
                uploaded_by: null // System upload
              });

            if (docError) {
              result.errors.push(`Failed to create document record for ${fileName}: ${docError.message}`);
            } else {
              result.documentsImported++;
            }

            processedFiles++;
            this.updateProgress({
              stage: 'uploading',
              message: `Processing ${fileName}...`,
              progress: 30 + ((processedFiles / result.totalFiles) * 50),
              filesProcessed: processedFiles
            });

          } catch (error) {
            result.errors.push(`Error processing ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            result.documentsSkipped++;
          }
        }

        processedUnits++;
        this.updateProgress({
          unitsProcessed: processedUnits,
          message: `Processed ${unitFolder}...`
        });
      }

      result.success = result.errors.length === 0 || result.documentsImported > 0;
      result.processingTime = Date.now() - startTime;

      this.updateProgress({
        stage: 'complete',
        message: 'Import completed successfully!',
        progress: 100,
        filesProcessed: processedFiles,
        unitsProcessed: processedUnits
      });

      return result;

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error occurred');
      result.processingTime = Date.now() - startTime;
      
      this.updateProgress({
        stage: 'error',
        message: `Import failed: ${result.errors[0]}`,
        progress: 0
      });

      return result;
    }
  }

  private categorizeDocument(fileName: string): string {
    const name = fileName.toLowerCase();
    if (name.includes('lease')) return 'lease';
    if (name.includes('insurance')) return 'insurance';
    if (name.includes('inspection')) return 'inspection';
    if (name.includes('maintenance')) return 'maintenance';
    if (name.includes('bylaw')) return 'legal';
    return 'general';
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    // For now, just restart the process
    return this.processHierarchicalZip(zipFile);
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
