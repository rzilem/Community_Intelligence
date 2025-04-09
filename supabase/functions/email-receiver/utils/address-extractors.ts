
/**
 * Helper functions for extracting address information from email content
 */

// Helper function to parse address and extract just the city
export function extractCityFromAddress(address: string): string {
  if (!address) return "";
  
  // Look for patterns in addresses
  // Pattern: "1234 Street Name, City, State ZIP" or "1234 Street Name City State ZIP"
  const cityPattern = /(?:,\s*|\s+)([A-Za-z\s.]+?)(?:,\s*|\s+)(?:[A-Z]{2}|[A-Za-z\s]+)\s+\d{5}/;
  const match = address.match(cityPattern);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // If we can't extract using the pattern, look for common city names
  const commonTexasCities = [
    'Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi',
    'Plano', 'Laredo', 'Lubbock', 'Garland', 'Irving', 'Amarillo', 'Grand Prairie', 'Brownsville',
    'McKinney', 'Frisco', 'Pasadena', 'Killeen', 'Waco', 'Denton', 'New Braunfels', 'Round Rock'
  ];
  
  for (const city of commonTexasCities) {
    if (address.includes(city)) {
      return city;
    }
  }
  
  // If we can't extract city, return a default value
  return "";
}

// Helper function to clean street address by removing "Map It" and similar phrases
export function cleanStreetAddress(address: string): string {
  if (!address) return "";
  
  // Remove "Map It" and similar phrases
  let cleaned = address.replace(/Map\s*It/gi, '').trim();
  
  // Remove any trailing commas, periods, etc.
  cleaned = cleaned.replace(/[.,]+$/, '').trim();
  
  return cleaned;
}
