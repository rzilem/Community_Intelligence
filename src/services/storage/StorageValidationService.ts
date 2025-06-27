
import { StorageResult, StorageValidationResult, CacheEntry } from './types';

/**
 * Service for validating storage URLs and testing accessibility
 */
export class StorageValidationService {
  private static instance: StorageValidationService;
  private cache = new Map<string, CacheEntry<StorageValidationResult>>();
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes for validation cache

  private constructor() {}

  static getInstance(): StorageValidationService {
    if (!StorageValidationService.instance) {
      StorageValidationService.instance = new StorageValidationService();
    }
    return StorageValidationService.instance;
  }

  /**
   * Test URL accessibility with caching
   */
  async testUrlAccess(url: string): Promise<StorageResult<StorageValidationResult>> {
    try {
      // Check cache first
      const cached = this.getCachedValidation(url);
      if (cached) {
        return { success: true, data: cached };
      }

      const result = await this.performValidation(url);
      
      // Cache the result
      this.setCachedValidation(url, result);
      
      return { success: true, data: result };
    } catch (error) {
      const result: StorageValidationResult = {
        isValid: false,
        isAccessible: false,
        error: error instanceof Error ? error.message : 'Validation failed',
        checkedAt: new Date()
      };
      
      return { success: false, data: result, error: result.error };
    }
  }

  /**
   * Batch validate multiple URLs
   */
  async batchValidate(urls: string[]): Promise<StorageResult<Map<string, StorageValidationResult>>> {
    try {
      const results = new Map<string, StorageValidationResult>();
      
      // Process URLs in parallel with a limit
      const BATCH_SIZE = 5;
      for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        const batch = urls.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (url) => {
          const result = await this.testUrlAccess(url);
          return { url, result: result.data! };
        });
        
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(({ url, result }) => {
          results.set(url, result);
        });
      }
      
      return { success: true, data: results };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch validation failed'
      };
    }
  }

  private async performValidation(url: string): Promise<StorageValidationResult> {
    const checkedAt = new Date();
    
    try {
      // Use HEAD request for efficiency
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Accept': 'application/pdf,*/*',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        return {
          isValid: true,
          isAccessible: true,
          contentType: contentType || undefined,
          checkedAt
        };
      } else {
        return {
          isValid: false,
          isAccessible: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          checkedAt
        };
      }
    } catch (error) {
      // Handle timeout and other errors
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          isValid: false,
          isAccessible: false,
          error: 'Request timeout',
          checkedAt
        };
      }
      
      // CORS errors are common but don't necessarily mean the URL is inaccessible
      if (error instanceof Error && error.message.includes('CORS')) {
        return {
          isValid: true, // Assume valid if we can't test due to CORS
          isAccessible: true,
          error: 'CORS blocked (but likely accessible)',
          checkedAt
        };
      }
      
      return {
        isValid: false,
        isAccessible: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        checkedAt
      };
    }
  }

  private getCachedValidation(url: string): StorageValidationResult | null {
    const cached = this.cache.get(url);
    if (cached && cached.expiresAt > new Date()) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(url);
    }
    
    return null;
  }

  private setCachedValidation(url: string, result: StorageValidationResult): void {
    const expiresAt = new Date(Date.now() + this.CACHE_TTL);
    this.cache.set(url, {
      data: result,
      timestamp: new Date(),
      expiresAt
    });
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = new Date();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const storageValidationService = StorageValidationService.getInstance();
