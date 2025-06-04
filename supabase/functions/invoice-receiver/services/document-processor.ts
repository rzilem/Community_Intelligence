
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { ContentExtractionService } from "./content-extraction-service.ts";
import { Attachment } from "./invoice-types.ts";
import { decodePDFContent, validatePDF, verifyUploadedPDF } from "./pdf-processor.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function processDocument(attachments: Attachment[] = []) {
  let documentContent = "";
  let processedAttachment: Attachment | null = null;

  if (!attachments || attachments.length === 0) {
    console.log("No attachments to process");
    return { documentContent: "", processedAttachment: null };
  }

  console.log(`Processing ${attachments.length} attachments:`, attachments.map(a => ({
    filename: a.filename || "unnamed",
    contentType: a.contentType || "unknown",
    hasContent: !!a.content,
    contentLength: a.content ? typeof a.content === 'string' ? a.content.length : 'binary' : 0
  })));

  const contentExtractionService = new ContentExtractionService();
  
  const sortedAttachments = [...attachments].sort((a, b) => {
    const aIsPdf = a.contentType === 'application/pdf' || (a.filename && a.filename.toLowerCase().endsWith('.pdf'));
    const bIsPdf = b.contentType === 'application/pdf' || (b.filename && b.filename.toLowerCase().endsWith('.pdf'));
    if (aIsPdf && !bIsPdf) return -1;
    if (!aIsPdf && bIsPdf) return 1;
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

    let contentToProcess = attachment.content;
    let contentBuffer: Uint8Array;
    let originalChecksum = '';

    try {
      if (contentToProcess instanceof Blob || contentToProcess instanceof File) {
        console.log(`Converting Blob/File to ArrayBuffer: ${filename}`);
        const arrayBuffer = await contentToProcess.arrayBuffer();
        contentBuffer = new Uint8Array(arrayBuffer);
      } else if (typeof contentToProcess === 'string') {
        if (contentType === 'application/pdf') {
          const decodedBuffer = decodePDFContent(contentToProcess, filename);
          if (!decodedBuffer) {
            console.error(`Failed to decode PDF content for ${filename}`);
            continue;
          }
          contentBuffer = decodedBuffer;
        } else {
          contentBuffer = new TextEncoder().encode(contentToProcess);
        }
      } else {
        console.warn(`Unsupported content type for ${filename}: ${typeof contentToProcess}`);
        continue;
      }

      if (!contentBuffer || contentBuffer.byteLength === 0) {
        console.error(`Empty content buffer after processing: ${filename}`);
        continue;
      }

      // Validate PDF if applicable
      if (contentType === 'application/pdf') {
        const validationResult = await validatePDF(contentBuffer, filename);
        if (!validationResult.isValid) {
          console.error(`PDF validation failed for ${filename}: ${validationResult.errorMessage}`);
          continue;
        }
        originalChecksum = validationResult.checksum;
      }

      // Upload to Supabase
      const timestamp = new Date().toISOString().replace(/[:.]/g, '');
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageFilename = `invoice_${timestamp}_${safeFilename}`;
      const normalizedStorageFilename = storageFilename.replace(/\/+/g, '');
      const sourceDocument = safeFilename;

      console.log(`Uploading ${filename} to invoices bucket as ${normalizedStorageFilename}`);
      const uploadResult = await supabase.storage.from('invoices').upload(normalizedStorageFilename, contentBuffer, {
        contentType: contentType,
        upsert: true
      });

      if (uploadResult.error) {
        console.error(`Failed to upload document ${filename}:`, uploadResult.error);
        continue;
      }

      const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(normalizedStorageFilename);
      if (!urlData?.publicUrl) {
        console.error(`Failed to get public URL for ${filename}`);
        continue;
      }

      let publicUrl = urlData.publicUrl;
      publicUrl = publicUrl.replace(/([^:])\/\/+/g, '$1/');
      console.log(`Document uploaded: ${filename}`, { publicUrl });

      // Verify uploaded file integrity
      try {
        const response = await fetch(publicUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch uploaded file: ${response.status}`);
        }
        
        const uploadedBuffer = new Uint8Array(await response.arrayBuffer());
        
        if (contentType === 'application/pdf') {
          const verificationResult = await verifyUploadedPDF(
            uploadedBuffer,
            originalChecksum,
            contentBuffer.byteLength,
            filename
          );
          
          if (!verificationResult.isValid) {
            console.error(`PDF verification failed for ${filename}: ${verificationResult.errorMessage}`);
            await supabase.storage.from('invoices').remove([normalizedStorageFilename]);
            continue;
          }
        }
      } catch (validationError) {
        console.error(`Error validating uploaded file ${filename}: ${validationError.message}`);
        await supabase.storage.from('invoices').remove([normalizedStorageFilename]);
        continue;
      }

      let extractedText = "";
      if (typeof contentToProcess === 'string') {
        extractedText = await contentExtractionService.extractContent(
          contentToProcess,
          filename,
          contentType
        );
      }

      console.log(`Text extraction for ${filename}`, {
        success: !!extractedText,
        length: extractedText?.length || 0
      });

      documentContent = extractedText || "";
      processedAttachment = {
        ...attachment,
        url: publicUrl,
        filename: normalizedStorageFilename,
        source_document: sourceDocument
      };

      break;
    } catch (error) {
      console.error(`Error processing document ${filename}:`, error);
    }
  }

  if (!processedAttachment && attachments.length > 0) {
    console.log("No documents processed, using first attachment as fallback");
    try {
      const firstAttachment = attachments[0];
      const filename = firstAttachment.filename || "unnamed_attachment";
      const timestamp = new Date().toISOString().replace(/[:.]/g, '');
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageFilename = `invoice_${timestamp}_${safeFilename}`;
      const normalizedStorageFilename = storageFilename.replace(/\/+/g, '');

      let contentBuffer: Uint8Array;
      const contentToProcess = firstAttachment.content;
      if (typeof contentToProcess === 'string') {
        contentBuffer = new TextEncoder().encode(contentToProcess);
      } else if (contentToProcess instanceof Blob || contentToProcess instanceof File) {
        const arrayBuffer = await contentToProcess.arrayBuffer();
        contentBuffer = new Uint8Array(arrayBuffer);
      } else {
        throw new Error(`Unsupported content type for fallback attachment: ${filename}`);
      }

      const uploadResult = await supabase.storage.from('invoices').upload(normalizedStorageFilename, contentBuffer, {
        contentType: firstAttachment.contentType || 'application/octet-stream',
        upsert: true
      });

      if (uploadResult.error) {
        throw new Error(`Failed to upload fallback attachment: ${uploadResult.error.message}`);
      }

      const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(normalizedStorageFilename);
      let publicUrl = urlData.publicUrl;
      publicUrl = publicUrl.replace(/([^:])\/\/+/g, '$1/');

      processedAttachment = {
        ...firstAttachment,
        url: publicUrl,
        filename: normalizedStorageFilename
      };
      console.log(`Fallback attachment uploaded: ${filename}`, { url: publicUrl });
    } catch (fallbackError) {
      console.error(`Error processing fallback attachment: ${fallbackError.message}`);
    }
  }

  console.log(`Document processing complete for ${processedAttachment?.filename || 'none'}`, {
    success: !!processedAttachment,
    url: processedAttachment?.url || 'none'
  });
  return { documentContent, processedAttachment };
}
