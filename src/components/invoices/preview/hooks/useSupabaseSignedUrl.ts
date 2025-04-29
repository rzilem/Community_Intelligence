
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook for managing Supabase signed URLs for documents
 * @returns Functions for creating and managing signed URLs
 */
export function useSupabaseSignedUrl() {
  /**
   * Creates a signed URL for a file in Supabase storage
   * @param filePathOrUrl - The file path or URL of the file
   * @param isStoragePath - Whether the path is a storage path
   * @returns A Promise resolving to the signed URL
   */
  const createSignedUrl = async (filePathOrUrl: string, isStoragePath: boolean = false): Promise<string> => {
    try {
      // Extract filename from URL or path
      let filename = filePathOrUrl;
      
      if (!isStoragePath && filePathOrUrl.includes('http')) {
        try {
          const url = new URL(filePathOrUrl);
          filename = url.pathname.split('/').pop() || '';
        } catch (e) {
          console.error('Error parsing URL:', e);
        }
      }
      
      // Determine if the filename includes storage path prefix
      const storageFilename = filename.startsWith('invoices/') 
        ? filename.substring('invoices/'.length) // Remove the path prefix
        : filename;
        
      console.log('Storage path for signed URL:', storageFilename);
      
      const { data: signedData, error: signedError } = await supabase.storage
        .from('invoices')
        .createSignedUrl(storageFilename, 3600); // Signed URL valid for 1 hour

      if (signedError) {
        throw new Error(`Failed to generate signed URL: ${signedError.message}`);
      }
      
      console.log('Generated new signed URL:', signedData.signedUrl);
      return signedData.signedUrl;
    } catch (err: any) {
      console.error('Error creating signed URL:', err);
      throw new Error(err.message || 'Failed to generate PDF URL');
    }
  };

  return {
    createSignedUrl
  };
}
