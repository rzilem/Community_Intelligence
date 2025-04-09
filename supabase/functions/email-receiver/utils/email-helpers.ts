
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

// Combined helper that extracts all location data in one function
export function extractAdditionalInfo(content: string): { notes?: string, address?: string, city?: string, state?: string, zip?: string } {
  const locationInfo = extractLocationInfo(content);
  const additionalInfo = extractAdditionalInfo(content);
  
  return {
    ...locationInfo,
    ...additionalInfo
  };
}
