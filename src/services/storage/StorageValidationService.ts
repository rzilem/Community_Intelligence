
import { supabase } from '@/integrations/supabase/client';
import { StorageResult } from './types';

/**
 * Service for validating storage configuration and accessibility
 */
export class StorageValidationService {
  private static instance: StorageValidationService;

  private constructor() {}

  static getInstance(): StorageValidationService {
    if (!StorageValidationService.instance) {
      StorageValidationService.instance = new StorageValidationService();
    }
    return StorageValidationService.instance;
  }

  /**
   * Validate if a storage bucket exists and is accessible
   */
  async validateBucket(bucketName: string): Promise<StorageResult<boolean>> {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.warn(`Storage validation error: ${error.message}`);
        return { 
          success: false, 
          error: `Storage not accessible: ${error.message}`,
          data: false 
        };
      }

      const bucketExists = data?.some(bucket => bucket.id === bucketName) || false;
      
      return { 
        success: true, 
        data: bucketExists 
      };
    } catch (error) {
      console.warn('Storage validation failed:', error);
      return { 
        success: false, 
        error: 'Storage service not available',
        data: false 
      };
    }
  }

  /**
   * Test if a URL is directly accessible
   */
  async validateDirectUrl(url: string): Promise<StorageResult<boolean>> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      return {
        success: true,
        data: response.ok
      };
    } catch (error) {
      return {
        success: true,
        data: false // URL might still work in iframe despite CORS
      };
    }
  }

  /**
   * Get storage health status
   */
  async getStorageHealth(): Promise<StorageResult<{
    storageAvailable: boolean;
    invoicesBucketExists: boolean;
    canCreateSignedUrls: boolean;
  }>> {
    try {
      const bucketValidation = await this.validateBucket('invoices');
      
      // Test signed URL creation if bucket exists
      let canCreateSignedUrls = false;
      if (bucketValidation.data) {
        try {
          await supabase.storage.from('invoices').createSignedUrl('test', 60);
          canCreateSignedUrls = true;
        } catch (error) {
          console.warn('Signed URL test failed:', error);
        }
      }

      return {
        success: true,
        data: {
          storageAvailable: bucketValidation.success,
          invoicesBucketExists: bucketValidation.data || false,
          canCreateSignedUrls
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Storage health check failed',
        data: {
          storageAvailable: false,
          invoicesBucketExists: false,
          canCreateSignedUrls: false
        }
      };
    }
  }
}

export const storageValidationService = StorageValidationService.getInstance();
