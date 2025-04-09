
/**
 * Helper functions for extracting company information from email content
 */

import { extractEmailFromHeader } from "./email-extractors.ts";

// Helper function to extract company information
export function extractCompanyInfo(content: string, from: string = ""): { company?: string } {
  const result: { company?: string } = {};
  
  // Look for "currently using" or similar patterns
  const currentlyUsingPatterns = [
    /We are currently[\.:\s]*([^<>\n\r]+)/i,
    /Currently managed by[\.:\s]*([^<>\n\r]+)/i,
    /Current Management[\.:\s]*([^<>\n\r]+)/i
  ];
  
  for (const pattern of currentlyUsingPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.company = match[1].trim();
      return result;
    }
  }
  
  // If not found, try other company patterns
  const companyPatterns = [
    /Company[:\s]*([^<>\n\r]+)/i,
    /Organization[:\s]*([^<>\n\r]+)/i,
    /Business[:\s]*([^<>\n\r]+)/i
  ];
  
  for (const pattern of companyPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.company = match[1].trim();
      break;
    }
  }
  
  // If no company found, try to extract from 'from' field domain
  if (!result.company) {
    if (from) {
      const email = extractEmailFromHeader(from);
      if (email) {
        const domainMatch = email.match(/@([^.]+)/);
        if (domainMatch && domainMatch[1] && domainMatch[1] !== 'gmail' && 
            domainMatch[1] !== 'yahoo' && domainMatch[1] !== 'hotmail' && 
            domainMatch[1] !== 'outlook' && domainMatch[1] !== 'aol') {
          result.company = domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
        }
      }
    }
  }
  
  return result;
}
