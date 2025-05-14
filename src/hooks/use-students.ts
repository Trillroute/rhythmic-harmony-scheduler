
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Student } from '@/lib/types';

// Fetch all students
export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          preferred_subjects,
          preferred_teachers,
          notes,
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
          title: 'Error fetching students',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      // Transform data to match Student type - convert snake_case to camelCase
      return data.map((item: any) => ({
        id: item.id,
        name: item.profiles.name,
        email: item.profiles.email,
        role: item.profiles.role,
        preferredSubjects: item.preferred_subjects,
        preferredTeachers: item.preferred_teachers,
        packs: [], // We'll need a separate query for this
        notes: item.notes,
        createdAt: new Date(item.profiles.created_at),
        updatedAt: new Date(item.profiles.updated_at)
      } as Student));
    },
  });
};

// Fetch a specific student by ID
export const useStudent = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['students', studentId],
    queryFn: async () => {
      if (!studentId) return null;

      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          preferred_subjects,
          preferred_teachers,
          notes,
          profiles (
            id,
            name,
            email,
            role,
            created_at,
            updated_at
          )
        `)
        .eq('id', studentId)
        .single();

      if (error) {
        toast({
          title: 'Error fetching student',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      // Convert snake_case to camelCase for frontend
      return {
        id: data.id,
        name: data.profiles.name,
        email: data.profiles.email,
        role: data.profiles.role,
        preferredSubjects: data.preferred_subjects,
        preferredTeachers: data.preferred_teachers,
        packs: [], // Need separate query
        notes: data.notes,
        createdAt: new Date(data.profiles.created_at),
        updatedAt: new Date(data.profiles.updated_at)
      } as Student;
    },
    enabled: !!studentId,
  });
};
