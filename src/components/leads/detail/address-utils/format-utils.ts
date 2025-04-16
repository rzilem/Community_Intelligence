
/**
 * Utilities for formatting and cleaning address data
 */

export function cleanCityName(city: string): string {
  if (!city) return '';
  
  // Special case for Pflugerville
  if (city.toLowerCase().includes('pflugerville')) {
    return 'Pflugerville';
  }
  
  // Fix common issues with extracted city names
  return city
    .replace(/^\s*([a-zA-Z0-9]+\s+)+/i, '') // Remove prefixes
    .replace(/\d+|Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Lane|Ln\.?|Drive|Dr\.?|Court|Ct\.?|Circle|Cir\.?|Boulevard|Blvd\.?|Highway|Hwy\.?|Way|Place|Pl\.?|Terrace|Ter\.?|Parkway|Pkwy\.?|Alley|Aly\.?|Creek|Loop|Prairie|Clover|pug|rippy|Tex\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatStreetAddress(address?: string): string {
  if (!address) return '';
  
  // Clean up the address
  return address
    .replace(/Map\s*It/gi, '')
    .replace(/Map It\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatFullAddress(street: string, city: string, state?: string, zip?: string): string {
  const parts = [];
  
  if (street) parts.push(street);
  
  const cityStateZip = [];
  if (city) cityStateZip.push(city);
  if (state) cityStateZip.push(state.replace(/\.?/g, ''));
  if (zip) cityStateZip.push(zip);
  
  if (cityStateZip.length > 0) {
    parts.push(cityStateZip.join(', '));
  }
  
  return parts.join(', ');
}
