import { Lead } from '@/types/lead-types';
import { formatStreetAddress } from './format-utils';
import { extractCity } from './city-utils';
import { extractZipCode } from './zip-utils';
import { formatFullAddress } from './format-utils';

/**
 * Prepares all formatted address data for a lead
 */
export function getFormattedLeadAddressData(lead: Lead) {
  const streetAddress = lead.street_address || '';
  const formattedStreetAddress = formatStreetAddress(streetAddress);
  const city = lead.city || extractCity(undefined, streetAddress);
  const cleanedCity = city; // City is already cleaned in extractCity
  const zipCode = extractZipCode(lead);
  
  // Format the full address properly, removing any duplicate or incorrect information
  let fullAddress = '';
  if (formattedStreetAddress) {
    // Check if the street address already contains city/state information
    const hasEmbeddedCityState = formattedStreetAddress.includes(', TX') || 
                                (cleanedCity && formattedStreetAddress.includes(cleanedCity));
    
    if (hasEmbeddedCityState) {
      // If street address already has city/state, just use it as is, possibly adding a ZIP
      fullAddress = zipCode && !formattedStreetAddress.includes(zipCode) ? 
                    `${formattedStreetAddress} ${zipCode}` : formattedStreetAddress;
    } else {
      // Otherwise use our normal formatting function
      fullAddress = formatFullAddress(formattedStreetAddress, cleanedCity, lead.state, zipCode);
    }
  } else {
    fullAddress = 'N/A';
  }
  
  // Remove any duplicate "Map It" text that might be in the address
  fullAddress = fullAddress.replace(/Map\s*It/gi, '').trim();
  
  // Remove any extraneous address pieces that might be tagged on (like "Auin, TX 67713")
  if (fullAddress.includes('Austin, TX') && fullAddress.includes('Auin, TX')) {
    fullAddress = fullAddress.replace(/Auin, TX \d+/i, '').trim();
  }
  
  return {
    formattedStreetAddress,
    cleanedCity,
    zipCode,
    fullAddress
  };
}
