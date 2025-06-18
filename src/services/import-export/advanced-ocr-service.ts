
import { ocrService, type OCRResult } from './ocr-service';
import { devLog } from '@/utils/dev-logger';

export interface AdvancedOCRResult extends OCRResult {
  tableData?: TableExtractionResult[];
  formFields?: FormFieldResult[];
  structuredRegions?: RegionResult[];
  documentLayout?: LayoutAnalysis;
  qualityScore: number;
}

export interface TableExtractionResult {
  rows: string[][];
  headers: string[];
  confidence: number;
  boundingBox: BoundingBox;
}

export interface FormFieldResult {
  fieldName: string;
  fieldValue: string;
  fieldType: 'text' | 'number' | 'date' | 'checkbox' | 'signature';
  confidence: number;
  boundingBox: BoundingBox;
}

export interface RegionResult {
  type: 'header' | 'body' | 'footer' | 'sidebar' | 'table' | 'form';
  content: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface LayoutAnalysis {
  pageCount: number;
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number };
  columns: number;
  readingOrder: string[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const advancedOcrService = {
  async processDocumentAdvanced(file: File): Promise<AdvancedOCRResult> {
    devLog.info('Starting advanced OCR processing for:', file.name);
    
    try {
      // Get basic OCR results first
      const basicOcr = await ocrService.extractTextFromImage(file, file.name);
      
      // Enhance with advanced features
      const tableData = await this.extractTables(basicOcr);
      const formFields = await this.extractFormFields(basicOcr);
      const structuredRegions = await this.analyzeRegions(basicOcr);
      const documentLayout = await this.analyzeLayout(basicOcr);
      const qualityScore = this.calculateQualityScore(basicOcr);
      
      const result: AdvancedOCRResult = {
        ...basicOcr,
        tableData,
        formFields,
        structuredRegions,
        documentLayout,
        qualityScore
      };
      
      devLog.info('Advanced OCR processing complete:', {
        filename: file.name,
        qualityScore: result.qualityScore,
        tablesFound: tableData.length,
        formFieldsFound: formFields.length,
        regionsFound: structuredRegions.length
      });
      
      return result;
      
    } catch (error) {
      devLog.error('Advanced OCR processing failed:', error);
      throw new Error(`Advanced OCR failed for ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async extractTables(ocrResult: OCRResult): Promise<TableExtractionResult[]> {
    const tables: TableExtractionResult[] = [];
    
    try {
      // Analyze word positions to detect table structures
      const words = ocrResult.words;
      if (!words || words.length === 0) return tables;
      
      // Group words by approximate Y positions (rows)
      const rowGroups = this.groupWordsByRows(words);
      
      // Detect column structures within rows
      const potentialTables = this.detectTableStructures(rowGroups);
      
      // Convert detected structures to table format
      for (const tableStructure of potentialTables) {
        const table = this.convertToTableFormat(tableStructure);
        if (table.rows.length > 1) { // Must have at least header + 1 data row
          tables.push(table);
        }
      }
      
      devLog.info(`Extracted ${tables.length} tables from document`);
      return tables;
      
    } catch (error) {
      devLog.error('Table extraction failed:', error);
      return tables;
    }
  },

  async extractFormFields(ocrResult: OCRResult): Promise<FormFieldResult[]> {
    const formFields: FormFieldResult[] = [];
    
    try {
      const text = ocrResult.text;
      const words = ocrResult.words;
      
      // Common form field patterns
      const fieldPatterns = [
        { pattern: /(\w+)\s*:\s*([^\n\r]+)/gi, type: 'text' as const },
        { pattern: /(\w+)\s*\[\s*\]\s*([^\n\r]*)/gi, type: 'checkbox' as const },
        { pattern: /(\w+)\s*_+\s*([^\n\r]*)/gi, type: 'text' as const },
        { pattern: /(date|Date|DATE)\s*:\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi, type: 'date' as const },
        { pattern: /(amount|Amount|AMOUNT|total|Total|TOTAL)\s*:\s*\$?(\d+\.?\d*)/gi, type: 'number' as const }
      ];
      
      fieldPatterns.forEach(({ pattern, type }) => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const fieldName = match[1].trim();
          const fieldValue = match[2].trim();
          
          if (fieldName && fieldValue) {
            // Find approximate bounding box for this field
            const boundingBox = this.findFieldBoundingBox(fieldName, fieldValue, words);
            
            formFields.push({
              fieldName,
              fieldValue,
              fieldType: type,
              confidence: 0.8, // Base confidence for pattern matching
              boundingBox: boundingBox || { x: 0, y: 0, width: 0, height: 0 }
            });
          }
        }
      });
      
      devLog.info(`Extracted ${formFields.length} form fields`);
      return formFields;
      
    } catch (error) {
      devLog.error('Form field extraction failed:', error);
      return formFields;
    }
  },

  async analyzeRegions(ocrResult: OCRResult): Promise<RegionResult[]> {
    const regions: RegionResult[] = [];
    
    try {
      const words = ocrResult.words;
      if (!words || words.length === 0) return regions;
      
      // Sort words by Y position to analyze document flow
      const sortedWords = [...words].sort((a, b) => a.bbox.y0 - b.bbox.y0);
      
      // Detect different regions based on position and content
      const documentHeight = Math.max(...words.map(w => w.bbox.y1));
      const documentWidth = Math.max(...words.map(w => w.bbox.x1));
      
      // Header region (top 15% of document)
      const headerWords = sortedWords.filter(w => w.bbox.y0 < documentHeight * 0.15);
      if (headerWords.length > 0) {
        regions.push({
          type: 'header',
          content: headerWords.map(w => w.text).join(' '),
          confidence: 0.9,
          boundingBox: this.calculateRegionBounds(headerWords)
        });
      }
      
      // Footer region (bottom 15% of document)
      const footerWords = sortedWords.filter(w => w.bbox.y0 > documentHeight * 0.85);
      if (footerWords.length > 0) {
        regions.push({
          type: 'footer',
          content: footerWords.map(w => w.text).join(' '),
          confidence: 0.9,
          boundingBox: this.calculateRegionBounds(footerWords)
        });
      }
      
      // Body region (middle section)
      const bodyWords = sortedWords.filter(w => 
        w.bbox.y0 >= documentHeight * 0.15 && 
        w.bbox.y0 <= documentHeight * 0.85
      );
      if (bodyWords.length > 0) {
        regions.push({
          type: 'body',
          content: bodyWords.map(w => w.text).join(' '),
          confidence: 0.8,
          boundingBox: this.calculateRegionBounds(bodyWords)
        });
      }
      
      devLog.info(`Analyzed ${regions.length} document regions`);
      return regions;
      
    } catch (error) {
      devLog.error('Region analysis failed:', error);
      return regions;
    }
  },

  async analyzeLayout(ocrResult: OCRResult): Promise<LayoutAnalysis> {
    try {
      const words = ocrResult.words;
      if (!words || words.length === 0) {
        return {
          pageCount: 1,
          orientation: 'portrait',
          margins: { top: 0, right: 0, bottom: 0, left: 0 },
          columns: 1,
          readingOrder: []
        };
      }
      
      const documentWidth = Math.max(...words.map(w => w.bbox.x1));
      const documentHeight = Math.max(...words.map(w => w.bbox.y1));
      
      // Determine orientation
      const orientation = documentWidth > documentHeight ? 'landscape' : 'portrait';
      
      // Calculate margins
      const leftMargin = Math.min(...words.map(w => w.bbox.x0));
      const rightMargin = documentWidth - Math.max(...words.map(w => w.bbox.x1));
      const topMargin = Math.min(...words.map(w => w.bbox.y0));
      const bottomMargin = documentHeight - Math.max(...words.map(w => w.bbox.y1));
      
      // Detect columns by analyzing X positions
      const xPositions = words.map(w => w.bbox.x0).sort((a, b) => a - b);
      const columns = this.detectColumns(xPositions, documentWidth);
      
      // Create reading order
      const readingOrder = this.createReadingOrder(words);
      
      return {
        pageCount: 1, // Single page for image processing
        orientation,
        margins: {
          top: topMargin,
          right: rightMargin,
          bottom: bottomMargin,
          left: leftMargin
        },
        columns,
        readingOrder
      };
      
    } catch (error) {
      devLog.error('Layout analysis failed:', error);
      return {
        pageCount: 1,
        orientation: 'portrait',
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
        columns: 1,
        readingOrder: []
      };
    }
  },

  calculateQualityScore(ocrResult: OCRResult): number {
    try {
      let score = 0;
      let factors = 0;
      
      // Base confidence from OCR
      if (ocrResult.confidence !== undefined) {
        score += ocrResult.confidence;
        factors++;
      }
      
      // Text length factor (more text generally means better extraction)
      const textLength = ocrResult.text.length;
      if (textLength > 0) {
        score += Math.min(textLength / 1000, 1) * 100; // Max 100 points for length
        factors++;
      }
      
      // Word count factor
      const wordCount = ocrResult.words.length;
      if (wordCount > 0) {
        score += Math.min(wordCount / 100, 1) * 100; // Max 100 points for word count
        factors++;
      }
      
      // Character diversity (more diverse text is usually better quality)
      const uniqueChars = new Set(ocrResult.text.toLowerCase()).size;
      if (uniqueChars > 0) {
        score += Math.min(uniqueChars / 26, 1) * 100; // Max 100 points for character diversity
        factors++;
      }
      
      return factors > 0 ? Math.round(score / factors) : 0;
      
    } catch (error) {
      devLog.error('Quality score calculation failed:', error);
      return 0;
    }
  },

  // Helper methods
  private groupWordsByRows(words: any[]): any[][] {
    const tolerance = 5; // Pixels tolerance for same row
    const rows: any[][] = [];
    
    const sortedWords = [...words].sort((a, b) => a.bbox.y0 - b.bbox.y0);
    
    for (const word of sortedWords) {
      let addedToRow = false;
      
      for (const row of rows) {
        const rowY = row[0].bbox.y0;
        if (Math.abs(word.bbox.y0 - rowY) <= tolerance) {
          row.push(word);
          addedToRow = true;
          break;
        }
      }
      
      if (!addedToRow) {
        rows.push([word]);
      }
    }
    
    // Sort words within each row by X position
    rows.forEach(row => row.sort((a, b) => a.bbox.x0 - b.bbox.x0));
    
    return rows;
  },

  private detectTableStructures(rowGroups: any[][]): any[] {
    const tables = [];
    
    // Look for consecutive rows with similar column structures
    for (let i = 0; i < rowGroups.length - 1; i++) {
      const potentialTable = [rowGroups[i]];
      
      for (let j = i + 1; j < rowGroups.length; j++) {
        if (this.rowsHaveSimilarStructure(rowGroups[i], rowGroups[j])) {
          potentialTable.push(rowGroups[j]);
        } else {
          break;
        }
      }
      
      if (potentialTable.length >= 2) {
        tables.push(potentialTable);
        i += potentialTable.length - 1; // Skip processed rows
      }
    }
    
    return tables;
  },

  private rowsHaveSimilarStructure(row1: any[], row2: any[]): boolean {
    // Simple heuristic: similar number of words and similar X positions
    if (Math.abs(row1.length - row2.length) > 1) return false;
    
    const tolerance = 20; // Pixel tolerance for column alignment
    const minWords = Math.min(row1.length, row2.length);
    
    for (let i = 0; i < minWords; i++) {
      if (Math.abs(row1[i].bbox.x0 - row2[i].bbox.x0) > tolerance) {
        return false;
      }
    }
    
    return true;
  },

  private convertToTableFormat(tableStructure: any[]): TableExtractionResult {
    const rows = tableStructure.map(row => row.map((word: any) => word.text));
    const headers = rows[0] || [];
    
    return {
      rows,
      headers,
      confidence: 0.8,
      boundingBox: this.calculateTableBounds(tableStructure)
    };
  },

  private calculateTableBounds(tableStructure: any[]): BoundingBox {
    const allWords = tableStructure.flat();
    const minX = Math.min(...allWords.map(w => w.bbox.x0));
    const minY = Math.min(...allWords.map(w => w.bbox.y0));
    const maxX = Math.max(...allWords.map(w => w.bbox.x1));
    const maxY = Math.max(...allWords.map(w => w.bbox.y1));
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  },

  private findFieldBoundingBox(fieldName: string, fieldValue: string, words: any[]): BoundingBox | null {
    // Find words that match the field name or value
    const matchingWords = words.filter(word => 
      word.text.toLowerCase().includes(fieldName.toLowerCase()) ||
      word.text.toLowerCase().includes(fieldValue.toLowerCase())
    );
    
    if (matchingWords.length === 0) return null;
    
    return this.calculateRegionBounds(matchingWords);
  },

  private calculateRegionBounds(words: any[]): BoundingBox {
    if (words.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
    
    const minX = Math.min(...words.map(w => w.bbox.x0));
    const minY = Math.min(...words.map(w => w.bbox.y0));
    const maxX = Math.max(...words.map(w => w.bbox.x1));
    const maxY = Math.max(...words.map(w => w.bbox.y1));
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  },

  private detectColumns(xPositions: number[], documentWidth: number): number {
    // Simple column detection based on X position clustering
    const threshold = documentWidth * 0.1; // 10% of document width
    const clusters = [];
    
    for (const x of xPositions) {
      let addedToCluster = false;
      
      for (const cluster of clusters) {
        if (Math.abs(cluster[0] - x) <= threshold) {
          cluster.push(x);
          addedToCluster = true;
          break;
        }
      }
      
      if (!addedToCluster) {
        clusters.push([x]);
      }
    }
    
    return Math.max(1, clusters.length);
  },

  private createReadingOrder(words: any[]): string[] {
    // Sort by Y position first (top to bottom), then by X position (left to right)
    const sortedWords = [...words].sort((a, b) => {
      const yDiff = a.bbox.y0 - b.bbox.y0;
      return yDiff !== 0 ? yDiff : a.bbox.x0 - b.bbox.x0;
    });
    
    return sortedWords.map(word => word.text);
  }
};
