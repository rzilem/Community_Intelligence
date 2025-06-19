
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
      languages?: string[];
      quality?: 'fast' | 'accurate';
    } = {}
  ): Promise<AdvancedOCRResult> {
    const startTime = Date.now();
    devLog.info('Starting advanced OCR processing', { 
      filename: typeof file === 'string' ? file : file.name,
      options 
    });

    try {
      // Initialize Tesseract worker
      const worker = await Tesseract.createWorker(options.languages?.join('+') || 'eng');
      
      try {
        // Configure OCR parameters for better accuracy
        await worker.setParameters({
          tessedit_pageseg_mode: options.quality === 'fast' 
            ? Tesseract.PSM.SINGLE_BLOCK 
            : Tesseract.PSM.AUTO,
          tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
          preserve_interword_spaces: '1',
        });

        // Perform OCR
        const { data } = await worker.recognize(file);
        
        // Extract structured data
        const words = this.extractWords(data);
        const lines = this.extractLines(data);
        
        // Build OCR result
        const ocrResult: OCRResult = {
          text: data.text || '',
          confidence: data.confidence || 0,
          boundingBoxes: words.map(word => ({
            text: word.text || '',
            bbox: word.bbox || { x0: 0, y0: 0, x1: 0, y1: 0 },
            confidence: word.confidence || 0
          }))
        };

        // Build final result
        const result: AdvancedOCRResult = {
          ocr: ocrResult,
          quality: this.assessQuality(data, words, lines),
          metadata: {
            processingTime: Date.now() - startTime,
            imageSize: { 
              width: data.imageSize?.width || 0, 
              height: data.imageSize?.height || 0 
            },
            format: typeof file === 'string' ? 'unknown' : file.type,
            dpi: data.dpi || undefined
          }
        };

        // Add optional features
        if (options.enableTableExtraction) {
          result.tables = this.extractTables(lines, words);
        }

        if (options.enableFormDetection) {
          result.forms = this.detectForms(lines, words);
        }

        devLog.info('Advanced OCR processing completed', {
          confidence: ocrResult.confidence,
          textLength: ocrResult.text.length,
          processingTime: result.metadata.processingTime,
          tablesFound: result.tables?.totalTables || 0,
          formsFound: result.forms?.totalFields || 0
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

  async processBatch(
    files: File[],
    options: Parameters<typeof this.processDocument>[1] = {},
    onProgress?: (completed: number, total: number) => void
  ): Promise<AdvancedOCRResult[]> {
    devLog.info('Starting batch OCR processing', { count: files.length });

    const results: AdvancedOCRResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.processDocument(files[i], options);
        results.push(result);
        onProgress?.(i + 1, files.length);
      } catch (error) {
        devLog.error(`Failed to process ${files[i].name}`, error);
        // Add failed result to maintain array consistency
        results.push({
          ocr: { text: '', confidence: 0, boundingBoxes: [] },
          quality: { score: 0, issues: [], recommendations: ['Failed to process document'] },
          metadata: {
            processingTime: 0,
            imageSize: { width: 0, height: 0 },
            format: files[i].type
          }
        });
      }
    }

    return results;
  },

  extractWords(data: any): any[] {
    const words: any[] = [];
    if (data.blocks) {
      data.blocks.forEach((block: any) => {
        if (block.paragraphs) {
          block.paragraphs.forEach((paragraph: any) => {
            if (paragraph.lines) {
              paragraph.lines.forEach((line: any) => {
                if (line.words) {
                  words.push(...line.words);
                }
              });
            }
          });
        }
      });
    }
    return words;
  },

  extractLines(data: any): any[] {
    const lines: any[] = [];
    if (data.blocks) {
      data.blocks.forEach((block: any) => {
        if (block.paragraphs) {
          block.paragraphs.forEach((paragraph: any) => {
            if (paragraph.lines) {
              lines.push(...paragraph.lines);
            }
          });
        }
      });
    }
    return lines;
  },

  assessQuality(data: any, words: any[], lines: any[]): QualityAssessmentResult {
    const issues: QualityAssessmentResult['issues'] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Analyze overall confidence
    if (data.confidence < 70) {
      issues.push({
        type: 'contrast',
        severity: 'high',
        description: 'Very low OCR confidence detected',
        suggestion: 'Improve image contrast and resolution before processing'
      });
      recommendations.push('Enhance image quality or use higher resolution scan');
      score -= 30;
    } else if (data.confidence < 85) {
      issues.push({
        type: 'contrast',
        severity: 'medium',
        description: 'Low OCR confidence detected',
        suggestion: 'Consider improving image quality'
      });
      score -= 15;
    }

    // Check for potential blur
    const lowConfidenceWords = words.filter(w => w.confidence < 60).length;
    const blurRatio = lowConfidenceWords / Math.max(words.length, 1);
    
    if (blurRatio > 0.3) {
      issues.push({
        type: 'blur',
        severity: 'high',
        description: 'Image appears significantly blurred',
        suggestion: 'Rescan document with better focus and stability'
      });
      score -= 25;
    } else if (blurRatio > 0.15) {
      issues.push({
        type: 'blur',
        severity: 'medium',
        description: 'Some text appears blurred',
        suggestion: 'Consider rescanning for better accuracy'
      });
      score -= 15;
    }

    // Check for skew issues
    if (lines.length > 0) {
      const avgSkew = this.calculateAverageSkew(lines);
      if (Math.abs(avgSkew) > 5) {
        issues.push({
          type: 'skew',
          severity: 'medium',
          description: 'Document appears skewed',
          suggestion: 'Straighten document before scanning'
        });
        score -= 10;
      }
    }

    // Check resolution
    if (data.imageSize && data.imageSize.width && data.imageSize.height) {
      const totalPixels = data.imageSize.width * data.imageSize.height;
      if (totalPixels < 500000) { // Less than ~750x670
        issues.push({
          type: 'resolution',
          severity: 'medium',
          description: 'Low resolution image detected',
          suggestion: 'Use higher resolution (at least 300 DPI) for better results'
        });
        score -= 15;
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  },

  calculateAverageSkew(lines: any[]): number {
    // Simple skew calculation based on line angles
    let totalSkew = 0;
    let validLines = 0;

    lines.forEach(line => {
      if (line.bbox && line.words && line.words.length > 1) {
        const firstWord = line.words[0];
        const lastWord = line.words[line.words.length - 1];
        
        if (firstWord.bbox && lastWord.bbox) {
          const deltaY = lastWord.bbox.y0 - firstWord.bbox.y0;
          const deltaX = lastWord.bbox.x1 - firstWord.bbox.x0;
          
          if (deltaX > 0) {
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            totalSkew += angle;
            validLines++;
          }
        }
      }
    });

    return validLines > 0 ? totalSkew / validLines : 0;
  },

  extractTables(lines: any[], words: any[]): TableExtractionResult {
    // Advanced table detection algorithm
    const potentialTables: any[] = [];
    
    // Group lines by vertical position
    const lineGroups = this.groupLinesByPosition(lines);
    
    // Detect table-like structures
    lineGroups.forEach(group => {
      if (this.looksLikeTable(group)) {
        const tableRows = this.extractTableRows(group);
        if (tableRows.length > 1) {
          potentialTables.push({
            rows: tableRows,
            confidence: this.calculateTableConfidence(group),
            boundingBox: this.calculateBoundingBox(group)
          });
        }
      }
    });

    return {
      tables: potentialTables,
      totalTables: potentialTables.length
    };
  },

  detectForms(lines: any[], words: any[]): FormFieldResult {
    const formFields: any[] = [];
    
    // Look for form-like patterns
    words.forEach((word, index) => {
      if (this.looksLikeFormLabel(word.text)) {
        const nextWord = words[index + 1];
        if (nextWord && this.isNearby(word, nextWord)) {
          formFields.push({
            label: word.text,
            value: nextWord.text,
            type: this.inferFieldType(word.text, nextWord.text),
            confidence: (word.confidence + nextWord.confidence) / 2,
            boundingBox: this.mergeBoundingBoxes(word.bbox, nextWord.bbox)
          });
        }
      }
    });

    return {
      fields: formFields,
      totalFields: formFields.length
    };
  },

  groupLinesByPosition(lines: any[]): any[][] {
    // Group lines by similar Y positions to detect rows
    const groups: any[][] = [];
    const sortedLines = lines.sort((a, b) => (a.bbox?.y0 || 0) - (b.bbox?.y0 || 0));
    
    let currentGroup: any[] = [];
    let lastY = -1;
    const yTolerance = 10;
    
    sortedLines.forEach(line => {
      const currentY = line.bbox?.y0 || 0;
      
      if (lastY === -1 || Math.abs(currentY - lastY) <= yTolerance) {
        currentGroup.push(line);
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [line];
      }
      
      lastY = currentY;
    });
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  },

  looksLikeTable(lineGroup: any[]): boolean {
    // Check if a group of lines looks like a table
    if (lineGroup.length < 2) return false;
    
    // Check for consistent column structure
    const columnCounts = lineGroup.map(line => line.words?.length || 0);
    const avgColumns = columnCounts.reduce((a, b) => a + b, 0) / columnCounts.length;
    const consistentColumns = columnCounts.filter(count => Math.abs(count - avgColumns) <= 1).length;
    
    return consistentColumns / lineGroup.length > 0.7; // 70% consistency
  },

  extractTableRows(lineGroup: any[]): string[][] {
    return lineGroup.map(line => 
      (line.words || []).map((word: any) => word.text || '').filter((text: string) => text.trim())
    ).filter(row => row.length > 0);
  },

  calculateTableConfidence(lineGroup: any[]): number {
    // Calculate confidence based on structure consistency
    const avgConfidence = lineGroup.reduce((sum, line) => {
      const lineConfidence = (line.words || []).reduce((wordSum: number, word: any) => 
        wordSum + (word.confidence || 0), 0) / Math.max(line.words?.length || 1, 1);
      return sum + lineConfidence;
    }, 0) / lineGroup.length;
    
    return avgConfidence;
  },

  calculateBoundingBox(lineGroup: any[]): { x: number; y: number; width: number; height: number } {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    lineGroup.forEach(line => {
      if (line.bbox) {
        minX = Math.min(minX, line.bbox.x0);
        minY = Math.min(minY, line.bbox.y0);
        maxX = Math.max(maxX, line.bbox.x1);
        maxY = Math.max(maxY, line.bbox.y1);
      }
    });
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  },

  looksLikeFormLabel(text: string): boolean {
    const formKeywords = /^(name|address|phone|email|date|amount|total|quantity|description)[:_\s]*$/i;
    return formKeywords.test(text.trim());
  },

  isNearby(word1: any, word2: any): boolean {
    if (!word1.bbox || !word2.bbox) return false;
    
    const distance = Math.sqrt(
      Math.pow(word2.bbox.x0 - word1.bbox.x1, 2) + 
      Math.pow(word2.bbox.y0 - word1.bbox.y0, 2)
    );
    
    return distance < 50; // pixels
  },

  inferFieldType(label: string, value: string): 'text' | 'checkbox' | 'radio' | 'select' {
    if (/checkbox|check|☐|☑|✓/i.test(label) || /^[☐☑✓x]$/i.test(value)) {
      return 'checkbox';
    }
    if (/radio|option/i.test(label)) {
      return 'radio';
    }
    if (/select|choose|dropdown/i.test(label)) {
      return 'select';
    }
    return 'text';
  },

  mergeBoundingBoxes(bbox1: any, bbox2: any): { x: number; y: number; width: number; height: number } {
    if (!bbox1 || !bbox2) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    const minX = Math.min(bbox1.x0, bbox2.x0);
    const minY = Math.min(bbox1.y0, bbox2.y0);
    const maxX = Math.max(bbox1.x1, bbox2.x1);
    const maxY = Math.max(bbox1.y1, bbox2.y1);
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  },

  async enhanceImageQuality(file: File): Promise<File> {
    // Basic image enhancement (could be expanded with canvas operations)
    return file;
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
    // Image preprocessing (could be expanded with canvas operations)
    return file;
  }
};
