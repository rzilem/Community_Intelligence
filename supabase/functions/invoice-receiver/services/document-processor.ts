
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { extractTextFromPdf } from "../utils/document-parser.ts";

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
    const filename = attachment.filename || "unnamed_attachment.pdf";
    const trimmedFilename = filename.trim();
    const safeFilename = trimmedFilename.toLowerCase().endsWith('.pdf')
      ? trimmedFilename.replace(/[^a-zA-Z0-9.-]/g, '_')
      : `${trimmedFilename.replace(/[^a-zA-Z0-9.-]/g, '_')}.pdf`;
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
        const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(attachment.content.trim().replace(/\s/g, ''));
        contentBuffer = isBase64
          ? new Uint8Array(Array.from(atob(attachment.content), c => c.charCodeAt(0)))
          : new TextEncoder().encode(attachment.content);
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
      const timestamp = new Date().getTime();
      const storageFilename = `invoice_${timestamp}_${safeFilename}`;
      console.log(`Uploading to Supabase with storageFilename: "${storageFilename}"`);

      const uploadResult = await supabase.storage.from('invoices').upload(storageFilename, contentBuffer, {
        contentType: contentType,
        upsert: true,
        duplex: 'full'
      });

      if (uploadResult.error) {
        console.error("Failed to upload document:", uploadResult.error);
        continue;
      }

      // Generate a signed URL instead of a public URL
      const { data: signedData, error: signedError } = await supabase.storage
        .from('invoices')
        .createSignedUrl(storageFilename, 3600); // URL valid for 1 hour

      if (signedError || !signedData?.signedUrl) {
        console.error("Failed to generate signed URL:", signedError);
        continue;
      }

      console.log(`Generated signed URL: "${signedData.signedUrl}"`);
      processedAttachment = {
        ...attachment,
        url: signedData.signedUrl,
        filename: storageFilename,
        source_document: safeFilename
      };

      // Extract text if PDF
      if (contentType.includes('pdf')) {
        documentContent = await extractTextFromPdf(contentBuffer);
      }
    } catch (error) {
      console.error(`Error processing document ${safeFilename}:`, error);
    }
  }

  console.log(`Document processing complete. Success: ${!!processedAttachment}, URL: ${processedAttachment?.url || 'none'}`);
  return { documentContent, processedAttachment };
}
