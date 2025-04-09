
/**
 * Main email helper utilities that consolidate functions from specialized extractors
 */

// Import all specialized extractors
import { extractEmailFromHeader, extractNameFromHeader, isValidEmail, extractContactInfo, extractCompanyInfo } from './contact-extractors.ts';
import { extractAssociationInfo, AssociationInfo, ASSOCIATION_TYPES } from './association-extractors.ts';
import { extractLocationInfo, LocationInfo } from './location-extractors.ts';
import { extractAdditionalInfo, AdditionalInfo } from './additional-extractors.ts';

// Re-export all the utility functions for backward compatibility
export {
  extractEmailFromHeader,
  extractNameFromHeader,
  isValidEmail,
  extractContactInfo,
  extractCompanyInfo,
  extractAssociationInfo,
  ASSOCIATION_TYPES,
  extractLocationInfo,
  extractAdditionalInfo
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
