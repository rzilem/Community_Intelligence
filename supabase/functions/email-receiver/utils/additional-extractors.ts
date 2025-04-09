
/**
 * Helper functions for extracting additional information from email content
 */

export interface AdditionalInfo {
  notes?: string;
}

// Helper function to extract additional information
export function extractAdditionalInfo(content: string): AdditionalInfo {
  const result: AdditionalInfo = {};
  
  // Extract notes or additional requirements
  const notesPatterns = [
    /[Nn]ote(?:s)?[:\s]*([^<\n]{10,})/,
    /[Aa]dditional\s*(?:[Ii]nfo|[Ii]nformation|[Rr]equirements)[:\s]*([^<\n]{10,})/,
    /[Cc]omments[:\s]*([^<\n]{10,})/,
    /[Rr]equirements[:\s]*([^<\n]{10,})/,
    /[Ss]pecial\s*[Ii]nstructions[:\s]*([^<\n]{10,})/
  ];
  
  for (const pattern of notesPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.notes = match[1].trim();
      break;
    }
  }
  
  return result;
}
