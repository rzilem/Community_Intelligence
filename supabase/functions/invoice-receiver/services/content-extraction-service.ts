
import { extractTextFromPdf, extractTextFromDocx, extractTextFromDoc, getDocumentType } from "../utils/document-parser.ts";

/**
 * Service for extracting text content from various document types
 */
export class ContentExtractionService {
  /**
   * Extract text from a document based on its type
   * @param content Document content string (base64 for PDFs)
   * @param filename Filename used to determine document type
   * @param contentType MIME type of the document
   * @returns Extracted text content
   */
  async extractContent(
    content: string | null,
    filename: string,
    contentType: string
  ): Promise<string> {
    if (!content) {
      console.warn(`No content to extract from ${filename}`);
      return "";
    }

    const documentType = getDocumentType(filename);
    
    // Skip unsupported document types
    if (documentType === "unknown" && !contentType.includes('pdf')) {
      console.log(`Skipping unsupported document type: ${filename} (${contentType})`);
      return "";
    }
    
    try {
      let extractedText = "";
      
      switch (documentType) {
        case "pdf":
          console.log(`Extracting text from PDF: ${filename}`);
          extractedText = await extractTextFromPdf(typeof content === 'string' ? content : '');
          break;
          
        case "docx":
          console.log(`Extracting text from DOCX: ${filename}`);
          extractedText = await extractTextFromDocx(typeof content === 'string' ? content : '');
          break;
          
        case "doc":
          console.log(`Extracting text from DOC: ${filename}`);
          extractedText = await extractTextFromDoc(typeof content === 'string' ? content : '');
          break;
          
        default:
          console.log(`No extraction method for document type: ${documentType}`);
      }
      
      console.log(`Text extraction for ${filename}`, {
        success: !!extractedText,
        length: extractedText?.length || 0
      });
      
      return extractedText || "";
    } catch (error: any) {
      console.error(`Error extracting text from ${filename}: ${error.message}`);
      return "";
    }
  }
  
  /**
   * Process content from various sources to extract the best possible text
   * @param documentContent Extracted document content
   * @param emailHtml HTML content from email
   * @param emailText Plain text content from email
   * @param emailSubject Email subject line
   * @returns Best available content
   */
  getBestAvailableContent(
    documentContent: string,
    emailHtml: string,
    emailText: string,
    emailSubject: string
  ): string {
    // Prioritize extracted document content, fallback to email content
    if (documentContent) {
      return documentContent;
    } else if (emailText) {
      return emailText;
    } else if (emailHtml) {
      return this.stripHtml(emailHtml);
    } else {
      return emailSubject || "";
    }
  }
  
  /**
   * Simple HTML content stripper
   * @param html HTML content to strip
   * @returns Plain text without HTML tags
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ') // Replace tags with spaces
      .replace(/\s{2,}/g, ' ')  // Replace multiple spaces with a single space
      .trim();
  }
}
