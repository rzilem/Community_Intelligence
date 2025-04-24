
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

export const formatRelativeDate = (dateString?: string): string => {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  if (!isValid(date)) return 'Invalid date';
  
  // First try to format as today, yesterday, etc.
  const relativeTime = formatRelativeTime(dateString);
  
  // For dates within a week, return the relative time
  if (relativeTime.includes('day') || relativeTime.includes('hour') || relativeTime.includes('minute')) {
    return relativeTime;
  }
  
  // For older dates, return the formatted date
  return format(date, 'MMM d, yyyy');
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
