
// Fix import path to use full URL for Edge Function compatibility
import { createWorker } from "https://esm.sh/tesseract.js@5.0.5";

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
    // Skip OCR processing in Deno Edge Function environment due to Worker limitations
    console.log('OCR text extraction skipped in Edge Function environment');
    
    // Return an empty string or placeholder text - the PDF URL is still valid
    // and will be accessible to the frontend for display
    return '';
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
