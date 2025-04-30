// FILE: ./services/document-processor.ts
import {
    extractTextFromPdf,
    extractTextFromDocx,
    extractTextFromDoc,
    getDocumentType,
    // Assuming isPdfContent and normalizeUrl might also be in document-parser or another util
    // Add imports for them if they exist and are needed, otherwise use inline versions below
    // e.g., import { isPdfContent } from "../utils/document-parser.ts";
    // e.g., import { normalizeUrl } from "../utils/url-normalizer.ts";
} from "../utils/document-parser.ts"; // Adjust path if needed
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- Helper function (if not imported) ---
function isPdfContent(content: Uint8Array): boolean {
    if (!content || content.length < 5) return false;
    try {
        const header = new TextDecoder().decode(content.slice(0, 5));
        return header === '%PDF-';
    } catch (e) {
        console.error("isPdfContent check failed:", e);
        return false;
    }
}

// --- Helper function (if not imported) ---
function normalizeUrl(url: string | null | undefined): string | null {
     if (!url) return null;
     try {
         if (typeof url !== 'string' || url.length < 5 || !url.includes(':')) {
             console.warn(`normalizeUrl: Received invalid URL: ${url}`);
             return url;
         }
        const urlObj = new URL(url);
         return urlObj.toString();
     } catch (error) {
         console.error(`Error normalizing URL "${url}": ${error.message}`);
         return url;
     }
}

// --- Helper function (if not imported/needed) ---
function normalizeFilename(filename: string | null | undefined, ensurePdfExt = false): string {
    // Simplified version from previous example - use if needed
    if (!filename) return ensurePdfExt ? "unnamed_attachment.pdf" : "unnamed_attachment";
    let norm = String(filename).trim().toLowerCase().replace(/[^a-z0-9.\-_]/g, '_');
    norm = norm.substring(0, 200);
    if (ensurePdfExt && !norm.endsWith('.pdf')) {
        norm = norm.replace(/\.[^.]+$/, '') + '.pdf';
    }
    return (norm === '.' || norm === '') ? (ensurePdfExt ? "unnamed_attachment.pdf" : "unnamed_attachment") : norm;
}


/**
 * Processes email attachments: finds primary doc (PDF preferred), uploads to Storage,
 * generates URLs, and attempts text extraction.
 *
 * @param attachments Array of attachment objects from normalizeEmailData
 * @returns Object with { documentContent, processedAttachment }
 */
export async function processDocument(attachments: any[] = []) {
    let documentContent = "";
    let processedAttachment = null;

    if (!attachments || attachments.length === 0) {
        console.log("processDocument: No attachments found.");
        return { documentContent: "", processedAttachment: null };
    }

    console.log(`processDocument: Received ${attachments.length} attachments.`);

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
        let contentType = attachment.contentType || 'application/octet-stream'; // Default if unknown
        const safeOriginalFilename = normalizeFilename(originalFilename, contentType === 'application/pdf');

        // Ensure contentType is 'application/pdf' if filename ends with .pdf
        if (!contentType || contentType === 'application/octet-stream') {
             if (safeOriginalFilename.toLowerCase().endsWith('.pdf')) {
                 contentType = 'application/pdf';
                 console.log(`processDocument: Corrected content type to application/pdf based on filename for "${safeOriginalFilename}"`);
             }
        }

        console.log(`processDocument: Attempting to process attachment: "${safeOriginalFilename}" (Type: ${contentType})`);

        if (!attachment.content) {
            console.warn(`processDocument: Skipping attachment "${safeOriginalFilename}" due to missing content.`);
            continue;
        }

        let fileData: ArrayBuffer | null = null; // Use ArrayBuffer for upload
        let dataFormat: string = 'unknown';

        // --- 1. Content Conversion and Validation ---
        try {
            const contentToProcess = attachment.content;

            if (contentToProcess instanceof File || contentToProcess instanceof Blob) {
                dataFormat = contentToProcess instanceof File ? 'File' : 'Blob';
                console.log(`processDocument: Attachment content is ${dataFormat} (Size: ${contentToProcess.size} bytes). Converting to ArrayBuffer.`);
                fileData = await contentToProcess.arrayBuffer();
            } else if (typeof contentToProcess === 'string') {
                dataFormat = 'string';
                console.log(`processDocument: Attachment content is string (Length: ${contentToProcess.length}). Checking for base64.`);
                // More reliable base64 check (simplified)
                 try {
                    atob(contentToProcess); // Check if it decodes without error
                    const binaryString = atob(contentToProcess);
                    const len = binaryString.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    fileData = bytes.buffer; // Get the ArrayBuffer
                    dataFormat = 'base64_string';
                     console.log(`processDocument: Decoded base64 string successfully.`);
                } catch (e) {
                    // If atob fails, it's not valid base64. Treat as potentially corrupt binary string.
                    console.warn(`processDocument: Attachment "${safeOriginalFilename}" content is a string but failed base64 decoding (${e.message}). This likely indicates corruption *before* the edge function or incorrect transmission. Skipping upload.`);
                    // **DO NOT use TextEncoder here for binary files!**
                    continue; // Skip this likely corrupted attachment
                }
            }
             else if (contentToProcess instanceof ArrayBuffer) {
                 dataFormat = 'ArrayBuffer';
                 console.log(`processDocument: Attachment content is already ArrayBuffer (Size: ${contentToProcess.byteLength} bytes).`);
                 fileData = contentToProcess;
            } else if (contentToProcess instanceof Uint8Array) {
                 dataFormat = 'Uint8Array';
                 console.log(`processDocument: Attachment content is Uint8Array (Size: ${contentToProcess.byteLength} bytes). Using its buffer.`);
                 fileData = contentToProcess.buffer; // Use the underlying ArrayBuffer
             }
             else {
                console.warn(`processDocument: Skipping attachment "${safeOriginalFilename}" due to unsupported content type in attachment object: ${typeof contentToProcess}`);
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
                const contentBytes = new Uint8Array(fileData); // Create temporary view for check
                if (!isPdfContent(contentBytes)) { // Use helper function
                     console.warn(`processDocument: Content for "${safeOriginalFilename}" (declared as PDF) is missing the '%PDF-' header after processing. Uploading anyway, but it might be corrupt.`);
                } else {
                    console.log(`processDocument: PDF header check passed for "${safeOriginalFilename}".`);
                }
            }

        } catch (processError) {
            console.error(`processDocument: Error processing content for attachment "${safeOriginalFilename}": ${processError.message}`);
            continue; // Skip to next attachment on error
        }


        // --- 2. Supabase Upload ---
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
        const storageFilename = `invoice_${timestamp}_${safeOriginalFilename}`;

        try {
            console.log(`processDocument: Uploading "${storageFilename}" to Supabase bucket "invoices" with contentType "${contentType}".`);

            // *** Upload using the ArrayBuffer directly ***
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('invoices')
                .upload(storageFilename, fileData, { // <-- Use ArrayBuffer (fileData)
                    contentType: contentType,
                    upsert: true // Or false if preferred
                    // duplex: 'full' // Removed for simplification
                });

            if (uploadError) {
                console.error(`processDocument: Failed to upload document "${storageFilename}" to Supabase Storage:`, uploadError);
                continue; // Continue to next attachment
            }

            console.log(`processDocument: Successfully uploaded "${storageFilename}". Path: ${uploadData?.path}`);

            // --- 3. URL Generation (Public and Signed) ---
            const { data: publicUrlData } = supabase.storage
                .from('invoices')
                .getPublicUrl(storageFilename);

            const expiresIn = 60 * 60 * 24; // 1 day validity for signed URL
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from('invoices')
                .createSignedUrl(storageFilename, expiresIn);

             if (signedUrlError) {
                 console.error(`processDocument: Could not create signed URL for "${storageFilename}":`, signedUrlError);
                 // Non-fatal, public URL might still work
             }

            const finalPublicUrl = normalizeUrl(publicUrlData?.publicUrl);
            const finalSignedUrl = normalizeUrl(signedUrlData?.signedUrl);

            console.log(`processDocument: Public URL: ${finalPublicUrl || 'N/A'}`);
            console.log(`processDocument: Signed URL (expires ${expiresIn}s): ${finalSignedUrl || 'Error/Not generated'}`);

            // --- 4. Text Extraction (Corrected Input) ---
            let extractedText = "";
             // Use getDocumentType imported from utils
            const documentType = getDocumentType(originalFilename);

            // Only attempt extraction if we have the binary data and it's a known type
            if (fileData && (documentType !== "unknown" || contentType.includes('pdf'))) {
                 console.log(`processDocument: Attempting text extraction for type "${documentType}" or contentType "${contentType}".`);
                 try {
                     const contentBytes = new Uint8Array(fileData); // Pass Uint8Array view to extractors
                     switch (documentType) {
                         case "pdf":
                             extractedText = await extractTextFromPdf(contentBytes); // Pass bytes
                             break;
                         case "docx":
                             extractedText = await extractTextFromDocx(contentBytes); // Pass bytes
                             break;
                         case "doc":
                             extractedText = await extractTextFromDoc(contentBytes); // Pass bytes
                             break;
                         default:
                             // If type is unknown but content is PDF, still try PDF extraction
                             if (contentType.includes('pdf')) {
                                 console.log(`processDocument: Document type unknown, but content type is PDF. Attempting PDF extraction.`);
                                 extractedText = await extractTextFromPdf(contentBytes);
                             } else {
                                 console.log(`processDocument: Skipping text extraction for unknown document type "${documentType}" and contentType "${contentType}".`);
                             }
                     }
                     console.log(`processDocument: Text extraction result length: ${extractedText?.length || 0}`);
                 } catch (extractError) {
                     console.error(`processDocument: Error extracting text from "${storageFilename}": ${extractError.message}`);
                     extractedText = ""; // Ensure empty on error
                 }
            } else {
                 console.log(`processDocument: Skipping text extraction for "${storageFilename}" (Type: ${documentType}, ContentType: ${contentType}).`);
            }

            documentContent = extractedText || ""; // Store result

            // --- 5. Prepare Result ---
            processedAttachment = {
                ...attachment, // Keep original details if needed
                content: undefined, // Don't return large content
                storage_path: uploadData?.path,
                filename: storageFilename, // Unique storage filename
                original_filename: originalFilename, // Original name for reference
                url: finalSignedUrl || finalPublicUrl, // Prefer signed URL
                public_url: finalPublicUrl,
                signed_url: finalSignedUrl,
                upload_timestamp: new Date().toISOString(),
                text_content_length: documentContent.length // Store length of extracted text
            };

            console.log(`processDocument: Successfully processed and uploaded "${storageFilename}". Stopping attachment loop.`);
            break; // Stop after processing the first preferred attachment

        } catch (error) {
            console.error(`processDocument: Unhandled error during upload/URL/extraction for "${storageFilename}":`, error);
            // Continue to the next attachment
        }
    } // End loop through attachments

    // Removed the complex fallback logic - the main loop should handle the first valid one.

    if (!processedAttachment) {
         console.log("processDocument: No attachments were successfully processed and uploaded after checking all candidates.");
    } else {
         console.log(`processDocument: Finished. Returning processed attachment: ${processedAttachment.filename}`);
    }

    return { documentContent, processedAttachment };
}

// Ensure other necessary functions like getDocumentType are correctly imported or defined.
// Make sure the extractText... functions are robust and handle potential errors.
