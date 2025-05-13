
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SessionUpdateProps } from "./types";
import { toast } from "sonner";
import { AttendanceStatus } from "@/lib/types";

// Hook for updating session status
export const useUpdateSession = (queryKey: any[]) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionUpdate: SessionUpdateProps) => {
      const { id, status } = sessionUpdate;
      
      const { data, error } = await supabase
        .from("sessions")
        .update({ status: status as AttendanceStatus })
        .eq("id", id)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(`Failed to update session status: ${error.message}`);
    }
  });
};
