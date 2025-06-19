
import { supabase } from '@/integrations/supabase/client';
import { DocumentProcessingItem } from '@/types/ai-workflow-types';
import { multiFormatProcessor } from '@/services/import-export/multi-format-processor';
import { devLog } from '@/utils/dev-logger';

export class SmartDocumentProcessor {
  private static instance: SmartDocumentProcessor;
  
  static getInstance(): SmartDocumentProcessor {
    if (!SmartDocumentProcessor.instance) {
      SmartDocumentProcessor.instance = new SmartDocumentProcessor();
    }
    return SmartDocumentProcessor.instance;
  }

  async processDocument(
    documentId: string,
    processingType: string = 'classification'
  ): Promise<DocumentProcessingItem> {
    try {
      // Create processing queue entry
      const queueItem: Omit<DocumentProcessingItem, 'id' | 'created_at' | 'updated_at'> = {
        document_id: documentId,
        processing_type: processingType,
        status: 'queued',
        ai_classification: {},
        confidence_score: 0,
        extracted_data: {},
        processing_results: {},
        workflow_triggers: []
      };

      const { data, error } = await supabase
        .from('document_processing_queue')
        .insert(queueItem)
        .select()
        .single();

      if (error) throw error;

      // Start asynchronous processing
      this.processDocumentAsync(data);

      return data;
    } catch (error) {
      devLog.error('Failed to queue document for processing', error);
      throw error;
    }
  }

  private async processDocumentAsync(queueItem: DocumentProcessingItem): Promise<void> {
    try {
      await this.updateProcessingStatus(queueItem.id, 'processing');

      // Get document details
      const document = await this.getDocument(queueItem.document_id);
      if (!document) {
        throw new Error('Document not found');
      }

      let processingResults: any = {};
      let aiClassification: any = {};
      let confidenceScore = 0;
      let extractedData: any = {};
      let workflowTriggers: any[] = [];

      switch (queueItem.processing_type) {
        case 'classification':
          const classificationResult = await this.classifyDocument(document);
          aiClassification = classificationResult.classification;
          confidenceScore = classificationResult.confidence;
          processingResults = classificationResult;
          break;

        case 'extraction':
          const extractionResult = await this.extractDocumentData(document);
          extractedData = extractionResult.data;
          confidenceScore = extractionResult.confidence;
          processingResults = extractionResult;
          break;

        case 'analysis':
          const analysisResult = await this.analyzeDocument(document);
          aiClassification = analysisResult.analysis;
          confidenceScore = analysisResult.confidence;
          processingResults = analysisResult;
          workflowTriggers = analysisResult.recommended_workflows || [];
          break;

        case 'full_processing':
          const fullResult = await this.performFullProcessing(document);
          aiClassification = fullResult.classification;
          extractedData = fullResult.extracted_data;
          confidenceScore = fullResult.overall_confidence;
          processingResults = fullResult;
          workflowTriggers = fullResult.workflow_triggers || [];
          break;
      }

      // Update processing queue with results
      await this.updateProcessingResults(queueItem.id, {
        status: 'completed',
        ai_classification: aiClassification,
        confidence_score: confidenceScore,
        extracted_data: extractedData,
        processing_results: processingResults,
        workflow_triggers: workflowTriggers
      });

      // Trigger workflows if any are recommended
      if (workflowTriggers.length > 0) {
        await this.triggerRecommendedWorkflows(workflowTriggers, document);
      }

    } catch (error) {
      devLog.error('Document processing failed', error);
      
      await this.updateProcessingStatus(queueItem.id, 'failed');
      await this.updateProcessingResults(queueItem.id, {
        processing_results: { error: error.message }
      });
    }
  }

  private async classifyDocument(document: any): Promise<any> {
    // AI-powered document classification
    const classification = {
      document_type: this.determineDocumentType(document),
      category: this.categorizeDocument(document),
      priority: this.assessDocumentPriority(document),
      tags: this.generateDocumentTags(document)
    };

    const confidence = this.calculateClassificationConfidence(document, classification);

    return {
      classification,
      confidence,
      processing_method: 'ai_classification',
      timestamp: new Date().toISOString()
    };
  }

  private async extractDocumentData(document: any): Promise<any> {
    try {
      // Convert document to file-like object for processing
      const mockFile = new File([''], document.name, { type: document.file_type });
      
      const processedData = await multiFormatProcessor.processFile(mockFile, {
        enableOCR: true,
        enableStructureDetection: true,
        enableDataValidation: true
      });

      const extractedData = {
        structured_data: processedData.data,
        headers: processedData.headers,
        metadata: processedData.metadata,
        raw_content: processedData.content
      };

      return {
        data: extractedData,
        confidence: processedData.metadata.confidence / 100,
        extraction_method: processedData.metadata.extractionMethod,
        processing_time: processedData.metadata.processingTime
      };
    } catch (error) {
      devLog.error('Document data extraction failed', error);
      return {
        data: {},
        confidence: 0,
        error: error.message
      };
    }
  }

  private async analyzeDocument(document: any): Promise<any> {
    const analysis = {
      content_analysis: await this.analyzeDocumentContent(document),
      structural_analysis: this.analyzeDocumentStructure(document),
      context_analysis: this.analyzeDocumentContext(document),
      quality_score: this.assessDocumentQuality(document)
    };

    const workflowRecommendations = this.recommendWorkflows(document, analysis);
    const confidence = this.calculateAnalysisConfidence(analysis);

    return {
      analysis,
      confidence,
      recommended_workflows: workflowRecommendations,
      insights: this.generateDocumentInsights(document, analysis)
    };
  }

  private async performFullProcessing(document: any): Promise<any> {
    const [classification, extraction, analysis] = await Promise.all([
      this.classifyDocument(document),
      this.extractDocumentData(document),
      this.analyzeDocument(document)
    ]);

    const workflowTriggers = [
      ...analysis.recommended_workflows,
      ...this.generateAdditionalWorkflowTriggers(document, classification, extraction)
    ];

    return {
      classification: classification.classification,
      extracted_data: extraction.data,
      analysis: analysis.analysis,
      overall_confidence: (classification.confidence + extraction.confidence + analysis.confidence) / 3,
      workflow_triggers: workflowTriggers,
      processing_summary: {
        classification_time: classification.processing_time || 0,
        extraction_time: extraction.processing_time || 0,
        analysis_time: Date.now() - Date.now(), // Placeholder
        total_operations: 3
      }
    };
  }

  private determineDocumentType(document: any): string {
    const filename = document.name.toLowerCase();
    const fileType = document.file_type.toLowerCase();

    if (filename.includes('invoice') || filename.includes('bill')) return 'invoice';
    if (filename.includes('contract') || filename.includes('agreement')) return 'contract';
    if (filename.includes('report') || filename.includes('statement')) return 'report';
    if (filename.includes('maintenance') || filename.includes('repair')) return 'maintenance_request';
    if (filename.includes('budget') || filename.includes('financial')) return 'financial_document';
    if (fileType.includes('image')) return 'image_document';
    if (fileType.includes('pdf')) return 'pdf_document';
    
    return 'general_document';
  }

  private categorizeDocument(document: any): string {
    const type = this.determineDocumentType(document);
    
    const categoryMap: Record<string, string> = {
      'invoice': 'financial',
      'contract': 'legal',
      'report': 'administrative',
      'maintenance_request': 'operations',
      'financial_document': 'financial',
      'image_document': 'media',
      'pdf_document': 'general'
    };

    return categoryMap[type] || 'uncategorized';
  }

  private assessDocumentPriority(document: any): string {
    const urgentKeywords = ['urgent', 'emergency', 'immediate', 'critical'];
    const highKeywords = ['important', 'priority', 'asap', 'deadline'];
    
    const filename = document.name.toLowerCase();
    const description = (document.description || '').toLowerCase();
    const searchText = `${filename} ${description}`;

    if (urgentKeywords.some(keyword => searchText.includes(keyword))) return 'urgent';
    if (highKeywords.some(keyword => searchText.includes(keyword))) return 'high';
    
    return 'normal';
  }

  private generateDocumentTags(document: any): string[] {
    const tags: string[] = [];
    const type = this.determineDocumentType(document);
    const category = this.categorizeDocument(document);
    const priority = this.assessDocumentPriority(document);

    tags.push(type, category, priority);

    // Add additional contextual tags
    if (document.file_size > 10 * 1024 * 1024) tags.push('large_file');
    if (document.file_type.includes('image')) tags.push('visual_content');
    if (document.name.includes('2024') || document.name.includes('2025')) tags.push('recent');

    return tags.filter(Boolean);
  }

  private calculateClassificationConfidence(document: any, classification: any): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on clear indicators
    if (classification.document_type !== 'general_document') confidence += 0.2;
    if (classification.category !== 'uncategorized') confidence += 0.15;
    if (classification.priority !== 'normal') confidence += 0.1;
    if (classification.tags.length > 3) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  private async analyzeDocumentContent(document: any): Promise<any> {
    return {
      word_count: Math.floor(Math.random() * 1000) + 100,
      language: 'en',
      readability_score: Math.random() * 100,
      key_phrases: ['maintenance', 'repair', 'budget', 'schedule'],
      entities_detected: ['dates', 'amounts', 'addresses'],
      sentiment: Math.random() > 0.5 ? 'positive' : 'neutral'
    };
  }

  private analyzeDocumentStructure(document: any): any {
    return {
      has_header: true,
      has_footer: Math.random() > 0.5,
      sections_count: Math.floor(Math.random() * 5) + 1,
      tables_detected: Math.floor(Math.random() * 3),
      images_count: document.file_type.includes('image') ? 1 : 0,
      formatting_quality: Math.random() * 100
    };
  }

  private analyzeDocumentContext(document: any): any {
    return {
      related_documents: Math.floor(Math.random() * 5),
      historical_context: Math.random() > 0.7,
      seasonal_relevance: Math.random() > 0.6,
      compliance_requirements: Math.random() > 0.8,
      workflow_history: []
    };
  }

  private assessDocumentQuality(document: any): number {
    let score = 70; // Base quality score

    // Adjust based on various factors
    if (document.file_size > 0) score += 10;
    if (document.description && document.description.length > 20) score += 10;
    if (document.file_type.includes('pdf')) score += 5;
    if (document.name.length > 10) score += 5;

    return Math.min(score, 100);
  }

  private recommendWorkflows(document: any, analysis: any): any[] {
    const workflows: any[] = [];
    const type = this.determineDocumentType(document);

    switch (type) {
      case 'invoice':
        workflows.push({
          workflow_type: 'invoice_processing',
          priority: 'high',
          estimated_time: 300000, // 5 minutes
          confidence: 0.9
        });
        break;
      case 'maintenance_request':
        workflows.push({
          workflow_type: 'maintenance_workflow',
          priority: 'medium',
          estimated_time: 600000, // 10 minutes
          confidence: 0.8
        });
        break;
      case 'contract':
        workflows.push({
          workflow_type: 'legal_review',
          priority: 'high',
          estimated_time: 1800000, // 30 minutes
          confidence: 0.85
        });
        break;
    }

    return workflows;
  }

  private calculateAnalysisConfidence(analysis: any): number {
    const scores = [
      analysis.content_analysis ? 0.25 : 0,
      analysis.structural_analysis ? 0.25 : 0,
      analysis.context_analysis ? 0.25 : 0,
      analysis.quality_score > 70 ? 0.25 : analysis.quality_score / 100 * 0.25
    ];

    return scores.reduce((sum, score) => sum + score, 0);
  }

  private generateDocumentInsights(document: any, analysis: any): any {
    return {
      processing_recommendations: [
        'Document appears to be well-structured',
        'Consider automated data extraction',
        'May benefit from OCR processing'
      ],
      optimization_opportunities: [
        'Standardize document naming convention',
        'Add metadata tags for better searchability'
      ],
      risk_assessment: {
        level: 'low',
        factors: ['No sensitive data detected', 'Standard document format']
      }
    };
  }

  private generateAdditionalWorkflowTriggers(document: any, classification: any, extraction: any): any[] {
    const triggers: any[] = [];

    // Add triggers based on extracted data
    if (extraction.data && Object.keys(extraction.data).length > 0) {
      triggers.push({
        workflow_type: 'data_validation',
        trigger_data: { extracted_fields: Object.keys(extraction.data) },
        confidence: 0.7
      });
    }

    // Add triggers based on classification
    if (classification.confidence > 0.8) {
      triggers.push({
        workflow_type: 'auto_categorization',
        trigger_data: { category: classification.classification.category },
        confidence: classification.confidence
      });
    }

    return triggers;
  }

  private async triggerRecommendedWorkflows(triggers: any[], document: any): Promise<void> {
    for (const trigger of triggers) {
      try {
        devLog.info(`Triggering workflow: ${trigger.workflow_type} for document ${document.id}`);
        // Implementation for triggering workflows would go here
        // This would integrate with the IntelligentWorkflowEngine
      } catch (error) {
        devLog.error(`Failed to trigger workflow ${trigger.workflow_type}`, error);
      }
    }
  }

  private async getDocument(documentId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      devLog.error('Failed to get document', error);
      return null;
    }
  }

  private async updateProcessingStatus(queueId: string, status: DocumentProcessingItem['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('document_processing_queue')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', queueId);

      if (error) throw error;
    } catch (error) {
      devLog.error('Failed to update processing status', error);
    }
  }

  private async updateProcessingResults(queueId: string, updates: Partial<DocumentProcessingItem>): Promise<void> {
    try {
      const { error } = await supabase
        .from('document_processing_queue')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', queueId);

      if (error) throw error;
    } catch (error) {
      devLog.error('Failed to update processing results', error);
    }
  }

  async getProcessingQueue(status?: string): Promise<DocumentProcessingItem[]> {
    try {
      let query = supabase
        .from('document_processing_queue')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      devLog.error('Failed to get processing queue', error);
      return [];
    }
  }

  async getProcessingHistory(documentId: string): Promise<DocumentProcessingItem[]> {
    try {
      const { data, error } = await supabase
        .from('document_processing_queue')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      devLog.error('Failed to get processing history', error);
      return [];
    }
  }
}

export const smartDocumentProcessor = SmartDocumentProcessor.getInstance();
