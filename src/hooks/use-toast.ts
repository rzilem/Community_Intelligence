
import { toast as sonnerToast, type Toast as SonnerToast } from "sonner";
import * as React from "react";

export interface ToastProps extends SonnerToast {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export interface ToastActionElement {
  altText: string;
  onClick: () => void;
  children: React.ReactNode;
}

export type ToasterToast = ToastProps;

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToastState = {
  toasts: ToasterToast[];
};

const toastState = {
  toasts: [] as ToasterToast[]
};

export function createToast(props: ToasterToast) {
  const id = props.id || String(Date.now());
  const newToast = { id, ...props };

  // Update internal state for the UI toast component
  toastState.toasts = [
    ...toastState.toasts.filter(t => t.id !== id).slice(0, TOAST_LIMIT - 1),
    newToast,
  ];

  // Return the sonner toast id
  return sonnerToast[props.variant === "destructive" ? "error" : props.variant || "default"](
    props.description,
    {
      id,
      ...props,
    }
  );
}

export function dismissToast(toastId?: string) {
  // Update internal state
  if (toastId) {
    toastState.toasts = toastState.toasts.filter(t => t.id !== toastId);
  } else {
    toastState.toasts = [];
  }
  
  // Call the sonner dismiss
  sonnerToast.dismiss(toastId);
}

export const toast = {
  info: (message: string, options?: Omit<ToastProps, "description">) => {
    return createToast({ description: message, ...options, variant: "default" });
  },
  success: (message: string, options?: Omit<ToastProps, "description">) => {
    return createToast({ description: message, ...options, variant: "success" });
  },
  warning: (message: string, options?: Omit<ToastProps, "description">) => {
    return createToast({ description: message, ...options, variant: "warning" });
  },
  error: (message: string, options?: Omit<ToastProps, "description">) => {
    return createToast({ description: message, ...options, variant: "destructive" });
  },
  // Enhanced toast with title and description
  custom: ({ title, description, ...props }: ToastProps) => {
    return createToast({ title, description, ...props });
  },
  // Dismiss specific or all toasts
  dismiss: dismissToast,
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

export function useToast() {
  return {
    toast,
    dismiss: toast.dismiss,
    // Add toasts property for UI components
    toasts: toastState.toasts
  };
}
