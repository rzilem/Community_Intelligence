import { extractTextFromPdf, extractTextFromDocx, extractTextFromDoc, getDocumentType } from "../utils/document-parser.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function processDocument(attachments = []) {
  let documentContent = "";
  let processedAttachment = null;

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

    let contentBuffer;
    try {
      if (attachment.content instanceof Blob || attachment.content instanceof File) {
        const arrayBuffer = await attachment.content.arrayBuffer();
        contentBuffer = new Uint8Array(arrayBuffer);
      } else if (typeof attachment.content === 'string') {
        const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(attachment.content.trim().replace(/\s/g, ''));
        contentBuffer = isBase64
          ? new Uint8Array(Array.from(atob(attachment.content), c => c.charCodeAt(0)))
          : new TextEncoder().encode(attachment.content);
      } else {
        console.warn(`Unsupported content type for ${filename}: ${typeof attachment.content}`);
        continue;
      }

      if (!contentBuffer || contentBuffer.byteLength === 0) {
        console.error("Empty content buffer after processing");
        continue;
      }
    } catch (processError) {
      console.error(`Error processing attachment content: ${processError.message}`);
      continue;
    }

    try {
      const timestamp = new Date().getTime();
      const safeFilename = filename.replace(/ RENAMED TO AVOID CODEBLOCK BREAK -[^a-zA-Z0-9.-]/g, '_').replace(/\/+/g, '_'); // Avoid slashes
      const storageFilename = `invoices/invoice_${timestamp}_${safeFilename}`; // Add folder prefix
      const sourceDocument = safeFilename;

      console.log(`Uploading ${filename} to invoices bucket as ${storageFilename}`);
      const uploadResult = await supabase.storage.from('invoices').upload(storageFilename, contentBuffer, {
        contentType: contentType,
        upsert: true,
        duplex: 'full'
      });

      if (uploadResult.error) {
        console.error("Failed to upload document:", uploadResult.error);
        continue;
      }

      // Generate a signed URL for secure access (valid for 1 hour)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('invoices')
        .createSignedUrl(storageFilename, 3600);

      if (signedError || !signedData?.signedUrl) {
        console.error("Failed to generate signed URL:", signedError);
        continue;
      }

      console.log(`Document uploaded successfully: ${signedData.signedUrl}`);

      let extractedText = "";
      const documentType = getDocumentType(filename);
      if (documentType === "unknown" && !contentType.includes('pdf')) {
        console.log(`Skipping unsupported document type: ${filename} (${contentType})`);
      } else {
        try {
          switch (documentType) {
            case "pdf":
              extractedText = await extractTextFromPdf(contentBuffer);
              break;
            case "docx":
              extractedText = await extractTextFromDocx(contentBuffer);
              break;
            case "doc":
              extractedText = await extractTextFromDoc(contentBuffer);
              break;
          }
        } catch (extractError) {
          console.error(`Error extracting text: ${extractError.message}`);
        }
      }

      documentContent = extractedText || "";
      processedAttachment = {
        ...attachment,
        url: signedData.signedUrl,
        filename: storageFilename,
        source_document: sourceDocument
      };

      if (documentType === "pdf" || contentType.includes('pdf')) {
        console.log("PDF document processed successfully, stopping attachment processing");
        break;
      }
    } catch (error) {
      console.error(`Error processing document ${filename}:`, error);
    }
  }

  if (!processedAttachment && attachments.length > 0) {
    console.log("No documents were successfully processed, using first attachment as fallback");
    try {
      const firstAttachment = attachments[0];
      const filename = firstAttachment.filename || "unnamed_attachment";
      const timestamp = new Date().getTime();
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\/+/g, '_');
      const storageFilename = `invoices/invoice_${timestamp}_${safeFilename}`;
      let contentBuffer;

      if (typeof firstAttachment.content === 'string') {
        contentBuffer = new TextEncoder().encode(firstAttachment.content);
      } else if (firstAttachment.content instanceof Blob || firstAttachment.content instanceof File) {
        const arrayBuffer = await firstAttachment.content.arrayBuffer();
        contentBuffer = new Uint8Array(arrayBuffer);
      } else {
        throw new Error("Unsupported content type for fallback attachment");
      }

      const uploadResult = await supabase.storage.from('invoices').upload(storageFilename, contentBuffer, {
        contentType: firstAttachment.contentType || 'application/octet-stream',
        upsert: true
      });

      if (uploadResult.error) {
        throw new Error(`Failed to upload fallback attachment: ${uploadResult.error.message}`);
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from('invoices')
        .createSignedUrl(storageFilename, 3600);

      if (signedError || !signedData?.signedUrl) {
        throw new Error("Failed to generate signed URL for fallback attachment");
      }

      processedAttachment = {
        ...firstAttachment,
        url: signedData.signedUrl,
        filename: storageFilename
      };
      console.log(`Fallback attachment uploaded successfully: ${signedData.signedUrl}`);
    } catch (fallbackError) {
      console.error("Error processing fallback attachment:", fallbackError);
    }
  }

  console.log(`Document processing complete. Success: ${!!processedAttachment}, URL: ${processedAttachment?.url || 'none'}`);
  return { documentContent, processedAttachment };
}
