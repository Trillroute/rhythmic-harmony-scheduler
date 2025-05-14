
// Import from sonner directly
import { toast } from "sonner";

// Re-export toast to avoid circular dependencies
export { toast };

// Export the useToast hook to maintain API compatibility
export const useToast = () => {
  // Return toast as a function for backward compatibility
  return { toast };
};
