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
 * Cleans a city name by removing any unwanted patterns or formatting issues
 */
export function cleanCityName(cityName: string): string {
  // Remove any trailing zip or state codes (e.g. "Austin, TX 78701" -> "Austin")
  let cleaned = cityName.replace(/,\s*[A-Z]{2}.*$/, '');
  
  // Ensure proper case
  cleaned = cleaned.trim();
  
  // Handle special cases
  if (cleaned.toLowerCase() === 'atx') return 'Austin';
  if (cleaned.toLowerCase().includes('austin')) return 'Austin';
  
  return cleaned;
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

/**
 * Capitalizes the first letter of a string
 * @param text The string to capitalize
 * @returns The capitalized string
 */
export function capitalizeFirstLetter(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
