
import { ClassificationResult } from '../types';

export class DocumentClassificationService {
  async classifyDocument(content: string): Promise<ClassificationResult> {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('invoice') || lowerContent.includes('bill')) {
      return {
        type: 'invoice',
        confidence: 0.8,
        suggestedMapping: { 'amount': 'total', 'date': 'invoice_date' },
        category: 'financial',
        metadata: {}
      };
    } else if (lowerContent.includes('owner') || lowerContent.includes('resident')) {
      return {
        type: 'owner_list',
        confidence: 0.7,
        suggestedMapping: { 'name': 'owner_name', 'email': 'owner_email' },
        category: 'residents',
        metadata: {}
      };
    } else if (lowerContent.includes('property') || lowerContent.includes('address')) {
      return {
        type: 'property_list',
        confidence: 0.9,
        suggestedMapping: { 'address': 'property_address', 'unit': 'unit_number' },
        category: 'properties',
        metadata: {}
      };
    }
    
    return {
      type: 'unknown',
      confidence: 0.5,
      suggestedMapping: {},
      category: 'general',
      metadata: {}
    };
  }
}

export const documentClassificationService = new DocumentClassificationService();
