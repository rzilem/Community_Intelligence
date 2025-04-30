
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
    // Initialize Tesseract worker
    const worker = await createWorker();
    
    // Configure worker for better invoice recognition
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$,.-():/',
    });

    // Perform OCR on the PDF content
    const { data: { text } } = await worker.recognize(content);
    
    // Terminate worker to free resources
    await worker.terminate();

    console.log('OCR extracted text:', text.substring(0, 200) + '...');
    return text;
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
