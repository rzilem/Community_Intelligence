
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';
import { advancedOCRService } from './advanced-ocr-service';

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
  associationId?: string;
  associationName?: string;
  propertiesCreated: number;
  unitsCreated: number;
  ownersCreated: number;
  documentsImported: number;
  documentsSkipped: number;
  processingTime: number;
  errors: string[];
  warnings: string[];
  createdProperties: Array<{
    id: string;
    address: string;
    unitNumber?: string;
    documentsCount: number;
  }>;
  createdOwners: Array<{
    id: string;
    name: string;
    propertyId: string;
    contactInfo?: string;
  }>;
}

interface ExtractedOwnerInfo {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface ProcessedUnit {
  unitNumber: string;
  fullPath: string;
  files: Array<{ name: string; content: ArrayBuffer; type: string }>;
  extractedAddress?: string;
  extractedOwnerInfo?: ExtractedOwnerInfo;
}

export class DocumentStorageProcessor {
  private isCancelled = false;
  private progressCallback?: (progress: ProcessingProgress) => void;

  setProgressCallback(callback: (progress: ProcessingProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(update: Partial<ProcessingProgress>) {
    if (this.progressCallback) {
      const currentProgress = {
        stage: 'analyzing' as const,
        message: '',
        progress: 0,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0,
        ...update
      };
      this.progressCallback(currentProgress);
    }
  }

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    const startTime = Date.now();
    devLog.info('Starting hierarchical ZIP processing:', zipFile.name);

    try {
      this.isCancelled = false;
      
      // Stage 1: Analyze ZIP structure
      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing ZIP file structure and extracting content...',
        progress: 10
      });

      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipFile);
      
      // Extract association name from root folder
      const rootFolders = Object.keys(zipContent.files)
        .filter(path => path.includes('/') && !path.endsWith('/'))
        .map(path => path.split('/')[0])
        .filter((name, index, arr) => arr.indexOf(name) === index);
      
      const associationName = rootFolders[0] || 'Imported Association';
      
      // Stage 2: Extract and process units
      this.updateProgress({
        stage: 'extracting',
        message: 'Extracting unit folders and analyzing documents...',
        progress: 20
      });

      const processedUnits = await this.extractAndProcessUnits(zipContent, associationName);
      
      this.updateProgress({
        totalUnits: processedUnits.length,
        progress: 40
      });

      if (this.isCancelled) throw new Error('Processing cancelled');

      // Stage 3: Create association and properties
      this.updateProgress({
        stage: 'creating',
        message: 'Creating association, properties, and extracting owner information...',
        progress: 50
      });

      const associationId = await this.ensureAssociationExists(associationName);
      const createdProperties: Array<{ id: string; address: string; unitNumber?: string; documentsCount: number }> = [];
      const createdOwners: Array<{ id: string; name: string; propertyId: string; contactInfo?: string }> = [];

      // Process each unit to create properties and owners
      for (let i = 0; i < processedUnits.length; i++) {
        if (this.isCancelled) throw new Error('Processing cancelled');
        
        const unit = processedUnits[i];
        devLog.info(`Processing unit ${i + 1}/${processedUnits.length}: ${unit.unitNumber}`);

        // Create property with intelligent address generation
        const property = await this.createPropertyForUnit(associationId, unit, associationName);
        createdProperties.push({
          id: property.id,
          address: property.address,
          unitNumber: unit.unitNumber,
          documentsCount: 0 // Will be updated after document upload
        });

        // Extract and create owner information
        if (unit.extractedOwnerInfo) {
          const owner = await this.createOwnerForProperty(property.id, associationId, unit.extractedOwnerInfo);
          if (owner) {
            createdOwners.push({
              id: owner.id,
              name: owner.name,
              propertyId: property.id,
              contactInfo: owner.contactInfo
            });
          }
        }

        this.updateProgress({
          unitsProcessed: i + 1,
          progress: 50 + (i / processedUnits.length) * 30
        });
      }

      // Stage 4: Upload documents and link to properties
      this.updateProgress({
        stage: 'uploading',
        message: 'Uploading documents and linking to properties...',
        progress: 80
      });

      let documentsImported = 0;
      let documentsSkipped = 0;
      const errors: string[] = [];
      const warnings: string[] = [];

      for (let i = 0; i < processedUnits.length; i++) {
        if (this.isCancelled) throw new Error('Processing cancelled');
        
        const unit = processedUnits[i];
        const property = createdProperties[i];
        
        for (const file of unit.files) {
          try {
            await this.uploadAndLinkDocument(file, property.id, associationId);
            documentsImported++;
            property.documentsCount++;
          } catch (error) {
            documentsSkipped++;
            const errorMsg = `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            errors.push(errorMsg);
            devLog.error(errorMsg);
          }
        }

        this.updateProgress({
          filesProcessed: documentsImported + documentsSkipped,
          totalFiles: processedUnits.reduce((total, u) => total + u.files.length, 0),
          progress: 80 + (i / processedUnits.length) * 15
        });
      }

      // Complete
      this.updateProgress({
        stage: 'complete',
        message: `Import completed! Created ${createdProperties.length} properties, ${createdOwners.length} owners, and imported ${documentsImported} documents.`,
        progress: 100
      });

      const result: DocumentStorageResult = {
        success: true,
        associationId,
        associationName,
        propertiesCreated: createdProperties.length,
        unitsCreated: createdProperties.length,
        ownersCreated: createdOwners.length,
        documentsImported,
        documentsSkipped,
        processingTime: Date.now() - startTime,
        errors,
        warnings,
        createdProperties,
        createdOwners
      };

      devLog.info('Hierarchical ZIP processing completed:', result);
      return result;

    } catch (error) {
      devLog.error('Error in hierarchical ZIP processing:', error);
      throw error;
    }
  }

  private async extractAndProcessUnits(zipContent: JSZip, associationName: string): Promise<ProcessedUnit[]> {
    const units: ProcessedUnit[] = [];
    const unitFolders = new Map<string, string[]>();

    // Group files by unit folder
    Object.keys(zipContent.files).forEach(path => {
      if (!zipContent.files[path].dir && path.includes('/')) {
        const parts = path.split('/');
        if (parts.length >= 2) {
          const unitFolder = parts[1]; // Skip association name, get unit folder
          if (!unitFolders.has(unitFolder)) {
            unitFolders.set(unitFolder, []);
          }
          unitFolders.get(unitFolder)!.push(path);
        }
      }
    });

    // Process each unit folder
    for (const [unitFolder, filePaths] of unitFolders) {
      if (unitFolder.toLowerCase().includes('unit') || unitFolder.toLowerCase().includes('apt') || /^\d+/.test(unitFolder)) {
        const unit: ProcessedUnit = {
          unitNumber: this.extractUnitNumber(unitFolder),
          fullPath: unitFolder,
          files: [],
          extractedAddress: undefined,
          extractedOwnerInfo: undefined
        };

        // Process files in this unit
        for (const filePath of filePaths) {
          try {
            const file = zipContent.files[filePath];
            const content = await file.async('arraybuffer');
            const fileName = filePath.split('/').pop() || '';
            
            unit.files.push({
              name: fileName,
              content,
              type: this.determineFileType(fileName)
            });

            // Try to extract information from the first few documents
            if (unit.files.length <= 3 && this.isTextDocument(fileName)) {
              try {
                const extractedInfo = await this.extractInfoFromDocument(content, fileName);
                if (extractedInfo.address && !unit.extractedAddress) {
                  unit.extractedAddress = extractedInfo.address;
                }
                if (extractedInfo.ownerInfo && !unit.extractedOwnerInfo) {
                  unit.extractedOwnerInfo = extractedInfo.ownerInfo;
                }
              } catch (extractError) {
                devLog.warn(`Failed to extract info from ${fileName}:`, extractError);
              }
            }
          } catch (fileError) {
            devLog.error(`Failed to process file ${filePath}:`, fileError);
          }
        }

        // Generate address if not extracted from documents
        if (!unit.extractedAddress) {
          unit.extractedAddress = this.generateIntelligentAddress(associationName, unit.unitNumber);
        }

        units.push(unit);
      }
    }

    devLog.info(`Extracted ${units.length} units from ZIP`);
    return units;
  }

  private extractUnitNumber(folderName: string): string {
    // Extract unit number from folder name
    const match = folderName.match(/(\d+)/);
    if (match) {
      return match[1];
    }
    
    // Clean up folder name for unit number
    return folderName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  private determineFileType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf': return 'application/pdf';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default: return 'application/octet-stream';
    }
  }

  private isTextDocument(fileName: string): boolean {
    const textExtensions = ['pdf', 'doc', 'docx', 'txt'];
    const ext = fileName.toLowerCase().split('.').pop();
    return textExtensions.includes(ext || '');
  }

  private async extractInfoFromDocument(content: ArrayBuffer, fileName: string): Promise<{
    address?: string;
    ownerInfo?: ExtractedOwnerInfo;
  }> {
    try {
      // Convert ArrayBuffer to File for OCR processing
      const file = new File([content], fileName, { type: this.determineFileType(fileName) });
      
      // Use OCR to extract text
      const processedDoc = await advancedOCRService.processDocument(file);
      const text = processedDoc.content;

      const result: { address?: string; ownerInfo?: ExtractedOwnerInfo } = {};

      if (text) {
        // Extract address
        const addressMatch = text.match(/\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Way|Court|Ct|Place|Pl)/i);
        if (addressMatch) {
          result.address = addressMatch[0].trim();
        }

        // Extract owner information
        const ownerInfo: ExtractedOwnerInfo = {};
        
        // Extract names (look for patterns like "John Smith" or "Smith, John")
        const namePatterns = [
          /(?:tenant|owner|resident)[\s:]+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
          /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s+tenant|\s+owner|\s+resident)/i,
          /^([A-Z][a-z]+\s+[A-Z][a-z]+)$/m
        ];
        
        for (const pattern of namePatterns) {
          const nameMatch = text.match(pattern);
          if (nameMatch) {
            const fullName = nameMatch[1].trim();
            const nameParts = fullName.split(' ');
            ownerInfo.firstName = nameParts[0];
            ownerInfo.lastName = nameParts.slice(1).join(' ');
            ownerInfo.fullName = fullName;
            break;
          }
        }

        // Extract email
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
          ownerInfo.email = emailMatch[0];
        }

        // Extract phone
        const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) {
          ownerInfo.phone = phoneMatch[0];
        }

        if (Object.keys(ownerInfo).length > 0) {
          result.ownerInfo = ownerInfo;
        }
      }

      return result;
    } catch (error) {
      devLog.error('Error extracting info from document:', error);
      return {};
    }
  }

  private generateIntelligentAddress(associationName: string, unitNumber: string): string {
    // Generate a realistic address based on association name and unit
    const streetNumbers = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
    const streetNames = ['Main St', 'Oak Ave', 'Pine Dr', 'Cedar Ln', 'Maple Way', 'Elm Ct'];
    
    // Use unit number to determine street number
    const baseNumber = parseInt(unitNumber.replace(/\D/g, '')) || 1;
    const streetNumber = streetNumbers[baseNumber % streetNumbers.length];
    const streetName = streetNames[baseNumber % streetNames.length];
    
    return `${streetNumber} ${streetName}, Unit ${unitNumber}`;
  }

  private async ensureAssociationExists(associationName: string): Promise<string> {
    try {
      // Check if association already exists
      const { data: existing } = await supabase
        .from('associations')
        .select('id')
        .eq('name', associationName)
        .single();

      if (existing) {
        return existing.id;
      }

      // Create new association
      const { data: newAssociation, error } = await supabase
        .from('associations')
        .insert({
          name: associationName,
          address: 'Address to be updated',
          city: 'City',
          state: 'TX',
          zip: '78681'
        })
        .select('id')
        .single();

      if (error) throw error;
      return newAssociation.id;
    } catch (error) {
      devLog.error('Error ensuring association exists:', error);
      throw new Error(`Failed to create association: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createPropertyForUnit(associationId: string, unit: ProcessedUnit, associationName: string): Promise<{ id: string; address: string }> {
    try {
      const address = unit.extractedAddress || this.generateIntelligentAddress(associationName, unit.unitNumber);
      
      const { data: property, error } = await supabase
        .from('properties')
        .insert({
          association_id: associationId,
          address,
          unit_number: unit.unitNumber,
          property_type: 'apartment',
          city: 'City',
          state: 'TX',
          zip: '78681'
        })
        .select('id')
        .single();

      if (error) throw error;
      
      devLog.info(`Created property: ${address} (${unit.unitNumber})`);
      return { id: property.id, address };
    } catch (error) {
      devLog.error('Error creating property:', error);
      throw new Error(`Failed to create property for unit ${unit.unitNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createOwnerForProperty(propertyId: string, associationId: string, ownerInfo: ExtractedOwnerInfo): Promise<{ id: string; name: string; contactInfo?: string } | null> {
    try {
      if (!ownerInfo.firstName && !ownerInfo.lastName && !ownerInfo.fullName) {
        return null; // No name information available
      }

      const firstName = ownerInfo.firstName || ownerInfo.fullName?.split(' ')[0] || '';
      const lastName = ownerInfo.lastName || ownerInfo.fullName?.split(' ').slice(1).join(' ') || '';
      const fullName = ownerInfo.fullName || `${firstName} ${lastName}`.trim();

      const { data: resident, error } = await supabase
        .from('residents')
        .insert({
          association_id: associationId,
          property_id: propertyId,
          first_name: firstName,
          last_name: lastName,
          email: ownerInfo.email,
          phone: ownerInfo.phone,
          resident_type: 'owner',
          is_primary: true
        })
        .select('id')
        .single();

      if (error) throw error;

      const contactInfo = [ownerInfo.email, ownerInfo.phone].filter(Boolean).join(', ');
      
      devLog.info(`Created owner: ${fullName} for property ${propertyId}`);
      return { 
        id: resident.id, 
        name: fullName,
        contactInfo: contactInfo || undefined
      };
    } catch (error) {
      devLog.error('Error creating owner:', error);
      return null; // Don't fail the entire process for owner creation issues
    }
  }

  private async uploadAndLinkDocument(file: { name: string; content: ArrayBuffer; type: string }, propertyId: string, associationId: string): Promise<void> {
    try {
      // Create a file path in storage
      const fileName = `${propertyId}/${Date.now()}-${file.name}`;
      
      // Upload to Supabase storage (you'll need to create a 'documents' bucket)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file.content, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create document record
      const { error: docError } = await supabase
        .from('documents')
        .insert({
          association_id: associationId,
          property_id: propertyId,
          name: file.name,
          file_url: uploadData.path,
          file_type: file.type,
          file_size: file.content.byteLength,
          uploaded_by: null // System upload
        });

      if (docError) throw docError;
      
      devLog.info(`Uploaded document: ${file.name} for property ${propertyId}`);
    } catch (error) {
      devLog.error(`Failed to upload document ${file.name}:`, error);
      throw error;
    }
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    // For now, just restart the process
    return this.processHierarchicalZip(zipFile);
  }

  cancel() {
    this.isCancelled = true;
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
