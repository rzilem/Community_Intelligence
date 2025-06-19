
import Tesseract from 'tesseract.js';
import { devLog } from '@/utils/dev-logger';
import { OCROptions, ProcessedDocument } from './types';

export interface QualityAssessmentResult {
  score: number;
  issues: string[];
  recommendations: string[];
  dpi?: number;
  resolution?: { width: number; height: number };
}

export interface TableExtractionResult {
  tables: Array<{
    data: string[][];
    confidence: number;
    bounds: { x: number; y: number; width: number; height: number };
  }>;
  confidence: number;
}

export interface FormDetectionResult {
  fields: Array<{
    type: 'text' | 'checkbox' | 'radio' | 'select';
    label?: string;
    value?: string;
    bounds: { x: number; y: number; width: number; height: number };
    confidence: number;
  }>;
  confidence: number;
}

export const advancedOCRService = {
  async processDocumentWithOCR(
    file: File,
    options: OCROptions = {}
  ): Promise<ProcessedDocument> {
    const startTime = Date.now();
    
    try {
      devLog.info('Starting advanced OCR processing for:', file.name);
      
      // Quality assessment
      const qualityResult = await this.assessImageQuality(file);
      devLog.info('Image quality assessment:', qualityResult);
      
      // Main OCR processing
      const ocrResult = await this.performOCR(file, options);
      
      // Enhanced processing based on options
      let extractedTables: any[] = [];
      let extractedForms: any[] = [];
      let layoutAnalysis: any = null;
      
      if (options.enableTableExtraction) {
        const tableResult = await this.extractTables(file, ocrResult.text);
        extractedTables = tableResult.tables;
      }
      
      if (options.enableFormDetection) {
        const formResult = await this.detectForms(file, ocrResult.text);
        extractedForms = formResult.fields;
      }
      
      if (options.enableLayoutAnalysis) {
        layoutAnalysis = await this.analyzeLayout(file, ocrResult.text);
      }
      
      // Convert extracted text to structured data
      const structuredData = await this.convertToStructuredData(
        ocrResult.text,
        extractedTables,
        extractedForms
      );
      
      const processingTime = Date.now() - startTime;
      
      return {
        filename: file.name,
        data: structuredData,
        format: 'ocr-extracted',
        metadata: {
          processingMethod: 'advanced-ocr',
          extractionMethod: 'tesseract-enhanced',
          confidence: ocrResult.confidence,
          qualityScore: qualityResult.score,
          tables: extractedTables.length,
          forms: extractedForms.length,
          processingTime
        },
        extractedStructures: [
          ...extractedTables,
          ...extractedForms,
          ...(layoutAnalysis ? [layoutAnalysis] : [])
        ]
      };
      
    } catch (error) {
      devLog.error('Advanced OCR processing failed:', error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async assessImageQuality(file: File): Promise<QualityAssessmentResult> {
    try {
      // Create image element to assess quality
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          const issues: string[] = [];
          const recommendations: string[] = [];
          let score = 100;
          
          // Resolution assessment
          if (img.width < 800 || img.height < 600) {
            issues.push('Low resolution image');
            recommendations.push('Use higher resolution scan (minimum 300 DPI)');
            score -= 20;
          }
          
          // File size assessment (rough quality indicator)
          const fileSize = file.size;
          const pixelCount = img.width * img.height;
          const bytesPerPixel = fileSize / pixelCount;
          
          if (bytesPerPixel < 0.5) {
            issues.push('Heavy compression detected');
            recommendations.push('Use less compressed image format');
            score -= 15;
          }
          
          // Aspect ratio assessment
          const aspectRatio = img.width / img.height;
          if (aspectRatio < 0.5 || aspectRatio > 3) {
            issues.push('Unusual aspect ratio');
            recommendations.push('Check document orientation');
            score -= 10;
          }
          
          URL.revokeObjectURL(imageUrl);
          
          resolve({
            score: Math.max(0, score),
            issues,
            recommendations,
            resolution: { width: img.width, height: img.height }
          });
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          resolve({
            score: 0,
            issues: ['Could not load image'],
            recommendations: ['Check image format and integrity']
          });
        };
        
        img.src = imageUrl;
      });
      
    } catch (error) {
      devLog.error('Quality assessment failed:', error);
      return {
        score: 50,
        issues: ['Quality assessment failed'],
        recommendations: ['Manual review recommended']
      };
    }
  },

  async performOCR(file: File, options: OCROptions): Promise<{ text: string; confidence: number; words: any[] }> {
    try {
      const { data } = await Tesseract.recognize(file, options.languages?.join('+') || 'eng', {
        logger: m => devLog.debug('OCR progress:', m)
      });
      
      return {
        text: data.text,
        confidence: data.confidence,
        words: data.words || []
      };
      
    } catch (error) {
      devLog.error('OCR processing failed:', error);
      throw error;
    }
  },

  async extractTables(file: File, text: string): Promise<TableExtractionResult> {
    try {
      // Basic table detection using text patterns
      const lines = text.split('\n').filter(line => line.trim());
      const tables: any[] = [];
      
      let currentTable: string[][] = [];
      let inTable = false;
      
      for (const line of lines) {
        // Simple heuristic: lines with multiple whitespace-separated values
        const columns = line.trim().split(/\s{2,}/).filter(col => col.length > 0);
        
        if (columns.length >= 2) {
          if (!inTable) {
            inTable = true;
            currentTable = [];
          }
          currentTable.push(columns);
        } else {
          if (inTable && currentTable.length > 1) {
            tables.push({
              data: currentTable,
              confidence: 0.7,
              bounds: { x: 0, y: 0, width: 100, height: 100 }
            });
          }
          inTable = false;
          currentTable = [];
        }
      }
      
      // Add final table if exists
      if (inTable && currentTable.length > 1) {
        tables.push({
          data: currentTable,
          confidence: 0.7,
          bounds: { x: 0, y: 0, width: 100, height: 100 }
        });
      }
      
      return {
        tables,
        confidence: tables.length > 0 ? 0.8 : 0.2
      };
      
    } catch (error) {
      devLog.error('Table extraction failed:', error);
      return { tables: [], confidence: 0 };
    }
  },

  async detectForms(file: File, text: string): Promise<FormDetectionResult> {
    try {
      const lines = text.split('\n');
      const fields: any[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect potential form fields
        if (line.includes(':') || line.includes('_____') || line.includes('□') || line.includes('☐')) {
          const parts = line.split(/[:_]{1,}/);
          if (parts.length >= 2) {
            fields.push({
              type: line.includes('□') || line.includes('☐') ? 'checkbox' : 'text',
              label: parts[0].trim(),
              value: parts[1]?.trim() || '',
              bounds: { x: 0, y: i * 20, width: 200, height: 20 },
              confidence: 0.6
            });
          }
        }
      }
      
      return {
        fields,
        confidence: fields.length > 0 ? 0.7 : 0.3
      };
      
    } catch (error) {
      devLog.error('Form detection failed:', error);
      return { fields: [], confidence: 0 };
    }
  },

  async analyzeLayout(file: File, text: string): Promise<any> {
    try {
      const lines = text.split('\n');
      const analysis = {
        totalLines: lines.length,
        nonEmptyLines: lines.filter(line => line.trim()).length,
        averageLineLength: lines.reduce((sum, line) => sum + line.length, 0) / lines.length,
        sections: this.detectSections(lines),
        structure: 'document'
      };
      
      return analysis;
      
    } catch (error) {
      devLog.error('Layout analysis failed:', error);
      return null;
    }
  },

  detectSections(lines: string[]): any[] {
    const sections = [];
    let currentSection: any = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.length === 0) continue;
      
      // Detect headers (uppercase lines, short lines that might be titles)
      if (line === line.toUpperCase() && line.length < 50 && line.length > 3) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line,
          startLine: i,
          content: []
        };
      } else if (currentSection) {
        currentSection.content.push(line);
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  },

  async convertToStructuredData(text: string, tables: any[], forms: any[]): Promise<any[]> {
    const data: any[] = [];
    
    // Convert tables to structured data
    for (const table of tables) {
      if (table.data.length > 1) {
        const headers = table.data[0];
        for (let i = 1; i < table.data.length; i++) {
          const row: any = {};
          headers.forEach((header: string, index: number) => {
            row[header] = table.data[i][index] || '';
          });
          data.push(row);
        }
      }
    }
    
    // Convert forms to structured data
    if (forms.length > 0 && data.length === 0) {
      const formData: any = {};
      forms.forEach(field => {
        formData[field.label || 'field'] = field.value;
      });
      data.push(formData);
    }
    
    // Fallback: try to extract key-value pairs from text
    if (data.length === 0) {
      const lines = text.split('\n').filter(line => line.trim());
      const extractedData: any = {};
      
      for (const line of lines) {
        if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          if (key.trim() && value) {
            extractedData[key.trim()] = value;
          }
        }
      }
      
      if (Object.keys(extractedData).length > 0) {
        data.push(extractedData);
      }
    }
    
    return data;
  }
};
