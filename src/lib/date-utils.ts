
import { formatDistance, parseISO, isValid } from 'date-fns';

/**
 * Format a date as a relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(dateString?: string): string {
  if (!dateString) return 'Unknown';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    
    if (!isValid(date)) {
      return 'Invalid date';
    }
    
    return formatDistance(date, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
}

/**
 * Format a date in a standard format (e.g., "Apr 24, 2025")
 */
export function formatStandardDate(dateString?: string): string {
  if (!dateString) return 'Unknown';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    
    if (!isValid(date)) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
}
