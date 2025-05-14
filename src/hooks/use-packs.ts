
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SessionPack } from "@/lib/types";

export const useSessionPacks = (studentId?: string) => {
  return useQuery({
    queryKey: ["sessionPacks", studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from("session_packs")
        .select("*")
        .eq("student_id", studentId);

      if (error) throw error;
      return data as SessionPack[];
    },
    enabled: !!studentId,
  });
};

interface CreateSessionPackInput {
  studentId: string;
  size: number;
  subject: string;
  sessionType: string;
  location: string;
  purchasedDate: Date;
  remainingSessions: number;
  isActive: boolean;
  weeklyFrequency: string;
}

export const useCreateSessionPack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packData: CreateSessionPackInput) => {
      // Convert to snake_case for the API
      const apiData = {
        student_id: packData.studentId,
        size: packData.size,
        subject: packData.subject,
        session_type: packData.sessionType,
        location: packData.location,
        purchased_date: packData.purchasedDate.toISOString(),
        remaining_sessions: packData.remainingSessions,
        is_active: packData.isActive,
        weekly_frequency: packData.weeklyFrequency
      };

      const { data, error } = await supabase
        .from("session_packs")
        .insert(apiData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sessionPacks", variables.studentId] });
    }
  });
};
