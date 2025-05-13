
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SessionPack } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

// Fetch all packs or student-specific packs
export const useSessionPacks = (studentId?: string) => {
  const { userRole, user } = useAuth();
  
  return useQuery({
    queryKey: ['session-packs', studentId],
    queryFn: async () => {
      let query = supabase
        .from('session_packs')
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
          updated_at,
          students (
            profiles (
              name
            )
          )
        `);
      
      // Filter by student if provided or if user is a student
      if (studentId) {
        query = query.eq('student_id', studentId);
      } else if (userRole === 'student' && user) {
        query = query.eq('student_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast({
          title: 'Error fetching session packs',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      // Transform data to match SessionPack type
      return data.map((item: any) => ({
        id: item.id,
        studentId: item.student_id,
        studentName: item.students?.profiles?.name || 'Unknown',
        size: parseInt(item.size),
        subject: item.subject,
        sessionType: item.session_type,
        location: item.location,
        purchasedDate: new Date(item.purchased_date),
        expiryDate: item.expiry_date ? new Date(item.expiry_date) : undefined,
        remainingSessions: item.remaining_sessions,
        isActive: item.is_active,
        weeklyFrequency: item.weekly_frequency,
        sessions: [], // Need separate query for this
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      } as SessionPack & { studentName: string }));
    },
  });
};

// Create a new session pack
export const useCreateSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packData: Partial<SessionPack>) => {
      // Calculate expiry date (6 months from purchase)
      const purchasedDate = packData.purchasedDate || new Date();
      const expiryDate = new Date(purchasedDate);
      expiryDate.setMonth(expiryDate.getMonth() + 6);
      
      const { data, error } = await supabase
        .from('session_packs')
        .insert({
          student_id: packData.studentId,
          size: packData.size?.toString(),
          subject: packData.subject,
          session_type: packData.sessionType,
          location: packData.location,
          purchased_date: purchasedDate.toISOString(),
          expiry_date: expiryDate.toISOString(),
          remaining_sessions: packData.size || 4, // Default to pack size
          is_active: true,
          weekly_frequency: packData.weeklyFrequency || 'once'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-packs'] });
      toast({
        title: 'Success',
        description: 'Session pack created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating session pack',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Update a session pack
export const useUpdateSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      packId, 
      remainingSessions,
      isActive 
    }: { 
      packId: string, 
      remainingSessions?: number,
      isActive?: boolean
    }) => {
      const updates: any = {};
      
      if (remainingSessions !== undefined) {
        updates.remaining_sessions = remainingSessions;
      }
      
      if (isActive !== undefined) {
        updates.is_active = isActive;
      }
      
      const { data, error } = await supabase
        .from('session_packs')
        .update(updates)
        .eq('id', packId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-packs'] });
      toast({
        title: 'Success',
        description: 'Session pack updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating session pack',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
