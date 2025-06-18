
import Tesseract from 'tesseract.js';
import { devLog } from '@/utils/dev-logger';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    confidence: number;
  }>;
  lines: Array<{
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    words: any[];
  }>;
}

export interface TableExtractionResult {
  tables: Array<{
    rows: string[][];
    confidence: number;
    bbox: { x: number; y: number; width: number; height: number };
  }>;
  forms: Array<{
    fields: Array<{ label: string; value: string; confidence: number }>;
    bbox: { x: number; y: number; width: number; height: number };
  }>;
}

export interface DocumentLayoutAnalysis {
  regions: Array<{
    type: 'text' | 'table' | 'image' | 'header' | 'footer';
    bbox: { x: number; y: number; width: number; height: number };
    confidence: number;
    content?: string;
  }>;
  readingOrder: number[];
  pageStructure: {
    headers: string[];
    paragraphs: string[];
    tables: any[];
    images: any[];
  };
}

export interface DocumentQualityAssessment {
  overallScore: number;
  issues: Array<{
    type: 'blur' | 'skew' | 'low_contrast' | 'noise' | 'incomplete';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
  }>;
  recommendations: string[];
  processingStrategy: 'standard' | 'enhanced' | 'manual_review';
}

export interface AdvancedOCROptions {
  language?: string;
  psm?: number;
  oem?: number;
  whitelist?: string;
  blacklist?: string;
  dpi?: number;
  enhanceImage?: boolean;
  extractTables?: boolean;
  analyzeLayout?: boolean;
  qualityCheck?: boolean;
}

export const advancedOCRService = {
  async processDocument(
    file: File,
    options: AdvancedOCROptions = {}
  ): Promise<{
    ocr: OCRResult;
    tables?: TableExtractionResult;
    layout?: DocumentLayoutAnalysis;
    quality?: DocumentQualityAssessment;
  }> {
    devLog.info('Starting advanced OCR processing for:', file.name);
    
    try {
      const startTime = Date.now();
      
      // Pre-process image if needed
      const processedFile = options.enhanceImage 
        ? await this.enhanceImageQuality(file)
        : file;
      
      // Perform OCR
      const ocrResult = await this.performOCR(processedFile, options);
      
      const results: any = { ocr: ocrResult };
      
      // Extract tables and forms if requested
      if (options.extractTables) {
        results.tables = await this.extractTablesAndForms(processedFile, ocrResult);
      }
      
      // Analyze document layout if requested
      if (options.analyzeLayout) {
        results.layout = await this.analyzeDocumentLayout(processedFile, ocrResult);
      }
      
      // Assess document quality if requested
      if (options.qualityCheck) {
        results.quality = await this.assessDocumentQuality(processedFile, ocrResult);
      }
      
      const processingTime = Date.now() - startTime;
      devLog.info(`Advanced OCR completed in ${processingTime}ms with confidence: ${ocrResult.confidence}%`);
      
      return results;
      
    } catch (error) {
      devLog.error('Advanced OCR processing failed:', error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async batchProcessDocuments(
    files: File[],
    options: AdvancedOCROptions = {},
    progressCallback?: (progress: { current: number; total: number; filename: string }) => void
  ): Promise<Array<{
    filename: string;
    success: boolean;
    result?: any;
    error?: string;
  }>> {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (progressCallback) {
        progressCallback({ current: i + 1, total: files.length, filename: file.name });
      }
      
      try {
        const result = await this.processDocument(file, options);
        results.push({
          filename: file.name,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          filename: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  },

  async extractTextFromImages(images: File[]): Promise<Array<{
    filename: string;
    text: string;
    confidence: number;
    wordCount: number;
  }>> {
    const results = [];
    
    for (const image of images) {
      try {
        const ocrResult = await this.performOCR(image, { language: 'eng' });
        results.push({
          filename: image.name,
          text: ocrResult.text,
          confidence: ocrResult.confidence,
          wordCount: ocrResult.words.length
        });
      } catch (error) {
        devLog.error(`Failed to extract text from ${image.name}:`, error);
        results.push({
          filename: image.name,
          text: '',
          confidence: 0,
          wordCount: 0
        });
      }
    }
    
    return results;
  },

  async performOCR(file: File, options: AdvancedOCROptions): Promise<OCRResult> {
    const worker = await Tesseract.createWorker({
      logger: m => devLog.debug('Tesseract:', m)
    });
    
    try {
      await worker.loadLanguage(options.language || 'eng');
      await worker.initialize(options.language || 'eng');
      
      // Configure Tesseract parameters
      if (options.psm !== undefined) {
        await worker.setParameters({ tessedit_pageseg_mode: options.psm });
      }
      if (options.oem !== undefined) {
        await worker.setParameters({ tessedit_ocr_engine_mode: options.oem });
      }
      if (options.whitelist) {
        await worker.setParameters({ tessedit_char_whitelist: options.whitelist });
      }
      if (options.blacklist) {
        await worker.setParameters({ tessedit_char_blacklist: options.blacklist });
      }
      
      const { data } = await worker.recognize(file);
      
      return {
        text: data.text,
        confidence: data.confidence,
        words: data.words.map(word => ({
          text: word.text,
          bbox: word.bbox,
          confidence: word.confidence
        })),
        lines: data.lines.map(line => ({
          text: line.text,
          bbox: line.bbox,
          words: line.words
        }))
      };
      
    } finally {
      await worker.terminate();
    }
  },

  async enhanceImageQuality(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Apply enhancements
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const enhancedData = this.applyImageEnhancements(imageData);
        ctx.putImageData(enhancedData, 0, 0);
        
        // Convert back to file
        canvas.toBlob((blob) => {
          if (blob) {
            const enhancedFile = new File([blob], file.name, { type: file.type });
            resolve(enhancedFile);
          } else {
            reject(new Error('Failed to create enhanced image'));
          }
        }, file.type);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  },

  applyImageEnhancements(imageData: ImageData): ImageData {
    const data = imageData.data;
    
    // Apply contrast enhancement and noise reduction
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      // Apply contrast enhancement
      const enhanced = Math.min(255, Math.max(0, 1.2 * (gray - 128) + 128));
      
      data[i] = enhanced;     // Red
      data[i + 1] = enhanced; // Green
      data[i + 2] = enhanced; // Blue
    }
    
    return imageData;
  },

  async extractTablesAndForms(file: File, ocrResult: OCRResult): Promise<TableExtractionResult> {
    // Simplified table detection based on OCR layout
    const tables = this.detectTables(ocrResult);
    const forms = this.detectForms(ocrResult);
    
    return { tables, forms };
  },

  detectTables(ocrResult: OCRResult): Array<{
    rows: string[][];
    confidence: number;
    bbox: { x: number; y: number; width: number; height: number };
  }> {
    // Simple table detection based on line alignment
    const lines = ocrResult.lines;
    const tables = [];
    
    // Group lines that might form a table
    const potentialTableLines = lines.filter(line => 
      line.text.includes('|') || 
      line.text.match(/\s{3,}/) || // Multiple spaces
      line.words.length > 2
    );
    
    if (potentialTableLines.length > 2) {
      const rows = potentialTableLines.map(line => 
        line.text.split(/\s{2,}|\|/).filter(cell => cell.trim())
      );
      
      tables.push({
        rows,
        confidence: 0.7, // Simplified confidence
        bbox: {
          x: Math.min(...potentialTableLines.map(l => l.bbox.x0)),
          y: Math.min(...potentialTableLines.map(l => l.bbox.y0)),
          width: Math.max(...potentialTableLines.map(l => l.bbox.x1)) - Math.min(...potentialTableLines.map(l => l.bbox.x0)),
          height: Math.max(...potentialTableLines.map(l => l.bbox.y1)) - Math.min(...potentialTableLines.map(l => l.bbox.y0))
        }
      });
    }
    
    return tables;
  },

  detectForms(ocrResult: OCRResult): Array<{
    fields: Array<{ label: string; value: string; confidence: number }>;
    bbox: { x: number; y: number; width: number; height: number };
  }> {
    // Simple form field detection
    const forms = [];
    const formLines = ocrResult.lines.filter(line => 
      line.text.includes(':') || 
      line.text.includes('____') ||
      line.text.match(/\[\s*\]/) // Checkboxes
    );
    
    if (formLines.length > 0) {
      const fields = formLines.map(line => {
        const parts = line.text.split(':');
        return {
          label: parts[0]?.trim() || '',
          value: parts[1]?.trim() || '',
          confidence: 0.6
        };
      }).filter(field => field.label);
      
      if (fields.length > 0) {
        forms.push({
          fields,
          bbox: {
            x: Math.min(...formLines.map(l => l.bbox.x0)),
            y: Math.min(...formLines.map(l => l.bbox.y0)),
            width: Math.max(...formLines.map(l => l.bbox.x1)) - Math.min(...formLines.map(l => l.bbox.x0)),
            height: Math.max(...formLines.map(l => l.bbox.y1)) - Math.min(...formLines.map(l => l.bbox.y0))
          }
        });
      }
    }
    
    return forms;
  },

  async analyzeDocumentLayout(file: File, ocrResult: OCRResult): Promise<DocumentLayoutAnalysis> {
    const regions = this.identifyDocumentRegions(ocrResult);
    const readingOrder = this.determineReadingOrder(regions);
    const pageStructure = this.analyzePageStructure(ocrResult);
    
    return {
      regions,
      readingOrder,
      pageStructure
    };
  },

  identifyDocumentRegions(ocrResult: OCRResult): Array<{
    type: 'text' | 'table' | 'image' | 'header' | 'footer';
    bbox: { x: number; y: number; width: number; height: number };
    confidence: number;
    content?: string;
  }> {
    const regions = [];
    
    // Identify headers (top of page, larger font, centered)
    const topLines = ocrResult.lines.filter(line => line.bbox.y0 < 100);
    topLines.forEach(line => {
      if (line.text.trim()) {
        regions.push({
          type: 'header' as const,
          bbox: {
            x: line.bbox.x0,
            y: line.bbox.y0,
            width: line.bbox.x1 - line.bbox.x0,
            height: line.bbox.y1 - line.bbox.y0
          },
          confidence: 0.8,
          content: line.text
        });
      }
    });
    
    // Identify main text regions
    const mainLines = ocrResult.lines.filter(line => 
      line.bbox.y0 >= 100 && 
      line.bbox.y1 <= (ocrResult.lines[ocrResult.lines.length - 1]?.bbox.y1 || 0) - 100
    );
    
    mainLines.forEach(line => {
      if (line.text.trim()) {
        regions.push({
          type: 'text' as const,
          bbox: {
            x: line.bbox.x0,
            y: line.bbox.y0,
            width: line.bbox.x1 - line.bbox.x0,
            height: line.bbox.y1 - line.bbox.y0
          },
          confidence: 0.9,
          content: line.text
        });
      }
    });
    
    return regions;
  },

  determineReadingOrder(regions: any[]): number[] {
    // Sort regions by y-coordinate (top to bottom), then x-coordinate (left to right)
    return regions
      .map((region, index) => ({ region, index }))
      .sort((a, b) => {
        const yDiff = a.region.bbox.y - b.region.bbox.y;
        if (Math.abs(yDiff) < 20) { // Same line tolerance
          return a.region.bbox.x - b.region.bbox.x;
        }
        return yDiff;
      })
      .map(item => item.index);
  },

  analyzePageStructure(ocrResult: OCRResult): {
    headers: string[];
    paragraphs: string[];
    tables: any[];
    images: any[];
  } {
    const headers: string[] = [];
    const paragraphs: string[] = [];
    
    // Simple heuristics for identifying headers vs paragraphs
    ocrResult.lines.forEach(line => {
      const text = line.text.trim();
      if (!text) return;
      
      // Headers are typically shorter, may be in caps, or at specific positions
      if (text.length < 50 && (text === text.toUpperCase() || line.bbox.y0 < 100)) {
        headers.push(text);
      } else if (text.length > 20) {
        paragraphs.push(text);
      }
    });
    
    return {
      headers,
      paragraphs,
      tables: [], // Would be populated by table detection
      images: []  // Would be populated by image detection
    };
  },

  async assessDocumentQuality(file: File, ocrResult: OCRResult): Promise<DocumentQualityAssessment> {
    const issues = [];
    let overallScore = 100;
    
    // Check OCR confidence
    if (ocrResult.confidence < 70) {
      issues.push({
        type: 'low_contrast' as const,
        severity: 'high' as const,
        description: `Low OCR confidence: ${ocrResult.confidence}%`,
        suggestion: 'Consider image enhancement or manual review'
      });
      overallScore -= 30;
    }
    
    // Check for potential blur (low word confidence)
    const lowConfidenceWords = ocrResult.words.filter(word => word.confidence < 60);
    if (lowConfidenceWords.length > ocrResult.words.length * 0.2) {
      issues.push({
        type: 'blur' as const,
        severity: 'medium' as const,
        description: `${lowConfidenceWords.length} words have low confidence`,
        suggestion: 'Image may be blurry, try image enhancement'
      });
      overallScore -= 20;
    }
    
    // Check for incomplete text (very short output)
    if (ocrResult.text.length < 50) {
      issues.push({
        type: 'incomplete' as const,
        severity: 'high' as const,
        description: 'Very little text extracted',
        suggestion: 'Document may be incomplete or require manual processing'
      });
      overallScore -= 40;
    }
    
    const recommendations = this.generateQualityRecommendations(issues);
    const processingStrategy = this.determineProcessingStrategy(overallScore, issues);
    
    return {
      overallScore: Math.max(0, overallScore),
      issues,
      recommendations,
      processingStrategy
    };
  },

  generateQualityRecommendations(issues: any[]): string[] {
    const recommendations = [];
    
    if (issues.some(issue => issue.type === 'blur')) {
      recommendations.push('Apply image sharpening or deblurring filters');
    }
    
    if (issues.some(issue => issue.type === 'low_contrast')) {
      recommendations.push('Increase image contrast and brightness');
    }
    
    if (issues.some(issue => issue.type === 'skew')) {
      recommendations.push('Apply deskewing correction');
    }
    
    if (issues.some(issue => issue.severity === 'high')) {
      recommendations.push('Consider manual review and correction');
    }
    
    return recommendations;
  },

  determineProcessingStrategy(overallScore: number, issues: any[]): 'standard' | 'enhanced' | 'manual_review' {
    if (overallScore >= 80) {
      return 'standard';
    } else if (overallScore >= 50) {
      return 'enhanced';
    } else {
      return 'manual_review';
    }
  }
};
