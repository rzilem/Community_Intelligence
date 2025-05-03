
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Service for handling file uploads to Supabase storage
 */
export class FileUploadService {
  private supabase: any;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  /**
   * Uploads a file to the Supabase storage bucket
   * @param filename Original filename
   * @param contentBuffer File content as Uint8Array
   * @param contentType MIME type of the file
   * @param bucket Storage bucket name (default: 'invoices')
   * @returns Object with upload details including publicUrl and normalizedFilename
   */
  async uploadFile(
    filename: string, 
    contentBuffer: Uint8Array, 
    contentType: string,
    bucket: string = 'invoices'
  ): Promise<{ 
    publicUrl: string; 
    normalizedFilename: string;
    error?: string;
  }> {
    try {
      // Generate safe filename with timestamp to avoid collisions
      const timestamp = new Date().toISOString().replace(/[:.]/g, '');
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageFilename = `invoice_${timestamp}_${safeFilename}`;
      const normalizedFilename = storageFilename.replace(/\/+/g, '');
      
      console.log(`Uploading ${filename} to ${bucket} bucket as ${normalizedFilename}`);
      
      // Upload to Supabase
      const uploadResult = await this.supabase.storage.from(bucket).upload(
        normalizedFilename, 
        contentBuffer, 
        {
          contentType: contentType,
          upsert: true,
          duplex: 'full'
        }
      );

      if (uploadResult.error) {
        console.error(`Failed to upload document ${filename}:`, uploadResult.error);
        return { 
          publicUrl: '', 
          normalizedFilename: '',
          error: uploadResult.error.message 
        };
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage.from(bucket).getPublicUrl(normalizedFilename);
      if (!urlData?.publicUrl) {
        console.error(`Failed to get public URL for ${filename}`);
        return { 
          publicUrl: '', 
          normalizedFilename,
          error: 'Failed to get public URL' 
        };
      }

      // Normalize URL (fix double slashes in path)
      let publicUrl = urlData.publicUrl;
      publicUrl = publicUrl.replace(/([^:])\/\/+/g, '$1/');
      
      console.log(`Document uploaded: ${filename}`, {
        publicUrl,
        contentType,
        bufferLength: contentBuffer.byteLength
      });
      
      return { publicUrl, normalizedFilename };
    } catch (error: any) {
      console.error(`Error uploading file ${filename}:`, error);
      return {
        publicUrl: '',
        normalizedFilename: '',
        error: error.message
      };
    }
  }
  
  /**
   * Fetches a file from its public URL
   * @param publicUrl Public URL of the file
   * @returns File content as Uint8Array or null if fetch failed
   */
  async fetchFile(publicUrl: string): Promise<Uint8Array | null> {
    try {
      const response = await fetch(publicUrl, { method: 'GET' });
      if (!response.ok) {
        console.error(`Failed to fetch file from ${publicUrl}: ${response.status}`);
        return null;
      }
      return new Uint8Array(await response.arrayBuffer());
    } catch (error: any) {
      console.error(`Error fetching file from ${publicUrl}:`, error);
      return null;
    }
  }
  
  /**
   * Deletes a file from storage
   * @param filename Filename in the storage bucket
   * @param bucket Storage bucket name (default: 'invoices')
   * @returns Success indicator
   */
  async deleteFile(filename: string, bucket: string = 'invoices'): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage.from(bucket).remove([filename]);
      if (error) {
        console.error(`Failed to delete file ${filename}:`, error);
        return false;
      }
      return true;
    } catch (error: any) {
      console.error(`Error deleting file ${filename}:`, error);
      return false;
    }
  }
}
