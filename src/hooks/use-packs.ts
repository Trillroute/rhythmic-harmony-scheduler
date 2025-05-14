
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SessionPack, PackSize, SubjectType, SessionType, LocationType, WeeklyFrequency } from "@/lib/types";

// Create a new pack
const createSessionPack = async (packData: Omit<SessionPack, 'id' | 'createdAt' | 'updatedAt'>) => {
  // Convert camelCase to snake_case for Supabase
  const { 
    studentId, 
    size, 
    subject, 
    sessionType, 
    location, 
    purchasedDate, 
    expiryDate, 
    remainingSessions, 
    isActive, 
    weeklyFrequency 
  } = packData;

  // Map pack size to string to match Supabase enum
  const packSizeStr = size.toString() as "4" | "10" | "20" | "30";
  
  const { data, error } = await supabase
    .from('session_packs')
    .insert({
      student_id: studentId,
      size: packSizeStr,
      subject,
      session_type: sessionType,
      location,
      purchased_date: purchasedDate instanceof Date 
        ? purchasedDate.toISOString() 
        : purchasedDate,
      expiry_date: expiryDate instanceof Date 
        ? expiryDate.toISOString() 
        : expiryDate,
      remaining_sessions: remainingSessions,
      is_active: isActive,
      weekly_frequency: weeklyFrequency
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create session pack: ${error.message}`);
  return data;
};

// Update an existing pack
const updateSessionPack = async (packData: SessionPack) => {
  const { 
    id,
    studentId, 
    size, 
    subject, 
    sessionType, 
    location, 
    purchasedDate, 
    expiryDate, 
    remainingSessions, 
    isActive, 
    weeklyFrequency 
  } = packData;

  // Map pack size to string to match Supabase enum
  const packSizeStr = size.toString() as "4" | "10" | "20" | "30";

  const { data, error } = await supabase
    .from('session_packs')
    .update({
      student_id: studentId,
      size: packSizeStr,
      subject,
      session_type: sessionType,
      location,
      purchased_date: purchasedDate instanceof Date 
        ? purchasedDate.toISOString() 
        : purchasedDate,
      expiry_date: expiryDate instanceof Date 
        ? expiryDate.toISOString() 
        : expiryDate,
      remaining_sessions: remainingSessions,
      is_active: isActive,
      weekly_frequency: weeklyFrequency
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update session pack: ${error.message}`);
  return data;
};

// Hook to manage session packs
export const usePacks = (studentId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["session_packs", studentId];

  // Query to fetch packs
  const { data: packs, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('session_packs')
        .select('*');

      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;

      if (error) throw new Error(error.message);
      
      return (data || []).map(item => ({
        id: item.id,
        studentId: item.student_id,
        size: parseInt(item.size) as PackSize,
        subject: item.subject as SubjectType,
        sessionType: item.session_type as SessionType,
        location: item.location as LocationType,
        purchasedDate: new Date(item.purchased_date),
        expiryDate: item.expiry_date ? new Date(item.expiry_date) : undefined,
        remainingSessions: item.remaining_sessions,
        isActive: item.is_active,
        weeklyFrequency: item.weekly_frequency as WeeklyFrequency,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    },
    enabled: true
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createSessionPack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Session pack created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateSessionPack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Session pack updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return {
    packs,
    isLoading,
    error,
    refetch,
    createPack: createMutation.mutate,
    updatePack: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending
  };
};
