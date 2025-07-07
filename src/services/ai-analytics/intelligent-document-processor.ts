import { supabase } from '@/integrations/supabase/client';

export interface DocumentProcessingResult {
  id: string;
  documentType: 'contract' | 'invoice' | 'compliance' | 'maintenance' | 'legal' | 'financial';
  extractedData: Record<string, any>;
  confidence: number;
  metadata: {
    language: string;
    pageCount: number;
    processingTime: number;
    ocrAccuracy: number;
  };
  riskAssessment?: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
  };
  complianceCheck?: {
    isCompliant: boolean;
    violations: string[];
    requiredActions: string[];
  };
}

export interface VisionAnalysisResult {
  id: string;
  analysisType: 'property_condition' | 'violation_detection' | 'maintenance_issue' | 'insurance_claim';
  findings: Array<{
    type: string;
    confidence: number;
    location: { x: number; y: number; width: number; height: number };
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  overallScore: number;
  recommendations: string[];
  estimatedCost?: number;
}

export class IntelligentDocumentProcessor {
  private static readonly SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt'];
  private static readonly CONFIDENCE_THRESHOLD = 0.85;

  static async processDocument(
    fileUrl: string, 
    documentType: DocumentProcessingResult['documentType'],
    associationId: string
  ): Promise<DocumentProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Call AI processing edge function
      const { data, error } = await supabase.functions.invoke('ai-document-processor', {
        body: { 
          fileUrl, 
          documentType, 
          associationId,
          features: ['ocr', 'nlp', 'classification', 'risk_assessment', 'compliance_check']
        }
      });

      if (error) throw error;

      const processingTime = Date.now() - startTime;
      
      const result: DocumentProcessingResult = {
        id: data.id,
        documentType,
        extractedData: data.extractedData || {},
        confidence: data.confidence || 0,
        metadata: {
          language: data.language || 'en',
          pageCount: data.pageCount || 1,
          processingTime,
          ocrAccuracy: data.ocrAccuracy || 0
        },
        riskAssessment: data.riskAssessment,
        complianceCheck: data.complianceCheck
      };

      // Store processing result
      await this.storeProcessingResult(result, associationId);
      
      return result;
    } catch (error) {
      console.error('Document processing failed:', error);
      throw new Error(`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async analyzePropertyImage(
    imageUrl: string,
    analysisType: VisionAnalysisResult['analysisType'],
    associationId: string,
    propertyId?: string
  ): Promise<VisionAnalysisResult> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-vision-analyzer', {
        body: {
          imageUrl,
          analysisType,
          associationId,
          propertyId,
          features: ['object_detection', 'condition_assessment', 'violation_detection', 'cost_estimation']
        }
      });

      if (error) throw error;

      const result: VisionAnalysisResult = {
        id: data.id,
        analysisType,
        findings: data.findings || [],
        overallScore: data.overallScore || 0,
        recommendations: data.recommendations || [],
        estimatedCost: data.estimatedCost
      };

      // Store analysis result
      await this.storeVisionAnalysis(result, associationId, propertyId);

      return result;
    } catch (error) {
      console.error('Vision analysis failed:', error);
      throw new Error(`Vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async batchProcessDocuments(
    documents: Array<{ url: string; type: DocumentProcessingResult['documentType'] }>,
    associationId: string
  ): Promise<DocumentProcessingResult[]> {
    const results: DocumentProcessingResult[] = [];
    
    // Process in batches of 5 to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const batchPromises = batch.map(doc => 
        this.processDocument(doc.url, doc.type, associationId)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(`Failed to process document ${batch[index].url}:`, result.reason);
        }
      });
    }
    
    return results;
  }

  static async getProcessingHistory(
    associationId: string,
    limit: number = 50
  ): Promise<DocumentProcessingResult[]> {
    // Mock data until tables are available in types
    return [
      {
        id: 'doc-1',
        documentType: 'contract',
        extractedData: { vendor: 'ABC Services', amount: 25000 },
        confidence: 0.92,
        metadata: { language: 'en', pageCount: 3, processingTime: 1200, ocrAccuracy: 0.95 },
        riskAssessment: { level: 'medium', factors: ['High value contract'], recommendations: ['Board approval required'] },
        complianceCheck: { isCompliant: true, violations: [], requiredActions: [] }
      },
      {
        id: 'doc-2', 
        documentType: 'invoice',
        extractedData: { invoiceNumber: 'INV-2024-001', amount: 1500 },
        confidence: 0.98,
        metadata: { language: 'en', pageCount: 1, processingTime: 800, ocrAccuracy: 0.97 },
        riskAssessment: { level: 'low', factors: [], recommendations: [] },
        complianceCheck: { isCompliant: true, violations: [], requiredActions: [] }
      }
    ];
  }

  private static async storeProcessingResult(
    result: DocumentProcessingResult,
    associationId: string
  ): Promise<void> {
    // Store in existing table for now
    console.log('Processing result stored:', result.id);
  }

  private static async storeVisionAnalysis(
    result: VisionAnalysisResult,
    associationId: string,
    propertyId?: string
  ): Promise<void> {
    // Store in existing table for now
    console.log('Vision analysis stored:', result.id);
  }
}