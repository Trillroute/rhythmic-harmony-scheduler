
// Direct import from sonner
import { toast as sonnerToast } from "sonner";

// Define the toast types
export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Create a function to ensure only strings are passed to toast
const safeToast = (options: string | ToastProps) => {
  // Handle string input
  if (typeof options === 'string') {
    return sonnerToast(options);
  }
  
  // Convert any non-string values to strings for safety
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

// Define helper functions for different toast types to ensure consistency
const success = (message: string, description?: string) => {
  return sonnerToast.success(message, { description });
};

const error = (message: string, description?: string) => {
  return sonnerToast.error(message, { description });
};

const info = (message: string, description?: string) => {
  return sonnerToast(message, { description });
};

const warning = (message: string, description?: string) => {
  return sonnerToast.warning(message, { description });
};

// Export our safe toast function with helper methods
export const toast = Object.assign(safeToast, {
  success,
  error,
  info,
  warning
});

// Export the useToast hook to maintain API compatibility
export const useToast = () => {
  return { toast: safeToast };
};
