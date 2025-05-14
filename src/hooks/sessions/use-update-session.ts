
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformSessionUpdate } from "./session-transformers";
import { AttendanceStatus } from "@/lib/types";

interface SessionUpdateProps {
  id: string;
  status?: AttendanceStatus;
  notes?: string;
  dateTime?: Date;
  teacherId?: string;
  duration?: number;
}

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: SessionUpdateProps) => {
      const { id, ...updates } = updateData;
      
      // Transform frontend model to API format
      const apiUpdates = transformSessionUpdate(updates);
      
      const { data, error } = await supabase
        .from("sessions")
        .update(apiUpdates)
        .eq("id", id)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    }
  });
}
