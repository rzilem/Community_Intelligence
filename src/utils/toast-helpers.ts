
import { toast } from 'sonner';

/**
 * Standardized toast helper functions to ensure consistent usage across the application
 * These helpers use the sonner toast library directly and generate unique IDs
 * to prevent duplicate toasts
 */
export const showToast = {
  success: (title: string, description?: string) => {
    const id = `toast-success-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast.success(title, { id, description });
    return id;
  },
  
  error: (title: string, description?: string) => {
    const id = `toast-error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast.error(title, { id, description });
    return id;
  },
  
  info: (title: string, description?: string) => {
    const id = `toast-info-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast.info(title, { id, description });
    return id;
  },
  
  warning: (title: string, description?: string) => {
    const id = `toast-warning-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast.warning(title, { id, description });
    return id;
  },
  
  custom: (title: string, options?: any) => {
    const id = `toast-custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    toast(title, { id, ...options });
    return id;
  }
};

/**
 * Legacy adapter for code that still uses the useToast() hook pattern
 * This allows for a smoother transition without breaking existing code
 */
export const legacyToastAdapter = {
  toast: (props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => {
    const { title, description, variant } = props;
    
    if (!title && !description) return;
    
    const content = title || description || '';
    const details = title && description ? description : undefined;
    
    if (variant === 'destructive') {
      showToast.error(content, details);
    } else {
      showToast.info(content, details);
    }
  }
};
