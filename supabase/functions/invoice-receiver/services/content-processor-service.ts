
import { Attachment } from "./invoice-types.ts";
import { decodePDFContent, validatePDF, verifyUploadedPDF } from "./pdf-processor.ts";
import { FileUploadService } from "./file-upload-service.ts";
import { ContentExtractionService } from "./content-extraction-service.ts";

/**
 * Service for processing document content from attachments
 */
export class ContentProcessorService {
  private fileUploader: FileUploadService;
  private contentExtractor: ContentExtractionService;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.fileUploader = new FileUploadService(supabaseUrl, supabaseKey);
    this.contentExtractor = new ContentExtractionService();
  }
  
  /**
   * Process a document attachment to extract content and upload to storage
   * @param attachment The email attachment
   * @returns Object with processed document information
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
      console.warn(`No content for attachment: ${filename}`);
      return { 
        documentContent: "", 
        processedAttachment: null,
        error: "No content in attachment"
      };
    }
    
    let contentBuffer: Uint8Array;
    let originalChecksum = '';
    const contentToProcess = attachment.content;
    let stringContent: string | null = null;
    
    try {
      // Convert content to Uint8Array based on its type
      if (contentToProcess instanceof Blob || contentToProcess instanceof File) {
        console.log(`Converting Blob/File to ArrayBuffer: ${filename}`);
        const arrayBuffer = await contentToProcess.arrayBuffer();
        contentBuffer = new Uint8Array(arrayBuffer);
        console.log(`Converted to Uint8Array: ${filename}`, {
          length: contentBuffer.byteLength,
          firstBytes: Array.from(contentBuffer.slice(0, 4)).map(b => b.toString(16)).join('')
        });
      } else if (typeof contentToProcess === 'string') {
        stringContent = contentToProcess;
        
        if (contentType === 'application/pdf') {
          const decodedBuffer = decodePDFContent(contentToProcess, filename);
          if (decodedBuffer) {
            contentBuffer = decodedBuffer;
          } else {
            console.warn(`Non-base64 string content for PDF: ${filename}, treating as text`);
            contentBuffer = new TextEncoder().encode(contentToProcess);
          }
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
      
      if (!contentBuffer || contentBuffer.byteLength === 0) {
        return { 
          documentContent: "", 
          processedAttachment: null,
          error: `Empty content buffer after processing: ${filename}`
        };
      }
      
      // Validate PDF content
      if (contentType === 'application/pdf') {
        const validation = validatePDF(contentBuffer, filename);
        if (!validation.isValid) {
          return { 
            documentContent: "", 
            processedAttachment: null,
            error: validation.errorMessage
          };
        }
        originalChecksum = validation.checksum;
      }
      
      // Upload file to storage
      const uploadResult = await this.fileUploader.uploadFile(
        filename,
        contentBuffer,
        contentType
      );
      
      if (uploadResult.error) {
        return { 
          documentContent: "", 
          processedAttachment: null,
          error: `Upload failed: ${uploadResult.error}`
        };
      }
      
      // Verify uploaded file if it's a PDF
      if (contentType === 'application/pdf') {
        const uploadedBuffer = await this.fileUploader.fetchFile(uploadResult.publicUrl);
        if (!uploadedBuffer) {
          await this.fileUploader.deleteFile(uploadResult.normalizedFilename);
          return { 
            documentContent: "", 
            processedAttachment: null,
            error: `Failed to fetch uploaded file for verification: ${filename}`
          };
        }
        
        const verification = verifyUploadedPDF(
          uploadedBuffer, 
          originalChecksum, 
          contentBuffer.byteLength,
          filename
        );
        
        if (!verification.isValid) {
          await this.fileUploader.deleteFile(uploadResult.normalizedFilename);
          return { 
            documentContent: "", 
            processedAttachment: null,
            error: verification.errorMessage
          };
        }
      }
      
      // Extract text content from the document
      const extractedText = await this.contentExtractor.extractContent(
        stringContent,
        filename,
        contentType
      );
      
      // Create processed attachment with upload info
      const sourceDocument = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const processedAttachment = {
        ...attachment,
        url: uploadResult.publicUrl,
        filename: uploadResult.normalizedFilename,
        source_document: sourceDocument
      };
      
      return { 
        documentContent: extractedText, 
        processedAttachment
      };
    } catch (error: any) {
      console.error(`Error processing document ${filename}:`, error);
      return { 
        documentContent: "", 
        processedAttachment: null,
        error: `Processing error: ${error.message}`
      };
    }
  }
  
  /**
   * Process a fallback attachment when no valid document is found
   * @param attachment The fallback attachment
   * @returns Object with processed attachment information
   */
  async processFallbackAttachment(attachment: Attachment): Promise<{
    processedAttachment: Attachment | null;
    error?: string;
  }> {
    const filename = attachment.filename || "unnamed_attachment";
    console.log(`Processing fallback attachment: ${filename}`);
    
    try {
      let contentBuffer: Uint8Array;
      const contentToProcess = attachment.content;
      
      if (typeof contentToProcess === 'string') {
        contentBuffer = new TextEncoder().encode(contentToProcess);
      } else if (contentToProcess instanceof Blob || contentToProcess instanceof File) {
        const arrayBuffer = await contentToProcess.arrayBuffer();
        contentBuffer = new Uint8Array(arrayBuffer);
      } else {
        return { 
          processedAttachment: null,
          error: `Unsupported content type for fallback attachment: ${filename}`
        };
      }
      
      const uploadResult = await this.fileUploader.uploadFile(
        filename,
        contentBuffer,
        attachment.contentType || 'application/octet-stream'
      );
      
      if (uploadResult.error) {
        return { 
          processedAttachment: null,
          error: `Failed to upload fallback attachment: ${uploadResult.error}`
        };
      }
      
      const processedAttachment = {
        ...attachment,
        url: uploadResult.publicUrl,
        filename: uploadResult.normalizedFilename
      };
      
      console.log(`Fallback attachment uploaded: ${filename}`, { url: uploadResult.publicUrl });
      return { processedAttachment };
    } catch (error: any) {
      console.error(`Error processing fallback attachment: ${error.message}`);
      return { 
        processedAttachment: null,
        error: `Fallback processing error: ${error.message}`
      };
    }
  }
}
