
import { toast } from "sonner";
import { legacyToastAdapter } from "@/utils/toast-helpers";

// Re-export toast from sonner for direct usage
export { toast };

// Export a useToast function that returns the same API shape but uses sonner under the hood
export function useToast() {
  return {
    toast: legacyToastAdapter.toast,
    dismiss: (toastId?: string) => toast.dismiss(toastId),
    // Provide an empty toasts array since sonner manages this internally
    toasts: []
  };
}
