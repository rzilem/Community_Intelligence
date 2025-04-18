export function getDocumentType(filename: string): "pdf" | "docx" | "doc" | "unknown" {
  if (!filename) return "unknown";
  
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.endsWith('.pdf')) {
    return "pdf";
  } else if (lowerFilename.endsWith('.docx')) {
    return "docx";
  } else if (lowerFilename.endsWith('.doc')) {
    return "doc";
  } else {
    return "unknown";
  }
}

export async function extractTextFromPdf(content: string): Promise<string> {
  try {
    // Use more robust PDF text extraction
    // For now returning placeholder since actual PDF parsing requires additional dependencies
    // In production, this would use a PDF parsing library
    return content;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

export async function extractTextFromDocx(content: string): Promise<string> {
  // This is a placeholder for DOCX extraction
  return "DOCX content extraction not implemented";
}

export async function extractTextFromDoc(content: string): Promise<string> {
  // This is a placeholder for DOC extraction
  return "DOC content extraction not implemented";
}
