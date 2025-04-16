
import { extractCity } from './city-utils';

export { extractCity };

export function createGoogleMapsLink(address: string): string {
  if (!address) return '#';
  
  // Clean the address by removing "Map it" text and special characters
  const cleanAddress = address.replace(/Map\s*It/gi, '').trim();
  
  // Create the Google Maps URL
  const encodedAddress = encodeURIComponent(cleanAddress);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}
