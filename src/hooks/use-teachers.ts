
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Teacher } from '@/lib/types';

// Fetch all teachers
export const useTeachers = () => {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id,
          subjects,
          max_weekly_sessions,
          profiles (
            id,
            name,
            email,
            role,
            created_at,
            updated_at
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
        name: item.profiles.name,
        email: item.profiles.email,
        role: item.profiles.role,
        subjects: item.subjects,
        availableTimes: [], // We'll need a separate query for this
        maxWeeklySessions: item.max_weekly_sessions,
        createdAt: new Date(item.profiles.created_at),
        updatedAt: new Date(item.profiles.updated_at)
      } as Teacher));
    },
  });
};

// Fetch a specific teacher by ID
export const useTeacher = (teacherId: string | undefined) => {
  return useQuery({
    queryKey: ['teachers', teacherId],
    queryFn: async () => {
      if (!teacherId) return null;

      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id,
          subjects,
          max_weekly_sessions,
          profiles (
            id,
            name,
            email,
            role,
            created_at,
            updated_at
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
        name: data.profiles.name,
        email: data.profiles.email,
        role: data.profiles.role,
        subjects: data.subjects,
        availableTimes: [], // Need separate query
        maxWeeklySessions: data.max_weekly_sessions,
        createdAt: new Date(data.profiles.created_at),
        updatedAt: new Date(data.profiles.updated_at)
      } as Teacher;
    },
    enabled: !!teacherId,
  });
};
