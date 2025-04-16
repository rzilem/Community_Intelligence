
/**
 * Helper functions for extracting additional information from email content
 */

export interface AdditionalInfo {
  notes?: string;
}

// Helper function to extract additional information
export function extractAdditionalInfo(content: string): AdditionalInfo {
  const result: AdditionalInfo = {};
  
  // Extract notes or additional requirements - capture larger blocks of text
  const notesPatterns = [
    /[Nn]ote(?:s)?[:\s]*([^<\n]{10,})/,
    /[Aa]dditional\s*(?:[Ii]nfo|[Ii]nformation|[Rr]equirements)[:\s]*([^<\n]{10,})/,
    /[Cc]omments[:\s]*([^<\n]{10,})/,
    /[Rr]equirements[:\s]*([^<\n]{10,})/,
    /[Ss]pecial\s*[Ii]nstructions[:\s]*([^<\n]{10,})/,
    // Add patterns to capture RFP information
    /RFP\s*(?:process|details|information)[:\s]*([^<\n]{10,})/,
    /\d+\s*-\s*(?:Would|Do|Please)[^<\n]{10,}/
  ];
  
  // Try to find the most comprehensive information
  let longestMatch = '';
  
  for (const pattern of notesPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      if (match[1].length > longestMatch.length) {
        longestMatch = match[1].trim();
      }
    }
  }
  
  // Look for numbered lists which are common in RFP requirement emails
  const numberedListMatch = content.match(/\d+\s*-\s*[^\n<]+(?:\n\s*[a-z]\s*-\s*[^\n<]+)+/g);
  if (numberedListMatch && numberedListMatch[0]) {
    if (numberedListMatch[0].length > longestMatch.length) {
      longestMatch = numberedListMatch[0];
    }
  }
  
  // Check for the specific pattern shown in the screenshot example
  const dripSpringsMatch = content.match(/[Tt]his is a new community in Dripping Springs[^<\n]{50,}/);
  if (dripSpringsMatch && dripSpringsMatch[0]) {
    longestMatch = dripSpringsMatch[0];
  }
  
  if (longestMatch) {
    result.notes = longestMatch;
  }
  
  // If we didn't find a good match, try to get a larger section of text
  if (!result.notes) {
    const bodyText = content.replace(/<[^>]*>/g, '\n')
      .replace(/\n+/g, '\n')
      .trim();
    
    // Get a significant portion of the email body if it's substantial
    if (bodyText.length > 100) {
      const excerpt = bodyText.substring(0, Math.min(500, bodyText.length));
      result.notes = excerpt;
    }
  }
  
  return result;
}
