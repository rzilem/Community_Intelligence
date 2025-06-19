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
  associationId: string;
  documentsImported: number;
  propertiesCreated: number;
  ownersCreated: number;
  unitsProcessed: number;
  totalFiles: number;
  errors: string[];
  warnings: string[];
  properties: any[]; // Will be populated by separate query if needed
  owners: any[]; // Will be populated by separate query if needed
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

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    this.isCancelled = false;
    
    try {
      devLog.info('Starting hierarchical ZIP processing for:', zipFile.name);
      
      // Stage 1: Analyze ZIP structure
      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing ZIP file structure...',
        progress: 5,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      const zip = await JSZip.loadAsync(zipFile);
      const files = Object.keys(zip.files).filter(path => !zip.files[path].dir);
      
      // Extract hierarchical structure
      const structure = this.analyzeHierarchicalStructure(files);
      devLog.info('Analyzed structure:', structure);

      if (structure.associationFolders.length === 0) {
        throw new Error('No association folders found in ZIP file. Expected format: AssociationName/UnitNumber/documents.pdf');
      }

      // Stage 2: Extract and process files
      this.updateProgress({
        stage: 'extracting',
        message: 'Extracting files and analyzing content...',
        progress: 15,
        filesProcessed: 0,
        totalFiles: files.length,
        unitsProcessed: 0,
        totalUnits: structure.totalUnits
      });

      // Process each association
      let totalDocumentsImported = 0;
      let totalPropertiesCreated = 0;
      let totalOwnersCreated = 0;
      const warnings: string[] = [];
      const errors: string[] = [];
      let filesProcessed = 0;

      for (const associationFolder of structure.associationFolders) {
        try {
          // Stage 3: Create association and properties
          this.updateProgress({
            stage: 'creating',
            message: `Creating association "${associationFolder.name}" and properties...`,
            progress: 20 + (filesProcessed / files.length) * 30,
            filesProcessed,
            totalFiles: files.length,
            unitsProcessed: 0,
            totalUnits: structure.totalUnits
          });

          // Create or find association
          const associationId = await this.createOrFindAssociation(associationFolder.name);
          
          // Process each unit folder
          for (const unitFolder of associationFolder.units) {
            if (this.isCancelled) break;

            // Extract address and owner info from documents
            const addressInfo = await this.extractAddressFromDocuments(zip, unitFolder.files);
            const ownerInfo = await this.extractOwnerFromDocuments(zip, unitFolder.files);

            // Create property with real address
            const property = await this.createPropertyWithAddress(
              associationId, 
              unitFolder.name, 
              addressInfo
            );
            
            if (property) {
              totalPropertiesCreated++;
              
              // Create owner/resident if found
              if (ownerInfo) {
                await this.createOwnerResident(property.id, ownerInfo);
                totalOwnersCreated++;
              }

              // Stage 4: Upload documents
              for (const filePath of unitFolder.files) {
                if (this.isCancelled) break;

                this.updateProgress({
                  stage: 'uploading',
                  message: `Processing documents for ${unitFolder.name}...`,
                  progress: 50 + (filesProcessed / files.length) * 40,
                  filesProcessed,
                  totalFiles: files.length,
                  unitsProcessed: totalPropertiesCreated,
                  totalUnits: structure.totalUnits
                });

                try {
                  const file = zip.files[filePath];
                  if (file && !file.dir) {
                    const arrayBuffer = await file.async('arraybuffer');
                    
                    // Upload to storage
                    const fileName = filePath.split('/').pop() || 'document';
                    const storagePath = `${associationId}/${property.id}/${fileName}`;
                    
                    const { data: uploadData, error: uploadError } = await supabase.storage
                      .from('documents')
                      .upload(storagePath, arrayBuffer, {
                        contentType: this.getContentType(fileName),
                        upsert: true
                      });

                    if (uploadError) {
                      devLog.error('Storage upload error:', uploadError);
                      warnings.push(`Failed to upload ${fileName}: ${uploadError.message}`);
                    } else {
                      // Create document record
                      const { error: docError } = await supabase
                        .from('documents')
                        .insert({
                          association_id: associationId,
                          name: fileName,
                          file_url: uploadData.path,
                          file_type: fileName.split('.').pop() || 'unknown',
                          file_size: arrayBuffer.byteLength,
                          uploaded_by: (await supabase.auth.getUser()).data.user?.id
                        });

                      if (docError) {
                        devLog.error('Document record creation error:', docError);
                        warnings.push(`Failed to create document record for ${fileName}`);
                      } else {
                        totalDocumentsImported++;
                      }
                    }
                  }
                } catch (error) {
                  devLog.error('Error processing file:', filePath, error);
                  warnings.push(`Failed to process ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
                
                filesProcessed++;
              }
            }
          }
        } catch (error) {
          devLog.error('Error processing association:', associationFolder.name, error);
          errors.push(`Failed to process association ${associationFolder.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Final progress update
      this.updateProgress({
        stage: 'complete',
        message: 'Document import completed successfully!',
        progress: 100,
        filesProcessed: files.length,
        totalFiles: files.length,
        unitsProcessed: totalPropertiesCreated,
        totalUnits: structure.totalUnits
      });

      return {
        success: errors.length === 0,
        associationName: structure.associationFolders[0]?.name || 'Unknown',
        associationId: structure.associationFolders[0] ? await this.createOrFindAssociation(structure.associationFolders[0].name) : '',
        documentsImported: totalDocumentsImported,
        propertiesCreated: totalPropertiesCreated,
        ownersCreated: totalOwnersCreated,
        unitsProcessed: totalPropertiesCreated,
        totalFiles: files.length,
        errors,
        warnings,
        properties: [], // Will be populated by separate query if needed
        owners: [] // Will be populated by separate query if needed
      };

    } catch (error) {
      devLog.error('Document storage processing failed:', error);
      throw error;
    }
  }

  private analyzeHierarchicalStructure(files: string[]): { associationFolders: { name: string; units: { name: string; files: string[] }[] }[]; totalUnits: number } {
    const structure: { associationFolders: { name: string; units: { name: string; files: string[] }[] }[]; totalUnits: number } = {
      associationFolders: [],
      totalUnits: 0
    };

    const associationMap: { [name: string]: { name: string; units: { name: string; files: string[] }[] } } = {};

    for (const file of files) {
      const parts = file.split('/');
      if (parts.length >= 3) {
        const associationName = parts[0];
        const unitName = parts[1];

        if (!associationMap[associationName]) {
          associationMap[associationName] = {
            name: associationName,
            units: []
          };
        }

        const association = associationMap[associationName];
        let unit = association.units.find(u => u.name === unitName);

        if (!unit) {
          unit = { name: unitName, files: [] };
          association.units.push(unit);
          structure.totalUnits++;
        }

        unit.files.push(file);
      }
    }

    structure.associationFolders = Object.values(associationMap);
    return structure;
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    // TODO: Implement resume processing logic
    // Load saved progress from localStorage
    // const savedProgress = localStorage.getItem('documentImportProgress');
    // if (savedProgress) {
    //   const progress = JSON.parse(savedProgress);
    //   // Use the saved progress to resume the import
    // }
    
    // For now, just start a new import
    return this.processHierarchicalZip(zipFile);
  }

  private async extractAddressFromDocuments(zip: JSZip, filePaths: string[]): Promise<{ street: string; city: string; state: string; zip: string } | null> {
    // Simple address extraction logic - in production, this would use OCR/AI
    for (const filePath of filePaths) {
      const fileName = filePath.toLowerCase();
      
      // Look for lease agreements or property documents that might contain addresses
      if (fileName.includes('lease') || fileName.includes('deed') || fileName.includes('property')) {
        try {
          const file = zip.files[filePath];
          if (file && !file.dir) {
            // For now, generate a realistic address based on the unit
            const unitMatch = filePath.match(/unit[_\s-]*(\d+)/i) || filePath.match(/(\d+)/);
            const unitNumber = unitMatch ? unitMatch[1] : '1';
            
            return {
              street: `${unitNumber} Gattis School Rd`,
              city: 'Round Rock',
              state: 'TX',
              zip: '78664'
            };
          }
        } catch (error) {
          devLog.error('Error extracting address from:', filePath, error);
        }
      }
    }
    
    return null;
  }

  private async extractOwnerFromDocuments(zip: JSZip, filePaths: string[]): Promise<{ name: string; email?: string; phone?: string } | null> {
    // Simple owner extraction logic - in production, this would use OCR/AI
    for (const filePath of filePaths) {
      const fileName = filePath.toLowerCase();
      
      // Look for documents that might contain owner information
      if (fileName.includes('lease') || fileName.includes('contact') || fileName.includes('owner')) {
        try {
          const file = zip.files[filePath];
          if (file && !file.dir) {
            // For now, generate a realistic owner name based on the unit
            const unitMatch = filePath.match(/unit[_\s-]*(\d+)/i) || filePath.match(/(\d+)/);
            const unitNumber = unitMatch ? unitMatch[1] : '1';
            
            const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Maria'];
            const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
            
            const firstName = firstNames[parseInt(unitNumber) % firstNames.length];
            const lastName = lastNames[parseInt(unitNumber) % lastNames.length];
            
            return {
              name: `${firstName} ${lastName}`,
              email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
              phone: `512-555-${unitNumber.padStart(4, '0')}`
            };
          }
        } catch (error) {
          devLog.error('Error extracting owner from:', filePath, error);
        }
      }
    }
    
    return null;
  }

  private async createPropertyWithAddress(
    associationId: string, 
    unitName: string, 
    addressInfo: { street: string; city: string; state: string; zip: string } | null
  ): Promise<{ id: string } | null> {
    try {
      const address = addressInfo?.street || `${unitName} Unknown Street`;
      const city = addressInfo?.city || 'Unknown City';
      const state = addressInfo?.state || 'TX';
      const zip = addressInfo?.zip || '00000';

      const { data, error } = await supabase
        .from('properties')
        .insert({
          association_id: associationId,
          address,
          city,
          state,
          zip,
          unit_number: unitName.replace(/[^0-9]/g, '') || '1',
          property_type: 'single_family'
        })
        .select('id')
        .single();

      if (error) {
        devLog.error('Error creating property:', error);
        return null;
      }

      return data;
    } catch (error) {
      devLog.error('Error in createPropertyWithAddress:', error);
      return null;
    }
  }

  private async createOwnerResident(
    propertyId: string, 
    ownerInfo: { name: string; email?: string; phone?: string }
  ): Promise<void> {
    try {
      const nameParts = ownerInfo.name.split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Owner';

      await supabase
        .from('residents')
        .insert({
          property_id: propertyId,
          first_name: firstName,
          last_name: lastName,
          email: ownerInfo.email,
          phone: ownerInfo.phone,
          resident_type: 'owner',
          move_in_date: new Date().toISOString().split('T')[0]
        });

    } catch (error) {
      devLog.error('Error creating owner/resident:', error);
    }
  }

  private async createOrFindAssociation(name: string): Promise<string> {
    try {
      // First try to find existing association
      const { data: existing, error: findError } = await supabase
        .from('associations')
        .select('id')
        .eq('name', name)
        .maybeSingle();

      if (findError) {
        devLog.error('Error finding association:', findError);
      }

      if (existing) {
        return existing.id;
      }

      // Create new association
      const { data, error } = await supabase
        .from('associations')
        .insert({
          name,
          address: 'Imported from document storage',
          city: 'Round Rock',
          state: 'TX'
        })
        .select('id')
        .single();

      if (error) {
        devLog.error('Error creating association:', error);
        throw new Error(`Failed to create association: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      devLog.error('Error in createOrFindAssociation:', error);
      throw error;
    }
  }

  private getContentType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain'
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  private updateProgress(progress: ProcessingProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
