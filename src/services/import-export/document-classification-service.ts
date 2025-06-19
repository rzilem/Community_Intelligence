
import { devLog } from '@/utils/dev-logger';

export interface DocumentFeatures {
  textContent: string;
  structuralFeatures: {
    hasHeaders: boolean;
    hasFooters: boolean;
    hasLogo: boolean;
    hasSignature: boolean;
    hasStamp: boolean;
    lineCount: number;
    wordCount: number;
    numberCount: number;
    dateCount: number;
    currencyCount: number;
    tableCount: number;
    formFieldCount: number;
  };
  keywordFeatures: {
    invoiceKeywords: number;
    contractKeywords: number;
    reportKeywords: number;
    letterKeywords: number;
    formKeywords: number;
    legalKeywords: number;
  };
  layoutFeatures: {
    isMultiColumn: boolean;
    hasBoxes: boolean;
    hasLines: boolean;
    textDensity: number;
    averageLineLength: number;
  };
}

export interface ClassificationResult {
  documentType: string;
  confidence: number;
  alternativeTypes: Array<{
    type: string;
    confidence: number;
  }>;
  reasoning: string[];
  features: DocumentFeatures;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  features: DocumentFeatures;
  patterns: {
    requiredKeywords: string[];
    optionalKeywords: string[];
    structuralRequirements: string[];
    layoutRequirements: string[];
  };
  confidence: number;
  usageCount: number;
  lastUsed: Date;
  createdBy: string;
  associationId?: string;
}

export interface ClassificationConfig {
  enableMLClassification: boolean;
  enableTemplateMatching: boolean;
  enableLearning: boolean;
  confidenceThreshold: number;
  customTemplates: DocumentTemplate[];
}

export const documentClassificationService = {
  // Predefined document types with their characteristics
  documentTypes: {
    invoice: {
      keywords: ['invoice', 'bill', 'payment', 'due', 'amount', 'total', 'vendor', 'remit'],
      structure: ['header', 'line_items', 'total'],
      confidence: 0.85
    },
    contract: {
      keywords: ['agreement', 'contract', 'terms', 'conditions', 'party', 'whereas', 'signature'],
      structure: ['title', 'parties', 'terms', 'signature'],
      confidence: 0.90
    },
    financial_report: {
      keywords: ['balance', 'income', 'expense', 'budget', 'financial', 'statement', 'revenue'],
      structure: ['title', 'summary', 'details', 'totals'],
      confidence: 0.80
    },
    maintenance_request: {
      keywords: ['maintenance', 'repair', 'service', 'request', 'work', 'order', 'priority'],
      structure: ['request_info', 'description', 'contact'],
      confidence: 0.85
    },
    compliance_notice: {
      keywords: ['violation', 'compliance', 'notice', 'warning', 'fine', 'corrective', 'action'],
      structure: ['notice_header', 'violation_details', 'action_required'],
      confidence: 0.88
    },
    form: {
      keywords: ['application', 'form', 'please', 'fill', 'submit', 'information', 'required'],
      structure: ['fields', 'instructions', 'submission'],
      confidence: 0.75
    },
    letter: {
      keywords: ['dear', 'sincerely', 'regards', 'yours', 'correspondence', 'notice'],
      structure: ['header', 'greeting', 'body', 'closing'],
      confidence: 0.70
    }
  },

  async classifyDocument(
    textContent: string,
    ocrResults?: any,
    config: Partial<ClassificationConfig> = {}
  ): Promise<ClassificationResult> {
    devLog.info('Starting document classification', { 
      textLength: textContent.length,
      hasOCR: !!ocrResults 
    });

    try {
      // Extract features from the document
      const features = this.extractFeatures(textContent, ocrResults);
      
      // Perform classification using multiple methods
      const classifications: Array<{ type: string; confidence: number; reasoning: string[] }> = [];
      
      // Method 1: Keyword-based classification
      const keywordResult = this.classifyByKeywords(features);
      classifications.push(keywordResult);
      
      // Method 2: Structural analysis
      const structuralResult = this.classifyByStructure(features);
      classifications.push(structuralResult);
      
      // Method 3: Layout analysis (if OCR data available)
      if (ocrResults) {
        const layoutResult = this.classifyByLayout(features, ocrResults);
        classifications.push(layoutResult);
      }
      
      // Method 4: Template matching (if enabled)
      if (config.enableTemplateMatching && config.customTemplates) {
        const templateResult = this.matchTemplates(features, config.customTemplates);
        classifications.push(templateResult);
      }
      
      // Combine results using weighted voting
      const finalResult = this.combineClassifications(classifications, features);
      
      // Learn from classification if enabled
      if (config.enableLearning) {
        await this.recordClassification(finalResult, features);
      }
      
      devLog.info('Document classification completed', {
        type: finalResult.documentType,
        confidence: finalResult.confidence
      });
      
      return finalResult;
      
    } catch (error) {
      devLog.error('Document classification failed', error);
      
      // Return fallback classification
      return {
        documentType: 'unknown',
        confidence: 0.1,
        alternativeTypes: [],
        reasoning: [`Classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        features: this.extractFeatures(textContent, ocrResults)
      };
    }
  },

  extractFeatures(textContent: string, ocrResults?: any): DocumentFeatures {
    const text = textContent.toLowerCase();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const lines = textContent.split('\n').filter(line => line.trim().length > 0);
    
    // Count various elements
    const numberMatches = text.match(/\d+/g) || [];
    const dateMatches = text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}-\d{2}-\d{2}/g) || [];
    const currencyMatches = text.match(/\$\d+|\d+\.\d{2}|usd|dollar|payment|amount/g) || [];
    
    return {
      textContent,
      structuralFeatures: {
        hasHeaders: this.detectHeaders(textContent),
        hasFooters: this.detectFooters(textContent),
        hasLogo: this.detectLogo(textContent, ocrResults),
        hasSignature: this.detectSignature(textContent, ocrResults),
        hasStamp: this.detectStamp(textContent, ocrResults),
        lineCount: lines.length,
        wordCount: words.length,
        numberCount: numberMatches.length,
        dateCount: dateMatches.length,
        currencyCount: currencyMatches.length,
        tableCount: ocrResults?.tables?.totalTables || this.estimateTableCount(textContent),
        formFieldCount: ocrResults?.forms?.totalFields || this.estimateFormFields(textContent)
      },
      keywordFeatures: {
        invoiceKeywords: this.countKeywords(text, ['invoice', 'bill', 'payment', 'due', 'amount', 'vendor']),
        contractKeywords: this.countKeywords(text, ['contract', 'agreement', 'terms', 'party', 'signature']),
        reportKeywords: this.countKeywords(text, ['report', 'analysis', 'summary', 'findings', 'conclusion']),
        letterKeywords: this.countKeywords(text, ['dear', 'sincerely', 'regards', 'yours', 'letter']),
        formKeywords: this.countKeywords(text, ['form', 'application', 'fill', 'submit', 'required']),
        legalKeywords: this.countKeywords(text, ['legal', 'law', 'court', 'attorney', 'litigation'])
      },
      layoutFeatures: {
        isMultiColumn: this.detectMultiColumn(textContent, ocrResults),
        hasBoxes: this.detectBoxes(textContent, ocrResults),
        hasLines: this.detectLines(textContent, ocrResults),
        textDensity: words.length / Math.max(lines.length, 1),
        averageLineLength: lines.reduce((sum, line) => sum + line.length, 0) / Math.max(lines.length, 1)
      }
    };
  },

  classifyByKeywords(features: DocumentFeatures): { type: string; confidence: number; reasoning: string[] } {
    const scores: Array<{ type: string; score: number }> = [];
    const reasoning: string[] = [];
    
    Object.entries(features.keywordFeatures).forEach(([category, count]) => {
      if (count > 0) {
        const type = category.replace('Keywords', '');
        const normalizedScore = Math.min(count / 5, 1); // Max score at 5 keywords
        scores.push({ type, score: normalizedScore });
        reasoning.push(`Found ${count} ${type} keywords`);
      }
    });
    
    // Sort by score and return top result
    scores.sort((a, b) => b.score - a.score);
    
    if (scores.length > 0) {
      return {
        type: scores[0].type,
        confidence: scores[0].score * 0.7, // Keyword matching has 70% weight
        reasoning
      };
    }
    
    return {
      type: 'unknown',
      confidence: 0.1,
      reasoning: ['No significant keywords found']
    };
  },

  classifyByStructure(features: DocumentFeatures): { type: string; confidence: number; reasoning: string[] } {
    const reasoning: string[] = [];
    let type = 'unknown';
    let confidence = 0.1;
    
    // Analyze structural features
    if (features.structuralFeatures.tableCount > 0 && features.structuralFeatures.currencyCount > 2) {
      type = 'invoice';
      confidence = 0.8;
      reasoning.push(`Document has ${features.structuralFeatures.tableCount} tables and ${features.structuralFeatures.currencyCount} currency references`);
    } else if (features.structuralFeatures.formFieldCount > 3) {
      type = 'form';
      confidence = 0.75;
      reasoning.push(`Document has ${features.structuralFeatures.formFieldCount} form fields`);
    } else if (features.structuralFeatures.hasSignature && features.structuralFeatures.wordCount > 200) {
      type = 'contract';
      confidence = 0.7;
      reasoning.push('Document has signature and substantial content suggesting contract');
    } else if (features.layoutFeatures.isMultiColumn && features.structuralFeatures.numberCount > 10) {
      type = 'financial_report';
      confidence = 0.65;
      reasoning.push('Multi-column layout with many numbers suggests financial report');
    } else if (features.structuralFeatures.lineCount < 20 && features.structuralFeatures.hasHeaders) {
      type = 'letter';
      confidence = 0.6;
      reasoning.push('Short document with headers suggests letter format');
    }
    
    return { type, confidence, reasoning };
  },

  classifyByLayout(features: DocumentFeatures, ocrResults: any): { type: string; confidence: number; reasoning: string[] } {
    const reasoning: string[] = [];
    let type = 'unknown';
    let confidence = 0.1;
    
    if (ocrResults.tables && ocrResults.tables.totalTables > 0) {
      const tables = ocrResults.tables.tables;
      
      // Analyze table structure for invoice patterns
      const hasInvoiceStructure = tables.some((table: any) => {
        const headers = table.rows[0] || [];
        const invoiceHeaders = ['description', 'quantity', 'price', 'amount', 'total'];
        const matchingHeaders = headers.filter((header: string) => 
          invoiceHeaders.some(ih => header.toLowerCase().includes(ih))
        ).length;
        return matchingHeaders >= 2;
      });
      
      if (hasInvoiceStructure) {
        type = 'invoice';
        confidence = 0.85;
        reasoning.push('Table structure matches invoice pattern');
      }
    }
    
    if (ocrResults.forms && ocrResults.forms.totalFields > 0) {
      type = 'form';
      confidence = 0.8;
      reasoning.push(`Document contains ${ocrResults.forms.totalFields} form fields`);
    }
    
    return { type, confidence, reasoning };
  },

  matchTemplates(features: DocumentFeatures, templates: DocumentTemplate[]): { type: string; confidence: number; reasoning: string[] } {
    let bestMatch = { type: 'unknown', confidence: 0.1, reasoning: ['No templates matched'] };
    
    templates.forEach(template => {
      const similarity = this.calculateTemplateSimilarity(features, template.features);
      if (similarity > bestMatch.confidence) {
        bestMatch = {
          type: template.type,
          confidence: similarity,
          reasoning: [`Matched template "${template.name}" with ${(similarity * 100).toFixed(1)}% similarity`]
        };
      }
    });
    
    return bestMatch;
  },

  calculateTemplateSimilarity(features1: DocumentFeatures, features2: DocumentFeatures): number {
    let totalScore = 0;
    let totalWeight = 0;
    
    // Compare keyword features (weight: 0.4)
    const keywordSimilarity = this.compareKeywordFeatures(features1.keywordFeatures, features2.keywordFeatures);
    totalScore += keywordSimilarity * 0.4;
    totalWeight += 0.4;
    
    // Compare structural features (weight: 0.3)
    const structuralSimilarity = this.compareStructuralFeatures(features1.structuralFeatures, features2.structuralFeatures);
    totalScore += structuralSimilarity * 0.3;
    totalWeight += 0.3;
    
    // Compare layout features (weight: 0.3)
    const layoutSimilarity = this.compareLayoutFeatures(features1.layoutFeatures, features2.layoutFeatures);
    totalScore += layoutSimilarity * 0.3;
    totalWeight += 0.3;
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  },

  combineClassifications(
    classifications: Array<{ type: string; confidence: number; reasoning: string[] }>,
    features: DocumentFeatures
  ): ClassificationResult {
    // Group by type and calculate weighted average
    const typeScores: Record<string, { score: number; count: number; reasoning: string[] }> = {};
    
    classifications.forEach(result => {
      if (!typeScores[result.type]) {
        typeScores[result.type] = { score: 0, count: 0, reasoning: [] };
      }
      typeScores[result.type].score += result.confidence;
      typeScores[result.type].count += 1;
      typeScores[result.type].reasoning.push(...result.reasoning);
    });
    
    // Calculate final scores
    const finalScores = Object.entries(typeScores).map(([type, data]) => ({
      type,
      confidence: data.score / data.count,
      reasoning: data.reasoning
    })).sort((a, b) => b.confidence - a.confidence);
    
    const primaryResult = finalScores[0] || { type: 'unknown', confidence: 0.1, reasoning: [] };
    const alternatives = finalScores.slice(1, 4).map(result => ({
      type: result.type,
      confidence: result.confidence
    }));
    
    return {
      documentType: primaryResult.type,
      confidence: primaryResult.confidence,
      alternativeTypes: alternatives,
      reasoning: primaryResult.reasoning,
      features
    };
  },

  // Helper methods for feature detection
  detectHeaders(text: string): boolean {
    const lines = text.split('\n');
    const firstLine = lines[0]?.trim() || '';
    return firstLine.length > 0 && firstLine.length < 100 && 
           (firstLine.includes('INVOICE') || firstLine.includes('CONTRACT') || 
            firstLine.includes('REPORT') || firstLine.includes('NOTICE'));
  },

  detectFooters(text: string): boolean {
    const lines = text.split('\n');
    const lastLine = lines[lines.length - 1]?.trim() || '';
    return lastLine.length > 0 && 
           (lastLine.includes('©') || lastLine.includes('Page') || 
            lastLine.includes('Total') || lastLine.includes('Contact'));
  },

  detectLogo(text: string, ocrResults?: any): boolean {
    return text.toLowerCase().includes('logo') || 
           (ocrResults?.boundingBoxes?.some((box: any) => 
             box.text.toLowerCase().includes('logo')) || false);
  },

  detectSignature(text: string, ocrResults?: any): boolean {
    const signatureKeywords = ['signature', 'signed', 'by:', '/s/', 'electronically signed'];
    return signatureKeywords.some(keyword => text.toLowerCase().includes(keyword));
  },

  detectStamp(text: string, ocrResults?: any): boolean {
    const stampKeywords = ['stamp', 'seal', 'notary', 'official'];
    return stampKeywords.some(keyword => text.toLowerCase().includes(keyword));
  },

  estimateTableCount(text: string): number {
    // Simple heuristic: count lines that look like table rows
    const lines = text.split('\n');
    let tableRows = 0;
    
    lines.forEach(line => {
      const parts = line.split(/\s{2,}|\t/).filter(part => part.trim());
      if (parts.length >= 3 && parts.some(part => /\d+/.test(part))) {
        tableRows++;
      }
    });
    
    return tableRows > 3 ? 1 : 0; // Estimate 1 table if we have enough rows
  },

  estimateFormFields(text: string): number {
    const fieldPatterns = [
      /\[\s*\]/g, // Empty checkboxes
      /_{3,}/g,   // Underlines for filling
      /Name:\s*$/gm, // Field labels
      /Date:\s*$/gm,
      /Address:\s*$/gm
    ];
    
    let fieldCount = 0;
    fieldPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      fieldCount += matches?.length || 0;
    });
    
    return fieldCount;
  },

  detectMultiColumn(text: string, ocrResults?: any): boolean {
    if (ocrResults?.boundingBoxes) {
      // Analyze OCR bounding boxes to detect column layout
      const words = ocrResults.boundingBoxes;
      const midPoint = Math.max(...words.map((w: any) => w.bbox.x1)) / 2;
      const leftWords = words.filter((w: any) => w.bbox.x1 < midPoint).length;
      const rightWords = words.filter((w: any) => w.bbox.x0 > midPoint).length;
      
      return leftWords > 5 && rightWords > 5;
    }
    
    // Fallback: analyze text structure
    const lines = text.split('\n');
    const wideLines = lines.filter(line => line.length > 80).length;
    return wideLines > lines.length * 0.3;
  },

  detectBoxes(text: string, ocrResults?: any): boolean {
    return text.includes('□') || text.includes('☐') || text.includes('[') || 
           text.includes('|') || text.includes('+');
  },

  detectLines(text: string, ocrResults?: any): boolean {
    return text.includes('_____') || text.includes('-----') || text.includes('═══');
  },

  countKeywords(text: string, keywords: string[]): number {
    return keywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      return count + (matches?.length || 0);
    }, 0);
  },

  compareKeywordFeatures(features1: any, features2: any): number {
    const keys = Object.keys(features1);
    let similarity = 0;
    
    keys.forEach(key => {
      const val1 = features1[key] || 0;
      const val2 = features2[key] || 0;
      const maxVal = Math.max(val1, val2, 1);
      similarity += 1 - Math.abs(val1 - val2) / maxVal;
    });
    
    return similarity / keys.length;
  },

  compareStructuralFeatures(features1: any, features2: any): number {
    // Compare boolean and numeric features
    const booleanKeys = ['hasHeaders', 'hasFooters', 'hasLogo', 'hasSignature', 'hasStamp'];
    const numericKeys = ['lineCount', 'wordCount', 'numberCount', 'dateCount', 'currencyCount', 'tableCount', 'formFieldCount'];
    
    let similarity = 0;
    let totalKeys = 0;
    
    // Compare boolean features
    booleanKeys.forEach(key => {
      if (features1[key] === features2[key]) similarity += 1;
      totalKeys += 1;
    });
    
    // Compare numeric features
    numericKeys.forEach(key => {
      const val1 = features1[key] || 0;
      const val2 = features2[key] || 0;
      const maxVal = Math.max(val1, val2, 1);
      similarity += 1 - Math.abs(val1 - val2) / maxVal;
      totalKeys += 1;
    });
    
    return similarity / totalKeys;
  },

  compareLayoutFeatures(features1: any, features2: any): number {
    const booleanKeys = ['isMultiColumn', 'hasBoxes', 'hasLines'];
    const numericKeys = ['textDensity', 'averageLineLength'];
    
    let similarity = 0;
    let totalKeys = 0;
    
    // Compare boolean features
    booleanKeys.forEach(key => {
      if (features1[key] === features2[key]) similarity += 1;
      totalKeys += 1;
    });
    
    // Compare numeric features
    numericKeys.forEach(key => {
      const val1 = features1[key] || 0;
      const val2 = features2[key] || 0;
      const maxVal = Math.max(val1, val2, 1);
      similarity += 1 - Math.abs(val1 - val2) / maxVal;
      totalKeys += 1;
    });
    
    return similarity / totalKeys;
  },

  async recordClassification(result: ClassificationResult, features: DocumentFeatures): Promise<void> {
    // Record classification for learning (would integrate with database)
    devLog.info('Recording classification for learning', {
      type: result.documentType,
      confidence: result.confidence
    });
    
    // This would store the classification result for future learning
    // Implementation would depend on the storage system
  },

  async createCustomTemplate(
    name: string,
    type: string,
    features: DocumentFeatures,
    associationId?: string
  ): Promise<DocumentTemplate> {
    const template: DocumentTemplate = {
      id: crypto.randomUUID(),
      name,
      type,
      features,
      patterns: {
        requiredKeywords: this.extractRequiredKeywords(features),
        optionalKeywords: this.extractOptionalKeywords(features),
        structuralRequirements: this.extractStructuralRequirements(features),
        layoutRequirements: this.extractLayoutRequirements(features)
      },
      confidence: 0.8,
      usageCount: 0,
      lastUsed: new Date(),
      createdBy: 'system',
      associationId
    };
    
    return template;
  },

  extractRequiredKeywords(features: DocumentFeatures): string[] {
    // Extract keywords that appear frequently and are likely important
    const keywordCounts = features.keywordFeatures;
    return Object.entries(keywordCounts)
      .filter(([_, count]) => count >= 2)
      .map(([key, _]) => key.replace('Keywords', ''))
      .slice(0, 5);
  },

  extractOptionalKeywords(features: DocumentFeatures): string[] {
    const keywordCounts = features.keywordFeatures;
    return Object.entries(keywordCounts)
      .filter(([_, count]) => count === 1)
      .map(([key, _]) => key.replace('Keywords', ''))
      .slice(0, 10);
  },

  extractStructuralRequirements(features: DocumentFeatures): string[] {
    const requirements: string[] = [];
    const struct = features.structuralFeatures;
    
    if (struct.hasHeaders) requirements.push('headers_required');
    if (struct.hasFooters) requirements.push('footers_required');
    if (struct.tableCount > 0) requirements.push('tables_required');
    if (struct.formFieldCount > 0) requirements.push('form_fields_required');
    if (struct.hasSignature) requirements.push('signature_required');
    
    return requirements;
  },

  extractLayoutRequirements(features: DocumentFeatures): string[] {
    const requirements: string[] = [];
    const layout = features.layoutFeatures;
    
    if (layout.isMultiColumn) requirements.push('multi_column');
    if (layout.hasBoxes) requirements.push('boxes_present');
    if (layout.hasLines) requirements.push('lines_present');
    
    return requirements;
  }
};
