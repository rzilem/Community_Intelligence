
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { extractTextFromPdf } from "../utils/document-parser.ts";
import { normalizeUrl } from "../utils/url-normalizer.ts";

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

  // Ascendingly sorted attachments by preference for PDFs
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
    const originalFilename = attachment.filename || "unnamed_attachment.pdf";
    const timestamp = new Date().getTime();
    const safeFilename = originalFilename.trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Create a unique filename to avoid collisions
    const storageFilename = `invoice_${timestamp}_${safeFilename}`;
    const contentType = attachment.contentType || "application/pdf";
    console.log(`Processing attachment: ${safeFilename} (${contentType})`);

    if (!attachment.content) {
      console.warn(`No content for attachment: ${safeFilename}`);
      continue;
    }

    let contentBuffer;
    try {
      if (attachment.content instanceof Blob || attachment.content instanceof File) {
        console.log(`Attachment is Blob/File, converting to ArrayBuffer`);
        const arrayBuffer = await attachment.content.arrayBuffer();
        contentBuffer = new Uint8Array(arrayBuffer);
      } else if (typeof attachment.content === 'string') {
        console.log(`Attachment is string, checking for base64 encoding`);
        // Check for base64 encoding or data URL format
        if (attachment.content.startsWith('data:application/pdf;base64,') || 
            attachment.contentType?.includes('base64')) {
          const base64Content = attachment.content.startsWith('data:') 
            ? attachment.content.split(',')[1] 
            : attachment.content;
          console.log(`Decoding base64 content, length: ${base64Content.length}`);
          contentBuffer = new Uint8Array(Array.from(atob(base64Content), c => c.charCodeAt(0)));
        } else {
          // Just use the string content directly
          contentBuffer = new TextEncoder().encode(attachment.content);
        }
      } else {
        console.warn(`Unsupported content type for ${safeFilename}: ${typeof attachment.content}`);
        continue;
      }

      if (!contentBuffer || contentBuffer.byteLength === 0) {
        console.error("Empty content buffer after processing");
        continue;
      }

      console.log(`Content buffer size: ${contentBuffer.byteLength} bytes`);
      if (contentType.includes('pdf')) {
        const pdfHeader = new TextDecoder().decode(contentBuffer.slice(0, 5));
        console.log(`PDF header check: "${pdfHeader}"`);
        if (!pdfHeader.startsWith('%PDF')) {
          console.warn(`Content may not be a valid PDF (missing %PDF header): ${safeFilename}`);
        }
      }
    } catch (processError) {
      console.error(`Error processing attachment content: ${processError.message}`);
      continue;
    }

    try {
      console.log(`Uploading file "${storageFilename}" to Supabase storage`);
      
      const uploadResult = await supabase.storage.from('invoices').upload(storageFilename, contentBuffer, {
        contentType: contentType,
        upsert: true,
        duplex: 'full'
      });

      if (uploadResult.error) {
        console.error("Failed to upload document:", uploadResult.error);
        continue;
      }

      console.log(`Successfully uploaded file to storage: ${storageFilename}`);
      
      // Generate a signed URL with 24-hour validity
      const { data: signedData, error: signedError } = await supabase.storage
        .from('invoices')
        .createSignedUrl(storageFilename, 24 * 60 * 60); // 24 hours in seconds

      if (signedError || !signedData?.signedUrl) {
        console.error("Failed to generate signed URL:", signedError);
        continue;
      }

      // Generate public URL as well (for later access)
      const { data: publicUrlData } = await supabase.storage
        .from('invoices')
        .getPublicUrl(storageFilename);
      
      // Normalize the URLs to avoid malformed paths
      const signedUrl = normalizeUrl(signedData.signedUrl);
      const publicUrl = normalizeUrl(publicUrlData.publicUrl);
      
      console.log(`Generated signed URL (valid for 24 hours): ${signedUrl}`);
      console.log(`Also generated public URL: ${publicUrl}`);

      processedAttachment = {
        ...attachment,
        url: signedUrl,
        public_url: publicUrl,
        filename: storageFilename,
        source_document: safeFilename,
        original_filename: originalFilename
      };

      // Extract text if PDF
      if (contentType.includes('pdf')) {
        try {
          documentContent = await extractTextFromPdf(contentBuffer);
          console.log(`Extracted ${documentContent.length} characters of text from PDF`);
        } catch (extractError) {
          console.error(`Error extracting text from PDF: ${extractError.message}`);
          // Continue anyway - we have the PDF file stored successfully
        }
      }
      
      // If we processed a PDF successfully, stop here
      if (processedAttachment && contentType.includes('pdf')) {
        break;
      }
    } catch (error) {
      console.error(`Error processing document ${safeFilename}:`, error);
    }
  }

  console.log(`Document processing complete. Success: ${!!processedAttachment}, URL: ${processedAttachment?.url || 'none'}`);
  return { documentContent, processedAttachment };
}
