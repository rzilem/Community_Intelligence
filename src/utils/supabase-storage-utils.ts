
import { supabase } from '@/integrations/supabase/client';

export interface StorageUrlResult {
  url: string;
  isPublic: boolean;
  isSigned: boolean;
  error?: string;
}

export interface StorageDebugInfo {
  originalUrl: string;
  publicUrl?: string;
  signedUrl?: string;
  bucketName?: string;
  filePath?: string;
  isAccessible: boolean;
  errors: string[];
}

/**
 * Extract bucket and file path from a Supabase storage URL
 */
export const parseStorageUrl = (url: string): { bucket?: string; path?: string } => {
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
};

/**
 * Generate multiple URL strategies for PDF access
 */
export const generatePdfUrls = async (originalUrl: string): Promise<StorageUrlResult[]> => {
  const results: StorageUrlResult[] = [];
  const { bucket, path } = parseStorageUrl(originalUrl);

  // Strategy 1: Use original URL (direct public access)
  results.push({
    url: originalUrl,
    isPublic: true,
    isSigned: false
  });

  // Strategy 2: Generate fresh public URL if we can parse bucket/path
  if (bucket && path) {
    try {
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      
      if (publicData?.publicUrl && publicData.publicUrl !== originalUrl) {
        results.push({
          url: publicData.publicUrl,
          isPublic: true,
          isSigned: false
        });
      }
    } catch (error) {
      console.warn('Failed to generate public URL:', error);
    }

    // Strategy 3: Generate signed URL (1 hour expiry)
    try {
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600); // 1 hour

      if (signedData?.signedUrl && !signedError) {
        results.push({
          url: signedData.signedUrl,
          isPublic: false,
          isSigned: true
        });
      } else if (signedError) {
        results.push({
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

  return results;
};

/**
 * Test URL accessibility
 */
export const testUrlAccess = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // Avoid CORS issues for testing
    });
    return response.ok;
  } catch (error) {
    // CORS errors are expected, but the URL might still work in iframe
    return true; // Assume accessible if we can't test due to CORS
  }
};

/**
 * Generate comprehensive debug information
 */
export const generateStorageDebugInfo = async (originalUrl: string): Promise<StorageDebugInfo> => {
  const debugInfo: StorageDebugInfo = {
    originalUrl,
    isAccessible: false,
    errors: []
  };

  const { bucket, path } = parseStorageUrl(originalUrl);
  debugInfo.bucketName = bucket;
  debugInfo.filePath = path;

  if (bucket && path) {
    // Test public URL generation
    try {
      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      debugInfo.publicUrl = publicData?.publicUrl;
    } catch (error) {
      debugInfo.errors.push(`Public URL generation failed: ${error}`);
    }

    // Test signed URL generation
    try {
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600);
      
      if (signedData?.signedUrl && !signedError) {
        debugInfo.signedUrl = signedData.signedUrl;
      } else if (signedError) {
        debugInfo.errors.push(`Signed URL generation failed: ${signedError.message}`);
      }
    } catch (error) {
      debugInfo.errors.push(`Signed URL generation error: ${error}`);
    }
  } else {
    debugInfo.errors.push('Could not parse bucket and file path from URL');
  }

  // Test accessibility
  debugInfo.isAccessible = await testUrlAccess(originalUrl);

  return debugInfo;
};
