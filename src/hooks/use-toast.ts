
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

  // Create the base toast function that can be called directly
  const toastFunction = (props: string | ToastProps, options?: Omit<ToastProps, "title">) => {
    // Handle both string and object formats
    if (typeof props === 'string') {
      const id = sonnerToast(props, options);
      toasts.push({ title: props, ...options, id: id.toString() });
      return id;
    } else {
      const { title, description, ...rest } = props;
      const id = sonnerToast(title || '', { description, ...rest });
      toasts.push({ ...props, id: id.toString() });
      return id;
    }
  };

  // Add methods to the toast function
  const toast = Object.assign(toastFunction, {
    // Standard toast method (for objects)
    toast: (props: string | ToastProps, options?: Omit<ToastProps, "title">) => {
      return toastFunction(props, options);
    },
    
    // Success toast
    success: (props: string | Omit<ToastProps, "variant">, options?: Omit<ToastProps, "title" | "variant">) => {
      if (typeof props === 'string') {
        const id = sonnerToast.success(props, options);
        toasts.push({ title: props, ...options, variant: "default", id: id.toString() });
        return id;
      } else {
        const { title, description, ...rest } = props;
        const id = sonnerToast.success(title || '', { description, ...rest });
        toasts.push({ ...props, variant: "default", id: id.toString() });
        return id;
      }
    },
    
    // Error toast
    error: (props: string | Omit<ToastProps, "variant">, options?: Omit<ToastProps, "title" | "variant">) => {
      if (typeof props === 'string') {
        const id = sonnerToast.error(props, options);
        toasts.push({ title: props, ...options, variant: "destructive", id: id.toString() });
        return id;
      } else {
        const { title, description, ...rest } = props;
        const id = sonnerToast.error(title || '', { description, ...rest });
        toasts.push({ ...props, variant: "destructive", id: id.toString() });
        return id;
      }
    },
    
    // Info toast
    info: (props: string | Omit<ToastProps, "variant">, options?: Omit<ToastProps, "title" | "variant">) => {
      if (typeof props === 'string') {
        const id = sonnerToast.info(props, options);
        toasts.push({ title: props, ...options, variant: "default", id: id.toString() });
        return id;
      } else {
        const { title, description, ...rest } = props;
        const id = sonnerToast.info(title || '', { description, ...rest });
        toasts.push({ ...props, variant: "default", id: id.toString() });
        return id;
      }
    },
    
    // Warning toast
    warning: (props: string | Omit<ToastProps, "variant">, options?: Omit<ToastProps, "title" | "variant">) => {
      if (typeof props === 'string') {
        const id = sonnerToast.warning(props, options);
        toasts.push({ title: props, ...options, variant: "default", id: id.toString() });
        return id;
      } else {
        const { title, description, ...rest } = props;
        const id = sonnerToast.warning(title || '', { description, ...rest });
        toasts.push({ ...props, variant: "default", id: id.toString() });
        return id;
      }
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

// Export the hook
export function useToast() {
  return {
    toast,
    dismiss,
    toasts,
  };
}
