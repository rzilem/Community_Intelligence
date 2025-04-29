import { createWorker } from "https://esm.sh/tesseract.js@4.1.1";

export function getDocumentType(filename) {
  if (!filename) return "unknown";
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.endsWith('.pdf')) return "pdf";
  if (lowerFilename.endsWith('.docx')) return "docx";
  if (lowerFilename.endsWith('.doc')) return "doc";
  return "unknown";
}

export async function extractTextFromPdf(content) {
  try {
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
