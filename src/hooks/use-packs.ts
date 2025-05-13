
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PackSize, SessionPack, SubjectType, SessionType, LocationType, WeeklyFrequency } from "@/lib/types";
import { toast } from "sonner";

// Extended SessionPack interface with student name
export interface PackWithRelations extends SessionPack {
  studentName: string;
  nameWithStudentIds?: string;
}

// Get all packs
export const useFetchPacks = (filterActive?: boolean) => {
  return useQuery({
    queryKey: ["packs", filterActive],
    queryFn: async () => {
      let query = supabase.from("session_packs")
        .select(`
          id,
          student_id,
          size,
          subject,
          session_type,
          location,
          purchased_date,
          expiry_date,
          remaining_sessions,
          is_active,
          weekly_frequency,
          created_at,
          updated_at
        `);
      
      // Filter for only active packs if requested
      if (filterActive) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Now fetch student names for each pack
      const packsWithStudentNames: PackWithRelations[] = [];
      
      for (const pack of data) {
        const { data: studentData } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", pack.student_id)
          .single();
        
        packsWithStudentNames.push({
          id: pack.id,
          studentId: pack.student_id,
          size: pack.size as unknown as PackSize,
          subject: pack.subject as SubjectType,
          sessionType: pack.session_type as SessionType,
          location: pack.location as LocationType,
          purchasedDate: pack.purchased_date,
          expiryDate: pack.expiry_date,
          remainingSessions: pack.remaining_sessions,
          isActive: pack.is_active,
          weeklyFrequency: pack.weekly_frequency as WeeklyFrequency,
          createdAt: pack.created_at,
          updatedAt: pack.updated_at,
          studentName: studentData?.name || 'Unknown'
        });
      }
      
      return packsWithStudentNames;
    }
  });
};

// Get packs for a specific student
export const useFetchStudentPacks = (studentId: string) => {
  return useQuery({
    queryKey: ["studentPacks", studentId],
    queryFn: async () => {
      const { data, error } = await supabase.from("session_packs")
        .select(`
          id,
          student_id,
          size,
          subject,
          session_type,
          location,
          purchased_date,
          expiry_date,
          remaining_sessions,
          is_active,
          weekly_frequency,
          created_at,
          updated_at
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Get student name
      const { data: studentData } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", studentId)
        .single();
      
      const packsWithStudentName: PackWithRelations[] = data.map(pack => ({
        id: pack.id,
        studentId: pack.student_id,
        size: pack.size as unknown as PackSize,
        subject: pack.subject as SubjectType,
        sessionType: pack.session_type as SessionType,
        location: pack.location as LocationType,
        purchasedDate: pack.purchased_date,
        expiryDate: pack.expiry_date,
        remainingSessions: pack.remaining_sessions,
        isActive: pack.is_active,
        weeklyFrequency: pack.weekly_frequency as WeeklyFrequency,
        createdAt: pack.created_at,
        updatedAt: pack.updated_at,
        studentName: studentData?.name || 'Unknown'
      }));
      
      return packsWithStudentName;
    }
  });
};

// Create new packs
export const useCreatePacks = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packData: Omit<SessionPack, "id" | "createdAt" | "updatedAt">[]) => {
      const formattedData = packData.map(pack => ({
        purchased_date: new Date(pack.purchasedDate).toISOString(),
        expiry_date: pack.expiryDate ? new Date(pack.expiryDate).toISOString() : null,
        student_id: pack.studentId,
        size: Number(pack.size),
        subject: pack.subject,
        session_type: pack.sessionType,
        location: pack.location,
        remaining_sessions: pack.remainingSessions,
        is_active: pack.isActive,
        weekly_frequency: pack.weeklyFrequency
      }));
      
      const { data, error } = await supabase
        .from("session_packs")
        .insert(formattedData)
        .select();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packs"] });
      queryClient.invalidateQueries({ queryKey: ["studentPacks"] });
      toast.success("Pack created successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to create pack: ${error.message}`);
    }
  });
};
