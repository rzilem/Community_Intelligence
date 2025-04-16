
import { extractCity } from './city-utils';
import { cleanCityName, formatStreetAddress, getFormattedLeadAddressData } from './format-utils';
import { extractZipCode, extractZipCodeFromText } from './zip-utils';

/**
 * Create a Google Maps link from an address string
 */
export function createGoogleMapsLink(address: string): string {
  if (!address) return '#';
  
  // Clean the address by removing "Map it" text and special characters
  const cleanAddress = address.replace(/Map\s*It/gi, '').trim();
  
  // Create the Google Maps URL
  const encodedAddress = encodeURIComponent(cleanAddress);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

export { 
  extractCity,
  cleanCityName,
  formatStreetAddress,
  getFormattedLeadAddressData,
  extractZipCode,
  extractZipCodeFromText
};
