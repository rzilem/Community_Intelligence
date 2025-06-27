
import { StorageResult, StorageDebugInfo } from './types';
import { detectBrowser, logBrowserDiagnostics } from '@/utils/browser-utils';
import { chromeStorageService } from './ChromeStorageService';

/**
 * Service for debugging storage URLs and PDF access issues
 */
export class StorageDebugService {
  private static instance: StorageDebugService;

  private constructor() {}

  static getInstance(): StorageDebugService {
    if (!StorageDebugService.instance) {
      StorageDebugService.instance = new StorageDebugService();
    }
    return StorageDebugService.instance;
  }

  /**
   * Generate comprehensive debug information for storage URLs
   */
  async generateDebugInfo(originalUrl: string): Promise<StorageResult<StorageDebugInfo>> {
    try {
      const browser = detectBrowser();
      const debugInfo: StorageDebugInfo = {
        originalUrl,
        isAccessible: false,
        strategies: [],
        errors: [],
        lastChecked: new Date()
      };

      // Parse URL structure
      const { bucket, path } = this.parseStorageUrl(originalUrl);
      debugInfo.bucketName = bucket;
      debugInfo.filePath = path;

      // Test original URL accessibility
      try {
        const isAccessible = browser.isChrome 
          ? await chromeStorageService.testChromeAccessibility(originalUrl)
          : await this.testBasicAccessibility(originalUrl);
        debugInfo.isAccessible = isAccessible;
      } catch (error) {
        debugInfo.errors.push(`Accessibility test failed: ${error}`);
      }

      // Generate browser-specific strategies
      if (browser.isChrome) {
        const chromeResult = await chromeStorageService.generateChromeOptimizedStrategies(originalUrl);
        if (chromeResult.success && chromeResult.data) {
          debugInfo.strategies = chromeResult.data;
        } else {
          debugInfo.errors.push(`Chrome strategy generation failed: ${chromeResult.error}`);
        }
      }

      // Log debug information
      this.logDebugInfo(debugInfo, browser);

      return { success: true, data: debugInfo };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Debug info generation failed'
      };
    }
  }

  private async testBasicAccessibility(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch (error) {
      console.warn('Basic accessibility test failed:', error);
      return false;
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

  private logDebugInfo(debugInfo: StorageDebugInfo, browser: any) {
    console.group('🔍 Storage Debug Information');
    console.log('Browser:', browser);
    console.log('Original URL:', debugInfo.originalUrl);
    console.log('Bucket:', debugInfo.bucketName);
    console.log('File Path:', debugInfo.filePath);
    console.log('Accessible:', debugInfo.isAccessible);
    console.log('Strategies:', debugInfo.strategies);
    console.log('Errors:', debugInfo.errors);
    console.groupEnd();
  }
}

export const storageDebugService = StorageDebugService.getInstance();
