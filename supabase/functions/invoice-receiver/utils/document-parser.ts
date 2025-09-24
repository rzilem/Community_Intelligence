
import { createWorker } from "https://esm.sh/tesseract.js@4.1.1";
// mammoth removed due to dependency issues - placeholder for now
// textract removed due to dependency issues - placeholder for now

/**
 * Determines the document type based on file extension
 * @param filename The name of the file
 * @returns Document type string ("pdf", "docx", "doc", or "unknown")
 */
export function getDocumentType(filename: string): string {
  if (!filename) return "unknown";
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.endsWith('.pdf')) return "pdf";
  if (lowerFilename.endsWith('.docx')) return "docx";
  if (lowerFilename.endsWith('.doc')) return "doc";
  return "unknown";
}

/**
 * Extracts text from PDF using OCR
 * @param content Base64 encoded PDF content
 * @returns Extracted text
 */
export async function extractTextFromPdf(content: string): Promise<string> {
  try {
    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$,.-():/\\'
    });
    const { data } = await worker.recognize(content);
    await worker.terminate();
    console.log('OCR extracted text:', data.text.substring(0, 200) + '...', {
      contentLength: content.length,
      extractedLength: data.text.length
    });
    return data.text || "No text extracted from PDF";
  } catch (error: any) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

/**
 * Extracts text from DOCX file (placeholder)
 * @param content DOCX content
 * @returns Extracted text
 */
export async function extractTextFromDocx(content: string): Promise<string> {
  try {
    // Placeholder implementation - mammoth removed due to dependency issues
    console.log('DOCX text extraction not yet implemented');
    return 'DOCX text extraction temporarily unavailable';
  } catch (error: any) {
    console.error('Error extracting text from DOCX:', error);
    return '';
  }
}

/**
 * Extracts text from DOC file (placeholder)
 * @param content DOC content
 * @returns Extracted text
 */
export async function extractTextFromDoc(content: string): Promise<string> {
  try {
    // Placeholder implementation - textract removed due to dependency issues
    console.log('DOC text extraction not yet implemented');
    return 'DOC text extraction temporarily unavailable';
  } catch (error: any) {
    console.error('Error extracting text from DOC:', error);
    return '';
  }
}
