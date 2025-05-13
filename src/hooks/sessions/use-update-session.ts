
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@/lib/types";
import { toast } from "sonner";

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...sessionData }: Partial<Session> & { id: string }) => {
      // Cast status to string for the Supabase query if provided
      const dataToUpdate = {
        ...sessionData,
        status: sessionData.status ? sessionData.status.toString() : undefined,
      };
      
      const { data, error } = await supabase
        .from("sessions")
        .update(dataToUpdate)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update session: ${error.message}`);
    },
  });
};
