
import { toast } from "sonner";

// Re-export toast from sonner for backwards compatibility
export { toast };

// Export a mock useToast that returns the same API shape but uses sonner under the hood
export function useToast() {
  return {
    toast,
    dismiss: (toastId?: string) => toast.dismiss(toastId),
    // Provide an empty toasts array since sonner manages this internally
    toasts: []
  };
}
