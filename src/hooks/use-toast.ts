
// Import from sonner directly for consistency
import { toast as sonnerToast } from "sonner";

// Re-export toast to avoid circular dependencies
export const toast = sonnerToast;

// Export the useToast hook to maintain API compatibility
export const useToast = () => {
  return { toast: sonnerToast };
};
