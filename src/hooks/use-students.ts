
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
        // Get all student IDs first
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select(`
            id,
            preferred_subjects,
            preferred_teachers,
            notes
          `);
          
        if (studentError) {
          toast({
            title: 'Error fetching students',
            description: studentError.message,
            variant: 'destructive',
          });
          throw studentError;
        }
        
        if (!studentData || studentData.length === 0) {
          return [];
        }
        
        // Get profiles for these student IDs
        const studentIds = studentData.map(student => student.id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email, role, created_at, updated_at')
          .in('id', studentIds);
          
        if (profilesError) {
          toast({
            title: 'Error fetching student profiles',
            description: profilesError.message,
            variant: 'destructive',
          });
          throw profilesError;
        }
        
        // Combine student data with profiles
        const studentsWithProfiles = studentData.map(student => {
          const profile = profilesData?.find(p => p.id === student.id);
          return {
            id: student.id,
            name: profile?.name || 'Unknown',
            email: profile?.email || '',
            role: profile?.role || 'student',
            preferredSubjects: student.preferred_subjects || [],
            preferredTeachers: student.preferred_teachers || [],
            packs: [], // Will need a separate query
            notes: student.notes,
            createdAt: profile?.created_at ? new Date(profile.created_at) : new Date(),
            updatedAt: profile?.updated_at ? new Date(profile.updated_at) : new Date()
          } as Student;
        });

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
        // Get student data
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select(`
            id,
            preferred_subjects,
            preferred_teachers,
            notes
          `)
          .eq('id', studentId)
          .single();

        if (studentError) {
          toast({
            title: 'Error fetching student',
            description: studentError.message,
            variant: 'destructive',
          });
          throw studentError;
        }

        // Get the student's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name, email, role, created_at, updated_at')
          .eq('id', studentData.id)
          .single();
          
        if (profileError) {
          toast({
            title: 'Error fetching student profile',
            description: profileError.message,
            variant: 'destructive',
          });
        }

        return {
          id: studentData.id,
          name: profileData?.name || 'Unknown',
          email: profileData?.email || '',
          role: profileData?.role || 'student',
          preferredSubjects: studentData.preferred_subjects || [],
          preferredTeachers: studentData.preferred_teachers || [],
          packs: [], // Need separate query
          notes: studentData.notes,
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
