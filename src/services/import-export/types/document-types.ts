
// Document storage import types

export interface DocumentStorageResult {
  success: boolean;
  associationName: string;
  associationId: string;
  documentsImported: number;
  documentsSkipped: number;
  totalFiles: number;
  createdProperties: Array<{
    unitNumber: string;
    address: string;
    id: string;
  }>;
  createdOwners: Array<{
    name: string;
    email: string;
    id: string;
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

export interface DocumentUploadInfo {
  file: File;
  folderPath: string;
  unitNumber?: string;
  address?: string;
  category?: string;
}

export interface AssociationInfo {
  id: string;
  name: string;
  created: boolean;
}

export interface PropertyCreationResult {
  property: any;
  created: boolean;
  error?: string;
}
