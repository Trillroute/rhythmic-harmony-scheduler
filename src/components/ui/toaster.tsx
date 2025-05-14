
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toast]:flex group-[.toast]:items-start",
          title: "group-[.toast]:text-sm group-[.toast]:font-medium",
          description: "group-[.toast]:text-sm group-[.toast]:opacity-90",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: "group-[.toast]:text-destructive group-[.toast]:border-destructive",
          info: "group-[.toast]:text-primary group-[.toast]:border-primary",
          success: "group-[.toast]:text-green-500 group-[.toast]:border-green-500",
          warning: "group-[.toast]:text-amber-500 group-[.toast]:border-amber-500",
        }
      }}
    />
  );
}
