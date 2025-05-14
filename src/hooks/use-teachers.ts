
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Teacher } from '@/lib/types';

// Fetch all teachers
export const useTeachers = () => {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      try {
        // Simplify the query to avoid complex joins that might cause infinite recursion
        const { data, error } = await supabase
          .from('teachers')
          .select(`
            id,
            subjects,
            max_weekly_sessions,
            profiles:id (
              name,
              email,
              role
            )
          `);

        if (error) {
          toast({
            title: 'Error fetching teachers',
            description: error.message,
            variant: 'destructive',
          });
          throw error;
        }

        // Transform data to match Teacher type
        return data.map((item: any) => ({
          id: item.id,
          name: item.profiles?.name || 'Unknown',
          email: item.profiles?.email || '',
          role: item.profiles?.role || 'teacher',
          subjects: item.subjects || [],
          availableTimes: [], // We'll need a separate query for this
          maxWeeklySessions: item.max_weekly_sessions,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Teacher));
      } catch (error) {
        console.error("Error in useTeachers:", error);
        // Return an empty array instead of throwing to prevent UI from breaking
        return [];
      }
    },
  });
};

// Fetch a specific teacher by ID
export const useTeacher = (teacherId: string | undefined) => {
  return useQuery({
    queryKey: ['teachers', teacherId],
    queryFn: async () => {
      if (!teacherId) return null;

      try {
        const { data, error } = await supabase
          .from('teachers')
          .select(`
            id,
            subjects,
            max_weekly_sessions,
            profiles:id (
              name,
              email,
              role
            )
          `)
          .eq('id', teacherId)
          .single();

        if (error) {
          toast({
            title: 'Error fetching teacher',
            description: error.message,
            variant: 'destructive',
          });
          throw error;
        }

        return {
          id: data.id,
          name: data.profiles?.name || 'Unknown',
          email: data.profiles?.email || '',
          role: data.profiles?.role || 'teacher',
          subjects: data.subjects || [],
          availableTimes: [], // Need separate query
          maxWeeklySessions: data.max_weekly_sessions,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Teacher;
      } catch (error) {
        console.error("Error in useTeacher:", error);
        return null;
      }
    },
    enabled: !!teacherId,
  });
};
