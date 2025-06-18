
import JSZip from 'jszip';
import { parseService } from './parse-service';
import { ocrService, DocumentOCRResult } from './ocr-service';
import * as XLSX from 'xlsx';
import { devLog } from '@/utils/dev-logger';

export interface EnhancedZipFileEntry {
  filename: string;
  path: string;
  data: any[];
  detectedType: string;
  associationHint?: string;
  confidence: number;
  isOCRProcessed?: boolean;
  ocrResult?: DocumentOCRResult;
  fileType: 'spreadsheet' | 'image' | 'pdf' | 'text' | 'unknown';
}

export interface EnhancedZipAnalysisResult {
  files: EnhancedZipFileEntry[];
  suggestedAssociations: string[];
  totalRecords: number;
  fileTypes: Record<string, number>;
  ocrProcessedFiles: number;
  processingTime: number;
}

export const enhancedZipParserService = {
  async parseZipFile(zipFile: File): Promise<EnhancedZipAnalysisResult> {
    const startTime = Date.now();
    
    try {
      devLog.info('Starting enhanced zip file analysis:', zipFile.name);
      
      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipFile);
      
      const files: EnhancedZipFileEntry[] = [];
      const suggestedAssociations = new Set<string>();
      const fileTypes: Record<string, number> = {};
      let totalRecords = 0;
      let ocrProcessedFiles = 0;

      // Process each file in the zip
      for (const [filename, zipObject] of Object.entries(zipData.files)) {
        if (zipObject.dir || this.isIgnoredFile(filename)) {
          continue;
        }

        try {
          const fileType = this.determineFileType(filename);
          let fileData: any[] = [];
          let ocrResult: DocumentOCRResult | undefined;
          
          if (fileType === 'spreadsheet') {
            fileData = await this.extractSpreadsheetData(zipObject);
          } else if (fileType === 'image' || fileType === 'pdf') {
            // Process with OCR
            const buffer = await zipObject.async('arraybuffer');
            const blob = new Blob([buffer]);
            const file = new File([blob], filename);
            
            ocrResult = await ocrService.processDocumentOCR(file);
            
            // Convert OCR structured data to array format for consistency
            if (ocrResult.structuredData) {
              fileData = this.convertOCRDataToArray(ocrResult.structuredData, ocrResult.documentType);
            }
            
            ocrProcessedFiles++;
          } else if (fileType === 'text') {
            const text = await zipObject.async('text');
            if (filename.toLowerCase().endsWith('.csv')) {
              fileData = parseService.parseCSV(text);
            }
          }

          if (fileData.length > 0 || ocrResult) {
            const detectedType = this.detectDataType(filename, fileData, ocrResult?.documentType);
            const associationHint = this.extractAssociationHint(filename);
            
            const entry: EnhancedZipFileEntry = {
              filename: filename.split('/').pop() || filename,
              path: filename,
              data: fileData,
              detectedType,
              associationHint,
              confidence: this.calculateConfidence(filename, fileData, detectedType, ocrResult),
              isOCRProcessed: !!ocrResult,
              ocrResult,
              fileType
            };

            files.push(entry);
            totalRecords += fileData.length;
            fileTypes[detectedType] = (fileTypes[detectedType] || 0) + 1;
            
            if (associationHint) {
              suggestedAssociations.add(associationHint);
            }

            devLog.info(`Processed file: ${filename}, Type: ${detectedType}, Records: ${fileData.length}, OCR: ${!!ocrResult}`);
          }
        } catch (error) {
          devLog.error(`Error processing file ${filename}:`, error);
        }
      }

      const processingTime = Date.now() - startTime;
      
      const result: EnhancedZipAnalysisResult = {
        files,
        suggestedAssociations: Array.from(suggestedAssociations),
        totalRecords,
        fileTypes,
        ocrProcessedFiles,
        processingTime
      };

      devLog.info('Enhanced zip analysis complete:', result);
      return result;
    } catch (error) {
      devLog.error('Error parsing zip file:', error);
      throw new Error(`Failed to parse zip file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  determineFileType(filename: string): 'spreadsheet' | 'image' | 'pdf' | 'text' | 'unknown' {
    const name = filename.toLowerCase();
    
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      return 'spreadsheet';
    }
    if (name.endsWith('.csv') || name.endsWith('.txt')) {
      return 'text';
    }
    if (name.endsWith('.pdf')) {
      return 'pdf';
    }
    if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.gif') || name.endsWith('.bmp')) {
      return 'image';
    }
    
    return 'unknown';
  },

  async extractSpreadsheetData(zipObject: JSZip.JSZipObject): Promise<any[]> {
    const buffer = await zipObject.async('arraybuffer');
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  },

  convertOCRDataToArray(structuredData: any, documentType?: string): any[] {
    if (!structuredData) return [];

    switch (documentType) {
      case 'invoice':
        return [{
          vendor: structuredData.vendor,
          invoice_number: structuredData.invoiceNumber,
          date: structuredData.date,
          amount: structuredData.amount,
          line_items: structuredData.lineItems
        }];
        
      case 'property_list':
        return structuredData.properties || [];
        
      case 'owner_list':
        return structuredData.owners || [];
        
      case 'assessment':
        return [{
          amount: structuredData.assessmentAmount,
          due_date: structuredData.dueDate
        }];
        
      case 'financial_statement':
        return [{
          balance_amount: structuredData.balanceAmount,
          amounts: structuredData.amounts,
          dates: structuredData.dates
        }];
        
      default:
        // Convert generic data to a single record
        return [structuredData];
    }
  },

  detectDataType(filename: string, data: any[], ocrDocumentType?: string): string {
    // First, use OCR document type if available
    if (ocrDocumentType && ocrDocumentType !== 'unknown') {
      switch (ocrDocumentType) {
        case 'invoice':
          return 'invoices';
        case 'property_list':
          return 'properties';
        case 'owner_list':
          return 'owners';
        case 'assessment':
          return 'assessments';
        case 'financial_statement':
          return 'financial';
        default:
          break;
      }
    }

    // Fall back to filename and data analysis
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
    if (name.includes('invoice') || name.includes('bill')) {
      return 'invoices';
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

  calculateConfidence(filename: string, data: any[], detectedType: string, ocrResult?: DocumentOCRResult): number {
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
    
    // Boost confidence based on OCR results
    if (ocrResult) {
      if (ocrResult.confidence > 0.8) confidence += 0.2;
      else if (ocrResult.confidence > 0.6) confidence += 0.1;
      
      if (ocrResult.documentType && ocrResult.documentType !== 'unknown') {
        confidence += 0.15;
      }
    }
    
    return Math.min(confidence, 0.95);
  },

  isIgnoredFile(filename: string): boolean {
    const name = filename.toLowerCase();
    return name.startsWith('__macosx') || 
           name.includes('.ds_store') ||
           name.endsWith('.doc') ||
           name.endsWith('.docx') ||
           name.endsWith('.zip') ||
           name.endsWith('.rar');
  }
};
