
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Session } from "@/lib/types";

interface UpdateSessionParams {
  sessionId: string;
  updates: Partial<Omit<Session, "id">>;
}

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, updates }: UpdateSessionParams) => {
      const { data, error } = await supabase
        .from("sessions")
        .update(updates)
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update session:", error);
      toast.error(`Failed to update session: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
};
