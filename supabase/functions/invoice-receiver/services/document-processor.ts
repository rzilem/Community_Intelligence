import { 
  extractTextFromPdf, 
  extractTextFromDocx, 
  extractTextFromDoc, 
  getDocumentType 
} from "../utils/document-parser.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize Supabase client with service role key for storage access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function processDocument(attachments: any[] = []) {
  let documentContent = "";
  let processedAttachment = null;

  if (!attachments || attachments.length === 0) {
    console.log("No attachments to process");
    return { documentContent: "", processedAttachment: null };
  }

  console.log(`Processing ${attachments.length} attachments:`, 
    attachments.map(a => ({ 
      filename: a.filename || "unnamed", 
      contentType: a.contentType || "unknown",
      hasContent: !!a.content,
      contentLength: a.content ? (typeof a.content === 'string' ? a.content.length : 'binary') : 0,
    }))
  );
  
  // Sort attachments to prioritize PDFs
  const sortedAttachments = [...attachments].sort((a, b) => {
    // Prioritize PDFs first
    const aIsPdf = a.contentType === 'application/pdf' || (a.filename && a.filename.toLowerCase().endsWith('.pdf'));
    const bIsPdf = b.contentType === 'application/pdf' || (b.filename && b.filename.toLowerCase().endsWith('.pdf'));
    
    if (aIsPdf && !bIsPdf) return -1;
    if (!aIsPdf && bIsPdf) return 1;
    
    // Then check for existence of content
    if (a.content && !b.content) return -1;
    if (!a.content && b.content) return 1;
    
    return 0;
  });
  
  for (const attachment of sortedAttachments) {
    const filename = attachment.filename || "unnamed_attachment";
    const contentType = attachment.contentType || "application/octet-stream";
    
    console.log(`Processing attachment: ${filename} (${contentType})`);
    
    if (!attachment.content) {
      console.warn(`No content for attachment: ${filename}`);
      continue;
    }

    // Handle both string content and Blob/File objects from form data
    let contentToProcess = attachment.content;
    let contentBuffer;
    
    try {
      if (contentToProcess instanceof Blob || contentToProcess instanceof File) {
        console.log(`Converting Blob/File to ArrayBuffer for: ${filename}`);
        // Convert Blob to ArrayBuffer
        const arrayBuffer = await contentToProcess.arrayBuffer();
        contentBuffer = new Uint8Array(arrayBuffer);
        console.log(`Successfully converted Blob to Uint8Array, length: ${contentBuffer.byteLength}`);
      } else if (typeof contentToProcess === 'string') {
        // Try to determine if it's base64 encoded
        const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(
          contentToProcess.trim().replace(/\s/g, '')
        );
        
        if (isBase64) {
          console.log(`Content appears to be Base64 encoded, decoding now`);
          try {
            // Convert base64 to binary
            contentBuffer = new Uint8Array(Array.from(atob(contentToProcess), c => c.charCodeAt(0)));
          } catch (base64Error) {
            console.error(`Base64 decode error: ${base64Error.message}`);
            contentBuffer = new TextEncoder().encode(contentToProcess);
          }
        } else {
          console.log(`Content is plain text, encoding as binary`);
          contentBuffer = new TextEncoder().encode(contentToProcess);
        }
      } else {
        console.warn(`Unsupported content type for ${filename}: ${typeof contentToProcess}`);
        continue;
      }
      
      if (!contentBuffer || contentBuffer.byteLength === 0) {
        console.error("Empty content buffer after processing");
        continue;
      }
      
      console.log(`Successfully processed content, byte length: ${contentBuffer.byteLength}`);
    } catch (processError) {
      console.error(`Error processing attachment content: ${processError.message}`);
      continue;
    }

    try {
      // Generate a unique filename with original extension
      const timestamp = new Date().getTime();
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageFilename = `invoice_${timestamp}_${safeFilename}`;
      
      // Store original filename as source_document
      const sourceDocument = safeFilename;
      
      // Upload to the 'invoices' bucket
      console.log(`Uploading ${filename} to invoices bucket as ${storageFilename}`);
      const uploadResult = await supabase.storage
        .from('invoices')
        .upload(storageFilename, contentBuffer, {
          contentType: contentType,
          upsert: true,
          duplex: 'full'
        });

      if (uploadResult.error) {
        console.error("Failed to upload document:", uploadResult.error);
        continue;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(storageFilename);

      if (!urlData?.publicUrl) {
        console.error("Failed to get public URL for uploaded document");
        continue;
      }

      console.log(`Document uploaded successfully: ${urlData.publicUrl}`);

      // Extract text content for recognized document types
      let extractedText = "";
      const documentType = getDocumentType(filename);
      if (documentType === "unknown" && !contentType.includes('pdf')) {
        console.log(`Skipping unsupported document type: ${filename} (${contentType})`);
        
        // Even if we can't extract text, still save the file if it's not a recognized document type
        // This ensures we don't lose attachments that might be important
      } else {
        try {
          switch (documentType) {
            case "pdf":
              extractedText = await extractTextFromPdf(
                typeof contentToProcess === 'string' ? contentToProcess : ''
              );
              break;
            case "docx":
              extractedText = await extractTextFromDocx(
                typeof contentToProcess === 'string' ? contentToProcess : ''
              );
              break;
            case "doc":
              extractedText = await extractTextFromDoc(
                typeof contentToProcess === 'string' ? contentToProcess : ''
              );
              break;
          }
        } catch (extractError) {
          console.error(`Error extracting text: ${extractError.message}`);
          // Even if text extraction fails, we still have the document
        }
      }

      console.log(`Text extraction ${extractedText ? 'successful' : 'failed or not attempted'}, length: ${extractedText?.length || 0}`);
      documentContent = extractedText || "";
      processedAttachment = {
        ...attachment,
        url: urlData.publicUrl,
        filename: storageFilename,
        source_document: sourceDocument // Add original filename as source_document
      };
      
      // If we successfully processed a PDF, we can stop here
      if (documentType === "pdf" || contentType.includes('pdf')) {
        console.log("PDF document processed successfully, stopping attachment processing");
        break;
      }
    } catch (error) {
      console.error(`Error processing document ${filename}:`, error);
    }
  }

  // If no document was successfully processed but we have attachments,
  // use the first attachment as a fallback
  if (!processedAttachment && attachments.length > 0) {
    console.log("No documents were successfully processed, using first attachment as fallback");
    
    try {
      const firstAttachment = attachments[0];
      const filename = firstAttachment.filename || "unnamed_attachment";
      const timestamp = new Date().getTime();
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageFilename = `invoice_${timestamp}_${safeFilename}`;
      
      let contentBuffer;
      const contentToProcess = firstAttachment.content;
      
      if (typeof contentToProcess === 'string') {
        contentBuffer = new TextEncoder().encode(contentToProcess);
      } else if (contentToProcess instanceof Blob || contentToProcess instanceof File) {
        const arrayBuffer = await contentToProcess.arrayBuffer();
        contentBuffer = new Uint8Array(arrayBuffer);
      } else {
        throw new Error("Unsupported content type for fallback attachment");
      }
      
      const uploadResult = await supabase.storage
        .from('invoices')
        .upload(storageFilename, contentBuffer, {
          contentType: firstAttachment.contentType || 'application/octet-stream',
          upsert: true
        });
        
      if (uploadResult.error) {
        throw new Error(`Failed to upload fallback attachment: ${uploadResult.error.message}`);
      }
      
      const { data: urlData } = supabase.storage
        .from('invoices')
        .getPublicUrl(storageFilename);
        
      processedAttachment = {
        ...firstAttachment,
        url: urlData.publicUrl,
        filename: storageFilename
      };
      
      console.log(`Fallback attachment uploaded successfully: ${urlData.publicUrl}`);
    } catch (fallbackError) {
      console.error("Error processing fallback attachment:", fallbackError);
    }
  }

  console.log(`Document processing complete. Success: ${!!processedAttachment}, URL: ${processedAttachment?.url || 'none'}`);
  return { documentContent, processedAttachment };
}
