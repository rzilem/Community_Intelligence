
import { decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

/**
 * Handles file storage operations for invoice attachments
 */
export class FileStorageService {
  private supabase: any;
  private logger: any;
  
  constructor(supabase: any, logger: any) {
    this.supabase = supabase;
    this.logger = logger;
  }

  async processAttachment(requestId: string, attachment: any): Promise<string | null> {
    if (!attachment) return null;
    
    console.log(`[${requestId}] Processing document attachment: ${attachment.filename}`);
    await this.logger.logInfo(requestId, 'Processing document attachment', { filename: attachment.filename });

    const fileExt = attachment.filename.substring(attachment.filename.lastIndexOf('.'));
    const timestamp = new Date().toISOString().replace(/[:.]/g, '');
    const fileName = `invoice_${timestamp}${fileExt}`;
    const normalizedFileName = fileName.replace(/\/+/g, '');

    try {
      let content: Uint8Array;
      if (typeof attachment.content === 'string') {
        const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(attachment.content.trim());
        if (!isBase64) {
          throw new Error(`Attachment content for ${attachment.filename} is not base64 encoded`);
        }
        const base64Content = attachment.content
          .replace(/^data:application\/pdf;base64,/, '')
          .replace(/\s/g, '');
        content = decode(base64Content);
      } else if (attachment.content instanceof Blob) {
        content = new Uint8Array(await attachment.content.arrayBuffer());
      } else {
        content = attachment.content;
      }

      if (attachment.contentType === 'application/pdf') {
        const pdfHeader = Array.from(content.slice(0, 4)).map(b => b.toString(16)).join('');
        if (pdfHeader !== '25504446') {
          throw new Error(`Invalid PDF header for ${attachment.filename}: ${pdfHeader}`);
        }
      }

      const { error: uploadError } = await this.supabase.storage
        .from('invoices')
        .upload(normalizedFileName, content, {
          contentType: attachment.contentType,
          upsert: true
        });

      if (uploadError) {
        await this.logger.logError(requestId, 'Error uploading attachment', uploadError);
        return null;
      } 
      
      const { data: urlData } = this.supabase.storage.from('invoices').getPublicUrl(normalizedFileName);
      let pdfUrl = urlData.publicUrl;
      pdfUrl = pdfUrl.replace(/([^:])\/\/+/g, '$1/');
      
      await this.logger.logInfo(requestId, 'Attachment uploaded successfully', { pdfUrl });
      
      // Validate the uploaded file
      try {
        await this.validateUploadedFile(requestId, pdfUrl, content, attachment, normalizedFileName);
        return pdfUrl;
      } catch (validationError) {
        await this.logger.logError(requestId, 'Error validating uploaded file', validationError);
        return null;
      }
    } catch (storageError) {
      await this.logger.logError(requestId, 'Storage error', storageError);
      return null;
    }
  }

  private async validateUploadedFile(
    requestId: string, 
    pdfUrl: string, 
    content: Uint8Array, 
    attachment: any,
    normalizedFileName: string
  ): Promise<void> {
    const response = await fetch(pdfUrl, { method: 'GET' });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch uploaded file: ${response.status}`);
    }
    
    const uploadedBuffer = new Uint8Array(await response.arrayBuffer());
    const uploadedHeader = Array.from(uploadedBuffer.slice(0, 4)).map(b => b.toString(16)).join('');
    
    if (attachment.contentType === 'application/pdf' && uploadedHeader !== '25504446') {
      console.error(`Uploaded file corrupted: ${pdfUrl}`, { uploadedHeader });
      await this.supabase.storage.from('invoices').remove([normalizedFileName]);
      throw new Error(`Uploaded file is not a valid PDF`);
    }
    
    if (uploadedBuffer.byteLength !== content.byteLength) {
      console.error(`Uploaded file size mismatch: ${pdfUrl}`, {
        originalSize: content.byteLength,
        uploadedSize: uploadedBuffer.byteLength
      });
      await this.supabase.storage.from('invoices').remove([normalizedFileName]);
      throw new Error(`Uploaded file size does not match original`);
    }
  }
}
