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
    // Check for "City Name, TX" pattern
    const cityMatch = address.match(/([A-Za-z\s]+),\s*TX/);
    if (cityMatch && cityMatch[1]) {
      return cleanCityName(cityMatch[1].trim());
    }
    
    // Check for special case "XxxxAustin"
    if (address.includes('Austin')) {
      return 'Austin';
    }
  }
  
  return '';
}
