
import { supabase } from '@/integrations/supabase/client';
import { StorageResult, StorageUrlStrategy } from './types';
import { detectBrowser, getChromeSpecificConfig } from '@/utils/browser-utils';

/**
 * Chrome-specific storage service for PDF handling
 */
export class ChromeStorageService {
  private static instance: ChromeStorageService;
  private browser = detectBrowser();
  private chromeConfig = getChromeSpecificConfig();

  private constructor() {}

  static getInstance(): ChromeStorageService {
    if (!ChromeStorageService.instance) {
      ChromeStorageService.instance = new ChromeStorageService();
    }
    return ChromeStorageService.instance;
  }

  /**
   * Generate Chrome-optimized URL strategies
   */
  async generateChromeOptimizedStrategies(originalUrl: string): Promise<StorageResult<StorageUrlStrategy[]>> {
    try {
      const strategies: StorageUrlStrategy[] = [];
      const { bucket, path } = this.parseStorageUrl(originalUrl);

      console.log('🔧 Generating Chrome-optimized strategies for:', originalUrl);

      if (this.browser.isChrome && bucket && path) {
        // Strategy 1: Signed URL with longer expiry for Chrome
        try {
          const { data: signedData, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, 7200); // 2 hours for Chrome compatibility

          if (signedData?.signedUrl && !error) {
            strategies.push({
              type: 'signed',
              url: signedData.signedUrl,
              isPublic: false,
              isSigned: true,
              expiresAt: new Date(Date.now() + 7200 * 1000)
            });
            console.log('✅ Chrome signed URL generated');
          }
        } catch (error) {
          console.warn('⚠️ Chrome signed URL generation failed:', error);
        }

        // Strategy 2: Direct download URL for Chrome
        try {
          const { data: downloadData } = supabase.storage
            .from(bucket)
            .getPublicUrl(path, {
              download: true
            });

          if (downloadData?.publicUrl) {
            strategies.push({
              type: 'public',
              url: downloadData.publicUrl,
              isPublic: true,
              isSigned: false
            });
            console.log('✅ Chrome download URL generated');
          }
        } catch (error) {
          console.warn('⚠️ Chrome download URL generation failed:', error);
        }

        // Strategy 3: Transform URL for Chrome compatibility
        const transformedUrl = this.transformUrlForChrome(originalUrl);
        if (transformedUrl !== originalUrl) {
          strategies.push({
            type: 'public',
            url: transformedUrl,
            isPublic: true,
            isSigned: false
          });
          console.log('✅ Chrome transformed URL generated');
        }
      }

      // Fallback: Original URL
      strategies.push({
        type: 'direct',
        url: originalUrl,
        isPublic: true,
        isSigned: false
      });

      return { success: true, data: strategies };
    } catch (error) {
      console.error('❌ Chrome strategy generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate Chrome strategies'
      };
    }
  }

  /**
   * Transform URL for better Chrome compatibility
   */
  private transformUrlForChrome(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Add Chrome-specific query parameters
      urlObj.searchParams.set('chrome', '1');
      urlObj.searchParams.set('t', Date.now().toString());
      
      // Remove problematic parameters that Chrome might block
      urlObj.searchParams.delete('token');
      
      return urlObj.toString();
    } catch (error) {
      console.warn('URL transformation failed:', error);
      return url;
    }
  }

  /**
   * Test URL accessibility specifically for Chrome
   */
  async testChromeAccessibility(url: string): Promise<boolean> {
    if (!this.browser.isChrome) {
      return true; // Not Chrome, assume accessible
    }

    try {
      console.log('🧪 Testing Chrome PDF accessibility:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.chromeConfig?.loadTimeout || 10000);

      const response = await fetch(url, {
        method: 'HEAD',
        mode: this.chromeConfig?.corsMode || 'no-cors',
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Accept': 'application/pdf,*/*',
          'User-Agent': navigator.userAgent
        }
      });

      clearTimeout(timeoutId);
      
      const accessible = response.ok || response.type === 'opaque';
      console.log('🧪 Chrome accessibility test result:', accessible);
      
      return accessible;
    } catch (error) {
      console.warn('🧪 Chrome accessibility test failed (might still be accessible):', error);
      // For Chrome, CORS errors don't necessarily mean inaccessible
      return true;
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
}

export const chromeStorageService = ChromeStorageService.getInstance();
