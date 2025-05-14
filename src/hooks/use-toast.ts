
// Direct import from sonner
import { toast as sonnerToast } from "sonner";

// Define the toast types
export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Create a function to ensure only strings are passed to toast
const safeToast = (options: ToastProps) => {
  // Convert any non-string values to strings
  const safeOptions = {
    title: options.title ? String(options.title) : '',
    description: options.description ? String(options.description) : '',
    variant: options.variant
  };
  
  // When using sonner, if using destructive variant, set color to be red
  if (safeOptions.variant === 'destructive') {
    return sonnerToast.error(safeOptions.title, {
      description: safeOptions.description
    });
  }
  
  return sonnerToast(safeOptions.title, {
    description: safeOptions.description
  });
};

// Export our safe toast function
export const toast = safeToast;

// Export the useToast hook to maintain API compatibility
export const useToast = () => {
  return { toast: safeToast };
};
