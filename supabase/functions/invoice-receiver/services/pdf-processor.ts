
import { decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

/**
 * Decodes a base64 PDF content string
 */
export function decodePDFContent(content: string, filename: string): Uint8Array | null {
  try {
    const base64Content = content
      .replace(/^data:application\/pdf;base64,/, '')
      .replace(/\s/g, '');
    
    const contentBuffer = decode(base64Content);
    console.log(`Base64 decoded: ${filename}`, {
      length: contentBuffer.byteLength,
      firstBytes: Array.from(contentBuffer.slice(0, 4)).map(b => b.toString(16)).join('')
    });
    
    return contentBuffer;
  } catch (base64Error) {
    console.error(`Base64 decode error for ${filename}: ${base64Error.message}`);
    return null;
  }
}

/**
 * Validates if the content is a valid PDF
 */
export function validatePDF(contentBuffer: Uint8Array, filename: string): { 
  isValid: boolean; 
  errorMessage?: string; 
  checksum: string;
} {
  try {
    const pdfHeader = Array.from(contentBuffer.slice(0, 4)).map(b => b.toString(16)).join('');
    if (pdfHeader !== '25504446') { // %PDF in hex
      console.error(`Invalid PDF header for ${filename}: ${pdfHeader}`);
      return { 
        isValid: false, 
        errorMessage: `Invalid PDF content: File does not start with %PDF`, 
        checksum: '' 
      };
    }
    
    // Compute checksum using native crypto
    const hashBuffer = crypto.subtle.digestSync("SHA-256", contentBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    console.log(`Original checksum for ${filename}: ${checksum}`);
    
    return { 
      isValid: true, 
      checksum 
    };
  } catch (error) {
    console.error(`Error validating PDF ${filename}: ${error.message}`);
    return { 
      isValid: false, 
      errorMessage: `Error validating PDF: ${error.message}`, 
      checksum: '' 
    };
  }
}

/**
 * Verifies that an uploaded PDF matches the original
 */
export function verifyUploadedPDF(
  uploadedBuffer: Uint8Array, 
  originalChecksum: string, 
  originalSize: number, 
  filename: string
): { 
  isValid: boolean; 
  errorMessage?: string; 
} {
  try {
    // Check size match
    if (uploadedBuffer.byteLength !== originalSize) {
      console.error(`Uploaded file size mismatch for ${filename}:`, {
        originalSize,
        uploadedSize: uploadedBuffer.byteLength
      });
      return { 
        isValid: false, 
        errorMessage: `Uploaded file size does not match original` 
      };
    }
    
    // Check PDF header
    const uploadedHeader = Array.from(uploadedBuffer.slice(0, 4)).map(b => b.toString(16)).join('');
    if (uploadedHeader !== '25504446') { // %PDF in hex
      console.error(`Uploaded file corrupted for ${filename}:`, {
        uploadedHeader
      });
      return { 
        isValid: false, 
        errorMessage: `Uploaded file is not a valid PDF` 
      };
    }
    
    // If there's an original checksum, verify it
    if (originalChecksum) {
      // Compute checksum using native crypto
      const hashBuffer = crypto.subtle.digestSync("SHA-256", uploadedBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const uploadedChecksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      console.log(`Uploaded checksum for ${filename}: ${uploadedChecksum}`);
      
      if (originalChecksum !== uploadedChecksum) {
        console.error(`Checksum mismatch for ${filename}:`, {
          originalChecksum,
          uploadedChecksum
        });
        return { 
          isValid: false, 
          errorMessage: `Uploaded file content does not match original` 
        };
      }
    }
    
    return { isValid: true };
  } catch (error) {
    console.error(`Error verifying uploaded PDF ${filename}: ${error.message}`);
    return { 
      isValid: false, 
      errorMessage: `Error verifying uploaded PDF: ${error.message}` 
    };
  }
}
