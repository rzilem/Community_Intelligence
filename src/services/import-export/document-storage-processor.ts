
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface DocumentStorageResult {
  success: boolean;
  associationName: string;
  documentsImported: number;
  unitsProcessed: number;
  categoriesFound: string[];
  totalDocuments: number;
  errors: string[];
  summary: Record<string, number>;
}

export interface ProcessingProgress {
  stage: 'analyzing' | 'processing' | 'storing' | 'complete' | 'error';
  message: string;
  progress: number;
  currentUnit?: string;
  currentCategory?: string;
}

class DocumentStorageProcessor {
  private supportedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'];

  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    try {
      devLog.info('Starting document storage processing for:', zipFile.name);
      
      const zip = await JSZip.loadAsync(zipFile);
      const result = await this.analyzeAndProcessZip(zip);
      
      devLog.info('Document storage processing completed:', result);
      return result;
    } catch (error) {
      devLog.error('Document storage processing error:', error);
      throw error;
    }
  }

  private async analyzeAndProcessZip(zip: JSZip): Promise<DocumentStorageResult> {
    const result: DocumentStorageResult = {
      success: false,
      associationName: '',
      documentsImported: 0,
      unitsProcessed: 0,
      categoriesFound: [],
      totalDocuments: 0,
      errors: [],
      summary: {}
    };

    try {
      // Analyze ZIP structure
      const structure = this.analyzeZipStructure(zip);
      result.associationName = structure.associationName;
      result.totalDocuments = structure.totalDocuments;
      result.categoriesFound = Array.from(structure.categories);

      devLog.info('ZIP structure analyzed:', structure);

      // Find or create association
      const association = await this.findOrCreateAssociation(structure.associationName);
      devLog.info('Association resolved:', association);

      // Process each unit and its documents
      let documentsProcessed = 0;
      for (const [unitName, unitData] of structure.units.entries()) {
        try {
          devLog.info(`Processing unit: ${unitName}`);
          
          // Find or create property for this unit
          const property = await this.findOrCreateProperty(association.id, unitName);
          
          // Process documents for this unit
          for (const [category, files] of unitData.categories.entries()) {
            for (const fileInfo of files) {
              try {
                await this.processDocument(zip, fileInfo, association.id, property.id, category);
                documentsProcessed++;
                
                // Update summary
                result.summary[category] = (result.summary[category] || 0) + 1;
              } catch (error) {
                const errorMsg = `Failed to process ${fileInfo.path}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                result.errors.push(errorMsg);
                devLog.error(errorMsg);
              }
            }
          }
          
          result.unitsProcessed++;
        } catch (error) {
          const errorMsg = `Failed to process unit ${unitName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          devLog.error(errorMsg);
        }
      }

      result.documentsImported = documentsProcessed;
      result.success = true;

      return result;
    } catch (error) {
      result.errors.push(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private analyzeZipStructure(zip: JSZip) {
    const structure = {
      associationName: '',
      totalDocuments: 0,
      categories: new Set<string>(),
      units: new Map<string, {
        categories: Map<string, Array<{
          path: string;
          name: string;
          size: number;
        }>>
      }>()
    };

    zip.forEach((relativePath, file) => {
      if (file.dir) return;

      const pathParts = relativePath.split('/').filter(part => part.length > 0);
      
      // Skip files that aren't in the expected structure (Association/Unit/Category/File)
      if (pathParts.length < 3) return;

      const [associationName, unitName, categoryName, ...fileNameParts] = pathParts;
      const fileName = fileNameParts.join('/');

      // Set association name from the first file we encounter
      if (!structure.associationName) {
        structure.associationName = associationName;
      }

      // Check if file has supported extension
      const hasValidExtension = this.supportedExtensions.some(ext => 
        fileName.toLowerCase().endsWith(ext.toLowerCase())
      );
      
      if (!hasValidExtension) return;

      // Initialize unit if not exists
      if (!structure.units.has(unitName)) {
        structure.units.set(unitName, {
          categories: new Map()
        });
      }

      const unit = structure.units.get(unitName)!;

      // Initialize category if not exists
      if (!unit.categories.has(categoryName)) {
        unit.categories.set(categoryName, []);
      }

      // Add file to category
      unit.categories.get(categoryName)!.push({
        path: relativePath,
        name: fileName,
        size: file._data?.uncompressedSize || 0
      });

      structure.categories.add(categoryName);
      structure.totalDocuments++;
    });

    return structure;
  }

  private async findOrCreateAssociation(name: string) {
    try {
      // First, try to find existing association
      const { data: existing, error: findError } = await supabase
        .from('associations')
        .select('id, name')
        .ilike('name', name)
        .maybeSingle();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      if (existing) {
        devLog.info('Found existing association:', existing);
        return existing;
      }

      // Create new association
      const { data: newAssociation, error: createError } = await supabase
        .from('associations')
        .insert({
          name: name,
          status: 'active'
        })
        .select('id, name')
        .single();

      if (createError) {
        throw createError;
      }

      devLog.info('Created new association:', newAssociation);
      return newAssociation;
    } catch (error) {
      devLog.error('Error finding/creating association:', error);
      throw new Error(`Failed to process association "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async findOrCreateProperty(associationId: string, unitName: string) {
    try {
      // First, try to find existing property
      const { data: existing, error: findError } = await supabase
        .from('properties')
        .select('id, unit_number, address')
        .eq('association_id', associationId)
        .or(`unit_number.ilike.${unitName},address.ilike.%${unitName}%`)
        .maybeSingle();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      if (existing) {
        devLog.info('Found existing property:', existing);
        return existing;
      }

      // Create new property
      const { data: newProperty, error: createError } = await supabase
        .from('properties')
        .insert({
          association_id: associationId,
          unit_number: unitName,
          address: `Unit ${unitName}`,
          status: 'active'
        })
        .select('id, unit_number, address')
        .single();

      if (createError) {
        throw createError;
      }

      devLog.info('Created new property:', newProperty);
      return newProperty;
    } catch (error) {
      devLog.error('Error finding/creating property:', error);
      throw new Error(`Failed to process unit "${unitName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processDocument(
    zip: JSZip, 
    fileInfo: { path: string; name: string; size: number },
    associationId: string,
    propertyId: string,
    category: string
  ) {
    try {
      const file = zip.file(fileInfo.path);
      if (!file) {
        throw new Error('File not found in ZIP');
      }

      // Get file content as blob
      const blob = await file.async('blob');
      
      // Create file object for upload
      const uploadFile = new File([blob], fileInfo.name, {
        type: this.getMimeType(fileInfo.name)
      });

      // Generate unique file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${associationId}/${propertyId}/${category}/${timestamp}-${fileInfo.name}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, uploadFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Create document record in database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          association_id: associationId,
          name: fileInfo.name,
          url: urlData.publicUrl,
          file_type: this.getFileExtension(fileInfo.name),
          file_size: fileInfo.size,
          category: category,
          description: `Imported from ZIP archive - ${category} for property`,
          is_public: false,
          uploaded_at: new Date().toISOString()
        });

      if (dbError) {
        // If database insert fails, try to clean up the uploaded file
        await supabase.storage.from('documents').remove([fileName]);
        throw dbError;
      }

      devLog.info(`Successfully processed document: ${fileInfo.name}`);
    } catch (error) {
      devLog.error(`Error processing document ${fileInfo.name}:`, error);
      throw error;
    }
  }

  private getMimeType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  private getFileExtension(fileName: string): string {
    return fileName.toLowerCase().split('.').pop() || 'unknown';
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
