
import { cleanCityName } from './city-utils';

/**
 * Formats and cleans the street address from a lead
 */
export function formatStreetAddress(address: string | undefined): string {
  if (!address) return '';
  
  return address
    .replace(/Dr\.?Austin/i, 'Dr. Austin')  // Add space between Dr. and Austin
    .replace(/Austin,/i, 'Austin, ')
    .replace(/Auin, TX \d+/i, '')  // Remove the extraneous Auin, TX text
    .trim();
}

/**
 * Cleans and formats the city name from a lead
 */
export function cleanCityName(city: string | undefined): string {
  if (!city) return '';
  
  // Special case for known issues
  if (city === 'TrailAuin') {
    return 'Austin';
  }
  
  return city;
}

/**
 * Formats a complete address with proper spacing and punctuation
 * @param streetAddress The street address line
 * @param city The city name
 * @param state The state code (e.g., TX)
 * @param zipCode The ZIP code
 * @returns A properly formatted complete address
 */
export function formatFullAddress(
  streetAddress?: string, 
  city?: string, 
  state?: string, 
  zipCode?: string
): string {
  if (!streetAddress) return 'N/A';
  
  const formattedStreet = formatStreetAddress(streetAddress);
  const formattedCity = city ? cleanCityName(city) : '';
  
  // Build the city, state, zip part only from actual values
  const cityStateZipParts = [];
  
  if (formattedCity) cityStateZipParts.push(formattedCity);
  if (state) cityStateZipParts.push(state);
  if (zipCode) cityStateZipParts.push(zipCode);
  
  const cityStateZip = cityStateZipParts.join(', ')
    .replace(/, ([A-Z]{2}),/, ', $1 '); // Fix state/zip formatting: "TX, 12345" -> "TX 12345"
  
  // Only add the comma separator if we actually have something to append
  return cityStateZip ? `${formattedStreet}, ${cityStateZip}` : formattedStreet;
}

/**
 * Creates a Google Maps link from an address string
 * @param address The address to link to on Google Maps
 * @returns A properly formatted Google Maps URL
 */
export function createGoogleMapsLink(address: string | undefined): string {
  if (!address) return '#';
  
  // Clean up the address by removing "Map It" and similar phrases
  const cleanAddress = address.replace(/Map\s*It/gi, '').trim();
  
  // URL encode the address for Google Maps
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress)}`;
}

