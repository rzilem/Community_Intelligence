
import { Lead } from '@/types/lead-types';
import { formatStreetAddress, formatFullAddress } from './format-utils';
import { extractCity } from './city-utils';
import { extractZipCode } from './zip-utils';

/**
 * Prepares all formatted address data for a lead
 */
export function getFormattedLeadAddressData(lead: Lead) {
  const streetAddress = lead.street_address || '';
  const formattedStreetAddress = formatStreetAddress(streetAddress);
  const city = lead.city || extractCity(undefined, streetAddress);
  const cleanedCity = city; // City is already cleaned in extractCity
  const zipCode = lead.zip || extractZipCode(streetAddress || '');
  const state = (lead.state || '').replace(/\.?/g, '');
  
  // Format the full address properly, removing any duplicate or incorrect information
  let fullAddress = '';
  if (formattedStreetAddress) {
    // Remove variations of 'Map It' and extra text
    const cleanedStreetAddress = formattedStreetAddress
      .replace(/\s*Map\s*It\.?/gi, '')
      .replace(/Tex\.?/gi, '')
      .trim();
    
    fullAddress = formatFullAddress(cleanedStreetAddress, cleanedCity, state, zipCode);
  } else {
    fullAddress = 'N/A';
  }
  
  return {
    formattedStreetAddress,
    cleanedCity,
    zipCode,
    fullAddress
  };
}
