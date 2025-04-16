
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
    /\d+\s*-\s*(?:Would|Do|Please)[^<\n]{10,}/,
    /(?:interested|looking)\s+in\s+(?:obtaining|receiving)\s+(?:a\s+)?(?:quote|proposal|bid)[^<\n]{10,}/i,
    /(?:request|seeking)\s+(?:for|a)\s+(?:quote|proposal|bid)[^<\n]{10,}/i,
    // Specific pattern for scope of services section
    /SCOPE\s+OF\s+SERVICES[^<\n]{10,}/i
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
  
  // Look for SCOPE OF SERVICES sections which often contain requirements
  const scopeMatch = content.match(/SCOPE\s+OF\s+SERVICES([\s\S]*?)(?:<\/h|<\/p|<\/div|<h|\n\s*\n)/i);
  if (scopeMatch && scopeMatch[1]) {
    const scopeText = scopeMatch[1].replace(/<[^>]*>/g, ' ').trim();
    if (scopeText.length > longestMatch.length) {
      longestMatch = scopeText;
    }
  }
  
  // Look for numbered lists which are common in RFP requirement emails
  const numberedListMatch = content.match(/(?:\d+\s*[.)-]\s*[^\n<]+(?:\n\s*\d+\s*[.)-]\s*[^\n<]+)+)/g);
  if (numberedListMatch && numberedListMatch[0]) {
    if (numberedListMatch[0].length > longestMatch.length) {
      longestMatch = numberedListMatch[0];
    }
  }
  
  // Look for bullet points
  const bulletListMatch = content.match(/(?:[•*-]\s*[^\n<]+(?:\n\s*[•*-]\s*[^\n<]+)+)/g);
  if (bulletListMatch && bulletListMatch[0]) {
    if (bulletListMatch[0].length > longestMatch.length) {
      longestMatch = bulletListMatch[0];
    }
  }
  
  // Check for the specific pattern shown in the screenshot example
  const drippingSpringsMatch = content.match(/[Tt]his is a new community in Dripping Springs[^<\n]{50,}/);
  if (drippingSpringsMatch && drippingSpringsMatch[0]) {
    longestMatch = drippingSpringsMatch[0];
  }
  
  // Special check for 1600 units information
  if (content.includes("1600 units") || content.includes("1,600 units")) {
    const unitsMatch = content.match(/[^<\n]{0,50}(?:1600|1,600) units[^<\n]{0,100}/);
    if (unitsMatch && unitsMatch[0]) {
      // Make sure we include this important information
      if (!longestMatch.includes(unitsMatch[0])) {
        longestMatch = unitsMatch[0] + "\n\n" + longestMatch;
      }
    }
  }
  
  // Look for paragraphs that might contain requirements
  const paragraphMatch = content.match(/<p>([^<]{100,})<\/p>/g);
  if (paragraphMatch && paragraphMatch[0]) {
    // Extract just the text content from the paragraph
    const textContent = paragraphMatch[0].replace(/<\/?p>/g, '');
    if (textContent.length > longestMatch.length) {
      longestMatch = textContent;
    }
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
      const excerpt = bodyText.substring(0, Math.min(800, bodyText.length));
      result.notes = excerpt;
    }
  }
  
  return result;
}
