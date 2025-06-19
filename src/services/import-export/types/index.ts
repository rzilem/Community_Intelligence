
// Re-export all types from domain-specific files with conflict resolution
// Use type-only exports for isolatedModules compliance

export type * from './core-types';

// Re-export processing types with aliases to avoid conflicts
export type {
  OCROptions as ProcessingOCROptions,
  ProcessingResult as ProcessingResultExtended
} from './processing-types';

export type * from './document-types';
export type * from './ai-ml-types';
export type * from './enterprise-types';
