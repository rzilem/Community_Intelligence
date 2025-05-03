
import { toast as sonnerToast, type Toast } from "sonner";

type ToastProps = Toast & {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

export const toast = {
  info: (message: string, options?: Omit<ToastProps, "description">) => {
    return sonnerToast.info(message, options);
  },
  success: (message: string, options?: Omit<ToastProps, "description">) => {
    return sonnerToast.success(message, options);
  },
  warning: (message: string, options?: Omit<ToastProps, "description">) => {
    return sonnerToast.warning(message, options);
  },
  error: (message: string, options?: Omit<ToastProps, "description">) => {
    return sonnerToast.error(message, options);
  },
  // Enhanced toast with title and description
  custom: ({
    title,
    description,
    ...props
  }: ToastProps) => {
    return sonnerToast(title!, {
      description,
      ...props,
    });
  },
  // Dismiss specific or all toasts
  dismiss: (toastId?: string) => {
    sonnerToast.dismiss(toastId);
  },
  // Promise toast for async operations
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: ToastProps
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    }, options);
  }
};

export const useToast = () => {
  return {
    toast,
    dismiss: toast.dismiss,
  };
};
