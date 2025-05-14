
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Student } from '@/lib/types';

// Fetch all students
export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      try {
        // Simplify the query to avoid complex joins that might cause infinite recursion
        const { data, error } = await supabase
          .from('students')
          .select(`
            id,
            preferred_subjects,
            preferred_teachers,
            notes
          `);
          
        if (error) {
          toast({
            title: 'Error fetching students',
            description: error.message,
            variant: 'destructive',
          });
          throw error;
        }
        
        // For each student, get their profile separately
        const studentsWithProfiles = await Promise.all(
          data.map(async (student) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name, email, role, created_at, updated_at')
              .eq('id', student.id)
              .single();
              
            return {
              id: student.id,
              name: profileData?.name || 'Unknown',
              email: profileData?.email || '',
              role: profileData?.role || 'student',
              preferredSubjects: student.preferred_subjects || [],
              preferredTeachers: student.preferred_teachers || [],
              packs: [], // Will need a separate query
              notes: student.notes,
              createdAt: profileData?.created_at ? new Date(profileData.created_at) : new Date(),
              updatedAt: profileData?.updated_at ? new Date(profileData.updated_at) : new Date()
            } as Student;
          })
        );

        return studentsWithProfiles;
      } catch (error) {
        console.error("Error in useStudents:", error);
        // Return an empty array instead of throwing to prevent UI from breaking
        return [];
      }
    },
  });
};

// Fetch a specific student by ID
export const useStudent = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['students', studentId],
    queryFn: async () => {
      if (!studentId) return null;

      try {
        const { data, error } = await supabase
          .from('students')
          .select(`
            id,
            preferred_subjects,
            preferred_teachers,
            notes
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

        // Get the student's profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, email, role, created_at, updated_at')
          .eq('id', data.id)
          .single();

        return {
          id: data.id,
          name: profileData?.name || 'Unknown',
          email: profileData?.email || '',
          role: profileData?.role || 'student',
          preferredSubjects: data.preferred_subjects || [],
          preferredTeachers: data.preferred_teachers || [],
          packs: [], // Need separate query
          notes: data.notes,
          createdAt: profileData?.created_at ? new Date(profileData.created_at) : new Date(),
          updatedAt: profileData?.updated_at ? new Date(profileData.updated_at) : new Date()
        } as Student;
      } catch (error) {
        console.error("Error in useStudent:", error);
        return null;
      }
    },
    enabled: !!studentId,
  });
};
