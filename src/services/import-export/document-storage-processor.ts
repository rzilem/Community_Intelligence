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
  warnings: string[];
  errors: string[];
  processingTime: number;
}

interface FolderStructure {
  path: string;
  type: 'unit' | 'admin' | 'general';
  unitNumber?: string;
  address?: string;
  files: JSZip.JSZipObject[];
}

export class DocumentStorageProcessor {
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
    const result: DocumentStorageResult = {
      success: false,
      associationName: '',
      documentsImported: 0,
      documentsSkipped: 0,
      totalFiles: 0,
      createdProperties: [],
      createdOwners: [],
      warnings: [],
      errors: [],
      processingTime: 0
    };

    try {
      // Load and analyze ZIP file
      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipFile);
      
      this.updateProgress({
        stage: 'analyzing',
        message: 'Analyzing ZIP file structure...',
        progress: 10,
        filesProcessed: 0,
        totalFiles: 0,
        unitsProcessed: 0,
        totalUnits: 0
      });

      // Extract folder structure
      const folderStructure = await this.analyzeFolderStructure(zipData);
      devLog.info('Analyzed folder structure:', folderStructure);

      if (folderStructure.length === 0) {
        throw new Error('No valid folders found in ZIP file');
      }

      // Determine association name from first folder
      result.associationName = this.extractAssociationName(folderStructure[0].path);
      devLog.info('Extracted association name:', result.associationName);

      const totalFiles = folderStructure.reduce((sum, folder) => sum + folder.files.length, 0);
      result.totalFiles = totalFiles;

      this.updateProgress({
        stage: 'creating',
        message: 'Creating association and properties...',
        progress: 30,
        filesProcessed: 0,
        totalFiles: totalFiles,
        unitsProcessed: 0,
        totalUnits: folderStructure.filter(f => f.type === 'unit').length
      });

      // Create or get association
      const associationId = await this.createOrGetAssociation(result.associationName);
      devLog.info('Association ID:', associationId);

      // Process unit folders to create properties
      const unitFolders = folderStructure.filter(f => f.type === 'unit');
      for (const folder of unitFolders) {
        if (this.cancelled) break;

        const property = await this.createPropertyFromFolder(associationId, folder);
        if (property) {
          result.createdProperties.push(property);
        }
      }

      this.updateProgress({
        stage: 'uploading',
        message: 'Processing and uploading documents...',
        progress: 50,
        filesProcessed: 0,
        totalFiles: totalFiles,
        unitsProcessed: result.createdProperties.length,
        totalUnits: unitFolders.length
      });

      // Process documents
      let filesProcessed = 0;
      for (const folder of folderStructure) {
        if (this.cancelled) break;

        const folderResult = await this.processDocumentsInFolder(associationId, folder);
        result.documentsImported += folderResult.imported;
        result.documentsSkipped += folderResult.skipped;
        result.warnings.push(...folderResult.warnings);
        result.errors.push(...folderResult.errors);

        filesProcessed += folder.files.length;
        this.updateProgress({
          stage: 'uploading',
          message: `Processing documents in ${folder.path}...`,
          progress: 50 + (filesProcessed / totalFiles) * 40,
          filesProcessed,
          totalFiles,
          unitsProcessed: result.createdProperties.length,
          totalUnits: unitFolders.length
        });
      }

      result.success = true;
      result.processingTime = Date.now() - startTime;

      this.updateProgress({
        stage: 'complete',
        message: 'Document import completed successfully!',
        progress: 100,
        filesProcessed: totalFiles,
        totalFiles,
        unitsProcessed: result.createdProperties.length,
        totalUnits: unitFolders.length
      });

      return result;

    } catch (error) {
      devLog.error('Document storage processing error:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.processingTime = Date.now() - startTime;
      
      this.updateProgress({
        stage: 'error',
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0,
        filesProcessed: 0,
        totalFiles: result.totalFiles,
        unitsProcessed: 0,
        totalUnits: 0
      });

      return result;
    }
  }

  private async analyzeFolderStructure(zipData: JSZip): Promise<FolderStructure[]> {
    const folders: FolderStructure[] = [];
    const folderMap = new Map<string, JSZip.JSZipObject[]>();

    // Group files by their parent folder
    Object.entries(zipData.files).forEach(([path, zipObject]) => {
      if (zipObject.dir) return;

      // Skip system files
      if (this.isSystemFile(path)) return;

      const folderPath = path.substring(0, path.lastIndexOf('/'));
      if (!folderPath) return;

      if (!folderMap.has(folderPath)) {
        folderMap.set(folderPath, []);
      }
      folderMap.get(folderPath)!.push(zipObject);
    });

    // Analyze each folder
    for (const [folderPath, files] of folderMap.entries()) {
      if (files.length === 0) continue;

      const folderInfo = this.analyzeFolderPath(folderPath);
      devLog.info(`Analyzing folder: ${folderPath}`, folderInfo);

      folders.push({
        path: folderPath,
        type: folderInfo.type,
        unitNumber: folderInfo.unitNumber,
        address: folderInfo.address,
        files
      });
    }

    return folders;
  }

  private analyzeFolderPath(folderPath: string): {
    type: 'unit' | 'admin' | 'general';
    unitNumber?: string;
    address?: string;
  } {
    const folderName = folderPath.split('/').pop()?.toLowerCase() || '';
    
    devLog.info(`Analyzing folder name: "${folderName}"`);

    // Check for administrative folders
    const adminFolders = [
      'arc requests', 'collections', 'insurance', 'legal', 'management',
      'maintenance', 'financial', 'accounting', 'bylaws', 'rules',
      'minutes', 'notices', 'general', 'admin', 'administrative'
    ];

    if (adminFolders.some(admin => folderName.includes(admin))) {
      devLog.info(`Identified as admin folder: ${folderName}`);
      return { type: 'admin' };
    }

    // Enhanced unit detection patterns
    const unitPatterns = [
      // Pattern: GOC13696-1490 Rusk Rd. Unit 301
      /goc\d+-(.+?)\s+unit\s+(\d+)/i,
      // Pattern: Unit 301, Apt 301, etc.
      /(unit|apt|apartment|suite)\s*(\d+)/i,
      // Pattern: 301, 1-301, A-301, etc.
      /^([a-z]?-?\d+)$/i,
      // Pattern: Building A Unit 301
      /building\s+[a-z]\s+unit\s+(\d+)/i
    ];

    for (const pattern of unitPatterns) {
      const match = folderName.match(pattern);
      if (match) {
        let unitNumber: string;
        let address: string | undefined;

        if (pattern.source.includes('goc')) {
          // GOC pattern: extract address and unit
          address = match[1]?.trim();
          unitNumber = match[2];
          devLog.info(`GOC pattern matched - Address: ${address}, Unit: ${unitNumber}`);
        } else {
          // Other patterns: just extract unit number
          unitNumber = match[2] || match[1];
          devLog.info(`Unit pattern matched - Unit: ${unitNumber}`);
        }

        return {
          type: 'unit',
          unitNumber: unitNumber,
          address: address
        };
      }
    }

    devLog.info(`No specific pattern matched, treating as general folder: ${folderName}`);
    return { type: 'general' };
  }

  private extractAssociationName(firstFolderPath: string): string {
    const segments = firstFolderPath.split('/');
    const folderName = segments[segments.length - 1];
    
    // Try to extract association name from GOC pattern
    const gocMatch = folderName.match(/goc\d+-(.+?)\s+unit/i);
    if (gocMatch) {
      return gocMatch[1].trim();
    }
    
    // Fallback to first segment or folder name
    return segments[0] || folderName || 'Imported Association';
  }

  private async createOrGetAssociation(name: string): Promise<string> {
    // First try to find existing association
    const { data: existing } = await supabase
      .from('associations')
      .select('id')
      .ilike('name', name)
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
        status: 'active',
        is_archived: false
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create association: ${error.message}`);
    }

    devLog.info('Created new association:', newAssoc.id);
    return newAssoc.id;
  }

  private async createPropertyFromFolder(
    associationId: string, 
    folder: FolderStructure
  ): Promise<{ id: string; address: string; unitNumber: string } | null> {
    if (!folder.unitNumber) return null;

    try {
      const address = folder.address || 'Unknown Address';
      
      // Check if property already exists
      const { data: existing } = await supabase
        .from('properties')
        .select('id, address, unit_number')
        .eq('association_id', associationId)
        .eq('unit_number', folder.unitNumber)
        .single();

      if (existing) {
        devLog.info(`Property already exists: Unit ${folder.unitNumber}`);
        return {
          id: existing.id,
          address: existing.address,
          unitNumber: existing.unit_number
        };
      }

      // Create new property
      const { data: newProperty, error } = await supabase
        .from('properties')
        .insert({
          association_id: associationId,
          address,
          unit_number: folder.unitNumber,
          property_type: 'unit',
          status: 'active'
        })
        .select('id, address, unit_number')
        .single();

      if (error) {
        devLog.error('Failed to create property:', error);
        return null;
      }

      devLog.info(`Created property: Unit ${folder.unitNumber}`);
      return {
        id: newProperty.id,
        address: newProperty.address,
        unitNumber: newProperty.unit_number
      };

    } catch (error) {
      devLog.error('Error creating property:', error);
      return null;
    }
  }

  private async processDocumentsInFolder(
    associationId: string,
    folder: FolderStructure
  ): Promise<{
    imported: number;
    skipped: number;
    warnings: string[];
    errors: string[];
  }> {
    const result = {
      imported: 0,
      skipped: 0,
      warnings: [],
      errors: []
    };

    // Find property if this is a unit folder
    let propertyId: string | null = null;
    if (folder.type === 'unit' && folder.unitNumber) {
      const { data: property } = await supabase
        .from('properties')
        .select('id')
        .eq('association_id', associationId)
        .eq('unit_number', folder.unitNumber)
        .single();
      
      propertyId = property?.id || null;
    }

    for (const file of folder.files) {
      try {
        if (this.cancelled) break;

        // Skip non-document files
        if (!this.isValidDocumentFile(file.name)) {
          result.skipped++;
          result.warnings.push(`Skipped unsupported file: ${file.name}`);
          continue;
        }

        // Check file size (skip files over 300MB)
        const maxSize = 300 * 1024 * 1024; // 300MB
        if (file._data && file._data.uncompressedSize > maxSize) {
          result.skipped++;
          result.warnings.push(`Skipped large file (>300MB): ${file.name}`);
          continue;
        }

        await this.uploadDocument(file, associationId, propertyId, folder.type);
        result.imported++;

      } catch (error) {
        result.errors.push(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.skipped++;
      }
    }

    return result;
  }

  private async uploadDocument(
    file: JSZip.JSZipObject,
    associationId: string,
    propertyId: string | null,
    folderType: 'unit' | 'admin' | 'general'
  ): Promise<void> {
    // For now, we'll just create document records
    // In a full implementation, you'd upload to Supabase Storage
    
    const fileName = file.name.split('/').pop() || file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const category = this.determineDocumentCategory(fileName, folderType);
    
    const { error } = await supabase
      .from('documents')
      .insert({
        association_id: associationId,
        property_id: propertyId,
        name: fileName,
        file_type: fileExtension,
        category,
        file_size: file._data?.uncompressedSize || 0,
        storage_path: `${associationId}/${propertyId || 'general'}/${fileName}`,
        status: 'uploaded'
      });

    if (error) {
      throw new Error(`Failed to create document record: ${error.message}`);
    }
  }

  private determineDocumentCategory(fileName: string, folderType: string): string {
    const name = fileName.toLowerCase();
    
    if (folderType === 'admin') {
      if (name.includes('arc') || name.includes('architectural')) return 'ARC';
      if (name.includes('collection') || name.includes('delinquent')) return 'Collections';
      if (name.includes('insurance')) return 'Insurance';
      if (name.includes('legal')) return 'Legal';
      if (name.includes('financial') || name.includes('accounting')) return 'Financial';
      return 'Administrative';
    }
    
    // Unit-specific document categories
    if (name.includes('lease')) return 'Lease';
    if (name.includes('deed')) return 'Deed';
    if (name.includes('insurance')) return 'Insurance';
    if (name.includes('inspection')) return 'Inspection';
    if (name.includes('violation') || name.includes('compliance')) return 'Compliance';
    if (name.includes('maintenance') || name.includes('repair')) return 'Maintenance';
    
    return 'General';
  }

  private isValidDocumentFile(fileName: string): boolean {
    const validExtensions = [
      'pdf', 'doc', 'docx', 'txt', 'rtf',
      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff',
      'xls', 'xlsx', 'csv',
      'ppt', 'pptx'
    ];
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    return validExtensions.includes(extension || '');
  }

  private isSystemFile(path: string): boolean {
    const systemFiles = [
      '__MACOSX',
      '.DS_Store',
      'Thumbs.db',
      'desktop.ini'
    ];
    
    return systemFiles.some(sysFile => path.includes(sysFile));
  }

  private updateProgress(progress: ProcessingProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  async resumeProcessing(zipFile: File): Promise<DocumentStorageResult> {
    // For now, just restart the process
    // In a full implementation, you'd resume from saved state
    return this.processHierarchicalZip(zipFile);
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
