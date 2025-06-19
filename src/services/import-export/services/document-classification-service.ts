
import { ClassificationResult } from '../types';
import { devLog } from '@/utils/dev-logger';

class DocumentClassificationService {
  async classifyDocument(content: string): Promise<ClassificationResult> {
    try {
      devLog.info('Classifying document content');
      
      const type = this.determineDocumentType(content);
      const confidence = this.calculateConfidence(content, type);
      const suggestedMapping = this.generateMappingSuggestions(content, type);
      
      return {
        type,
        confidence,
        suggestedMapping,
        category: this.getCategoryForType(type),
        metadata: {
          contentLength: content.length,
          processingTime: Date.now()
        }
      };
    } catch (error) {
      devLog.error('Document classification failed:', error);
      return {
        type: 'unknown',
        confidence: 0,
        category: 'unknown'
      };
    }
  }

  private determineDocumentType(content: string): string {
    const lowerContent = content.toLowerCase();
    
    // Check for property-related documents
    if (lowerContent.includes('property') && (lowerContent.includes('address') || lowerContent.includes('unit'))) {
      return 'property_list';
    }
    
    // Check for resident/owner information
    if (lowerContent.includes('owner') || lowerContent.includes('resident') || lowerContent.includes('tenant')) {
      return 'resident_list';
    }
    
    // Check for financial documents
    if (lowerContent.includes('assessment') || lowerContent.includes('dues') || lowerContent.includes('fee')) {
      return 'assessment_list';
    }
    
    // Check for vendor documents
    if (lowerContent.includes('vendor') || lowerContent.includes('contractor') || lowerContent.includes('service')) {
      return 'vendor_list';
    }
    
    // Check for invoice documents
    if (lowerContent.includes('invoice') || lowerContent.includes('bill') || lowerContent.includes('amount due')) {
      return 'invoice';
    }
    
    return 'general_document';
  }

  private calculateConfidence(content: string, type: string): number {
    // Simple confidence calculation based on keyword matches
    const keywords = this.getKeywordsForType(type);
    const matches = keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    return Math.min(0.5 + (matches / keywords.length) * 0.5, 1.0);
  }

  private generateMappingSuggestions(content: string, type: string): Record<string, string> {
    const suggestions: Record<string, string> = {};
    
    switch (type) {
      case 'property_list':
        suggestions['address'] = 'property_address';
        suggestions['unit'] = 'unit_number';
        suggestions['owner'] = 'owner_name';
        break;
      case 'resident_list':
        suggestions['name'] = 'resident_name';
        suggestions['email'] = 'contact_email';
        suggestions['phone'] = 'phone_number';
        break;
      case 'assessment_list':
        suggestions['amount'] = 'assessment_amount';
        suggestions['due_date'] = 'due_date';
        suggestions['property'] = 'property_id';
        break;
      case 'vendor_list':
        suggestions['vendor'] = 'vendor_name';
        suggestions['contact'] = 'contact_info';
        suggestions['service'] = 'service_type';
        break;
    }
    
    return suggestions;
  }

  private getCategoryForType(type: string): string {
    const categoryMap: Record<string, string> = {
      'property_list': 'properties',
      'resident_list': 'residents',
      'assessment_list': 'financial',
      'vendor_list': 'vendors',
      'invoice': 'financial',
      'general_document': 'general'
    };
    
    return categoryMap[type] || 'general';
  }

  private getKeywordsForType(type: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'property_list': ['property', 'address', 'unit', 'lot', 'building'],
      'resident_list': ['resident', 'owner', 'tenant', 'name', 'email', 'phone'],
      'assessment_list': ['assessment', 'dues', 'fee', 'amount', 'payment'],
      'vendor_list': ['vendor', 'contractor', 'service', 'supplier', 'company'],
      'invoice': ['invoice', 'bill', 'amount', 'due', 'payment'],
      'general_document': ['document', 'information', 'data']
    };
    
    return keywordMap[type] || [];
  }
}

export const documentClassificationService = new DocumentClassificationService();
