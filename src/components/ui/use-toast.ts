
import { useToast as useToastHook, toast as toastHook, type ToastProps } from "@/hooks/use-toast";

// Re-export everything from the main hook
export const useToast = useToastHook;
export const toast = toastHook;
export type { ToastProps };
