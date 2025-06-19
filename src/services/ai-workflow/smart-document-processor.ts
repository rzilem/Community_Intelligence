
import { supabase } from '@/integrations/supabase/client';
import { devLog } from '@/utils/dev-logger';
import { DocumentProcessingItem } from '@/types/ai-workflow-types';

// Helper function to convert database rows to DocumentProcessingItem objects
function convertToDocumentProcessingItem(row: any): DocumentProcessingItem {
  return {
    id: row.id,
    document_id: row.document_id,
    processing_type: row.processing_type,
    status: row.status as 'queued' | 'processing' | 'completed' | 'failed',
    ai_classification: typeof row.ai_classification === 'string'
      ? JSON.parse(row.ai_classification)
      : row.ai_classification || {},
    confidence_score: row.confidence_score,
    extracted_data: typeof row.extracted_data === 'string'
      ? JSON.parse(row.extracted_data)
      : row.extracted_data || {},
    processing_results: typeof row.processing_results === 'string'
      ? JSON.parse(row.processing_results)
      : row.processing_results || {},
    workflow_triggers: typeof row.workflow_triggers === 'string'
      ? JSON.parse(row.workflow_triggers)
      : row.workflow_triggers || [],
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export class SmartDocumentProcessor {
  async queueDocumentForProcessing(documentId: string, processingType: string): Promise<DocumentProcessingItem> {
    const { data, error } = await supabase
      .from('document_processing_queue')
      .insert({
        document_id: documentId,
        processing_type: processingType,
        status: 'queued',
        ai_classification: {},
        confidence_score: 0,
        extracted_data: {},
        processing_results: {},
        workflow_triggers: []
      })
      .select()
      .single();

    if (error) {
      devLog.error('Failed to queue document for processing', error);
      throw new Error(`Failed to queue document: ${error.message}`);
    }

    return convertToDocumentProcessingItem(data);
  }

  async processDocument(processingItemId: string): Promise<DocumentProcessingItem> {
    // Update status to processing
    await supabase
      .from('document_processing_queue')
      .update({ status: 'processing' })
      .eq('id', processingItemId);

    // Simulate document processing
    const processingResults = {
      documentType: 'invoice',
      extractedText: 'Sample extracted text',
      keyFields: {
        amount: 1500.00,
        vendor: 'ABC Company',
        date: new Date().toISOString()
      }
    };

    const { data, error } = await supabase
      .from('document_processing_queue')
      .update({
        status: 'completed',
        ai_classification: { type: 'invoice', confidence: 0.95 },
        confidence_score: 0.95,
        extracted_data: processingResults.keyFields,
        processing_results: processingResults,
        updated_at: new Date().toISOString()
      })
      .eq('id', processingItemId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to process document: ${error.message}`);
    }

    return convertToDocumentProcessingItem(data);
  }

  async classifyDocument(documentId: string): Promise<{ type: string; confidence: number }> {
    // Simplified classification logic
    return {
      type: 'invoice',
      confidence: 0.92
    };
  }

  async extractKeyData(documentId: string): Promise<Record<string, any>> {
    // Simplified extraction logic
    return {
      vendor: 'Sample Vendor',
      amount: 1000.00,
      date: new Date().toISOString(),
      description: 'Maintenance services'
    };
  }

  async getProcessingQueue(associationId?: string): Promise<DocumentProcessingItem[]> {
    let query = supabase
      .from('document_processing_queue')
      .select('*')
      .order('created_at', { ascending: false });

    if (associationId) {
      // In a real implementation, you'd join with documents table to filter by association
      query = query.limit(50);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch processing queue: ${error.message}`);
    }

    return data ? data.map(convertToDocumentProcessingItem) : [];
  }

  async getProcessingHistory(documentId: string): Promise<DocumentProcessingItem[]> {
    const { data, error } = await supabase
      .from('document_processing_queue')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch processing history: ${error.message}`);
    }

    return data ? data.map(convertToDocumentProcessingItem) : [];
  }

  async retryFailedProcessing(processingItemId: string): Promise<DocumentProcessingItem> {
    const { data, error } = await supabase
      .from('document_processing_queue')
      .update({
        status: 'queued',
        updated_at: new Date().toISOString()
      })
      .eq('id', processingItemId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to retry processing: ${error.message}`);
    }

    return convertToDocumentProcessingItem(data);
  }
}

export const smartDocumentProcessor = new SmartDocumentProcessor();
