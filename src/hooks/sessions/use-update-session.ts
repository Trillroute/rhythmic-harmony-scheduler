
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
      
      // Transform frontend model to API format (camelCase to snake_case)
      const apiUpdates = transformSessionUpdate(updates);
      
      const { error } = await supabase
        .from("sessions")
        .update(apiUpdates)
        .eq("id", id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { sessionId: id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    }
  });
}
