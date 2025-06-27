
import { storageUrlService } from './StorageUrlService';
import { storageValidationService } from './StorageValidationService';
import { StorageResult, StorageDebugInfo } from './types';

/**
 * Service for generating comprehensive debug information
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
   * Generate comprehensive debug information for a storage URL
   */
  async generateDebugInfo(originalUrl: string): Promise<StorageResult<StorageDebugInfo>> {
    try {
      const errors: string[] = [];
      
      // Parse URL components
      const { bucket, path } = storageUrlService.parseStorageUrl(originalUrl);
      
      if (!bucket || !path) {
        errors.push('Could not parse bucket and file path from URL');
      }

      // Generate URL strategies
      const strategiesResult = await storageUrlService.generateUrlStrategies(originalUrl);
      const strategies = strategiesResult.data || [];
      
      if (!strategiesResult.success) {
        errors.push(`Strategy generation failed: ${strategiesResult.error}`);
      }

      // Test accessibility of original URL
      const validationResult = await storageValidationService.testUrlAccess(originalUrl);
      const isAccessible = validationResult.data?.isAccessible || false;
      
      if (!validationResult.success) {
        errors.push(`Accessibility test failed: ${validationResult.error}`);
      }

      const debugInfo: StorageDebugInfo = {
        originalUrl,
        bucketName: bucket,
        filePath: path,
        isAccessible,
        strategies,
        errors,
        lastChecked: new Date()
      };

      return { success: true, data: debugInfo };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate debug info'
      };
    }
  }

  /**
   * Generate a formatted debug report
   */
  async generateDebugReport(originalUrl: string): Promise<StorageResult<string>> {
    const debugResult = await this.generateDebugInfo(originalUrl);
    
    if (!debugResult.success || !debugResult.data) {
      return {
        success: false,
        error: debugResult.error || 'Failed to generate debug info'
      };
    }

    const debug = debugResult.data;
    
    const report = [
      '=== Storage Debug Report ===',
      `URL: ${debug.originalUrl}`,
      `Bucket: ${debug.bucketName || 'N/A'}`,
      `Path: ${debug.filePath || 'N/A'}`,
      `Accessible: ${debug.isAccessible ? 'Yes' : 'No'}`,
      `Checked: ${debug.lastChecked.toISOString()}`,
      '',
      '=== Available Strategies ===',
      ...debug.strategies.map(strategy => 
        `${strategy.type.toUpperCase()}: ${strategy.url}${strategy.error ? ` (Error: ${strategy.error})` : ''}`
      ),
      '',
      '=== Errors ===',
      ...debug.errors.map(error => `- ${error}`),
      ''
    ].join('\n');

    return { success: true, data: report };
  }

  /**
   * Get troubleshooting suggestions based on debug info
   */
  getTroubleshootingSuggestions(debugInfo: StorageDebugInfo): string[] {
    const suggestions: string[] = [];

    if (!debugInfo.isAccessible) {
      suggestions.push('File may not exist or has been moved/deleted');
      suggestions.push('Check RLS policies on the storage bucket');
      suggestions.push('Verify bucket permissions and public access settings');
    }

    if (debugInfo.errors.length > 0) {
      suggestions.push('Review the error messages above for specific issues');
    }

    if (debugInfo.strategies.length === 0) {
      suggestions.push('No URL strategies could be generated - check URL format');
    }

    const hasSignedStrategy = debugInfo.strategies.some(s => s.type === 'signed' && !s.error);
    if (!hasSignedStrategy) {
      suggestions.push('Try generating a signed URL for temporary access');
    }

    const hasPublicStrategy = debugInfo.strategies.some(s => s.type === 'public' && !s.error);
    if (!hasPublicStrategy) {
      suggestions.push('Check if the bucket is configured as public if needed');
    }

    if (suggestions.length === 0) {
      suggestions.push('URL appears to be correctly configured');
    }

    return suggestions;
  }
}

// Export singleton instance
export const storageDebugService = StorageDebugService.getInstance();
