
import { ClassificationResult } from '../types';

export class DocumentClassificationService {
  async classifyDocument(content: string): Promise<ClassificationResult> {
    const lowerContent = content.toLowerCase();
    
    // Simple classification logic
    if (lowerContent.includes('invoice') || lowerContent.includes('bill')) {
      return {
        type: 'invoice',
        confidence: 0.8,
        categories: ['financial', 'billing'],
        metadata: { classifierVersion: '1.0' }
      };
    }
    
    if (lowerContent.includes('property') || lowerContent.includes('address')) {
      return {
        type: 'property_document',
        confidence: 0.7,
        categories: ['property', 'real_estate'],
        metadata: { classifierVersion: '1.0' }
      };
    }
    
    if (lowerContent.includes('owner') || lowerContent.includes('resident')) {
      return {
        type: 'owner_document',
        confidence: 0.7,
        categories: ['owner', 'resident'],
        metadata: { classifierVersion: '1.0' }
      };
    }
    
    return {
      type: 'unknown',
      confidence: 0.1,
      categories: ['unclassified'],
      metadata: { classifierVersion: '1.0' }
    };
  }
}

export const documentClassificationService = new DocumentClassificationService();
