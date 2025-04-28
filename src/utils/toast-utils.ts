
import { toast } from 'sonner';

/**
 * Utility for showing toast notifications with unique IDs to prevent duplicates
 */
export const showToast = {
  success: (message: string, description?: string) => {
    const id = `toast-success-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast.success(message, { id, description });
  },
  
  error: (message: string, description?: string) => {
    const id = `toast-error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast.error(message, { id, description });
  },
  
  info: (message: string, description?: string) => {
    const id = `toast-info-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast.info(message, { id, description });
  },
  
  warning: (message: string, description?: string) => {
    const id = `toast-warning-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast.warning(message, { id, description });
  }
};
