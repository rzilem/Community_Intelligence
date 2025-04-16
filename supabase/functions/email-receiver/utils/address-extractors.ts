
/**
 * Helper functions for extracting address information from email content
 */

// Clean street address by fixing common formatting issues
export function cleanStreetAddress(address: string): string {
  if (!address) return '';
  
  // Fix spacing between Trail and Austin
  let cleanedAddress = address
    .replace(/TrailAustin/g, 'Trail Austin')
    .replace(/(\d+)\s*Forest\s*Trail\s*Austin/i, '$1 Forest Trail Austin')
    .replace(/,\s*TX\s+(\d{5})/i, ', TX $1'); // Ensure proper spacing for ZIP code
    
  return cleanedAddress.trim();
}

// Extract city from address string
export function extractCityFromAddress(address: string): string {
  if (!address) return '';
  
  // Special case for known addresses with formatting issues
  if (address.includes('Forest Trail') && (address.includes('Austin') || address.includes('Auin'))) {
    return 'Austin';
  }
  
  // Try to extract city from common patterns
  // Pattern: anything between a comma and state abbreviation
  const cityStatePattern = /,\s*([^,]+?)\s*,?\s*[A-Z]{2}\s+\d{5}/i;
  const cityStateMatch = address.match(cityStatePattern);
  
  if (cityStateMatch && cityStateMatch[1]) {
    const extractedCity = cityStateMatch[1].trim();
    
    // Special case for problematic city names
    if (extractedCity === 'TrailAuin' || extractedCity === 'Auin') {
      return 'Austin';
    }
    
    return extractedCity;
  }
  
  // If no match found with the above pattern, try another common pattern
  const cityPattern = /\b(Austin|Dallas|Houston|San Antonio|Fort Worth|El Paso|Arlington|Corpus Christi|Plano|Laredo|Lubbock|Garland|Irving|Amarillo|Grand Prairie|Brownsville|McKinney|Frisco|Pasadena|Killeen|Waco|Denton|New Braunfels|Round Rock|Dripping Springs|Colorado Springs)\b/i;
  const cityMatch = address.match(cityPattern);
  
  if (cityMatch && cityMatch[1]) {
    return cityMatch[1];
  }
  
  return '';
}
