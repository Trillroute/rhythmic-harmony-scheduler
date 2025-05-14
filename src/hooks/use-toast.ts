
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
    title: typeof options.title === 'string' ? options.title : String(options.title || ''),
    description: typeof options.description === 'string' ? options.description : String(options.description || ''),
    variant: options.variant
  };
  
  return sonnerToast(safeOptions.title, {
    description: safeOptions.description,
    className: safeOptions.variant === 'destructive' ? 'destructive' : undefined
  });
};

// Export our safe toast function
export const toast = safeToast;

// Export the useToast hook to maintain API compatibility
export const useToast = () => {
  return { toast: safeToast };
};
