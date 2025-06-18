
import { ocrService, type OCRResult, type DocumentOCRResult } from './ocr-service';
import { openaiContentAnalyzer } from './openai-content-analyzer';
import { devLog } from '@/utils/dev-logger';

export interface DocumentIntelligenceResult {
  filename: string;
  documentType: string;
  extractedData: any;
  confidence: number;
  structuredData: Record<string, any>;
  suggestions: string[];
  errors: string[];
}

export interface ProcessedDocument {
  originalFile: File;
  ocrResult: DocumentOCRResult;
  aiAnalysis: any;
  finalData: any[];
  dataType: string;
}

export const documentIntelligenceService = {
  async processDocument(file: File): Promise<DocumentIntelligenceResult> {
    try {
      devLog.info('Starting document intelligence processing for:', file.name);
      
      // Step 1: OCR extraction
      const ocrResult = await ocrService.processDocumentOCR(file);
      
      // Step 2: AI analysis of extracted text
      const aiAnalysis = await this.analyzeExtractedText(
        ocrResult.extractedText,
        ocrResult.documentType || 'unknown',
        file.name
      );
      
      // Step 3: Structure the data
      const structuredData = this.structureExtractedData(
        ocrResult.structuredData,
        aiAnalysis
      );
      
      const result: DocumentIntelligenceResult = {
        filename: file.name,
        documentType: ocrResult.documentType || aiAnalysis.dataType || 'unknown',
        extractedData: ocrResult.structuredData,
        confidence: Math.min(ocrResult.confidence, aiAnalysis.confidence || 0.8),
        structuredData,
        suggestions: aiAnalysis.recommendations || [],
        errors: []
      };
      
      devLog.info('Document intelligence processing complete:', {
        filename: file.name,
        documentType: result.documentType,
        confidence: result.confidence
      });
      
      return result;
      
    } catch (error) {
      devLog.error('Document intelligence processing failed:', error);
      
      return {
        filename: file.name,
        documentType: 'unknown',
        extractedData: {},
        confidence: 0,
        structuredData: {},
        suggestions: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  },

  async processBatchDocuments(files: File[]): Promise<ProcessedDocument[]> {
    const results: ProcessedDocument[] = [];
    
    for (const file of files) {
      try {
        const docResult = await this.processDocument(file);
        
        // Convert document intelligence result to import-ready data
        const finalData = this.convertToImportData(docResult);
        
        results.push({
          originalFile: file,
          ocrResult: {
            filename: file.name,
            extractedText: docResult.extractedData?.text || '',
            confidence: docResult.confidence,
            structuredData: docResult.structuredData,
            documentType: docResult.documentType
          },
          aiAnalysis: docResult,
          finalData,
          dataType: this.inferDataType(docResult.documentType)
        });
        
      } catch (error) {
        devLog.error(`Failed to process document ${file.name}:`, error);
        
        // Add error result to maintain file order
        results.push({
          originalFile: file,
          ocrResult: {
            filename: file.name,
            extractedText: '',
            confidence: 0,
            documentType: 'error'
          },
          aiAnalysis: null,
          finalData: [],
          dataType: 'unknown'
        });
      }
    }
    
    return results;
  },

  async analyzeExtractedText(text: string, documentType: string, filename: string): Promise<any> {
    try {
      // Use existing OpenAI content analyzer with document context
      const mockHeaders = this.extractFieldsFromText(text, documentType);
      const mockSampleData = [this.extractSampleData(text, documentType)];
      
      return await openaiContentAnalyzer.analyzeFileContent(
        filename,
        mockHeaders,
        mockSampleData,
        { associationHint: documentType }
      );
      
    } catch (error) {
      devLog.error('AI analysis of extracted text failed:', error);
      return {
        dataType: documentType,
        confidence: 0.5,
        fieldMappings: {},
        recommendations: ['Manual review required due to analysis error']
      };
    }
  },

  extractFieldsFromText(text: string, documentType: string): string[] {
    const fields: string[] = [];
    
    // Common field patterns
    const fieldPatterns = {
      invoice: ['vendor', 'amount', 'date', 'invoice_number', 'description'],
      property_list: ['address', 'unit_number', 'property_type', 'owner_name'],
      financial_statement: ['account', 'balance', 'date', 'transaction_type'],
      owner_list: ['first_name', 'last_name', 'email', 'phone', 'address'],
      assessment: ['property_id', 'amount', 'due_date', 'assessment_type']
    };
    
    const typeFields = fieldPatterns[documentType as keyof typeof fieldPatterns] || 
                      fieldPatterns.invoice;
    
    // Add detected fields from text patterns
    if (text.toLowerCase().includes('email')) fields.push('email');
    if (text.toLowerCase().includes('phone')) fields.push('phone');
    if (text.toLowerCase().includes('address')) fields.push('address');
    if (text.toLowerCase().includes('amount') || text.match(/\$[\d,]+/)) fields.push('amount');
    
    return [...new Set([...typeFields, ...fields])];
  },

  extractSampleData(text: string, documentType: string): Record<string, any> {
    const sampleData: Record<string, any> = {};
    
    // Extract sample data based on document type
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Extract emails
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) sampleData.email = emailMatch[0];
    
    // Extract phone numbers
    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) sampleData.phone = phoneMatch[0];
    
    // Extract amounts
    const amountMatch = text.match(/\$[\d,]+\.?\d*/);
    if (amountMatch) sampleData.amount = amountMatch[0];
    
    // Extract dates
    const dateMatch = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
    if (dateMatch) sampleData.date = dateMatch[0];
    
    return sampleData;
  },

  structureExtractedData(ocrData: any, aiAnalysis: any): Record<string, any> {
    if (!ocrData && !aiAnalysis) return {};
    
    const structured: Record<string, any> = {};
    
    // Merge OCR structured data with AI analysis
    if (ocrData) {
      Object.assign(structured, ocrData);
    }
    
    // Apply AI field mappings
    if (aiAnalysis?.fieldMappings) {
      Object.entries(aiAnalysis.fieldMappings).forEach(([source, target]) => {
        if (structured[source] && !structured[target]) {
          structured[target] = structured[source];
        }
      });
    }
    
    return structured;
  },

  convertToImportData(docResult: DocumentIntelligenceResult): any[] {
    // Convert document intelligence result to array format for import
    if (!docResult.structuredData || Object.keys(docResult.structuredData).length === 0) {
      return [];
    }
    
    // Handle different document types
    switch (docResult.documentType) {
      case 'invoice':
        return this.convertInvoiceToImportData(docResult.structuredData);
      
      case 'property_list':
        return this.convertPropertyListToImportData(docResult.structuredData);
      
      case 'owner_list':
        return this.convertOwnerListToImportData(docResult.structuredData);
      
      case 'financial_statement':
        return this.convertFinancialToImportData(docResult.structuredData);
      
      default:
        // Generic conversion - wrap single record in array
        return [docResult.structuredData];
    }
  },

  convertInvoiceToImportData(data: any): any[] {
    return [{
      vendor_name: data.vendor || '',
      amount: data.amount || '',
      invoice_number: data.invoiceNumber || '',
      date: data.date || '',
      description: data.lineItems?.map((item: any) => item.description).join('; ') || ''
    }];
  },

  convertPropertyListToImportData(data: any): any[] {
    if (data.properties && Array.isArray(data.properties)) {
      return data.properties.map((prop: any) => ({
        address: prop.address || '',
        unit_number: prop.unit || '',
        property_type: prop.type || ''
      }));
    }
    
    return [{
      address: data.address || '',
      unit_number: data.unit || '',
      property_type: data.type || ''
    }];
  },

  convertOwnerListToImportData(data: any): any[] {
    if (data.owners && Array.isArray(data.owners)) {
      return data.owners.map((owner: any) => ({
        first_name: owner.name?.split(' ')[0] || '',
        last_name: owner.name?.split(' ').slice(1).join(' ') || '',
        email: owner.email || '',
        phone: owner.phone || ''
      }));
    }
    
    return [{
      first_name: data.first_name || data.name?.split(' ')[0] || '',
      last_name: data.last_name || data.name?.split(' ').slice(1).join(' ') || '',
      email: data.email || '',
      phone: data.phone || ''
    }];
  },

  convertFinancialToImportData(data: any): any[] {
    return [{
      amount: data.balanceAmount || data.amounts?.[0] || '',
      date: data.dates?.[0] || '',
      description: 'Financial statement entry'
    }];
  },

  inferDataType(documentType: string): string {
    const typeMapping: Record<string, string> = {
      'invoice': 'financial',
      'property_list': 'properties',
      'owner_list': 'owners',
      'financial_statement': 'financial',
      'assessment': 'assessments'
    };
    
    return typeMapping[documentType] || 'unknown';
  }
};
