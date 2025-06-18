
import Tesseract from 'tesseract.js';
import { devLog } from '@/utils/dev-logger';

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes: Array<{
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    confidence: number;
  }>;
}

export interface TableExtractionResult {
  tables: Array<{
    rows: string[][];
    confidence: number;
    boundingBox: { x: number; y: number; width: number; height: number };
  }>;
  totalTables: number;
}

export interface FormFieldResult {
  fields: Array<{
    label: string;
    value: string;
    type: 'text' | 'checkbox' | 'radio' | 'select';
    confidence: number;
    boundingBox: { x: number; y: number; width: number; height: number };
  }>;
  totalFields: number;
}

export interface LayoutAnalysisResult {
  regions: Array<{
    type: 'text' | 'table' | 'image' | 'header' | 'footer';
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
  }>;
  readingOrder: Array<{ regionIndex: number; sequence: number }>;
}

export interface QualityAssessmentResult {
  score: number;
  issues: Array<{
    type: 'blur' | 'skew' | 'noise' | 'contrast' | 'resolution';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
  }>;
  recommendations: string[];
}

export interface AdvancedOCRResult {
  ocr: OCRResult;
  tables?: TableExtractionResult;
  forms?: FormFieldResult;
  layout?: LayoutAnalysisResult;
  quality: QualityAssessmentResult;
  metadata: {
    processingTime: number;
    imageSize: { width: number; height: number };
    format: string;
    dpi?: number;
  };
}

export const advancedOCRService = {
  async processDocument(
    file: File | string,
    options: {
      enableTableExtraction?: boolean;
      enableFormDetection?: boolean;
      enableLayoutAnalysis?: boolean;
      languages?: string[];
      quality?: 'fast' | 'accurate';
    } = {}
  ): Promise<AdvancedOCRResult> {
    const startTime = Date.now();
    devLog.info('Starting advanced OCR processing', { filename: typeof file === 'string' ? file : file.name });

    try {
      // Initialize Tesseract worker with correct API
      const worker = await Tesseract.createWorker(options.languages?.join('+') || 'eng');
      
      try {
        // Configure OCR parameters
        await worker.setParameters({
          tessedit_pageseg_mode: Tesseract.PSM.AUTO,
          tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
        });

        // Perform OCR
        const { data } = await worker.recognize(file);
        
        // Extract basic OCR results with correct data structure
        const ocrResult: OCRResult = {
          text: data.text || '',
          confidence: data.confidence || 0,
          boundingBoxes: data.words?.map(word => ({
            text: word.text || '',
            bbox: word.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 },
            confidence: word.confidence || 0
          })) || []
        };

        // Build result
        const result: AdvancedOCRResult = {
          ocr: ocrResult,
          quality: this.assessQuality(data),
          metadata: {
            processingTime: Date.now() - startTime,
            imageSize: { width: 0, height: 0 }, // Would be filled from image analysis
            format: typeof file === 'string' ? 'unknown' : file.type
          }
        };

        // Add optional features
        if (options.enableTableExtraction) {
          result.tables = this.extractTables(data);
        }

        if (options.enableFormDetection) {
          result.forms = this.detectForms(data);
        }

        if (options.enableLayoutAnalysis) {
          result.layout = this.analyzeLayout(data);
        }

        devLog.info('Advanced OCR processing completed', {
          confidence: ocrResult.confidence,
          textLength: ocrResult.text.length,
          processingTime: result.metadata.processingTime
        });

        return result;
      } finally {
        await worker.terminate();
      }
    } catch (error) {
      devLog.error('Advanced OCR processing failed', error);
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async processMultipleDocuments(
    files: File[],
    options: Parameters<typeof this.processDocument>[1] = {}
  ): Promise<AdvancedOCRResult[]> {
    devLog.info('Processing multiple documents with advanced OCR', { count: files.length });

    const results: AdvancedOCRResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.processDocument(file, options);
        results.push(result);
      } catch (error) {
        devLog.error(`Failed to process ${file.name}`, error);
        // Continue with other files
      }
    }

    return results;
  },

  assessQuality(data: any): QualityAssessmentResult {
    const issues: QualityAssessmentResult['issues'] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Analyze confidence
    if (data.confidence < 80) {
      issues.push({
        type: 'contrast',
        severity: 'medium',
        description: 'Low OCR confidence detected',
        suggestion: 'Consider improving image contrast or resolution'
      });
      recommendations.push('Enhance image quality before processing');
      score -= 20;
    }

    // Check for potential blur (low confidence + short words)
    const shortLowConfidenceWords = data.words?.filter((w: any) => 
      w.text?.length <= 3 && w.confidence < 60
    ).length || 0;

    if (shortLowConfidenceWords > 5) {
      issues.push({
        type: 'blur',
        severity: 'high',
        description: 'Image appears blurry or out of focus',
        suggestion: 'Rescan document with better focus'
      });
      score -= 30;
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  },

  extractTables(data: any): TableExtractionResult {
    // Simple table detection based on text alignment
    // This is a basic implementation - would be enhanced with proper table detection
    return {
      tables: [],
      totalTables: 0
    };
  },

  detectForms(data: any): FormFieldResult {
    // Basic form field detection
    // This would be enhanced with proper form detection algorithms
    return {
      fields: [],
      totalFields: 0
    };
  },

  analyzeLayout(data: any): LayoutAnalysisResult {
    // Basic layout analysis
    // This would be enhanced with proper layout detection
    return {
      regions: [],
      readingOrder: []
    };
  },

  async enhanceImageQuality(file: File): Promise<File> {
    // Placeholder for image enhancement
    // Would implement noise reduction, contrast enhancement, etc.
    return file;
  },

  async detectLanguage(file: File): Promise<string[]> {
    // Placeholder for automatic language detection
    // Would analyze the image to detect languages present
    return ['eng'];
  },

  async preprocessImage(
    file: File,
    options: {
      deskew?: boolean;
      denoise?: boolean;
      enhanceContrast?: boolean;
      binarize?: boolean;
    } = {}
  ): Promise<File> {
    // Placeholder for image preprocessing
    // Would implement various image enhancement techniques
    return file;
  }
};
