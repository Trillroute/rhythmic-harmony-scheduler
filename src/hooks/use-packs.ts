
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { SubjectType, SessionType, LocationType, WeeklyFrequency, PackSize } from "@/lib/types";
import { toast } from "sonner";

export interface PackWithRelations {
  id: string;
  studentId: string;
  size: PackSize;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  remainingSessions: number;
  isActive: boolean;
  weeklyFrequency: WeeklyFrequency;
  purchasedDate: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  studentName?: string;
}

interface CreatePackProps {
  student_id: string;
  size: PackSize;
  subject: SubjectType;
  session_type: SessionType;
  location: LocationType;
  remaining_sessions: number;
  is_active: boolean;
  weekly_frequency: WeeklyFrequency;
  purchased_date: Date;
  expiry_date?: Date;
}

interface UpdatePackProps {
  id: string;
  remaining_sessions?: number;
  is_active?: boolean;
}

export const useSessionPacks = (studentId?: string) => {
  const queryKey = ["session_packs", studentId];
  
  const fetchPacks = async (): Promise<PackWithRelations[]> => {
    let query = supabase.from("session_packs").select(`
      *,
      profiles:student_id(name)
    `);
    
    if (studentId) {
      query = query.eq("student_id", studentId);
    }
    
    const { data, error } = await query.order('is_active', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Transform data to match our interface
    return data.map(pack => ({
      id: pack.id,
      studentId: pack.student_id,
      size: pack.size,
      subject: pack.subject,
      sessionType: pack.session_type,
      location: pack.location,
      remainingSessions: pack.remaining_sessions,
      isActive: pack.is_active,
      weeklyFrequency: pack.weekly_frequency,
      purchasedDate: pack.purchased_date,
      expiryDate: pack.expiry_date,
      createdAt: pack.created_at,
      updatedAt: pack.updated_at,
      studentName: pack.profiles?.name
    }));
  };
  
  return useQuery({
    queryKey,
    queryFn: fetchPacks,
  });
};

// Hook to fetch all packs (for admin usage)
export const useAllSessionPacks = () => {
  const queryKey = ["all_session_packs"];
  
  const fetchAllPacks = async (): Promise<PackWithRelations[]> => {
    const { data, error } = await supabase
      .from("session_packs")
      .select(`
        *,
        profiles:student_id(name)
      `)
      .order('is_active', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Transform data to match our interface
    return data.map(pack => ({
      id: pack.id,
      studentId: pack.student_id,
      size: pack.size,
      subject: pack.subject,
      sessionType: pack.session_type,
      location: pack.location,
      remainingSessions: pack.remaining_sessions,
      isActive: pack.is_active,
      weeklyFrequency: pack.weekly_frequency,
      purchasedDate: pack.purchased_date,
      expiryDate: pack.expiry_date,
      createdAt: pack.created_at,
      updatedAt: pack.updated_at,
      studentName: pack.profiles?.name
    }));
  };
  
  return useQuery({
    queryKey,
    queryFn: fetchAllPacks,
  });
};

export const useCreateSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packData: CreatePackProps) => {
      // Format the dates as ISO strings for Supabase
      const formattedData = {
        ...packData,
        purchased_date: packData.purchased_date.toISOString(),
        expiry_date: packData.expiry_date ? packData.expiry_date.toISOString() : null
      };
      
      const { data, error } = await supabase
        .from("session_packs")
        .insert([formattedData])
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0];
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["session_packs", variables.student_id] });
      queryClient.invalidateQueries({ queryKey: ["all_session_packs"] });
      toast.success("Pack created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating pack: ${error.message}`);
    }
  });
};

export const useUpdateSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdatePackProps) => {
      const { data, error } = await supabase
        .from("session_packs")
        .update(updateData)
        .eq("id", id)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session_packs"] });
      queryClient.invalidateQueries({ queryKey: ["all_session_packs"] });
      toast.success("Pack updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating pack: ${error.message}`);
    }
  });
};
