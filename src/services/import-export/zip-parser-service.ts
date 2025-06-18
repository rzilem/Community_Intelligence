
import JSZip from 'jszip';
import { parseService } from './parse-service';
import * as XLSX from 'xlsx';
import { devLog } from '@/utils/dev-logger';

export interface ZipFileEntry {
  filename: string;
  path: string;
  data: any[];
  detectedType: string;
  associationHint?: string;
  confidence: number;
}

export interface ZipAnalysisResult {
  files: ZipFileEntry[];
  suggestedAssociations: string[];
  totalRecords: number;
  fileTypes: Record<string, number>;
}

export const zipParserService = {
  async parseZipFile(zipFile: File): Promise<ZipAnalysisResult> {
    try {
      devLog.info('Starting zip file analysis:', zipFile.name);
      
      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipFile);
      
      const files: ZipFileEntry[] = [];
      const suggestedAssociations = new Set<string>();
      const fileTypes: Record<string, number> = {};
      let totalRecords = 0;

      // Process each file in the zip
      for (const [filename, zipObject] of Object.entries(zipData.files)) {
        if (zipObject.dir || this.isIgnoredFile(filename)) {
          continue;
        }

        try {
          const fileData = await this.extractFileData(zipObject);
          if (fileData && fileData.length > 0) {
            const detectedType = this.detectDataType(filename, fileData);
            const associationHint = this.extractAssociationHint(filename);
            
            const entry: ZipFileEntry = {
              filename: filename.split('/').pop() || filename,
              path: filename,
              data: fileData,
              detectedType,
              associationHint,
              confidence: this.calculateConfidence(filename, fileData, detectedType)
            };

            files.push(entry);
            totalRecords += fileData.length;
            fileTypes[detectedType] = (fileTypes[detectedType] || 0) + 1;
            
            if (associationHint) {
              suggestedAssociations.add(associationHint);
            }

            devLog.info(`Processed file: ${filename}, Type: ${detectedType}, Records: ${fileData.length}`);
          }
        } catch (error) {
          devLog.error(`Error processing file ${filename}:`, error);
        }
      }

      const result: ZipAnalysisResult = {
        files,
        suggestedAssociations: Array.from(suggestedAssociations),
        totalRecords,
        fileTypes
      };

      devLog.info('Zip analysis complete:', result);
      return result;
    } catch (error) {
      devLog.error('Error parsing zip file:', error);
      throw new Error(`Failed to parse zip file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async extractFileData(zipObject: JSZip.JSZipObject): Promise<any[]> {
    const filename = zipObject.name.toLowerCase();
    
    if (filename.endsWith('.csv')) {
      const text = await zipObject.async('text');
      return parseService.parseCSV(text);
    } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      const buffer = await zipObject.async('arraybuffer');
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(worksheet);
    }
    
    return [];
  },

  detectDataType(filename: string, data: any[]): string {
    const name = filename.toLowerCase();
    const firstRow = data[0] || {};
    const columns = Object.keys(firstRow);
    
    // Check filename patterns
    if (name.includes('property') || name.includes('unit') || name.includes('address')) {
      return 'properties';
    }
    if (name.includes('owner') || name.includes('resident') || name.includes('tenant')) {
      return 'owners';
    }
    if (name.includes('financial') || name.includes('assessment') || name.includes('payment')) {
      return 'financial';
    }
    if (name.includes('compliance') || name.includes('violation')) {
      return 'compliance';
    }
    if (name.includes('maintenance') || name.includes('repair') || name.includes('work')) {
      return 'maintenance';
    }
    if (name.includes('association') || name.includes('hoa') || name.includes('community')) {
      return 'associations';
    }

    // Check column patterns
    if (columns.some(col => col.toLowerCase().includes('address') || col.toLowerCase().includes('unit'))) {
      if (columns.some(col => col.toLowerCase().includes('owner') || col.toLowerCase().includes('name'))) {
        return 'properties_owners';
      }
      return 'properties';
    }
    if (columns.some(col => col.toLowerCase().includes('amount') || col.toLowerCase().includes('payment'))) {
      return 'financial';
    }
    if (columns.some(col => col.toLowerCase().includes('violation') || col.toLowerCase().includes('fine'))) {
      return 'compliance';
    }

    return 'properties'; // Default fallback
  },

  extractAssociationHint(filename: string): string | undefined {
    const path = filename.toLowerCase();
    const segments = path.split('/');
    
    // Look for association patterns in folder structure
    for (const segment of segments) {
      if (segment.includes('hoa') || segment.includes('association') || segment.includes('community')) {
        return segment.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
      }
      // Look for patterns like "Sunset Village" or "Oak Grove HOA"
      if (segment.includes('village') || segment.includes('grove') || segment.includes('estates') || 
          segment.includes('manor') || segment.includes('heights') || segment.includes('park')) {
        return segment.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
      }
    }
    
    return undefined;
  },

  calculateConfidence(filename: string, data: any[], detectedType: string): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on filename match
    const name = filename.toLowerCase();
    if (name.includes(detectedType.replace('_', '')) || name.includes(detectedType)) {
      confidence += 0.3;
    }
    
    // Boost confidence based on data structure
    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      if (columns.length > 2) confidence += 0.1;
      if (columns.length > 5) confidence += 0.1;
    }
    
    return Math.min(confidence, 0.95);
  },

  isIgnoredFile(filename: string): boolean {
    const name = filename.toLowerCase();
    return name.startsWith('__macosx') || 
           name.includes('.ds_store') || 
           name.endsWith('.txt') ||
           name.endsWith('.pdf') ||
           name.endsWith('.jpg') ||
           name.endsWith('.png') ||
           name.endsWith('.doc') ||
           name.endsWith('.docx');
  }
};
