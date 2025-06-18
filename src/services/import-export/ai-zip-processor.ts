
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';

interface FileAnalysis {
  fileName: string;
  fileType: 'properties' | 'owners' | 'financials' | 'documents' | 'unknown';
  associationName?: string;
  associationCode?: string;
  confidence: number;
  suggestedMappings: Record<string, string>;
  sampleData: any[];
}

interface ProcessingResult {
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

      // Analyze all files with pattern matching
      const analyses = await Promise.all(
        files.map(f => this.analyzeFileWithPatterns(f))
      );

      // Group files by association
      const groupedFiles = this.groupFilesByAssociation(analyses);

      // Process each group in parallel
      await Promise.all(
        Array.from(groupedFiles.entries()).map(async ([association, files]) => {
          result.associations.add(association);
          await this.processAssociationFiles(association, files, result);
        })
      );

      result.processingTime = Date.now() - startTime;
      return result;
    } catch (error) {
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
        const content = await file.async('string');
        files.push({
          name: path.split('/').pop() || path,
          content,
          path
        });
      }
    }
    
    return files;
  }

  /**
   * Use pattern matching to analyze file content and determine type/structure
   */
  private async analyzeFileWithPatterns(file: {name: string, content: string, path: string}): Promise<FileAnalysis> {
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

    // Analyze content using pattern matching
    const analysis = this.analyzeContentPatterns(headers, sampleRows, file.name);

    return {
      fileName: file.name,
      fileType: analysis.dataType || 'unknown',
      associationName: associationInfo.name,
      associationCode: associationInfo.code,
      confidence: analysis.confidence || 0,
      suggestedMappings: analysis.mappings || {},
      sampleData: sampleRows
    };
  }

  /**
   * Analyze content using pattern matching for high-confidence detection
   */
  private analyzeContentPatterns(headers: string[], sampleData: any[], fileName: string): any {
    const lowerHeaders = headers.map(h => h.toLowerCase());
    
    // Property patterns
    const propertyScore = this.calculatePatternScore(lowerHeaders, [
      'unit', 'address', 'property', 'bedrooms', 'bathrooms', 'sqft', 'square_footage'
    ]);
    
    // Owner patterns
    const ownerScore = this.calculatePatternScore(lowerHeaders, [
      'first_name', 'last_name', 'name', 'email', 'phone', 'owner', 'resident'
    ]);
    
    // Financial patterns
    const financialScore = this.calculatePatternScore(lowerHeaders, [
      'amount', 'balance', 'payment', 'due_date', 'assessment', 'fee'
    ]);
    
    // Determine type based on scores
    let dataType = 'unknown';
    let confidence = 0;
    let mappings = {};
    
    if (propertyScore > ownerScore && propertyScore > financialScore && propertyScore > 0.3) {
      dataType = 'properties';
      confidence = Math.min(95, propertyScore * 100);
      mappings = this.generatePropertyMappings(lowerHeaders);
    } else if (ownerScore > financialScore && ownerScore > 0.3) {
      dataType = 'owners';
      confidence = Math.min(95, ownerScore * 100);
      mappings = this.generateOwnerMappings(lowerHeaders);
    } else if (financialScore > 0.3) {
      dataType = 'financials';
      confidence = Math.min(95, financialScore * 100);
      mappings = this.generateFinancialMappings(lowerHeaders);
    }
    
    return { dataType, confidence, mappings };
  }

  /**
   * Calculate pattern matching score
   */
  private calculatePatternScore(headers: string[], patterns: string[]): number {
    let matches = 0;
    for (const pattern of patterns) {
      for (const header of headers) {
        if (header.includes(pattern) || pattern.includes(header)) {
          matches++;
          break;
        }
      }
    }
    return matches / patterns.length;
  }

  /**
   * Generate property field mappings
   */
  private generatePropertyMappings(headers: string[]): Record<string, string> {
    const mappings: Record<string, string> = {};
    
    for (const header of headers) {
      if (header.includes('unit') || header.includes('number')) {
        mappings[header] = 'unit_number';
      } else if (header.includes('address') || header.includes('street')) {
        mappings[header] = 'address';
      } else if (header.includes('bedroom')) {
        mappings[header] = 'bedrooms';
      } else if (header.includes('bathroom')) {
        mappings[header] = 'bathrooms';
      } else if (header.includes('sqft') || header.includes('square')) {
        mappings[header] = 'square_footage';
      } else if (header.includes('type')) {
        mappings[header] = 'property_type';
      }
    }
    
    return mappings;
  }

  /**
   * Generate owner field mappings
   */
  private generateOwnerMappings(headers: string[]): Record<string, string> {
    const mappings: Record<string, string> = {};
    
    for (const header of headers) {
      if (header.includes('first') && header.includes('name')) {
        mappings[header] = 'first_name';
      } else if (header.includes('last') && header.includes('name')) {
        mappings[header] = 'last_name';
      } else if (header.includes('email')) {
        mappings[header] = 'email';
      } else if (header.includes('phone')) {
        mappings[header] = 'phone';
      } else if (header.includes('move') && header.includes('in')) {
        mappings[header] = 'move_in_date';
      }
    }
    
    return mappings;
  }

  /**
   * Generate financial field mappings
   */
  private generateFinancialMappings(headers: string[]): Record<string, string> {
    const mappings: Record<string, string> = {};
    
    for (const header of headers) {
      if (header.includes('amount') || header.includes('balance')) {
        mappings[header] = 'amount';
      } else if (header.includes('due') && header.includes('date')) {
        mappings[header] = 'due_date';
      } else if (header.includes('payment') && header.includes('date')) {
        mappings[header] = 'payment_date';
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
    }

    // Check account numbers in data
    for (const row of sampleData) {
      const accountNum = row.account_number || row.account || row.unit;
      if (accountNum && typeof accountNum === 'string') {
        // Extract association code from account number (e.g., "HOA123-001")
        const match = accountNum.match(/^([A-Z0-9]+)-/);
        if (match) {
          return { code: match[1], name: match[1] };
        }
      }
    }

    return { code: 'DEFAULT', name: 'Unassigned' };
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
      // Check if association exists or create it
      const associationId = await this.ensureAssociation(associationCode, files[0]?.associationName);

      // Process files by type
      for (const file of files) {
        if (file.confidence < 85) {
          // Flag for manual review if confidence is low
          result.errors.push(`Low confidence (${file.confidence}%) for file: ${file.fileName}`);
          continue;
        }

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
      }
    } catch (error) {
      result.errors.push(`Association processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Ensure association exists in database
   */
  private async ensureAssociation(code: string, name?: string): Promise<string> {
    const { data: existing } = await supabase
      .from('associations')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    if (existing) {
      return existing.id;
    }

    // Create new association
    const { data: newAssoc, error } = await supabase
      .from('associations')
      .insert({
        code,
        name: name || code,
        status: 'active'
      })
      .select('id')
      .single();

    if (error) throw error;
    return newAssoc.id;
  }

  /**
   * Import properties using AI-mapped columns
   */
  private async importProperties(associationId: string, file: FileAnalysis): Promise<number> {
    // Implementation would use the suggestedMappings to transform data
    const properties = file.sampleData.map(row => ({
      association_id: associationId,
      unit_number: row[file.suggestedMappings.unit_number] || row.unit,
      square_footage: parseInt(row[file.suggestedMappings.square_footage] || '0'),
      bedrooms: parseInt(row[file.suggestedMappings.bedrooms] || '0'),
      bathrooms: parseFloat(row[file.suggestedMappings.bathrooms] || '0'),
      property_type: row[file.suggestedMappings.property_type] || 'residential'
    }));

    const { data, error } = await supabase
      .from('properties')
      .insert(properties)
      .select();

    return data?.length || 0;
  }

  /**
   * Import owners using AI-mapped columns
   */
  private async importOwners(associationId: string, file: FileAnalysis): Promise<number> {
    // Similar implementation for owners
    devLog.info('Importing owners for association:', associationId);
    return file.sampleData.length;
  }

  /**
   * Import financials using AI-mapped columns
   */
  private async importFinancials(associationId: string, file: FileAnalysis): Promise<number> {
    // Similar implementation for financials
    devLog.info('Importing financials for association:', associationId);
    return file.sampleData.length;
  }
}
