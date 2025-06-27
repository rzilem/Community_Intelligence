
import { supabase } from '@/integrations/supabase/client';
import { StorageResult, StorageUrlStrategy, CacheEntry } from './types';
import { storageValidationService } from './StorageValidationService';

/**
 * Enhanced service for generating multiple URL strategies for PDF access
 */
export class StorageUrlService {
  private static instance: StorageUrlService;
  private cache = new Map<string, CacheEntry<StorageUrlStrategy[]>>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): StorageUrlService {
    if (!StorageUrlService.instance) {
      StorageUrlService.instance = new StorageUrlService();
    }
    return StorageUrlService.instance;
  }

  /**
   * Generate multiple URL strategies with fallback support
   */
  async generateUrlStrategies(originalUrl: string): Promise<StorageResult<StorageUrlStrategy[]>> {
    try {
      // Check cache first
      const cached = this.getFromCache(originalUrl);
      if (cached) {
        return { success: true, data: cached };
      }

      const strategies: StorageUrlStrategy[] = [];
      
      // Strategy 1: Direct URL (always first as fallback)
      strategies.push({
        type: 'direct',
        url: originalUrl,
        isPublic: true,
        isSigned: false
      });

      // Check if storage is available
      const storageHealth = await storageValidationService.getStorageHealth();
      
      if (storageHealth.success && storageHealth.data?.storageAvailable) {
        const { bucket, path } = this.parseStorageUrl(originalUrl);
        
        if (bucket && path && storageHealth.data.invoicesBucketExists) {
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
            console.warn('Public URL generation failed:', error);
          }

          // Strategy 3: Signed URL (if available)
          if (storageHealth.data.canCreateSignedUrls) {
            try {
              const { data: signedData, error } = await supabase.storage
                .from(bucket)
                .createSignedUrl(path, 3600); // 1 hour

              if (signedData?.signedUrl && !error) {
                strategies.push({
                  type: 'signed',
                  url: signedData.signedUrl,
                  isPublic: false,
                  isSigned: true,
                  expiresAt: new Date(Date.now() + 3600 * 1000)
                });
              }
            } catch (error) {
              console.warn('Signed URL generation failed:', error);
            }
          }
        }
      }

      // Cache the result
      this.setCache(originalUrl, strategies);

      return { success: true, data: strategies };
    } catch (error) {
      console.error('URL strategy generation failed:', error);
      
      // Return fallback strategy
      return {
        success: true,
        data: [{
          type: 'direct',
          url: originalUrl,
          isPublic: true,
          isSigned: false
        }]
      };
    }
  }

  private parseStorageUrl(url: string): { bucket?: string; path?: string } {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      
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

  private getFromCache(key: string): StorageUrlStrategy[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt.getTime()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache(key: string, data: StorageUrlStrategy[]): void {
    const entry: CacheEntry<StorageUrlStrategy[]> = {
      data,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + this.cacheTimeout)
    };
    this.cache.set(key, entry);
  }

  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt.getTime()) {
        this.cache.delete(key);
      }
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const storageUrlService = StorageUrlService.getInstance();
