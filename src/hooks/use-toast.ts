
import { toast as sonnerToast, type ToastT } from "sonner";

// Define our extended toast type 
export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

// Create a toast interface that works with our UI components
const createToast = () => {
  // Array to track active toasts
  const toasts: ToastProps[] = [];
  
  // Function to dismiss a toast by id
  const dismiss = (toastId?: string) => {
    if (toastId) {
      sonnerToast.dismiss(toastId);
    }
  };

  // Create the base toast function that can be directly called
  const toastFunction = (message: string, options?: Omit<ToastProps, "title">) => {
    const id = sonnerToast(message, options);
    toasts.push({ title: message, ...options, id: id.toString() });
    return id;
  };

  // Add methods to the toast function
  const toast = Object.assign(toastFunction, {
    // Standard toast method (for objects)
    toast: (props: ToastProps) => {
      const id = sonnerToast(props.title as string, {
        description: props.description,
      });
      toasts.push({ ...props, id: id.toString() });
      return id;
    },
    
    // Success toast
    success: (message: string, options?: Omit<ToastProps, "description">) => {
      const id = sonnerToast.success(message);
      toasts.push({ title: message, ...options, id: id.toString() });
      return id;
    },
    
    // Error toast
    error: (message: string, options?: Omit<ToastProps, "description">) => {
      const id = sonnerToast.error(message);
      toasts.push({ title: message, ...options, id: id.toString() });
      return id;
    },
    
    // Info toast
    info: (message: string, options?: Omit<ToastProps, "description">) => {
      const id = sonnerToast.info(message);
      toasts.push({ title: message, ...options, id: id.toString() });
      return id;
    },
    
    // Warning toast
    warning: (message: string, options?: Omit<ToastProps, "description">) => {
      const id = sonnerToast.warning(message);
      toasts.push({ title: message, ...options, id: id.toString() });
      return id;
    },
    
    // Custom toast
    custom: (props: ToastProps) => {
      const id = sonnerToast(props.title as string, {
        description: props.description,
      });
      toasts.push({ ...props, id: id.toString() });
      return id;
    },
    
    // Handle promises
    promise: sonnerToast.promise,
    
    // Dismiss a specific toast
    dismiss,
  });

  return {
    toast,
    dismiss,
    toasts,
  };
};

// Create a single instance of our toast system
const { toast, dismiss, toasts } = createToast();

// Export for easy usage
export { toast, dismiss, toasts };
export type { ToastProps };

export function useToast() {
  return {
    toast,
    dismiss,
    toasts,
  };
}
