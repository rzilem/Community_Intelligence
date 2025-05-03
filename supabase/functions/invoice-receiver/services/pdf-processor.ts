
import { decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";
import { createHash } from "https://deno.land/std@0.190.0/crypto/mod.ts";

/**
 * Validates and processes PDF content
 * @param contentBuffer The binary content of the PDF
 * @param filename The name of the file for logging purposes
 * @returns Object containing validation results and checksum
 */
export function validatePDF(contentBuffer: Uint8Array, filename: string): { 
  isValid: boolean; 
  checksum: string;
  errorMessage?: string;
} {
  try {
    // Check PDF header
    const pdfHeader = Array.from(contentBuffer.slice(0, 4)).map(b => b.toString(16)).join('');
    if (pdfHeader !== '25504446') { // %PDF in hex
      console.error(`Invalid PDF header for ${filename}: ${pdfHeader}`);
      return { 
        isValid: false, 
        checksum: '',
        errorMessage: `Invalid PDF content: File does not start with %PDF`
      };
    }
    
    // Compute checksum
    const hasher = createHash("sha256");
    hasher.update(contentBuffer);
    const checksum = hasher.toString();
    console.log(`Original checksum for ${filename}: ${checksum}`);
    
    return { 
      isValid: true, 
      checksum 
    };
  } catch (error) {
    console.error(`PDF validation error for ${filename}: ${error.message}`);
    return { 
      isValid: false, 
      checksum: '',
      errorMessage: `PDF validation failed: ${error.message}`
    };
  }
}

/**
 * Decodes base64 encoded PDF content
 * @param content The base64 encoded content string
 * @param filename The name of the file for logging purposes
 * @returns Decoded Uint8Array or null if decoding failed
 */
export function decodePDFContent(content: string, filename: string): Uint8Array | null {
  try {
    const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(
      content.trim().replace(/\s/g, '')
    );
    
    if (!isBase64) {
      console.warn(`Content for ${filename} is not base64 encoded`);
      return null;
    }
    
    // Remove data URI prefix if present and normalize
    const base64Content = content
      .replace(/^data:application\/pdf;base64,/, '')
      .replace(/\s/g, '');
    
    const contentBuffer = decode(base64Content);
    
    console.log(`Base64 decoded: ${filename}`, {
      length: contentBuffer.byteLength,
      firstBytes: Array.from(contentBuffer.slice(0, 4)).map(b => b.toString(16)).join('')
    });
    
    return contentBuffer;
  } catch (error) {
    console.error(`Base64 decode error for ${filename}: ${error.message}`);
    return null;
  }
}

/**
 * Verifies that an uploaded PDF file matches the original content
 * @param uploadedBuffer The binary content of the uploaded file
 * @param originalChecksum The checksum of the original file for comparison
 * @param originalSize The size of the original file for comparison
 * @param filename The name of the file for logging purposes
 * @returns Object indicating if the file is valid and any error message
 */
export function verifyUploadedPDF(
  uploadedBuffer: Uint8Array, 
  originalChecksum: string, 
  originalSize: number,
  filename: string
): { isValid: boolean; errorMessage?: string } {
  try {
    // Check PDF header
    const uploadedHeader = Array.from(uploadedBuffer.slice(0, 4)).map(b => b.toString(16)).join('');
    if (uploadedHeader !== '25504446') {
      console.error(`Uploaded file corrupted for ${filename}:`, { uploadedHeader });
      return { 
        isValid: false, 
        errorMessage: 'Uploaded file is not a valid PDF'
      };
    }
    
    // Check file size
    if (uploadedBuffer.byteLength !== originalSize) {
      console.error(`Uploaded file size mismatch for ${filename}:`, {
        originalSize,
        uploadedSize: uploadedBuffer.byteLength
      });
      return { 
        isValid: false, 
        errorMessage: 'Uploaded file size does not match original'
      };
    }
    
    // Check checksum if provided
    if (originalChecksum) {
      const hasher = createHash("sha256");
      hasher.update(uploadedBuffer);
      const uploadedChecksum = hasher.toString();
      console.log(`Uploaded checksum for ${filename}: ${uploadedChecksum}`);
      
      if (originalChecksum !== uploadedChecksum) {
        console.error(`Checksum mismatch for ${filename}:`, {
          originalChecksum,
          uploadedChecksum
        });
        return { 
          isValid: false, 
          errorMessage: 'Uploaded file content does not match original'
        };
      }
    }
    
    return { isValid: true };
  } catch (error) {
    console.error(`Error verifying uploaded PDF ${filename}: ${error.message}`);
    return { 
      isValid: false, 
      errorMessage: `Verification failed: ${error.message}`
    };
  }
}
