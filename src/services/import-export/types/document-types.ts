
export interface DocumentStorageResult {
  success: boolean;
  associationId: string;
  associationName: string;
  documentsImported: number;
  documentsSkipped: number;
  totalFiles: number;
  createdProperties: Array<{
    id: string;
    address: string;
    unitNumber: string;
  }>;
  createdOwners: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
  }>;
  errors: string[];
  warnings: string[];
  processingTime: number;
}

export interface ProcessingProgress {
  stage: 'analyzing' | 'creating_properties' | 'uploading' | 'complete' | 'error';
  message: string;
  progress: number;
  filesProcessed: number;
  totalFiles: number;
  unitsProcessed: number;
  totalUnits: number;
  canResume?: boolean;
}

export interface ProcessedDocument {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  propertyId?: string;
  unitNumber?: string;
  category?: string;
}
