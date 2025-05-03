import { decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";
import { extractTextFromPdf, extractTextFromDocx, extractTextFromDoc, getDocumentType } from "../utils/document-parser.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Attachment } from "../services/invoice-types.ts";
import { createHash } from "https://deno.land/std@0.190.0/hash/mod.ts";

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

    try {
      if (contentToProcess instanceof Blob || contentToProcess instanceof File) {
        console.log(`Converting Blob/File to ArrayBuffer: ${filename}`);
        const arrayBuffer = await contentToProcess.arrayBuffer();
        contentBuffer = new Uint8Array(arrayBuffer);
        console.log(`Converted to Uint8Array: ${filename}`, {
          length: contentBuffer.byteLength,
          firstBytes: Array.from(contentBuffer.slice(0, 4)).map(b => b.toString(16)).join('')
        });
      } else if (typeof contentToProcess === 'string') {
        const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(contentToProcess.trim().replace(/\s/g, ''));
        if (isBase64 && contentType === 'application/pdf') {
          console.log(`Decoding base64 PDF: ${filename}`);
          try {
            // Remove any data URI prefix and normalize the base64 string
            const base64Content = contentToProcess
              .replace(/^data:application\/pdf;base64,/, '')
              .replace(/\s/g, ''); // Remove whitespace
            contentBuffer = decode(base64Content);
            console.log(`Base64 decoded: ${filename}`, {
              length: contentBuffer.byteLength,
              firstBytes: Array.from(contentBuffer.slice(0, 4)).map(b => b.toString(16)).join('')
            });
          } catch (base64Error) {
            console.error(`Base64 decode error for ${filename}: ${base64Error.message}`);
            throw new Error(`Failed to decode base64 PDF: ${base64Error.message}`);
          }
        } else {
          console.warn(`Non-base64 string content for PDF: ${filename}, treating as text`);
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

      // Validate PDF header and compute checksum
      let originalChecksum = '';
      if (contentType === 'application/pdf') {
        const pdfHeader = Array.from(contentBuffer.slice(0, 4)).map(b => b.toString(16)).join('');
        if (pdfHeader !== '25504446') {
          console.error(`Invalid PDF header for ${filename}: ${pdfHeader}`);
          throw new Error(`Invalid PDF content: File does not start with %PDF`);
        }
        const hasher = createHash("sha256");
        hasher.update(contentBuffer);
        originalChecksum = hasher.toString();
        console.log(`Original checksum for ${filename}: ${originalChecksum}`);
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
        upsert: true,
        duplex: 'full'
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
      console.log(`Document uploaded: ${filename}`, {
        publicUrl,
        contentType,
        bufferLength: contentBuffer.byteLength
      });

      // Verify uploaded file integrity
      try {
        const response = await fetch(publicUrl, { method: 'GET' });
        if (!response.ok) {
          throw new Error(`Failed to fetch uploaded file: ${response.status}`);
        }
        const uploadedBuffer = new Uint8Array(await response.arrayBuffer());
        const uploadedHeader = Array.from(uploadedBuffer.slice(0, 4)).map(b => b.toString(16)).join('');
        if (contentType === 'application/pdf' && uploadedHeader !== '25504446') {
          console.error(`Uploaded file corrupted for ${filename}:`, {
            url: publicUrl,
            uploadedHeader
          });
          throw new Error(`Uploaded file is not a valid PDF`);
        }
        if (uploadedBuffer.byteLength !== contentBuffer.byteLength) {
          console.error(`Uploaded file size mismatch for ${filename}:`, {
            url: publicUrl,
            originalSize: contentBuffer.byteLength,
            uploadedSize: uploadedBuffer.byteLength
          });
          throw new Error(`Uploaded file size does not match original`);
        }
        const hasher = createHash("sha256");
        hasher.update(uploadedBuffer);
        const uploadedChecksum = hasher.toString();
        console.log(`Uploaded checksum for ${filename}: ${uploadedChecksum}`);
        if (originalChecksum && originalChecksum !== uploadedChecksum) {
          console.error(`Checksum mismatch for ${filename}:`, {
            originalChecksum,
            uploadedChecksum
          });
          throw new Error(`Uploaded file content does not match original`);
        }
      } catch (validationError) {
        console.error(`Error validating uploaded file ${filename}: ${validationError.message}`);
        await supabase.storage.from('invoices').remove([normalizedStorageFilename]);
        throw validationError;
      }

      let extractedText = "";
      const documentType = getDocumentType(filename);
      if (documentType === "unknown" && !contentType.includes('pdf')) {
        console.log(`Skipping unsupported document type: ${filename} (${contentType})`);
      } else {
        try {
          switch (documentType) {
            case "pdf":
              extractedText = await extractTextFromPdf(typeof contentToProcess === 'string' ? contentToProcess : '');
              break;
            case "docx":
              extractedText = await extractTextFromDocx(typeof contentToProcess === 'string' ? contentToProcess : '');
              break;
            case "doc":
              extractedText = await extractTextFromDoc(typeof contentToProcess === 'string' ? contentToProcess : '');
              break;
          }
        } catch (extractError) {
          console.error(`Error extracting text from ${filename}: ${extractError.message}`);
        }
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

      if (documentType === "pdf" || contentType.includes('pdf')) {
        console.log(`PDF document processed successfully: ${filename}`);
        break;
      }
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