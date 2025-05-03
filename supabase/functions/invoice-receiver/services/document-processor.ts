
// FILE: ./services/document-processor.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { log } from "../utils/logging.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- Helper function (inline or import if needed) ---
function normalizeUrl(url: string | null | undefined): string | null {
     if (!url) return null;
     try {
         if (typeof url !== 'string' || url.length < 5 || !url.includes(':')) return url;
        const urlObj = new URL(url);
        // Fix double slash issue - ensure path starts with single slash
        if (urlObj.pathname.includes('//')) {
          urlObj.pathname = urlObj.pathname.replace(/\/+/g, '/');
        }
         return urlObj.toString();
     } catch (error) { return url; }
}

// --- Helper function (inline or import if needed) ---
function normalizeFilename(filename: string | null | undefined, ensurePdfExt = false): string {
    if (!filename) return ensurePdfExt ? "unnamed_attachment.pdf" : "unnamed_attachment";
    let norm = String(filename).trim().toLowerCase().replace(/[^a-z0-9.\-_]/g, '_');
    norm = norm.substring(0, 200);
    if (ensurePdfExt && !norm.endsWith('.pdf')) {
        norm = norm.replace(/\.[^.]+$/, '') + '.pdf';
    }
    return (norm === '.' || norm === '') ? (ensurePdfExt ? "unnamed_attachment.pdf" : "unnamed_attachment") : norm;
}

/**
 * Checks if a buffer contains a valid PDF header
 */
function isPdfBuffer(buffer: ArrayBuffer): boolean {
  // PDF files start with %PDF- header
  const firstBytes = new Uint8Array(buffer, 0, 5);
  const header = new TextDecoder().decode(firstBytes);
  return header === '%PDF-';
}

/**
 * Processes email attachments: finds primary doc (PDF preferred), uploads to Storage.
 *
 * @param attachments Array of attachment objects from normalizeEmailData
 * @param requestId Request ID for logging
 * @returns Object with { documentContent, processedAttachment }
 */
export async function processDocument(attachments: any[] = [], requestId: string) {
    const documentContent = ""; // Text extraction disabled for this test
    let processedAttachment = null;

    if (!attachments || attachments.length === 0) {
        await log({
          request_id: requestId,
          level: 'info',
          message: 'No attachments found'
        });
        return { documentContent: "", processedAttachment: null };
    }

    await log({
      request_id: requestId,
      level: 'info',
      message: 'Processing attachments',
      metadata: { count: attachments.length }
    });

    // Sort attachments: prefer PDFs, then based on content presence
    const sortedAttachments = [...attachments].sort((a, b) => {
        const aIsPdf = (a.contentType === 'application/pdf' || (a.filename && a.filename.toLowerCase().endsWith('.pdf')));
        const bIsPdf = (b.contentType === 'application/pdf' || (b.filename && b.filename.toLowerCase().endsWith('.pdf')));
        if (aIsPdf && !bIsPdf) return -1;
        if (!aIsPdf && bIsPdf) return 1;
        const aHasContent = !!a.content;
        const bHasContent = !!b.content;
        if (aHasContent && !bHasContent) return -1;
        if (!aHasContent && bHasContent) return 1;
        return 0;
    });

    for (const attachment of sortedAttachments) {
        const originalFilename = attachment.filename || "unnamed_attachment";
        let contentType = attachment.contentType || 'application/octet-stream';
        const safeOriginalFilename = normalizeFilename(originalFilename, contentType === 'application/pdf');

        // Correct content type if filename indicates PDF
        if ((!contentType || contentType === 'application/octet-stream') && safeOriginalFilename.toLowerCase().endsWith('.pdf')) {
            contentType = 'application/pdf';
            await log({
              request_id: requestId,
              level: 'info',
              message: 'Corrected content type to application/pdf',
              metadata: { filename: safeOriginalFilename }
            });
        }

        await log({
          request_id: requestId,
          level: 'info',
          message: 'Processing attachment',
          metadata: { 
            filename: safeOriginalFilename,
            contentType,
            contentFormat: typeof attachment.content
          }
        });

        if (!attachment.content) {
            await log({
              request_id: requestId,
              level: 'warn',
              message: 'Skipping attachment due to missing content',
              metadata: { filename: safeOriginalFilename }
            });
            continue;
        }

        let fileData: ArrayBuffer | null = null; // Use ArrayBuffer for upload

        // --- Content Processing Logic ---
        try {
            const contentToProcess = attachment.content;

            if (contentToProcess instanceof File || contentToProcess instanceof Blob) {
                const format = contentToProcess instanceof File ? 'File' : 'Blob';
                await log({
                  request_id: requestId,
                  level: 'info',
                  message: `Attachment content is ${format}`,
                  metadata: { size: contentToProcess.size }
                });
                fileData = await contentToProcess.arrayBuffer();
                await log({
                  request_id: requestId,
                  level: 'info',
                  message: 'Converted to ArrayBuffer',
                  metadata: { size: fileData?.byteLength }
                });
            } else if (typeof contentToProcess === 'string') {
                // Handle base64 content
                try {
                    // Check if it's base64 by looking for base64 indicators
                    const isBase64 = contentToProcess.match(/^data:[^;]+;base64,/) || 
                                  !contentToProcess.match(/[^\w+/=]/) && contentToProcess.length % 4 <= 2;
                    
                    if (isBase64) {
                        // Clean the base64 string if it has a data URL prefix
                        const base64Data = contentToProcess.replace(/^data:[^;]+;base64,/, '');
                        
                        // Use standard base64 decoding
                        const binaryString = atob(base64Data);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        
                        fileData = bytes.buffer;
                        await log({
                          request_id: requestId,
                          level: 'info',
                          message: 'Converted base64 string to ArrayBuffer',
                          metadata: { 
                            inputLength: contentToProcess.length,
                            outputSize: fileData?.byteLength
                          }
                        });
                        
                        // Validate PDF header if it's supposed to be a PDF
                        if (contentType === 'application/pdf') {
                            const isPdfValid = isPdfBuffer(fileData);
                            await log({
                              request_id: requestId,
                              level: 'info',
                              message: 'PDF validation check',
                              metadata: { isValid: isPdfValid }
                            });
                            
                            if (!isPdfValid) {
                                await log({
                                  request_id: requestId,
                                  level: 'error',
                                  message: 'Invalid PDF header',
                                  metadata: { filename: safeOriginalFilename }
                                });
                                continue; // Skip invalid PDFs
                            }
                        }
                    } else {
                        // Plain text, treat as non-binary content
                        const textEncoder = new TextEncoder();
                        fileData = textEncoder.encode(contentToProcess).buffer;
                        await log({
                          request_id: requestId,
                          level: 'info',
                          message: 'Encoded text content to ArrayBuffer',
                          metadata: { 
                            inputLength: contentToProcess.length,
                            outputSize: fileData?.byteLength 
                          }
                        });
                    }
                } catch (base64Error) {
                    await log({
                      request_id: requestId,
                      level: 'error',
                      message: 'Error processing string content',
                      metadata: { 
                        error: base64Error.message,
                        contentLength: contentToProcess.length
                      }
                    });
                    continue;
                }
            } else {
                // If not File, Blob or string, log it and skip this attachment
                await log({
                  request_id: requestId,
                  level: 'warn',
                  message: 'Skipping attachment with unsupported content type',
                  metadata: {
                    filename: safeOriginalFilename,
                    contentType: typeof contentToProcess
                  }
                });
                continue;
            }

            if (!fileData || fileData.byteLength === 0) {
                await log({
                  request_id: requestId,
                  level: 'error',
                  message: 'Empty file data after conversion',
                  metadata: { filename: safeOriginalFilename }
                });
                continue;
            }

        } catch (processError) {
            await log({
              request_id: requestId,
              level: 'error',
              message: 'Error converting content to ArrayBuffer',
              metadata: { 
                filename: safeOriginalFilename,
                error: processError.message
              }
            });
            continue; // Skip to next attachment on error
        }


        // --- Supabase Upload ---
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
        const storageFilename = `invoice_${timestamp}_${safeOriginalFilename}`;

        try {
            await log({
              request_id: requestId,
              level: 'info',
              message: 'Preparing to upload file',
              metadata: {
                filename: storageFilename,
                contentType,
                size: fileData.byteLength
              }
            });

            // *** Upload using the ArrayBuffer directly ***
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('invoices')
                .upload(storageFilename, fileData, { // <-- Use ArrayBuffer (fileData)
                    contentType: contentType,
                    upsert: true
                });

            if (uploadError) {
                await log({
                  request_id: requestId,
                  level: 'error',
                  message: 'Failed to upload document',
                  metadata: {
                    filename: storageFilename,
                    error: uploadError.message
                  }
                });
                continue; // Continue to next attachment
            }

            await log({
              request_id: requestId,
              level: 'info',
              message: 'Successfully uploaded file',
              metadata: { 
                filename: storageFilename,
                path: uploadData?.path
              }
            });

            // --- URL Generation (Public Only in this simplified version for clarity) ---
            const { data: publicUrlData } = supabase.storage
                .from('invoices')
                .getPublicUrl(storageFilename);

             const finalPublicUrl = normalizeUrl(publicUrlData?.publicUrl);
             await log({
               request_id: requestId,
               level: 'info',
               message: 'Generated public URL',
               metadata: { url: finalPublicUrl }
             });

            // --- Prepare Result (Text Extraction Removed) ---
            processedAttachment = {
                storage_path: uploadData?.path,
                filename: storageFilename,
                original_filename: originalFilename,
                url: finalPublicUrl,
                public_url: finalPublicUrl,
                contentType: contentType
            };

            await log({
              request_id: requestId,
              level: 'info',
              message: 'Document processing complete',
              metadata: { filename: storageFilename }
            });
            break; // Stop after processing the first valid attachment

        } catch (error) {
            await log({
              request_id: requestId,
              level: 'error',
              message: 'Unhandled error during upload',
              metadata: {
                filename: storageFilename,
                error: error.message
              }
            });
            // Continue to the next attachment
        }
    } // End loop

    if (!processedAttachment) {
         await log({
           request_id: requestId,
           level: 'warn',
           message: 'No attachments were successfully processed',
           metadata: { 
             originalCount: attachments.length 
           }
         });
    }

    // Return documentContent as empty string since extraction is disabled
    return { documentContent: "", processedAttachment };
}
