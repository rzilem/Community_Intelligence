
/**
 * Main email helper utilities that consolidate functions from specialized extractors
 */

// Import all specialized extractors
import { extractEmailFromHeader, isValidEmail } from './email-extractors.ts';
import { extractNameFromHeader } from './name-extractors.ts';
import { extractContactInfo } from './contact-info-extractors.ts';
import { extractCompanyInfo } from './company-extractors.ts';
import { extractAssociationInfo, AssociationInfo, ASSOCIATION_TYPES } from './association-extractors.ts';
import { extractLocationInfo, LocationInfo } from './location-extractors.ts';
import { extractAdditionalInfo, AdditionalInfo } from './additional-extractors.ts';
import { extractCityFromAddress, cleanStreetAddress } from './address-extractors.ts';

// Re-export all the utility functions
export {
  extractEmailFromHeader,
  extractNameFromHeader,
  isValidEmail,
  extractContactInfo,
  extractCompanyInfo,
  extractAssociationInfo,
  ASSOCIATION_TYPES,
  extractLocationInfo,
  extractAdditionalInfo,
  extractCityFromAddress,
  cleanStreetAddress
};

// Combined helper that extracts all information in one function
export function extractAllInfo(content: string): { 
  locationInfo: LocationInfo, 
  additionalInfo: AdditionalInfo 
} {
  const locationInfo = extractLocationInfo(content);
  const additionalInfo = extractAdditionalInfo(content);
  
  return {
    locationInfo,
    additionalInfo
  };
}
