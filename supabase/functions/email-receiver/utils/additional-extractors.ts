
/**
 * Helper functions for extracting additional information from email content
 */

export interface AdditionalInfo {
  notes?: string;
}

// Helper function to extract additional information/notes
export function extractAdditionalInfo(content: string): AdditionalInfo {
  const result: AdditionalInfo = {};
  
  // Extract notes/additional requirements
  extractNotes(content, result);
  
  return result;
}

// Extract notes and requirements
function extractNotes(content: string, result: AdditionalInfo): void {
  const notesPatterns = [
    /Additional Information[:\s]*([^<>\n\r]+)/i,
    /Additional Information or requirements[:\s]*([^<>\n\r]+)/i,
    /Notes[:\s]*([^<>\n\r]+)/i,
    /Comments[:\s]*([^<>\n\r]+)/i,
    /Requirements[:\s]*([^<>\n\r]+)/i,
    /Additional Requirements[:\s]*([^<>\n\r]+)/i
  ];
  
  for (const pattern of notesPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.notes = match[1].trim();
      break;
    }
  }
}
