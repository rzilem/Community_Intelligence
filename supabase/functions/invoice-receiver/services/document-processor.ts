// FILE: ./services/document-processor.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// Assuming extractTextFromPdf, normalizeUrl are in ../utils/*
import { extractTextFromPdf } from "../utils/document-parser.ts"; // Or wherever it lives
import { normalizeUrl } from "../utils/url-normalizer.ts"; // Or wherever it lives

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Processes email attachments to find a primary document (preferring PDFs),
 * uploads it to Supabase Storage, generates URLs, and attempts text extraction.
 *
 * @param attachments Array of attachment objects from normalizeEmailData
 * @returns An object containing extracted text content and details of the processed attachment (if any).
 */
export async function processDocument(attachments = []) {
    let documentContent = "";
    let processedAttachment = null;

    if (!attachments || attachments.length === 0) {
        console.log("processDocument: No attachments found.");
        return { documentContent: "", processedAttachment: null };
    }

    console.log(`processDocument: Received ${attachments.length} attachments to process.`);

    // Sort attachments: prefer PDFs, then attachments with content
    const sortedAttachments = [...attachments].sort((a, b) => {
        const aIsPdf = (a.contentType === 'application/pdf' || (a.filename && a.filename.toLowerCase().endsWith('.pdf')));
        const bIsPdf = (b.contentType === 'application/pdf' || (b.filename && b.filename.toLowerCase().endsWith('.pdf')));

        if (aIsPdf && !bIsPdf) return -1; // Prioritize PDF a
        if (!aIsPdf && bIsPdf) return 1;  // Prioritize PDF b

        // If types are same (or neither is PDF), prioritize based on content presence
        const aHasContent = !!a.content;
        const bHasContent = !!b.content;
        if (aHasContent && !bHasContent) return -1; // Prioritize a with content
        if (!aHasContent && bHasContent) return 1;  // Prioritize b with content

        return 0; // Keep original order otherwise
    });

    for (const attachment of sortedAttachments) {
        const originalFilename = attachment.filename || "unnamed_attachment";
        const contentType = attachment.contentType || 'application/octet-stream'; // Default if unknown
        const safeOriginalFilename = normalizeFilename(originalFilename, contentType === 'application/pdf'); // Ensure .pdf if needed

        console.log(`processDocument: Attempting to process attachment: "${safeOriginalFilename}" (Type: ${contentType})`);

        if (!attachment.content) {
            console.warn(`processDocument: Skipping attachment "${safeOriginalFilename}" due to missing content.`);
            continue;
        }

        let fileData: ArrayBuffer | null = null;
        let dataFormat: string = 'unknown';

        try {
            // --- Content Conversion ---
            if (attachment.content instanceof File || attachment.content instanceof Blob) {
                dataFormat = attachment.content instanceof File ? 'File' : 'Blob';
                console.log(`processDocument: Attachment content is ${dataFormat} (Size: ${attachment.content.size} bytes). Converting to ArrayBuffer.`);
                fileData = await attachment.content.arrayBuffer();
            } else if (typeof attachment.content === 'string') {
                dataFormat = 'string';
                console.log(`processDocument: Attachment content is string (Length: ${attachment.content.length}). Checking for base64.`);
                // Basic check for base64 characteristics (common padding, chars)
                const isBase64Like = /^[A-Za-z0-9+/]*={0,2}$/.test(attachment.content.substring(0,100)); // Check start
                 const looksLikeDataUrl = attachment.content.startsWith('data:');

                if (looksLikeDataUrl || (isBase64Like && attachment.content.length % 4 === 0)) {
                   try {
                      const base64String = looksLikeDataUrl ? attachment.content.split(',')[1] : attachment.content;
                       if (!base64String) {
                           throw new Error("Empty base64 content after splitting data URL.");
                       }
                      console.log(`processDocument: Assuming base64 encoded string. Decoding...`);
                      const binaryString = atob(base64String);
                      const len = binaryString.length;
                      const bytes = new Uint8Array(len);
                      for (let i = 0; i < len; i++) {
                          bytes[i] = binaryString.charCodeAt(i);
                      }
                      fileData = bytes.buffer;
                      dataFormat = 'base64_string';
                   } catch (e) {
                        console.error(`processDocument: Error decoding base64 string for "${safeOriginalFilename}": ${e.message}. Skipping attachment.`);
                        continue; // Skip this attachment if decoding fails
                   }
                } else {
                    // If it's a string but doesn't look like base64, it's likely corrupted binary data treated as text.
                    console.warn(`processDocument: Attachment "${safeOriginalFilename}" content is a string but doesn't appear to be base64. This might indicate corruption *before* the edge function. Skipping upload for this attachment.`);
                    // DO NOT try TextEncoder().encode here for binary files!
                     continue; // Skip this likely corrupted attachment
                }
            } else if (attachment.content instanceof ArrayBuffer) {
                // Already an ArrayBuffer
                dataFormat = 'ArrayBuffer';
                console.log(`processDocument: Attachment content is already ArrayBuffer (Size: ${attachment.content.byteLength} bytes).`);
                fileData = attachment.content;
            } else if (attachment.content instanceof Uint8Array) {
                 dataFormat = 'Uint8Array';
                 console.log(`processDocument: Attachment content is Uint8Array (Size: ${attachment.content.byteLength} bytes). Using its buffer.`);
                 fileData = attachment.content.buffer;
            }
             else {
                console.warn(`processDocument: Skipping attachment "${safeOriginalFilename}" due to unsupported content type: ${typeof attachment.content}`);
                continue;
            }

            // --- Validation after conversion ---
            if (!fileData || fileData.byteLength === 0) {
                console.error(`processDocument: Skipping attachment "${safeOriginalFilename}" - resulted in empty file data after processing format ${dataFormat}.`);
                continue;
            }
            console.log(`processDocument: Processed content for "${safeOriginalFilename}" into ArrayBuffer (Size: ${fileData.byteLength} bytes).`);

            // Optional: Check PDF Header if applicable
            if (contentType === 'application/pdf') {
                if (!isPdfContent(new Uint8Array(fileData))) {
                     console.warn(`processDocument: Content for "${safeOriginalFilename}" (declared as PDF) is missing the '%PDF' header after processing. Uploading anyway, but it might be corrupt.`);
                } else {
                    console.log(`processDocument: PDF header check passed for "${safeOriginalFilename}".`);
                }
            }

        } catch (processError) {
            console.error(`processDocument: Error processing content for attachment "${safeOriginalFilename}": ${processError.message}`);
            continue; // Skip to next attachment on error
        }


        // --- Supabase Upload ---
        const timestamp = new Date().toISOString().replace(/[-:.]/g, ""); // Timestamp for uniqueness
        const storageFilename = `invoice_${timestamp}_${safeOriginalFilename}`;

        try {
            console.log(`processDocument: Uploading "${storageFilename}" to Supabase bucket "invoices" with contentType "${contentType}".`);

            // *** Upload using the ArrayBuffer directly ***
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('invoices')
                .upload(storageFilename, fileData, { // Use ArrayBuffer
                    contentType: contentType,
                    upsert: true // Use upsert: false if you *never* want to overwrite, true allows retries
                    // duplex: 'full' // Temporarily removed for simplification
                });

            if (uploadError) {
                console.error(`processDocument: Failed to upload document "${storageFilename}" to Supabase Storage:`, uploadError);
                // Consider if you want to throw or just continue to next attachment
                continue;
            }

            console.log(`processDocument: Successfully uploaded "${storageFilename}". Path: ${uploadData?.path}`);

            // --- URL Generation ---
            // Get Public URL (assuming bucket is public or using RLS for access)
            // Note: Public URLs don't work if the bucket is private and RLS isn't set up for GETs.
            const { data: publicUrlData } = supabase.storage
                .from('invoices')
                .getPublicUrl(storageFilename);

             // Generate a Signed URL (works for private buckets)
             // Expires in 1 day (adjust as needed)
            const expiresIn = 60 * 60 * 24;
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from('invoices')
                .createSignedUrl(storageFilename, expiresIn);

             if (signedUrlError) {
                 console.error(`processDocument: Could not create signed URL for "${storageFilename}":`, signedUrlError);
                 // Decide if this is critical. Maybe store the public URL or path anyway?
                 // For now, we'll continue but log the error.
             }

            const finalSignedUrl = signedUrlData ? normalizeUrl(signedUrlData.signedUrl) : null;
            const finalPublicUrl = publicUrlData ? normalizeUrl(publicUrlData.publicUrl) : null;

            console.log(`processDocument: Public URL for "${storageFilename}": ${finalPublicUrl || 'N/A'}`);
            console.log(`processDocument: Signed URL for "${storageFilename}" (expires ${expiresIn}s): ${finalSignedUrl || 'Error generating'}`);

            // Store details of the successfully processed attachment
            processedAttachment = {
                ...attachment, // Keep original details
                content: undefined, // Don't keep large content in the result object
                storage_path: uploadData?.path, // Store the path
                filename: storageFilename, // Use the unique storage filename
                original_filename: originalFilename, // Keep original for reference
                url: finalSignedUrl || finalPublicUrl, // Prefer signed URL if available
                public_url: finalPublicUrl, // Store public URL separately
                signed_url: finalSignedUrl, // Store signed URL separately
                upload_timestamp: new Date().toISOString()
            };

            // --- Text Extraction (Optional) ---
            if (contentType === 'application/pdf') {
                try {
                    // Pass the ArrayBuffer or a Uint8Array view
                    documentContent = await extractTextFromPdf(new Uint8Array(fileData));
                    if (documentContent) {
                         console.log(`processDocument: Extracted ${documentContent.length} characters of text from PDF "${storageFilename}".`);
                    } else {
                         console.log(`processDocument: Text extraction from PDF "${storageFilename}" returned empty content.`);
                    }
                } catch (extractError) {
                    console.error(`processDocument: Error extracting text from PDF "${storageFilename}": ${extractError.message}`);
                    documentContent = ""; // Ensure it's empty on error
                }
            }

            // If we successfully processed an attachment (especially a PDF), break the loop.
            // Adjust this logic if you need to process *all* valid attachments.
             console.log(`processDocument: Successfully processed and uploaded "${storageFilename}". Stopping attachment loop.`);
            break; // Stop after processing the first preferred attachment

        } catch (error) {
            console.error(`processDocument: Unhandled error during upload or URL generation for "${storageFilename}":`, error);
            // Continue to the next attachment
        }
    } // End loop through attachments

    if (!processedAttachment) {
         console.log("processDocument: No attachments were successfully processed and uploaded.");
    }

    return {
        documentContent, // Text content (if extracted)
        processedAttachment // Details of the uploaded file (or null)
    };
}


// --- Helper Functions (Ensure these are defined correctly) ---

/**
 * Normalizes a filename for safe storage.
 * @param filename The original filename.
 * @param ensurePdfExt If true and filename doesn't have .pdf, adds it.
 * @returns A safe filename string.
 */
export function normalizeFilename(filename: string | null | undefined, ensurePdfExt = false): string {
    if (!filename) {
        return ensurePdfExt ? "unnamed_attachment.pdf" : "unnamed_attachment";
    }
    let norm = String(filename)
        .trim()
        .toLowerCase()
        // Remove potentially harmful characters, replace spaces with underscores
        .replace(/[^a-z0-9.\-_]/g, '_')
         // Prevent path traversal
        .replace(/\.\.+[\/\\]/g, '')
        // Consolidate multiple underscores/dots
        .replace(/_+/g, '_')
        .replace(/\.\.+/g, '.');

     // Limit length
     norm = norm.substring(0, 200); // Limit length reasonably

    if (ensurePdfExt && !norm.endsWith('.pdf')) {
        // Remove other extensions first if adding .pdf
        norm = norm.replace(/\.[^.]+$/, '');
        norm += '.pdf';
    }
     // Handle edge case of empty name after sanitization
     if (norm === '.' || norm === '') {
         return ensurePdfExt ? "unnamed_attachment.pdf" : "unnamed_attachment";
     }
    return norm;
}


/**
 * Basic check for the PDF header (%PDF).
 * @param content Uint8Array of the file content.
 * @returns True if the header is found, false otherwise.
 */
export function isPdfContent(content: Uint8Array): boolean {
    if (!content || content.length < 5) return false;
    try {
        // Check the first 5 bytes for '%PDF-'
        const header = new TextDecoder().decode(content.slice(0, 5));
        return header === '%PDF-';
    } catch (e) {
        console.error("Error checking PDF header:", e);
        return false;
    }
}


/**
 * Extracts text content from PDF data (Placeholder/Current Implementation).
 * NOTE: Your current code skips extraction. This needs a proper library for Deno eventually.
 * @param content PDF binary content as Uint8Array.
 * @returns Extracted text or empty string.
 */
export async function extractTextFromPdf(content: Uint8Array): Promise<string> {
    if (!content || content.length === 0) {
        console.warn("extractTextFromPdf: Received empty content.");
        return "";
    }
    if (!isPdfContent(content)) {
         console.warn("extractTextFromPdf: Content doesn't appear to be a valid PDF based on header. Skipping text extraction.");
         return "";
    }

    // --- PDF Text Extraction Logic ---
    // This is where you would integrate a Deno-compatible PDF parsing library.
    // Example using a hypothetical library `DenoPdfParser`:
    /*
    try {
        const pdfText = await DenoPdfParser.getText(content);
        return pdfText || "";
    } catch (error) {
        console.error('Error during PDF text extraction:', error);
        return '';
    }
    */

    // Your current logic: Skip extraction
    console.log("extractTextFromPdf: Skipping actual text extraction as per current implementation.");
    return ""; // Return empty for now
}


/**
 * Normalizes URLs to prevent common issues like double slashes.
 * @param url The URL string.
 * @returns Normalized URL string or original if invalid.
 */
export function normalizeUrl(url: string | null | undefined): string | null {
     if (!url) return null;
     try {
         // Basic validation
         if (typeof url !== 'string' || url.length < 5 || !url.includes(':')) {
             console.warn(`normalizeUrl: Received invalid URL: ${url}`);
             return url; // Return as is if it doesn't look like a URL
         }

        // Use the URL constructor for robust parsing and normalization
        const urlObj = new URL(url);

        // Reconstruct to ensure clean path slashes (pathname handles this)
         return urlObj.toString();

     } catch (error) {
         console.error(`Error normalizing URL "${url}": ${error.message}`);
         return url; // Return original URL on parsing error
     }
}

// --- Make sure other functions like extractTextFromDocx/Doc are defined if needed ---
// export async function extractTextFromDocx(content) { ... }
// export async function extractTextFromDoc(content) { ... }
