
import { createWorker } from "https://esm.sh/tesseract.js@4.1.1";
import mammoth from "npm:mammoth";
import textract from "npm:textract";

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
    const binaryString = atob(content.replace(/^data:.*;base64,/, ''));
    const buffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      buffer[i] = binaryString.charCodeAt(i);
    }
    const { value } = await mammoth.extractRawText({ buffer });
    return value.trim();
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
    const binaryString = atob(content.replace(/^data:.*;base64,/, ''));
    const buffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      buffer[i] = binaryString.charCodeAt(i);
    }
    const text: string = await new Promise((resolve, reject) => {
      textract.fromBufferWithName('file.doc', buffer, (err: any, res: string) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
    return text.trim();
  } catch (error: any) {
    console.error('Error extracting text from DOC:', error);
    return '';
  }
}
