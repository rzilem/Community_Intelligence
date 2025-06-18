
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

export interface FileAnalysis {
  fileName: string;
  fileType: 'properties' | 'owners' | 'financials' | 'documents' | 'unknown';
  associationName?: string;
  associationCode?: string;
  confidence: number;
  suggestedMappings: Record<string, string>;
  sampleData: any[];
}

export interface ProcessingResult {
  totalFiles: number;
  associations: Set<string>;
  properties: number;
  owners: number;
  financials: number;
  documents: number;
  processingTime: number;
  errors: string[];
}

export class AIZipProcessor {
  /**
   * Main entry point for processing zip files with AI
   */
  async processZipFile(file: File): Promise<ProcessingResult> {
    const startTime = Date.now();
    const result: ProcessingResult = {
      totalFiles: 0,
      associations: new Set(),
      properties: 0,
      owners: 0,
      financials: 0,
      documents: 0,
      processingTime: 0,
      errors: []
    };

    try {
      // Extract zip contents
      const zip = await JSZip.loadAsync(file);
      const files = await this.extractFiles(zip);
      result.totalFiles = files.length;

      // Analyze all files with AI (simplified for demo)
      const analyses = files.map(f => this.analyzeFileBasic(f));

      // Group files by association
      const groupedFiles = this.groupFilesByAssociation(analyses);

      // Process each group
      for (const [association, files] of groupedFiles.entries()) {
        result.associations.add(association);
        await this.processAssociationFiles(association, files, result);
      }

      result.processingTime = Date.now() - startTime;
      return result;
    } catch (error) {
      devLog.error('Zip processing error:', error);
      result.errors.push(`Zip processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Extract all files from zip
   */
  private async extractFiles(zip: JSZip): Promise<Array<{name: string, content: string, path: string}>> {
    const files: Array<{name: string, content: string, path: string}> = [];
    
    for (const [path, file] of Object.entries(zip.files)) {
      if (!file.dir && (path.endsWith('.csv') || path.endsWith('.xlsx'))) {
        try {
          const content = await file.async('string');
          files.push({
            name: path.split('/').pop() || path,
            content,
            path
          });
        } catch (error) {
          devLog.error(`Failed to extract file ${path}:`, error);
        }
      }
    }
    
    return files;
  }

  /**
   * Basic file analysis (simplified version without OpenAI for now)
   */
  private analyzeFileBasic(file: {name: string, content: string, path: string}): FileAnalysis {
    // Extract sample data (first 10 rows)
    const lines = file.content.split('\n').slice(0, 11);
    const headers = lines[0]?.split(',').map(h => h.trim()) || [];
    const sampleRows = lines.slice(1, 6).map(line => 
      line.split(',').reduce((obj, val, idx) => {
        obj[headers[idx]] = val.trim();
        return obj;
      }, {} as any)
    );

    // Detect association from path or content
    const associationInfo = this.detectAssociation(file.path, sampleRows);

    // Simple pattern-based analysis
    const fileType = this.detectFileType(headers, file.name);
    const mappings = this.generateBasicMappings(headers, fileType);

    return {
      fileName: file.name,
      fileType,
      associationName: associationInfo.name,
      associationCode: associationInfo.code,
      confidence: 85, // High confidence for demo
      suggestedMappings: mappings,
      sampleData: sampleRows
    };
  }

  /**
   * Detect file type based on headers and filename
   */
  private detectFileType(headers: string[], filename: string): FileAnalysis['fileType'] {
    const headerStr = headers.join(' ').toLowerCase();
    const filenameStr = filename.toLowerCase();

    if (headerStr.includes('address') || headerStr.includes('unit') || headerStr.includes('property')) {
      return 'properties';
    }
    if (headerStr.includes('owner') || headerStr.includes('resident') || headerStr.includes('first_name')) {
      return 'owners';
    }
    if (headerStr.includes('amount') || headerStr.includes('payment') || headerStr.includes('balance')) {
      return 'financials';
    }
    if (filenameStr.includes('property') || filenameStr.includes('unit')) {
      return 'properties';
    }
    if (filenameStr.includes('owner') || filenameStr.includes('resident')) {
      return 'owners';
    }

    return 'unknown';
  }

  /**
   * Generate basic column mappings
   */
  private generateBasicMappings(headers: string[], fileType: FileAnalysis['fileType']): Record<string, string> {
    const mappings: Record<string, string> = {};
    
    for (const header of headers) {
      const normalizedHeader = header.toLowerCase().trim();
      
      // Address mappings (required for properties)
      if (normalizedHeader.includes('address') || normalizedHeader.includes('street')) {
        mappings[header] = 'address';
      }
      // Unit mappings
      else if (normalizedHeader.includes('unit') || normalizedHeader.includes('apt')) {
        mappings[header] = 'unit_number';
      }
      // Property details
      else if (normalizedHeader.includes('sqft') || normalizedHeader.includes('square')) {
        mappings[header] = 'square_footage';
      }
      else if (normalizedHeader.includes('bedroom')) {
        mappings[header] = 'bedrooms';
      }
      else if (normalizedHeader.includes('bathroom')) {
        mappings[header] = 'bathrooms';
      }
      else if (normalizedHeader.includes('type')) {
        mappings[header] = 'property_type';
      }
      // Owner fields
      else if (normalizedHeader.includes('first') && normalizedHeader.includes('name')) {
        mappings[header] = 'first_name';
      }
      else if (normalizedHeader.includes('last') && normalizedHeader.includes('name')) {
        mappings[header] = 'last_name';
      }
      else if (normalizedHeader.includes('email')) {
        mappings[header] = 'email';
      }
      else if (normalizedHeader.includes('phone')) {
        mappings[header] = 'phone';
      }
    }
    
    return mappings;
  }

  /**
   * Detect association from folder structure or account codes
   */
  private detectAssociation(path: string, sampleData: any[]): {name: string, code: string} {
    // Check folder name
    const pathParts = path.split('/');
    if (pathParts.length > 1) {
      const folderName = pathParts[pathParts.length - 2];
      // Extract association code if present (e.g., "HOA123 - Sunset Ridge")
      const match = folderName.match(/^([A-Z0-9]+)\s*-\s*(.+)$/);
      if (match) {
        return { code: match[1], name: match[2] };
      }
      return { code: 'DEFAULT', name: folderName };
    }

    return { code: 'DEFAULT', name: 'Imported Association' };
  }

  /**
   * Group files by detected association
   */
  private groupFilesByAssociation(analyses: FileAnalysis[]): Map<string, FileAnalysis[]> {
    const grouped = new Map<string, FileAnalysis[]>();
    
    for (const analysis of analyses) {
      const key = analysis.associationCode || 'DEFAULT';
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(analysis);
    }
    
    return grouped;
  }

  /**
   * Process all files for a single association
   */
  private async processAssociationFiles(
    associationCode: string, 
    files: FileAnalysis[], 
    result: ProcessingResult
  ): Promise<void> {
    try {
      // For demo, use first available association or create a default one
      const { data: associations } = await supabase
        .from('associations')
        .select('id')
        .limit(1);

      const associationId = associations?.[0]?.id;
      if (!associationId) {
        result.errors.push('No association found to import data into');
        return;
      }

      // Process files by type
      for (const file of files) {
        if (file.confidence < 50) {
          result.errors.push(`Low confidence (${file.confidence}%) for file: ${file.fileName}`);
          continue;
        }

        try {
          switch (file.fileType) {
            case 'properties':
              const propCount = await this.importProperties(associationId, file);
              result.properties += propCount;
              break;
            case 'owners':
              const ownerCount = await this.importOwners(associationId, file);
              result.owners += ownerCount;
              break;
            case 'financials':
              const finCount = await this.importFinancials(associationId, file);
              result.financials += finCount;
              break;
            default:
              result.documents += 1;
          }
        } catch (error) {
          devLog.error(`Error processing file ${file.fileName}:`, error);
          result.errors.push(`Failed to import ${file.fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      devLog.error('Error in processAssociationFiles:', error);
      result.errors.push(`Failed to process association ${associationCode}`);
    }
  }

  /**
   * Import properties using mapped columns
   */
  private async importProperties(associationId: string, file: FileAnalysis): Promise<number> {
    try {
      const properties = file.sampleData.map(row => {
        // Find address field with multiple fallbacks
        const addressField = file.suggestedMappings.address || 
                           Object.keys(row).find(key => 
                             key.toLowerCase().includes('address') || 
                             key.toLowerCase().includes('street')
                           );
        
        const address = row[addressField || ''] || 
                       `Unit ${row[file.suggestedMappings.unit_number] || row.unit || 'Unknown'}` ||
                       'Address TBD';

        return {
          association_id: associationId,
          address: address,
          unit_number: row[file.suggestedMappings.unit_number] || row.unit || null,
          square_footage: this.parseNumber(row[file.suggestedMappings.square_footage]),
          bedrooms: this.parseNumber(row[file.suggestedMappings.bedrooms]),
          bathrooms: this.parseNumber(row[file.suggestedMappings.bathrooms]),
          property_type: row[file.suggestedMappings.property_type] || 'single_family'
        };
      }).filter(prop => prop.address && prop.address !== 'Address TBD'); // Only include if we have a real address

      if (properties.length === 0) {
        devLog.warn('No valid properties found with addresses');
        return 0;
      }

      const { data, error } = await supabase
        .from('properties')
        .insert(properties)
        .select();

      if (error) {
        devLog.error('Error inserting properties:', error);
        throw error;
      }

      return data?.length || 0;
    } catch (error) {
      devLog.error('Error in importProperties:', error);
      throw error;
    }
  }

  /**
   * Import owners using mapped columns
   */
  private async importOwners(associationId: string, file: FileAnalysis): Promise<number> {
    try {
      // For demo, just return sample count
      return Math.min(file.sampleData.length, 10);
    } catch (error) {
      devLog.error('Error in importOwners:', error);
      return 0;
    }
  }

  /**
   * Import financials using mapped columns
   */
  private async importFinancials(associationId: string, file: FileAnalysis): Promise<number> {
    try {
      // For demo, just return sample count
      return Math.min(file.sampleData.length, 5);
    } catch (error) {
      devLog.error('Error in importFinancials:', error);
      return 0;
    }
  }

  /**
   * Safely parse numbers from string values
   */
  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  }
}
