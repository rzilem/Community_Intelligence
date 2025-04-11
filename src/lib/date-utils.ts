
import { format, parseISO, formatDistance, isValid } from 'date-fns';

/**
 * Formats a date string from the server (ISO format) to a readable format
 */
export const formatDate = (dateString: string, formatStr: string = 'MMM d, yyyy') => {
  try {
    // If it's not a string or is falsy, return empty string
    if (!dateString || typeof dateString !== 'string') return 'N/A';
    
    // Parse ISO string and format
    const date = parseISO(dateString);
    
    // Check if the date is valid
    if (!isValid(date)) {
      console.warn(`Invalid date: ${dateString}`);
      return 'Invalid date';
    }
    
    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'Invalid date';
  }
};

/**
 * Formats a date string to a relative format (e.g. "2 days ago")
 */
export const formatRelativeDate = (dateString: string) => {
  try {
    if (!dateString || typeof dateString !== 'string') return 'N/A';
    
    const date = parseISO(dateString);
    
    // Check if the date is valid
    if (!isValid(date)) {
      console.warn(`Invalid date: ${dateString}`);
      return 'Invalid date';
    }
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  } catch (error) {
    console.error('Error formatting relative date:', error, dateString);
    return 'Invalid date';
  }
};
