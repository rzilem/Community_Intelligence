
import { decode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

/**
 * Document parser utility for extracting text from different document types
 */

// Parse PDF document using PDF.js (simplified implementation)
export async function extractTextFromPdf(base64Content: string): Promise<string> {
  try {
    // This is a simplified implementation - in a production environment,
    // you would use a more robust PDF parsing library
    
    // For demonstration purposes, we'll extract some text from the binary data
    const decodedContent = decode(base64Content);
    
    // Extract text content from the PDF binary
    // This is a simplified approach - we're looking for text markers in the PDF
    const textContent = extractTextFromBinary(decodedContent);
    
    console.log("Extracted text from PDF, length:", textContent.length);
    
    return textContent;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "";
  }
}

// Parse DOCX document (simplified implementation)
export async function extractTextFromDocx(base64Content: string): Promise<string> {
  try {
    // This is a simplified implementation - in a production environment,
    // you would use a library like mammoth.js or similar
    
    const decodedContent = decode(base64Content);
    
    // Extract text content from the DOCX binary
    // This is a simplified approach - we're looking for text in the XML structure
    const textContent = extractTextFromBinary(decodedContent);
    
    console.log("Extracted text from DOCX, length:", textContent.length);
    
    return textContent;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    return "";
  }
}

// Parse DOC document (legacy Word format)
export async function extractTextFromDoc(base64Content: string): Promise<string> {
  try {
    // For the old binary .doc format - this is more challenging
    // In a production environment, you would use a specialized library
    
    const decodedContent = decode(base64Content);
    
    // Extract text from binary content
    const textContent = extractTextFromBinary(decodedContent);
    
    console.log("Extracted text from DOC, length:", textContent.length);
    
    return textContent;
  } catch (error) {
    console.error("Error extracting text from DOC:", error);
    return "";
  }
}

// Simple utility to extract textual content from binary data
function extractTextFromBinary(data: Uint8Array): string {
  // Convert binary data to string (handles ASCII text only)
  const textDecoder = new TextDecoder("utf-8", { fatal: false });
  let text = textDecoder.decode(data);
  
  // Clean up the text - replace unprintable characters
  text = text.replace(/[^\x20-\x7E\n\r\t]/g, " ");
  
  // Remove excessive whitespace
  text = text.replace(/\s+/g, " ");
  
  return text;
}

// Helper function to determine document type from file name
export function getDocumentType(fileName: string): "pdf" | "docx" | "doc" | "unknown" {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.endsWith(".pdf")) {
    return "pdf";
  } else if (lowerName.endsWith(".docx")) {
    return "docx";
  } else if (lowerName.endsWith(".doc")) {
    return "doc";
  } else {
    return "unknown";
  }
}
