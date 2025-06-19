
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface DocumentHierarchy {
  associationCode: string;
  associationName: string;
  units: Map<string, UnitDocuments>;
}

export interface UnitDocuments {
  unitNumber: string;
  documentCategories: Map<string, DocumentFile[]>;
}

export interface DocumentFile {
  filename: string;
  path: string;
  content: ArrayBuffer;
  size: number;
  category: string;
  unitNumber: string;
  associationCode: string;
}

export interface DocumentStorageResult {
  success: boolean;
  associationId: string;
  associationName: string;
  totalDocuments: number;
  documentsImported: number;
  unitsProcessed: number;
  categoriesFound: string[];
  errors: string[];
  warnings: string[];
  summary: {
    [category: string]: number;
  };
}

export class DocumentStorageProcessor {
  async processHierarchicalZip(zipFile: File): Promise<DocumentStorageResult> {
    try {
      const zip = await JSZip.loadAsync(zipFile);
      const hierarchy = await this.analyzeZipStructure(zip);
      
      // Create or find association
      const associationId = await this.createOrFindAssociation(
        hierarchy.associationCode, 
        hierarchy.associationName
      );
      
      // Process units and documents
      const result = await this.processDocumentHierarchy(hierarchy, associationId);
      
      return {
        success: true,
        associationId,
        associationName: hierarchy.associationName,
        ...result
      };
      
    } catch (error) {
      devLog.error('Document storage processing failed:', error);
      throw new Error(`Failed to process document ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async analyzeZipStructure(zip: JSZip): Promise<DocumentHierarchy> {
    const hierarchy: DocumentHierarchy = {
      associationCode: '',
      associationName: '',
      units: new Map()
    };

    // Find the top-level association folder
    const topLevelFolders = Object.keys(zip.files)
      .filter(path => path.includes('/') && !path.startsWith('__MACOSX'))
      .map(path => path.split('/')[0])
      .filter((folder, index, arr) => arr.indexOf(folder) === index);

    if (topLevelFolders.length === 0) {
      throw new Error('No association folder found in ZIP file');
    }

    const associationCode = topLevelFolders[0];
    hierarchy.associationCode = associationCode;
    hierarchy.associationName = this.generateAssociationName(associationCode);

    // Analyze unit structure
    for (const [path, zipObject] of Object.entries(zip.files)) {
      if (zipObject.dir || path.startsWith('__MACOSX') || path.startsWith('.')) {
        continue;
      }

      const parts = path.split('/');
      if (parts.length < 3) continue; // Need at least: association/unit/category/file

      const unitNumber = parts[1];
      const category = parts[2];
      const filename = parts[parts.length - 1];

      if (!hierarchy.units.has(unitNumber)) {
        hierarchy.units.set(unitNumber, {
          unitNumber,
          documentCategories: new Map()
        });
      }

      const unit = hierarchy.units.get(unitNumber)!;
      if (!unit.documentCategories.has(category)) {
        unit.documentCategories.set(category, []);
      }

      const content = await zipObject.async('arraybuffer');
      unit.documentCategories.get(category)!.push({
        filename,
        path,
        content,
        size: content.byteLength,
        category,
        unitNumber,
        associationCode
      });
    }

    return hierarchy;
  }

  private generateAssociationName(code: string): string {
    // Convert codes like 'GOC' to readable names
    const codeMap: Record<string, string> = {
      'GOC': 'Gattis Office Condos',
      'HOA': 'Homeowners Association',
      'CC': 'Country Club'
    };

    return codeMap[code] || code.replace(/([A-Z])/g, ' $1').trim();
  }

  private async createOrFindAssociation(code: string, name: string): Promise<string> {
    // First try to find existing association by code
    const { data: existing } = await supabase
      .from('associations')
      .select('id')
      .eq('code', code)
      .single();

    if (existing) {
      devLog.info(`Found existing association: ${code}`);
      return existing.id;
    }

    // Create new association
    const { data: newAssoc, error } = await supabase
      .from('associations')
      .insert({
        name,
        code,
        status: 'active'
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create association: ${error.message}`);
    }

    devLog.info(`Created new association: ${name} (${code})`);
    return newAssoc.id;
  }

  private async processDocumentHierarchy(
    hierarchy: DocumentHierarchy, 
    associationId: string
  ): Promise<Omit<DocumentStorageResult, 'success' | 'associationId' | 'associationName'>> {
    let totalDocuments = 0;
    let documentsImported = 0;
    const unitsProcessed = hierarchy.units.size;
    const categoriesFound = new Set<string>();
    const errors: string[] = [];
    const warnings: string[] = [];
    const summary: Record<string, number> = {};

    for (const [unitNumber, unitData] of hierarchy.units) {
      try {
        // Create or find property for this unit
        const propertyId = await this.createOrFindProperty(unitNumber, associationId);

        for (const [category, documents] of unitData.documentCategories) {
          categoriesFound.add(category);
          
          for (const doc of documents) {
            totalDocuments++;
            
            try {
              await this.storeDocument(doc, propertyId, associationId);
              documentsImported++;
              summary[category] = (summary[category] || 0) + 1;
            } catch (error) {
              errors.push(`Failed to store ${doc.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      } catch (error) {
        errors.push(`Failed to process unit ${unitNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      totalDocuments,
      documentsImported,
      unitsProcessed,
      categoriesFound: Array.from(categoriesFound),
      errors,
      warnings,
      summary
    };
  }

  private async createOrFindProperty(unitNumber: string, associationId: string): Promise<string> {
    // Try to find existing property
    const { data: existing } = await supabase
      .from('properties')
      .select('id')
      .eq('unit_number', unitNumber)
      .eq('association_id', associationId)
      .single();

    if (existing) {
      return existing.id;
    }

    // Create new property
    const { data: newProperty, error } = await supabase
      .from('properties')
      .insert({
        association_id: associationId,
        unit_number: unitNumber,
        address: `Unit ${unitNumber}`,
        property_type: 'condo',
        status: 'occupied'
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create property for unit ${unitNumber}: ${error.message}`);
    }

    return newProperty.id;
  }

  private async storeDocument(
    doc: DocumentFile, 
    propertyId: string, 
    associationId: string
  ): Promise<void> {
    // Upload file to storage
    const fileName = `${associationId}/${propertyId}/${doc.category}/${doc.filename}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, doc.content, {
        contentType: this.getContentType(doc.filename),
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Store document metadata
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        association_id: associationId,
        name: doc.filename,
        url: publicUrl,
        file_type: this.getFileExtension(doc.filename),
        file_size: doc.size,
        category: this.normalizeCategory(doc.category),
        description: `Document from unit ${doc.unitNumber} - ${doc.category}`,
        tags: [doc.unitNumber, doc.category, doc.associationCode],
        is_public: false
      });

    if (dbError) {
      throw new Error(`Database insert failed: ${dbError.message}`);
    }
  }

  private getContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const contentTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }

  private getFileExtension(filename: string): string {
    return filename.toLowerCase().split('.').pop() || 'unknown';
  }

  private normalizeCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      'emails': 'Communication',
      'letters': 'Communication',
      'notices': 'Legal',
      'invoices': 'Financial',
      'receipts': 'Financial',
      'contracts': 'Legal',
      'photos': 'Media',
      'reports': 'Administrative'
    };

    return categoryMap[category.toLowerCase()] || 'General';
  }
}

export const documentStorageProcessor = new DocumentStorageProcessor();
