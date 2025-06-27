
/**
 * Common types for storage services
 */

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface StorageUrlStrategy {
  type: 'public' | 'signed' | 'direct';
  url: string;
  isPublic: boolean;
  isSigned: boolean;
  expiresAt?: Date;
  error?: string;
}

export interface StorageDebugInfo {
  originalUrl: string;
  bucketName?: string;
  filePath?: string;
  isAccessible: boolean;
  strategies: StorageUrlStrategy[];
  errors: string[];
  lastChecked: Date;
}

export interface StorageValidationResult {
  isValid: boolean;
  isAccessible: boolean;
  contentType?: string;
  error?: string;
  checkedAt: Date;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  expiresAt: Date;
}
