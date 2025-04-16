
import { cleanCityName } from './format-utils';

/**
 * Extracts a city name from address info, with special handling for known issues
 */
export function extractCity(city?: string, address?: string): string {
  // If a valid city was provided, use it
  if (city && city.length > 1) {
    return cleanCityName(city);
  }
  
  // Otherwise try to extract from address if available
  if (address) {
    // Check for "Pflugerville, TX" pattern specifically
    if (address.toLowerCase().includes('pflugerville')) {
      return 'Pflugerville';
    }
    
    // Check for "City Name, TX" pattern
    const cityMatch = address.match(/([A-Za-z\s]+),\s*TX/i);
    if (cityMatch && cityMatch[1]) {
      return cleanCityName(cityMatch[1].trim());
    }
    
    // Check for City State ZIP pattern (e.g., "Pflugerville Texas 78660")
    const cityStateZipMatch = address.match(/([A-Za-z\s]+)\s+Texas\s+\d{5}/i);
    if (cityStateZipMatch && cityStateZipMatch[1]) {
      // Make sure we don't return "Texas" as the city
      const possibleCity = cleanCityName(cityStateZipMatch[1].trim());
      return possibleCity !== 'Tex' ? possibleCity : '';
    }
    
    // Check for special case "XxxxAustin"
    if (address.includes('Austin')) {
      return 'Austin';
    }
  }
  
  return '';
}
