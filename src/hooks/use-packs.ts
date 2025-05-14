
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SessionPack, LocationType, SubjectType, SessionType, WeeklyFrequency } from "@/lib/types";
import { assertLocationType, assertSubjectType, assertSessionType, assertWeeklyFrequency } from "@/lib/type-utils";

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
      
      // Transform database representation to SessionPack type
      return data.map(pack => ({
        id: pack.id,
        studentId: pack.student_id,
        size: pack.size,
        subject: assertSubjectType(pack.subject),
        sessionType: assertSessionType(pack.session_type),
        location: assertLocationType(pack.location),
        purchasedDate: pack.purchased_date,
        expiryDate: pack.expiry_date,
        remainingSessions: pack.remaining_sessions,
        isActive: pack.is_active,
        weeklyFrequency: assertWeeklyFrequency(pack.weekly_frequency),
        createdAt: pack.created_at,
        updatedAt: pack.updated_at
      })) as SessionPack[];
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
      // Convert to snake_case for the API and ensure proper type conversion
      const apiData = {
        student_id: packData.studentId,
        size: packData.size,
        subject: assertSubjectType(packData.subject),
        session_type: assertSessionType(packData.sessionType),
        location: assertLocationType(packData.location),
        purchased_date: packData.purchasedDate.toISOString(),
        remaining_sessions: packData.remainingSessions,
        is_active: packData.isActive,
        weekly_frequency: assertWeeklyFrequency(packData.weeklyFrequency)
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
