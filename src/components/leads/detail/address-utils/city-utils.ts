
import { cleanCityName } from './format-utils';

/**
 * Extracts and formats city name from various sources
 * @param cityField Direct city field value
 * @param address Full address string that might contain city information
 * @returns The extracted and cleaned city name
 */
export function extractCity(cityField: string | undefined, address: string | undefined): string {
  // If we have a city field directly, clean and use it
  if (cityField) {
    // Fix specific issues with city names
    if (cityField === 'TrailAuin') {
      return 'Austin';
    }
    return cleanCityName(cityField);
  }
  
  if (!address) return '';
  
  // Try to extract city with common patterns
  const cityPattern = /(?:,\s*|\s+)([A-Za-z\s.]+?)(?:,\s*|\s+)(?:[A-Z]{2}|[A-Za-z\s]+)\s+\d{5}/;
  const match = address.match(cityPattern);
  
  if (match && match[1]) {
    return cleanCityName(match[1].trim());
  }
  
  // Look for common Texas cities
  const commonTexasCities = getCommonTexasCities();
  
  for (const city of commonTexasCities) {
    if (address.includes(city)) {
      return city;
    }
  }
  
  // Special case for TrailAustin variants
  if (address.includes('Trail') && (address.includes('Austin') || address.includes('Auin'))) {
    return 'Austin';
  }
  
  return '';
}

/**
 * Returns a list of common Texas cities for city extraction
 */
function getCommonTexasCities(): string[] {
  return [
    'Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 'El Paso', 
    'Arlington', 'Corpus Christi', 'Plano', 'Laredo', 'Lubbock', 'Garland', 
    'Irving', 'Amarillo', 'Grand Prairie', 'Brownsville', 'McKinney', 'Frisco', 
    'Pasadena', 'Killeen', 'Waco', 'Denton', 'New Braunfels', 'Round Rock', 
    'Dripping Springs', 'Colorado Springs'
  ];
}
