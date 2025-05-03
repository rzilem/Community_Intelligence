
import { toast } from 'sonner';

/**
 * Standardized toast notification function
 * Used to ensure consistent toast formatting across the application
 */
export function showToast(
  message: string, 
  options?: { 
    description?: string;
    action?: React.ReactNode;
    duration?: number;
  }
) {
  return toast(message, options);
}

/**
 * Show success toast with standardized styling
 */
export function showSuccessToast(message: string, options?: { description?: string; }) {
  return toast.success(message, options);
}

/**
 * Show error toast with standardized styling
 */
export function showErrorToast(message: string, options?: { description?: string; }) {
  return toast.error(message, options);
}
