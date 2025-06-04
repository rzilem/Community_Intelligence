
/**
 * Helper functions for extracting location information from email content
 */

import { extractCityFromAddress, cleanStreetAddress } from './address-extractors.ts';

export interface LocationInfo {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

// Helper function to extract location information
export function extractLocationInfo(content: string): LocationInfo {
  const result: LocationInfo = {};
  
  // Extract full address using pattern matching
  const addressPatterns = [
    /address[:\s]*([^,\n<]{5,}(?:,|\n|$)[^,\n<]{3,}(?:,|\n|$)[^,\n<]{2,})/i,
    /location[:\s]*([^,\n<]{5,}(?:,|\n|$)[^,\n<]{3,}(?:,|\n|$)[^,\n<]{2,})/i,
    /property\s*address[:\s]*([^,\n<]{5,}(?:,|\n|$)[^,\n<]{3,}(?:,|\n|$)[^,\n<]{2,})/i
  ];
  
  for (const pattern of addressPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const rawAddress = match[1].trim();
      result.address = cleanStreetAddress(rawAddress);
      
      // Try to extract city from address if we found one
      if (result.address) {
        result.city = extractCityFromAddress(rawAddress);
      }
      break;
    }
  }
  
  // Extract city specifically if not extracted from address
  if (!result.city) {
    const cityPatterns = [
      /[Cc]ity[:\s]*([^,\n<]+)/,
      /[Ll]ocation[:\s]*([^,\n<]+)/,
      /[Tt]own[:\s]*([^,\n<]+)/,
      // Add pattern specifically for Pflugerville
      /\b(Pflugerville)\b/i
    ];
    
    for (const pattern of cityPatterns) {
      const match = content.match(pattern);
      if (match && match[1] && match[1].trim()) {
        result.city = match[1].trim();
        break;
      }
    }
  }
  
  // Extract state
  const statePatterns = [
    /[Ss]tate[:\s]*([^,\n<]+)/,
    /([A-Z]{2})(?:\s+\d{5})/
  ];
  
  for (const pattern of statePatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].trim()) {
      result.state = match[1].trim();
      break;
    }
  }
  
  // Default state to TX if not found and city is in Texas
  if (!result.state && result.city) {
    const texasCities = [
      'Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi',
      'Plano', 'Laredo', 'Lubbock', 'Garland', 'Irving', 'Amarillo', 'Grand Prairie', 'Brownsville',
      'McKinney', 'Frisco', 'Pasadena', 'Killeen', 'Waco', 'Denton', 'New Braunfels', 'Round Rock',
      'Pflugerville' // Add Pflugerville to the list of Texas cities
    ];
    
    if (texasCities.some(city => result.city && result.city.includes(city))) {
      result.state = "TX";
    }
  }
  
  // Extract zip code
  const zipPatterns = [
    /[Zz]ip[:\s]*(\d{5}(?:-\d{4})?)/,
    /[Zz]ip\s*[Cc]ode[:\s]*(\d{5}(?:-\d{4})?)/,
    /(\d{5}(?:-\d{4})?)(?:\s|$)/
  ];
  
  for (const pattern of zipPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      result.zip = match[1];
      break;
    }
  }
  
  return result;
}
