
/**
 * Determines the document type from filename
 * @param {string} filename The filename to check
 * @returns {string} The document type
 */
export function getDocumentType(filename) {
  if (!filename) return "unknown";
  
  // Sanitize input - only allow alphanumeric, dots and dashes
  const sanitizedFilename = String(filename).replace(/[^a-zA-Z0-9.-]/g, '');
  const lowerFilename = sanitizedFilename.toLowerCase();
  
  // Whitelist approach for document types
  if (lowerFilename.endsWith('.pdf')) return "pdf";
  if (lowerFilename.endsWith('.docx')) return "docx";
  if (lowerFilename.endsWith('.doc')) return "doc";
  return "unknown";
}

/**
 * Normalizes filename to be safe for storage
 * @param {string} filename The filename to normalize
 * @returns {string} Normalized filename
 */
export function normalizeFilename(filename) {
  if (!filename) return "unnamed_document.pdf";
  
  // Convert to string to handle any type
  const fileString = String(filename);
  
  // Limit filename length for security
  let normalizedName = fileString.substring(0, 255);
  
  // Remove path traversal attempts
  normalizedName = normalizedName.replace(/\.\.\//g, '');
  normalizedName = normalizedName.replace(/\.\.\\/g, '');
  
  // Only allow safe characters
  normalizedName = normalizedName.trim().replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Add .pdf extension if not present
  if (!normalizedName.toLowerCase().endsWith('.pdf')) {
    normalizedName += '.pdf';
  }
  
  return normalizedName;
}

/**
 * Checks if content appears to be a PDF
 * @param {Uint8Array|Buffer} content The content to check
 * @returns {boolean} Whether content appears to be PDF
 */
export function isPdfContent(content) {
  if (!content || !content.length || content.length < 5) return false;
  
  // Convert first 5 bytes to string to check for %PDF header
  try {
    const decoder = new TextDecoder();
    const header = decoder.decode(content.slice(0, 5));
    return header.startsWith('%PDF');
  } catch (e) {
    console.error("Error checking PDF header:", e);
    return false;
  }
}

/**
 * Extracts text content from PDF data
 * @param {Uint8Array|Buffer} content PDF binary content
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromPdf(content) {
  try {
    // Validate input
    if (!content || content.length < 100) {
      console.warn("Invalid or too small PDF content provided");
      return "";
    }
    
    if (!isPdfContent(content)) {
      console.warn("Content doesn't appear to be a valid PDF - skipping text extraction");
      return ""; // Return empty string instead of trying to extract
    }
    
    // For now, we'll return a placeholder as text extraction is causing issues
    // This can be improved in a future update with a proper PDF text extraction library
    console.log("Skipping detailed text extraction to avoid errors");
    return "";
  } catch (error) {
    console.error('Error in extractTextFromPdf:', error);
    return '';
  }
}

/**
 * Extracts text from DOCX (placeholder)
 */
export async function extractTextFromDocx(content) {
  // Validate input first
  if (!content || content.length < 100) {
    console.warn("Invalid or too small DOCX content provided");
    return "";
  }
  return "DOCX content extraction not implemented";
}

/**
 * Extracts text from DOC (placeholder)
 */
export async function extractTextFromDoc(content) {
  // Validate input first
  if (!content || content.length < 100) {
    console.warn("Invalid or too small DOC content provided");
    return "";
  }
  return "DOC content extraction not implemented";
}
