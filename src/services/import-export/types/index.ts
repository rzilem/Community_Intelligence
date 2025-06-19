
// Re-export all types from domain-specific files with conflict resolution
export * from './core-types';

// Re-export processing types with aliases to avoid conflicts
export {
  OCROptions as ProcessingOCROptions,
  ProcessingResult as ProcessingResultExtended
} from './processing-types';

export * from './document-types';
export * from './ai-ml-types';
export * from './enterprise-types';
