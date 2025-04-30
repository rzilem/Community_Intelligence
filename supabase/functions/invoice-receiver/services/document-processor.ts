// FILE: ./services/document-processor.ts (Simplified for Debugging)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// Import necessary utils IF THEY ARE USED HERE (e.g., normalizeUrl, normalizeFilename)
// We removed text extraction imports for this test.
// import { normalizeUrl } from "../utils/url-normalizer.ts";
// import { normalizeFilename } from "../utils/filename-helper.ts"; // Example path

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- Helper function (inline or import if needed) ---
function normalizeUrl(url: string | null | undefined): string | null {
     if (!url) return null;
     try {
         if (typeof url !== 'string' || url.length < 5 || !url.includes(':')) return url;
        const urlObj = new URL(url);
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
 * [SIMPLIFIED FOR DEBUGGING]
 * Processes email attachments: finds primary doc (PDF preferred), uploads to Storage.
 * ONLY handles Blob/File content. Skips text extraction and string processing.
 *
 * @param attachments Array of attachment objects from normalizeEmailData
 * @returns Object with { documentContent (always ""), processedAttachment }
 */
export async function processDocument(attachments: any[] = []) {
    const documentContent = ""; // Text extraction disabled for this test
    let processedAttachment = null;

    if (!attachments || attachments.length === 0) {
        console.log("Simplified_processDocument: No attachments found.");
        return { documentContent: "", processedAttachment: null };
    }

    console.log(`Simplified_processDocument: Received ${attachments.length} attachments.`);

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
             console.log(`Simplified_processDocument: Corrected content type to application/pdf for "${safeOriginalFilename}"`);
         }

        console.log(`Simplified_processDocument: Attempting to process attachment: "${safeOriginalFilename}" (Type: ${contentType})`);

        if (!attachment.content) {
            console.warn(`Simplified_processDocument: Skipping attachment "${safeOriginalFilename}" due to missing content.`);
            continue;
        }

        let fileData: ArrayBuffer | null = null; // Use ArrayBuffer for upload

        // --- Simplified Content Handling: ONLY Blob/File ---
        try {
            const contentToProcess = attachment.content;

            if (contentToProcess instanceof File || contentToProcess instanceof Blob) {
                const format = contentToProcess instanceof File ? 'File' : 'Blob';
                console.log(`Simplified_processDocument: Attachment content is ${format} (Size: ${contentToProcess.size} bytes). Converting to ArrayBuffer.`);
                fileData = await contentToProcess.arrayBuffer();
                 console.log(`Simplified_processDocument: Conversion to ArrayBuffer successful. Size: ${fileData?.byteLength ?? 0} bytes.`);
            } else {
                 // If not File or Blob, log it and skip this attachment
                console.warn(`Simplified_processDocument: Skipping attachment "${safeOriginalFilename}" because content is NOT a File or Blob. Type detected: ${typeof contentToProcess}`);
                continue;
            }

            if (!fileData || fileData.byteLength === 0) {
                console.error(`Simplified_processDocument: Skipping attachment "${safeOriginalFilename}" - resulted in empty file data after ArrayBuffer conversion.`);
                continue;
            }

        } catch (processError) {
            console.error(`Simplified_processDocument: Error converting Blob/File to ArrayBuffer for "${safeOriginalFilename}": ${processError.message}`);
            continue; // Skip to next attachment on error
        }


        // --- Supabase Upload ---
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
        const storageFilename = `invoice_${timestamp}_${safeOriginalFilename}`;

        try {
            console.log(`Simplified_processDocument: Preparing to upload "${storageFilename}". ContentType: "${contentType}", ArrayBuffer Size: ${fileData.byteLength}`);

            // *** Upload using the ArrayBuffer directly ***
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('invoices')
                .upload(storageFilename, fileData, { // <-- Use ArrayBuffer (fileData)
                    contentType: contentType,
                    upsert: true
                    // duplex: 'full' // Removed
                });

            if (uploadError) {
                console.error(`Simplified_processDocument: Failed to upload document "${storageFilename}" to Supabase Storage:`, uploadError);
                // Log specific Supabase error details if available
                if (uploadError instanceof Error) console.error(`Supabase Error Details: ${uploadError.message}`);
                continue; // Continue to next attachment
            }

            console.log(`Simplified_processDocument: Successfully uploaded "${storageFilename}". Path: ${uploadData?.path}`);

            // --- URL Generation (Public Only in this simplified version for clarity) ---
            const { data: publicUrlData } = supabase.storage
                .from('invoices')
                .getPublicUrl(storageFilename);

             const finalPublicUrl = normalizeUrl(publicUrlData?.publicUrl);
             console.log(`Simplified_processDocument: Public URL: ${finalPublicUrl || 'N/A'}`);


            // --- Prepare Result (Text Extraction Removed) ---
            processedAttachment = {
                // Include necessary fields needed by processInvoiceEmail/createInvoice
                storage_path: uploadData?.path,
                filename: storageFilename,
                original_filename: originalFilename,
                url: finalPublicUrl, // Using public URL in this simplified version
                public_url: finalPublicUrl,
                contentType: contentType // Pass contentType along if needed downstream
                // Add other fields from the original 'attachment' object if needed by createInvoice
                // e.g., size: fileData.byteLength
            };

            console.log(`Simplified_processDocument: Successfully processed and uploaded "${storageFilename}". Stopping attachment loop.`);
            break; // Stop after processing the first valid Blob/File attachment

        } catch (error) {
            console.error(`Simplified_processDocument: Unhandled error during upload/URL generation for "${storageFilename}":`, error);
            // Continue to the next attachment
        }
    } // End loop

    if (!processedAttachment) {
         console.log("Simplified_processDocument: No Blob/File attachments were successfully processed and uploaded.");
    } else {
         console.log(`Simplified_processDocument: Finished. Returning processed attachment: ${processedAttachment.filename}`);
    }

    // Return documentContent as empty string since extraction is disabled
    return { documentContent: "", processedAttachment };
}
