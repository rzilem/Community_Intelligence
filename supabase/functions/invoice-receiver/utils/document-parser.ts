
import { decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

/**
 * Document parser utility for extracting text from different document types
 */

// Parse PDF document using PDF.js (simplified implementation)
export async function extractTextFromPdf(base64Content: string): Promise<string> {
  try {
    console.log("Starting PDF text extraction");
    
    if (!base64Content || typeof base64Content !== 'string') {
      console.error("Invalid PDF content provided:", typeof base64Content);
      return "";
    }
    
    // This is a simplified implementation - in a production environment,
    // you would use a more robust PDF parsing library
    
    // For demonstration purposes, we'll extract some text from the binary data
    let decodedContent;
    try {
      decodedContent = decode(base64Content);
      console.log(`Decoded PDF content, size: ${decodedContent.length} bytes`);
    } catch (decodeError) {
      console.error("Error decoding PDF content:", decodeError);
      return "";
    }
    
    // Extract text content from the PDF binary
    // This is a simplified approach - we're looking for text markers in the PDF
    const textContent = extractTextFromBinary(decodedContent);
    
    console.log(`Extracted text from PDF, length: ${textContent.length} characters`);
    if (textContent.length > 100) {
      console.log(`PDF text sample: ${textContent.substring(0, 100)}...`);
    } else {
      console.log(`PDF text content: ${textContent}`);
    }
    
    return textContent;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "";
  }
}

// Parse DOCX document (simplified implementation)
export async function extractTextFromDocx(base64Content: string): Promise<string> {
  try {
    console.log("Starting DOCX text extraction");
    
    if (!base64Content || typeof base64Content !== 'string') {
      console.error("Invalid DOCX content provided:", typeof base64Content);
      return "";
    }
    
    // This is a simplified implementation - in a production environment,
    // you would use a library like mammoth.js or similar
    
    let decodedContent;
    try {
      decodedContent = decode(base64Content);
      console.log(`Decoded DOCX content, size: ${decodedContent.length} bytes`);
    } catch (decodeError) {
      console.error("Error decoding DOCX content:", decodeError);
      return "";
    }
    
    // Extract text content from the DOCX binary
    // This is a simplified approach - we're looking for text in the XML structure
    const textContent = extractTextFromBinary(decodedContent);
    
    console.log(`Extracted text from DOCX, length: ${textContent.length} characters`);
    if (textContent.length > 100) {
      console.log(`DOCX text sample: ${textContent.substring(0, 100)}...`);
    } else {
      console.log(`DOCX text content: ${textContent}`);
    }
    
    return textContent;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    return "";
  }
}

// Parse DOC document (legacy Word format)
export async function extractTextFromDoc(base64Content: string): Promise<string> {
  try {
    console.log("Starting DOC text extraction");
    
    if (!base64Content || typeof base64Content !== 'string') {
      console.error("Invalid DOC content provided:", typeof base64Content);
      return "";
    }
    
    // For the old binary .doc format - this is more challenging
    // In a production environment, you would use a specialized library
    
    let decodedContent;
    try {
      decodedContent = decode(base64Content);
      console.log(`Decoded DOC content, size: ${decodedContent.length} bytes`);
    } catch (decodeError) {
      console.error("Error decoding DOC content:", decodeError);
      return "";
    }
    
    // Extract text from binary content
    const textContent = extractTextFromBinary(decodedContent);
    
    console.log(`Extracted text from DOC, length: ${textContent.length} characters`);
    if (textContent.length > 100) {
      console.log(`DOC text sample: ${textContent.substring(0, 100)}...`);
    } else {
      console.log(`DOC text content: ${textContent}`);
    }
    
    return textContent;
  } catch (error) {
    console.error("Error extracting text from DOC:", error);
    return "";
  }
}

// Simple utility to extract textual content from binary data
function extractTextFromBinary(data: Uint8Array): string {
  try {
    // Convert binary data to string (handles ASCII text only)
    const textDecoder = new TextDecoder("utf-8", { fatal: false });
    let text = textDecoder.decode(data);
    
    console.log(`Raw decoded text length: ${text.length} characters`);
    
    // Clean up the text - replace unprintable characters
    text = text.replace(/[^\x20-\x7E\n\r\t]/g, " ");
    
    // Remove excessive whitespace
    text = text.replace(/\s+/g, " ");
    
    console.log(`Cleaned text length: ${text.length} characters`);
    
    return text;
  } catch (error) {
    console.error("Error in extractTextFromBinary:", error);
    return "";
  }
}

// Helper function to determine document type from file name
export function getDocumentType(fileName: string): "pdf" | "docx" | "doc" | "unknown" {
  if (!fileName) {
    console.log("No filename provided, document type: unknown");
    return "unknown";
  }
  
  const lowerName = fileName.toLowerCase();
  console.log(`Determining document type for: ${lowerName}`);
  
  if (lowerName.endsWith(".pdf")) {
    console.log("Document type detected: PDF");
    return "pdf";
  } else if (lowerName.endsWith(".docx")) {
    console.log("Document type detected: DOCX");
    return "docx";
  } else if (lowerName.endsWith(".doc")) {
    console.log("Document type detected: DOC");
    return "doc";
  } else {
    console.log("Document type: unknown");
    return "unknown";
  }
}
