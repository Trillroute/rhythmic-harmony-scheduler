
import {
  Toast,
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

import {
  useToast as useToastOriginal,
} from "@/components/ui/use-toast"

export interface ToastActionProps {
  altText?: string;
  onClick: () => void;
  children?: React.ReactNode;
}

type ToastOptions = Omit<ToastProps, "id"> & {
  action?: ToastActionElement;
  title?: string;
  description?: string;
}

// Re-export the toast function
export const toast = (options: ToastOptions) => {
  // Forward the toast call to the original implementation
  const { toast: originalToast } = useToastOriginal();
  return originalToast(options);
};

// Re-export the hook
export const useToast = useToastOriginal;

export type { ToastOptions };
