import { createWorker } from "https://esm.sh/tesseract.js@4.1.1";

export function getDocumentType(filename: string): string {
  if (!filename) return "unknown";
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.endsWith('.pdf')) return "pdf";
  if (lowerFilename.endsWith('.docx')) return "docx";
  if (lowerFilename.endsWith('.doc')) return "doc";
  return "unknown";
}

export async function extractTextFromPdf(content: string): Promise<string> {
  try {
    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$,.-():/'
    });
    const { data } = await worker.recognize(content);
    await worker.terminate();
    console.log('OCR extracted text:', data.text.substring(0, 200) + '...', {
      contentLength: content.length,
      extractedLength: data.text.length
    });
    return data.text || "No text extracted from PDF";
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

export async function extractTextFromDocx(content: string): Promise<string> {
  return "DOCX content extraction not implemented";
}

export async function extractTextFromDoc(content: string): Promise<string> {
  return "DOC content extraction not implemented";
}