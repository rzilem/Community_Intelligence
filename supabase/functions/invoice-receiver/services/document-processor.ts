
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { log } from "../utils/logging.ts";
import { getDocumentType } from "../utils/document-parser.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Processed document result type
type ProcessedDocument = {
  file_name?: string;
  file_path?: string;
  file_size?: number;
  content_type?: string;
  public_url?: string;
  text_content?: string;
};

export async function processDocument(attachments: any[], requestId: string): Promise<{
  processedAttachment: ProcessedDocument | null;
  error?: string;
}> {
  try {
    // Check if we have attachments
    if (!attachments || attachments.length === 0) {
      await log({
        request_id: requestId,
        level: 'info',
        message: 'No attachments found'
      });
      return { processedAttachment: null };
    }
    
    await log({
      request_id: requestId,
      level: 'info',
      message: 'Processing attachments',
      metadata: {
        count: attachments.length
      }
    });
    
    // Find the first PDF or Word document attachment
    const pdfAttachment = attachments.find(att => 
      (att.contentType || '').toLowerCase().includes('pdf') || 
      (att.contentType || '').toLowerCase().includes('word') || 
      (att.contentType || '').toLowerCase().includes('doc') ||
      (att.filename || '').toLowerCase().endsWith('.pdf') ||
      (att.filename || '').toLowerCase().endsWith('.docx') ||
      (att.filename || '').toLowerCase().endsWith('.doc')
    );
    
    if (!pdfAttachment) {
      await log({
        request_id: requestId,
        level: 'info',
        message: 'No PDF or Word documents found in attachments'
      });
      return { processedAttachment: null };
    }
    
    // Get the content type and filename
    const contentType = pdfAttachment.contentType || 'application/octet-stream';
    const filename = pdfAttachment.filename || 'document.pdf';
    
    await log({
      request_id: requestId,
      level: 'info',
      message: 'Processing attachment',
      metadata: {
        filename,
        contentType,
        contentFormat: typeof pdfAttachment.content
      }
    });
    
    // Handle different content formats
    let buffer;
    
    // If attachment content is a File/Blob object (from CloudMailin)
    if (typeof pdfAttachment.content === 'object' && 
        (pdfAttachment.content instanceof File || pdfAttachment.content instanceof Blob)) {
      await log({
        request_id: requestId,
        level: 'info',
        message: 'Attachment content is File',
        metadata: {
          size: pdfAttachment.content.size
        }
      });
      
      // Convert File/Blob to ArrayBuffer
      const arrayBuffer = await pdfAttachment.content.arrayBuffer();
      buffer = arrayBuffer;
      
      await log({
        request_id: requestId,
        level: 'info',
        message: 'Converted to ArrayBuffer',
        metadata: {
          size: buffer.byteLength
        }
      });
    }
    // Handle base64 encoded content
    else if (typeof pdfAttachment.content === 'string' && pdfAttachment.content.length > 0) {
      try {
        // Check if it's base64 encoded
        const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(
          pdfAttachment.content.replace(/\s/g, '')
        );
        
        if (isBase64) {
          // Decode base64 content
          buffer = Uint8Array.from(atob(pdfAttachment.content.replace(/\s/g, '')), c => c.charCodeAt(0)).buffer;
          
          await log({
            request_id: requestId,
            level: 'info',
            message: 'Decoded base64 content',
            metadata: {
              size: buffer.byteLength
            }
          });
        } else {
          // If not base64, try to convert string to buffer directly
          buffer = new TextEncoder().encode(pdfAttachment.content).buffer;
          
          await log({
            request_id: requestId,
            level: 'info',
            message: 'Converted string content to buffer',
            metadata: {
              size: buffer.byteLength
            }
          });
        }
      } catch (error) {
        await log({
          request_id: requestId,
          level: 'error',
          message: 'Error processing content string',
          metadata: {
            error: error.message
          }
        });
        return { 
          processedAttachment: null, 
          error: `Failed to process attachment content: ${error.message}` 
        };
      }
    } else {
      await log({
        request_id: requestId,
        level: 'error',
        message: 'Unsupported attachment content type',
        metadata: {
          contentType: typeof pdfAttachment.content
        }
      });
      return { 
        processedAttachment: null, 
        error: 'Unsupported attachment content format' 
      };
    }
    
    // Validate PDF header if it's supposed to be a PDF
    if (contentType.includes('pdf')) {
      const view = new Uint8Array(buffer);
      if (view.length >= 4) {
        // Check for %PDF header (25 50 44 46 in hex)
        const isPDF = view[0] === 0x25 && view[1] === 0x50 && view[2] === 0x44 && view[3] === 0x46;
        
        await log({
          request_id: requestId,
          level: 'info',
          message: 'PDF header validation',
          metadata: {
            isPDF,
            firstBytes: Array.from(view.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('')
          }
        });
        
        if (!isPDF) {
          await log({
            request_id: requestId,
            level: 'error',
            message: 'Invalid PDF header',
            metadata: {
              firstBytes: Array.from(view.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join('')
            }
          });
          return { 
            processedAttachment: null, 
            error: 'Invalid PDF header' 
          };
        }
      }
    }
    
    // Generate timestamp-based filename to avoid collisions
    const timestamp = new Date().toISOString().replace(/[:.]/g, '');
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
    const uniqueFilename = `invoice_${timestamp}_${safeName}`;
    
    await log({
      request_id: requestId,
      level: 'info',
      message: 'Preparing to upload file',
      metadata: {
        filename: uniqueFilename,
        contentType,
        size: buffer.byteLength
      }
    });
    
    try {
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(uniqueFilename, buffer, {
          contentType,
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        await log({
          request_id: requestId,
          level: 'error',
          message: 'Error uploading file',
          metadata: {
            error: uploadError
          }
        });
        return { 
          processedAttachment: null, 
          error: `Storage upload failed: ${uploadError.message}` 
        };
      }
      
      await log({
        request_id: requestId,
        level: 'info',
        message: 'Successfully uploaded file',
        metadata: {
          filename: uniqueFilename,
          path: uploadData.path
        }
      });
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(uniqueFilename);
        
      let publicUrl = urlData.publicUrl;
      
      // Fix double slashes in URL if present (known Supabase issue)
      if (publicUrl.includes('/object/public//')) {
        publicUrl = publicUrl.replace('/object/public//', '/object/public/');
      }
      
      await log({
        request_id: requestId,
        level: 'info',
        message: 'Generated public URL',
        metadata: {
          url: publicUrl
        }
      });
      
      const result: ProcessedDocument = {
        file_name: uniqueFilename,
        file_path: uploadData.path,
        file_size: buffer.byteLength,
        content_type: contentType,
        public_url: publicUrl
      };
      
      await log({
        request_id: requestId,
        level: 'info',
        message: 'Document processing complete',
        metadata: {
          filename: uniqueFilename
        }
      });
      
      return { processedAttachment: result };
    } catch (error) {
      await log({
        request_id: requestId,
        level: 'error',
        message: 'Unexpected error processing document',
        metadata: {
          error: error.message,
          stack: error.stack
        }
      });
      return { 
        processedAttachment: null, 
        error: `Document processing error: ${error.message}` 
      };
    }
  } catch (error) {
    await log({
      request_id: requestId,
      level: 'error',
      message: 'Processing document failed',
      metadata: {
        error: error.message,
        stack: error.stack
      }
    });
    return { 
      processedAttachment: null, 
      error: `Document processing error: ${error.message}` 
    };
  }
}
