// Mock implementation to avoid database errors
export class SmartDocumentProcessor {
  static async processDocument(documentId: string, associationId: string): Promise<any> {
    return { id: documentId, status: 'processed', result: {} };
  }

  static async getProcessingQueue(associationId: string): Promise<any[]> {
    return [];
  }

  static async updateProcessingStatus(documentId: string, status: string): Promise<void> {
    // Mock implementation
  }

  static async getProcessingResults(documentId: string): Promise<any> {
    return { id: documentId, status: 'completed', extractedData: {} };
  }
}

export const smartDocumentProcessor = SmartDocumentProcessor;