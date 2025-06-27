
import { supabase } from '@/integrations/supabase/client';
import { StorageResult, StorageUrlStrategy, CacheEntry } from './types';

/**
 * Service for generating and managing storage URL strategies
 */
export class StorageUrlService {
  private static instance: StorageUrlService;
  private cache = new Map<string, CacheEntry<StorageUrlStrategy[]>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): StorageUrlService {
    if (!StorageUrlService.instance) {
      StorageUrlService.instance = new StorageUrlService();
    }
    return StorageUrlService.instance;
  }

  /**
   * Parse storage URL to extract bucket and path
   */
  parseStorageUrl(url: string): { bucket?: string; path?: string } {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      
      // Format: /storage/v1/object/public/bucket/path/to/file
      if (pathSegments.includes('storage') && pathSegments.includes('object')) {
        const storageIndex = pathSegments.indexOf('storage');
        const objectIndex = pathSegments.indexOf('object');
        
        if (objectIndex + 2 < pathSegments.length) {
          const bucket = pathSegments[objectIndex + 2];
          const path = pathSegments.slice(objectIndex + 3).join('/');
          return { bucket, path };
        }
      }
      
      return {};
    } catch (error) {
      console.error('Error parsing storage URL:', error);
      return {};
    }
  }

  /**
   * Generate multiple URL strategies with caching
   */
  async generateUrlStrategies(originalUrl: string): Promise<StorageResult<StorageUrlStrategy[]>> {
    try {
      // Check cache first
      const cached = this.getCachedStrategies(originalUrl);
      if (cached) {
        return { success: true, data: cached };
      }

      const strategies: StorageUrlStrategy[] = [];
      const { bucket, path } = this.parseStorageUrl(originalUrl);

      // Strategy 1: Direct/Original URL
      strategies.push({
        type: 'direct',
        url: originalUrl,
        isPublic: true,
        isSigned: false
      });

      if (bucket && path) {
        // Strategy 2: Fresh public URL
        try {
          const { data: publicData } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);
          
          if (publicData?.publicUrl && publicData.publicUrl !== originalUrl) {
            strategies.push({
              type: 'public',
              url: publicData.publicUrl,
              isPublic: true,
              isSigned: false
            });
          }
        } catch (error) {
          console.warn('Failed to generate public URL:', error);
        }

        // Strategy 3: Signed URL (1 hour expiry)
        try {
          const { data: signedData, error: signedError } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, 3600);

          if (signedData?.signedUrl && !signedError) {
            const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour from now
            strategies.push({
              type: 'signed',
              url: signedData.signedUrl,
              isPublic: false,
              isSigned: true,
              expiresAt
            });
          } else if (signedError) {
            strategies.push({
              type: 'signed',
              url: originalUrl,
              isPublic: false,
              isSigned: true,
              error: signedError.message
            });
          }
        } catch (error) {
          console.warn('Failed to generate signed URL:', error);
        }
      }

      // Cache the results
      this.setCachedStrategies(originalUrl, strategies);

      return { success: true, data: strategies };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate URL strategies'
      };
    }
  }

  /**
   * Get the best available strategy
   */
  getBestStrategy(strategies: StorageUrlStrategy[]): StorageUrlStrategy | null {
    // Prefer signed URLs, then public URLs, then direct
    const preference = ['signed', 'public', 'direct'] as const;
    
    for (const type of preference) {
      const strategy = strategies.find(s => s.type === type && !s.error);
      if (strategy) {
        // Check if signed URL is not expired
        if (strategy.type === 'signed' && strategy.expiresAt && strategy.expiresAt < new Date()) {
          continue;
        }
        return strategy;
      }
    }
    
    return strategies[0] || null;
  }

  private getCachedStrategies(url: string): StorageUrlStrategy[] | null {
    const cached = this.cache.get(url);
    if (cached && cached.expiresAt > new Date()) {
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(url);
    }
    
    return null;
  }

  private setCachedStrategies(url: string, strategies: StorageUrlStrategy[]): void {
    const expiresAt = new Date(Date.now() + this.CACHE_TTL);
    this.cache.set(url, {
      data: strategies,
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
export const storageUrlService = StorageUrlService.getInstance();
