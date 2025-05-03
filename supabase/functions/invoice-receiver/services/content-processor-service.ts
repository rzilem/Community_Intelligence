import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { decodePDFContent, validatePDF, verifyUploadedPDF } from "./pdf-processor.ts";
import { ContentExtractionService } from "./content-extraction-service.ts";
import { Attachment } from "./invoice-types.ts";

/**
 * Service for processing content from attachments
 */
export class ContentProcessorService {
  private supabase;
  private contentExtractionService;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.contentExtractionService = new ContentExtractionService();
  }

  /**
   * Processes an attachment, extracts content, and uploads to storage
   * @param attachment The email attachment to process
   * @returns Processed attachment and extracted content
   */
  async processAttachment(attachment: Attachment): Promise<{
    documentContent: string;
    processedAttachment: Attachment | null;
    error?: string;
  }> {
    const filename = attachment.filename || "unnamed_attachment";
    const contentType = attachment.contentType || "application/octet-stream";
    
    console.log(`Processing attachment: ${filename} (${contentType})`);
    
    if (!attachment.content) {
      return {
        documentContent: "",
        processedAttachment: null,
        error: `No content for attachment: ${filename}`
      };
    }
    
    try {
      let contentBuffer: Uint8Array;
      let originalChecksum = "";
      let contentToProcess = attachment.content;
      
      // Convert content to Uint8Array for processing
      if (contentToProcess instanceof Blob || contentToProcess instanceof File) {
        const arrayBuffer = await contentToProcess.arrayBuffer();
        contentBuffer = new Uint8Array(arrayBuffer);
      } else if (typeof contentToProcess === 'string') {
        if (contentType === 'application/pdf') {
          const decodedBuffer = decodePDFContent(contentToProcess, filename);
          if (!decodedBuffer) {
            return {
              documentContent: "",
              processedAttachment: null,
              error: `Failed to decode PDF content for ${filename}`
            };
          }
          contentBuffer = decodedBuffer;
        } else {
          contentBuffer = new TextEncoder().encode(contentToProcess);
        }
      } else {
        return {
          documentContent: "",
          processedAttachment: null,
          error: `Unsupported content type for ${filename}: ${typeof contentToProcess}`
        };
      }
      
      // Validate PDF if applicable
      if (contentType === 'application/pdf') {
        const validationResult = validatePDF(contentBuffer, filename);
        if (!validationResult.isValid) {
          return {
            documentContent: "",
            processedAttachment: null,
            error: validationResult.errorMessage || `Invalid PDF content for ${filename}`
          };
        }
        originalChecksum = validationResult.checksum;
      }
      
      // Upload to storage
      const timestamp = new Date().toISOString().replace(/[:.]/g, '');
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageFilename = `invoice_${timestamp}_${safeFilename}`;
      const normalizedStorageFilename = storageFilename.replace(/\/+/g, '');
      
      console.log(`Uploading ${filename} to invoices bucket as ${normalizedStorageFilename}`);
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('invoices')
        .upload(normalizedStorageFilename, contentBuffer, {
          contentType,
          upsert: true
        });
      
      if (uploadError) {
        return {
          documentContent: "",
          processedAttachment: null,
          error: `Upload failed: ${uploadError.message}`
        };
      }
      
      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('invoices')
        .getPublicUrl(normalizedStorageFilename);
      
      if (!urlData?.publicUrl) {
        return {
          documentContent: "",
          processedAttachment: null,
          error: `Failed to get public URL for ${normalizedStorageFilename}`
        };
      }
      
      let publicUrl = urlData.publicUrl;
      publicUrl = publicUrl.replace(/([^:])\/\/+/g, '$1/');
      
      // Verify uploaded file
      try {
        const response = await fetch(publicUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch uploaded file: ${response.status}`);
        }
        
        const uploadedBuffer = new Uint8Array(await response.arrayBuffer());
        
        if (contentType === 'application/pdf') {
          const verificationResult = verifyUploadedPDF(
            uploadedBuffer, 
            originalChecksum, 
            contentBuffer.byteLength, 
            filename
          );
          
          if (!verificationResult.isValid) {
            await this.supabase.storage.from('invoices').remove([normalizedStorageFilename]);
            return {
              documentContent: "",
              processedAttachment: null,
              error: verificationResult.errorMessage || `Verification failed for ${filename}`
            };
          }
        }
      } catch (verifyError: any) {
        await this.supabase.storage.from('invoices').remove([normalizedStorageFilename]);
        return {
          documentContent: "",
          processedAttachment: null,
          error: `Error verifying uploaded file: ${verifyError.message}`
        };
      }
      
      // Extract text from document
      let documentContent = "";
      if (typeof contentToProcess === 'string') {
        documentContent = await this.contentExtractionService.extractContent(
          contentToProcess,
          filename,
          contentType
        );
      }
      
      // Return processed attachment
      const processedAttachment: Attachment = {
        ...attachment,
        url: publicUrl,
        filename: normalizedStorageFilename,
        source_document: safeFilename
      };
      
      return { documentContent, processedAttachment };
      
    } catch (error: any) {
      return {
        documentContent: "",
        processedAttachment: null,
        error: `Error processing attachment: ${error.message}`
      };
    }
  }
  
  /**
   * Process a fallback attachment when no valid documents were found
   * @param attachment The fallback attachment to process
   * @returns Processed attachment
   */
  async processFallbackAttachment(attachment: Attachment): Promise<{
    processedAttachment: Attachment | null;
    error?: string;
  }> {
    const filename = attachment.filename || "unnamed_attachment";
    const contentType = attachment.contentType || "application/octet-stream";
    
    console.log(`Processing fallback attachment: ${filename} (${contentType})`);
    
    try {
      // Convert content to Uint8Array
      let contentBuffer: Uint8Array;
      const contentToProcess = attachment.content;
      
      if (contentToProcess instanceof Blob || contentToProcess instanceof File) {
        const arrayBuffer = await contentToProcess.arrayBuffer();
        contentBuffer = new Uint8Array(arrayBuffer);
      } else if (typeof contentToProcess === 'string') {
        contentBuffer = new TextEncoder().encode(contentToProcess);
      } else {
        return {
          processedAttachment: null,
          error: `Unsupported content type for fallback attachment: ${typeof contentToProcess}`
        };
      }
      
      // Upload file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '');
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageFilename = `fallback_invoice_${timestamp}_${safeFilename}`;
      const normalizedStorageFilename = storageFilename.replace(/\/+/g, '');
      
      const { error: uploadError } = await this.supabase.storage
        .from('invoices')
        .upload(normalizedStorageFilename, contentBuffer, {
          contentType,
          upsert: true
        });
      
      if (uploadError) {
        return {
          processedAttachment: null,
          error: `Failed to upload fallback attachment: ${uploadError.message}`
        };
      }
      
      const { data: urlData } = this.supabase.storage
        .from('invoices')
        .getPublicUrl(normalizedStorageFilename);
      
      let publicUrl = urlData.publicUrl;
      publicUrl = publicUrl.replace(/([^:])\/\/+/g, '$1/');
      
      console.log(`Fallback attachment uploaded: ${filename}`, { url: publicUrl });
      
      const processedAttachment: Attachment = {
        ...attachment,
        url: publicUrl,
        filename: normalizedStorageFilename
      };
      
      return { processedAttachment };
      
    } catch (error: any) {
      return {
        processedAttachment: null,
        error: `Error processing fallback attachment: ${error.message}`
      };
    }
  }
}
