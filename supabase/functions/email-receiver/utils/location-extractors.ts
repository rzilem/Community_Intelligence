
/**
 * Helper functions for extracting location information from email content
 */

export interface LocationInfo {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

// Helper function to extract address information
export function extractLocationInfo(content: string): LocationInfo {
  const result: LocationInfo = {};
  
  // Extract street address
  extractAddress(content, result);
  
  // Try to extract city, state, zip as a pattern first
  const extracted = extractCityStateZipPattern(content);
  if (extracted) {
    Object.assign(result, extracted);
  } else {
    // If pattern matching fails, try individual extractions
    extractCity(content, result);
    extractState(content, result);
    extractZip(content, result);
  }
  
  return result;
}

// Extract the street address
function extractAddress(content: string, result: LocationInfo): void {
  const addressPatterns = [
    /Property Address[:\s]*([^<>\n\r]+)/i,
    /Address[:\s]*([^<>\n\r]+)/i,
    /Location[:\s]*([^<>\n\r]+)/i
  ];
  
  for (const pattern of addressPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.address = match[1].trim();
      break;
    }
  }
}

// Try to extract city, state, zip as a unified pattern
function extractCityStateZipPattern(content: string): LocationInfo | null {
  // Look for city, state, zip pattern like "Austin, TX 78724"
  const cityStateZipPattern = /([A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)/i;
  const cityStateZipMatch = content.match(cityStateZipPattern);
  
  if (cityStateZipMatch) {
    return {
      city: cityStateZipMatch[1].trim(),
      state: cityStateZipMatch[2].trim(),
      zip: cityStateZipMatch[3].trim()
    };
  }
  
  return null;
}

// Extract city information
function extractCity(content: string, result: LocationInfo): void {
  const cityPatterns = [
    /City[:\s]*([^<>\n\r,.]+)/i,
    /Location[:\s].*?City[:\s]*([^<>\n\r,.]+)/i
  ];
  
  for (const pattern of cityPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.city = match[1].trim();
      break;
    }
  }
}

// Extract state information
function extractState(content: string, result: LocationInfo): void {
  const statePatterns = [
    /State[:\s]*([^<>\n\r,.]+)/i,
    /Location[:\s].*?State[:\s]*([^<>\n\r,.]+)/i,
    /,\s*([A-Z]{2})\s*\d{5}/i // Match state in "City, ST 12345" format
  ];
  
  for (const pattern of statePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.state = match[1].trim();
      break;
    }
  }
}

// Extract zip code
function extractZip(content: string, result: LocationInfo): void {
  const zipPatterns = [
    /ZIP[:\s]*(\d{5}(?:-\d{4})?)/i,
    /Postal Code[:\s]*(\d{5}(?:-\d{4})?)/i,
    /Zip Code[:\s]*(\d{5}(?:-\d{4})?)/i,
    /[A-Z]{2}\s*(\d{5}(?:-\d{4})?)/i // Match ZIP in "ST 12345" format
  ];
  
  for (const pattern of zipPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.zip = match[1].trim();
      break;
    }
  }
}
