
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
    .replace(/\d+|Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Lane|Ln\.?|Drive|Dr\.?|Court|Ct\.?|Circle|Cir\.?|Boulevard|Blvd\.?|Highway|Hwy\.?|Way|Place|Pl\.?|Terrace|Ter\.?|Parkway|Pkwy\.?|Alley|Aly\.?|Creek|Loop|Prairie|Clover|pug|rippy/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatStreetAddress(address?: string): string {
  if (!address) return '';
  
  // Clean up the address
  return address
    .replace(/Map\s*It/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getFormattedLeadAddressData(lead: any): {
  fullAddress: string;
  formattedAddress: string;
  googleMapsUrl: string;
} {
  const streetAddress = lead.street_address || '';
  const addressLine2 = lead.address_line2 || '';
  const city = lead.city || '';
  const state = lead.state || '';
  const zip = lead.zip || '';
  
  // Create full address for display
  let fullAddress = streetAddress;
  if (addressLine2) fullAddress += `, ${addressLine2}`;
  if (city || state || zip) {
    fullAddress += ', ';
    if (city) fullAddress += `${city}, `;
    if (state) fullAddress += `${state} `;
    if (zip) fullAddress += zip;
  }
  
  // Create a clean formatted address for Google Maps
  let formattedAddress = streetAddress;
  if (addressLine2) formattedAddress += ` ${addressLine2}`;
  if (city) formattedAddress += `, ${city}`;
  if (state) formattedAddress += `, ${state}`;
  if (zip) formattedAddress += ` ${zip}`;
  
  // Create Google Maps URL
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedAddress)}`;
  
  return {
    fullAddress,
    formattedAddress,
    googleMapsUrl
  };
}
