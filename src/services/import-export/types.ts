
// This file now re-exports all types from the organized structure
// This maintains backward compatibility while providing better organization

export * from './types/core-types';
export * from './types/processing-types';
export * from './types/document-types';
export * from './types/ai-ml-types';
export * from './types/enterprise-types';

// Export specific types that are commonly used with aliases to avoid conflicts
export type { 
  ProcessedDocument, 
  AdvancedOCRResult, 
  OCROptions as DocumentOCROptions,
  ProcessingResult as DocumentProcessingResult
} from './types/document-types';
