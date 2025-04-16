
/**
 * Re-export all contact-related extractors from specialized files
 * This file is kept for backward compatibility
 */

export { 
  extractEmailFromHeader, 
  isValidEmail 
} from './email-extractors.ts';

export { 
  extractNameFromHeader,
  extractNameFromContent
} from './name-extractors.ts';

export { extractContactInfo } from './contact-info-extractors.ts';
export { extractCompanyInfo } from './company-extractors.ts';
export { extractCityFromAddress, cleanStreetAddress } from './address-extractors.ts';
