
import { Lead } from '@/types/lead-types';
import { 
  formatStreetAddress,
  cleanCityName,
  extractZipCode,
  extractZipCodeFromText,
  getFormattedLeadAddressData
} from './address-utils';

export { formatStreetAddress, cleanCityName, extractZipCode, extractZipCodeFromText, getFormattedLeadAddressData };

export function getFormattedLeadAddress(lead: Lead): string {
  const parts = [];
  
  if (lead.street_address) parts.push(formatStreetAddress(lead.street_address));
  if (lead.address_line2) parts.push(lead.address_line2);
  
  const cityStateZip = [];
  if (lead.city) cityStateZip.push(lead.city);
  if (lead.state) cityStateZip.push(lead.state);
  if (lead.zip) cityStateZip.push(lead.zip);
  
  if (cityStateZip.length > 0) {
    parts.push(cityStateZip.join(', '));
  }
  
  return parts.join(', ');
}

export function getLeadStatusLabel(status: Lead['status']): string {
  const statusMap: Record<Lead['status'], string> = {
    new: 'New Lead',
    contacted: 'Contacted',
    qualified: 'Qualified',
    proposal: 'Proposal Sent',
    converted: 'Converted',
    lost: 'Lost'
  };
  
  return statusMap[status] || status;
}

/**
 * Format a lead's name for display, using first_name and last_name if available
 */
export function formatLeadName(lead: Lead): string {
  if (lead.first_name && lead.last_name) {
    return `${lead.first_name} ${lead.last_name}`;
  }
  
  return lead.name || 'Unknown';
}

/**
 * Format additional requirements for display
 */
export function formatAdditionalRequirements(requirements?: string): string {
  if (!requirements) return 'No additional requirements specified.';
  
  return requirements;
}
