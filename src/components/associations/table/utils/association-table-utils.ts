
import { Association } from '@/types/association-types';

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

export const formatLocation = (association: Association): string => {
  if (association.city && association.state) {
    return `${association.city}, ${association.state}`;
  }
  return association.address || 'No location data';
};

export const getContactInfo = (association: Association): string => {
  return association.contact_email || 'No contact info';
};

export const getUnitsDisplay = (association: Association): string => {
  return association.total_units?.toString() || 'N/A';
};

export const getPropertyType = (association: Association): string => {
  return association.property_type || 'HOA';
};
