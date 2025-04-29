
import { toast } from 'sonner';

/**
 * Utility for showing toast notifications with unique IDs to prevent duplicates
 */
export const showToast = {
  success: (message: string, description?: string) => {
    const id = `toast-success-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast.success(message, { id, description });
    return id;
  },
  
  error: (message: string, description?: string) => {
    const id = `toast-error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast.error(message, { id, description });
    return id;
  },
  
  info: (message: string, description?: string) => {
    const id = `toast-info-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast.info(message, { id, description });
    return id;
  },
  
  warning: (message: string, description?: string) => {
    const id = `toast-warning-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast.warning(message, { id, description });
    return id;
  },
  
  custom: (title: string, options?: any) => {
    const id = `toast-custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast(title, { id, ...options });
    return id;
  }
};
