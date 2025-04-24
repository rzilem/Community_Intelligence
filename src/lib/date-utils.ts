
import { format, formatDistance, isValid } from 'date-fns';

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  if (!isValid(date)) return 'Invalid date';
  
  return format(date, 'MMM d, yyyy h:mm a');
};

export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return 'Unknown time';
  
  const date = new Date(dateString);
  if (!isValid(date)) return 'Invalid date';
  
  return formatDistance(date, new Date(), { addSuffix: true });
};

export const formatDateShort = (dateString?: string): string => {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  if (!isValid(date)) return 'Invalid date';
  
  return format(date, 'MMM d, yyyy');
};

export const formatDateOnly = (dateString?: string): string => {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  if (!isValid(date)) return 'Invalid date';
  
  return format(date, 'yyyy-MM-dd');
};
