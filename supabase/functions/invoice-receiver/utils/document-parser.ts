
import { createWorker } from "https://esm.sh/tesseract.js@4.1.1";

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
    // Verify this is actually a PDF
    if (!isPdfContent(content)) {
      console.warn("Content doesn't appear to be a valid PDF (missing %PDF header)");
    }
    
    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$,.-():/'
    });

    // Convert Uint8Array to Blob for Tesseract
    const blob = new Blob([content], { type: 'application/pdf' });
    const { data } = await worker.recognize(blob);
    await worker.terminate();

    console.log('OCR extracted text:', data.text.substring(0, 200) + '...');
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

export async function extractTextFromDocx(content) {
  return "DOCX content extraction not implemented";
}

export async function extractTextFromDoc(content) {
  return "DOC content extraction not implemented";
}
