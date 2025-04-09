
/**
 * Helper functions for extracting contact information from email content
 */

import { extractEmailFromHeader, isValidEmail } from "./email-extractors.ts";
import { extractNameFromHeader } from "./name-extractors.ts";

// Helper function to extract contact information from email content
export function extractContactInfo(content: string, from: string = ""): { name?: string, email?: string, phone?: string } {
  const result: { name?: string, email?: string, phone?: string } = {};
  
  // First try to extract name from the content - specific pattern for "Name" field
  const namePatterns = [
    /Contact\s*Name[:\s]*([^<>\n\r,\.]+)/i,
    /Name[:\s]*([^<>\n\r,\.]+)/i,
    /From[:\s]*([^<>\n\r,\.]+)/i,
    /Contact[:\s]*([^<>\n\r,\.]+)/i,
    /Contact Person[:\s]*([^<>\n\r,\.]+)/i,
    /Submitted by[:\s]*([^<>\n\r,\.]+)/i
  ];
  
  for (const pattern of namePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      const name = match[1].trim();
      // Skip patterns like "Name of Association"
      if (!name.toLowerCase().includes("of association")) {
        result.name = name;
        break;
      }
    }
  }
  
  // If no name found in content, try to extract from 'from' field
  if (!result.name && from) {
    const nameFromHeader = extractNameFromHeader(from);
    if (nameFromHeader) {
      result.name = nameFromHeader;
    }
  }
  
  // Extract email from content
  const emailPatterns = [
    /Email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /Contact Email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /[^a-zA-Z0-9]([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})[^a-zA-Z0-9]/i
  ];
  
  for (const pattern of emailPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && isValidEmail(match[1])) {
      result.email = match[1].trim();
      break;
    }
  }
  
  // If no email found in content, try to extract from 'from' field
  if (!result.email && from) {
    const extractedEmail = extractEmailFromHeader(from);
    if (isValidEmail(extractedEmail)) {
      result.email = extractedEmail;
    }
  }
  
  // Extract phone from content
  const phonePatterns = [
    /Phone[:\s]*([\d\s\(\)\-\+\.]+)/i,
    /Contact Phone[:\s]*([\d\s\(\)\-\+\.]+)/i,
    /Tel[:\s]*([\d\s\(\)\-\+\.]+)/i,
    /Telephone[:\s]*([\d\s\(\)\-\+\.]+)/i,
    /Mobile[:\s]*([\d\s\(\)\-\+\.]+)/i,
    /Cell[:\s]*([\d\s\(\)\-\+\.]+)/i
  ];
  
  for (const pattern of phonePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      // Clean up the phone number
      result.phone = match[1].trim().replace(/\s+/g, '');
      break;
    }
  }
  
  return result;
}
