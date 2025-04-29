
export function getDocumentType(filename) {
  if (!filename) return "unknown";
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.endsWith('.pdf')) return "pdf";
  if (lowerFilename.endsWith('.docx')) return "docx";
  if (lowerFilename.endsWith('.doc')) return "doc";
  return "unknown";
}

export function normalizeFilename(filename) {
  if (!filename) return "unnamed_document.pdf";
  
  // Ensure the filename has a proper extension
  let normalizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Add .pdf extension if not present
  if (!normalizedName.toLowerCase().endsWith('.pdf')) {
    normalizedName += '.pdf';
  }
  
  return normalizedName;
}

export function isPdfContent(content) {
  if (!content || content.length < 5) return false;
  
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

export async function extractTextFromPdf(content) {
  try {
    if (!isPdfContent(content)) {
      console.warn("Content doesn't appear to be a valid PDF - skipping text extraction");
      return ""; // Return empty string instead of trying to extract
    }
    
    // For now, we'll return an empty string as text extraction is failing
    // and blocking the processing. We'll improve this in a future update.
    console.log("Skipping text extraction to avoid errors");
    return "";
  } catch (error) {
    console.error('Error in extractTextFromPdf:', error);
    return '';
  }
}

export async function extractTextFromDocx(content) {
  return "DOCX content extraction not implemented";
}

export async function extractTextFromDoc(content) {
  return "DOC content extraction not implemented";
}
