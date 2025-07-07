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
      throw new Error(`Document processing failed: ${error.message}`);
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
      throw new Error(`Vision analysis failed: ${error.message}`);
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
    const { data, error } = await supabase
      .from('ai_document_processing_results')
      .select('*')
      .eq('association_id', associationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch processing history:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      documentType: item.document_type,
      extractedData: item.extracted_data,
      confidence: item.confidence,
      metadata: item.metadata,
      riskAssessment: item.risk_assessment,
      complianceCheck: item.compliance_check
    }));
  }

  private static async storeProcessingResult(
    result: DocumentProcessingResult,
    associationId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('ai_document_processing_results')
      .insert({
        id: result.id,
        association_id: associationId,
        document_type: result.documentType,
        extracted_data: result.extractedData,
        confidence: result.confidence,
        metadata: result.metadata,
        risk_assessment: result.riskAssessment,
        compliance_check: result.complianceCheck
      });

    if (error) {
      console.error('Failed to store processing result:', error);
    }
  }

  private static async storeVisionAnalysis(
    result: VisionAnalysisResult,
    associationId: string,
    propertyId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('ai_vision_analysis_results')
      .insert({
        id: result.id,
        association_id: associationId,
        property_id: propertyId,
        analysis_type: result.analysisType,
        findings: result.findings,
        overall_score: result.overallScore,
        recommendations: result.recommendations,
        estimated_cost: result.estimatedCost
      });

    if (error) {
      console.error('Failed to store vision analysis:', error);
    }
  }
}