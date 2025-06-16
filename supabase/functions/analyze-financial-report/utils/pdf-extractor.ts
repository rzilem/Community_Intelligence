
import { createWorker } from "https://esm.sh/tesseract.js@4.1.1";

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
