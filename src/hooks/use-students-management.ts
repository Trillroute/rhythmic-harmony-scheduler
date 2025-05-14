
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SubjectType, Student } from '@/lib/types';
import { toast } from 'sonner';

interface StudentsQueryParams {
  searchTerm?: string;
  subject?: SubjectType | "all";
  limit?: number;
}

export const useStudentsManagement = (params: StudentsQueryParams = {}) => {
  const queryClient = useQueryClient();
  const { searchTerm = '', subject = 'all', limit } = params;

  // Fetch students with optional filtering
  const studentsQuery = useQuery({
    queryKey: ['students-management', searchTerm, subject, limit],
    queryFn: async () => {
      // Start by joining profiles with students to get all student data
      let query = supabase
        .from('profiles')
        .select(`
          *,
          students (
            id,
            preferred_subjects,
            preferred_teachers,
            notes
          )
        `)
        .eq('role', 'student');

      // Apply search term filter if provided
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Apply subject filter if provided and not "all"
      if (subject && subject !== "all") {
        query = query.filter('students.preferred_subjects', 'cs', `{${subject}}`);
      }

      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform the data into a format that matches the Student interface
      return data.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        preferredSubjects: profile.students?.[0]?.preferred_subjects || [],
        preferredTeachers: profile.students?.[0]?.preferred_teachers || [],
        notes: profile.students?.[0]?.notes || '',
        status: profile.students?.[0]?.status || 'active'
      }));
    }
  });

  // Create a new student
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: Omit<Student, 'id'>) => {
      // First, create a profile in auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: studentData.email,
        password: Math.random().toString(36).slice(-8), // Generate a random password
        options: {
          data: {
            name: studentData.name,
            role: 'student'
          }
        }
      });

      if (authError) throw authError;
      
      const userId = authData.user?.id;
      if (!userId) throw new Error('Failed to create user account');

      // Then insert the student-specific data
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          id: userId,
          preferred_subjects: studentData.preferredSubjects || [],
          preferred_teachers: studentData.preferredTeachers || [],
          notes: studentData.notes
        });

      if (studentError) throw studentError;

      return {
        id: userId,
        ...studentData
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students-management'] });
      toast.success('Student created successfully');
    },
    onError: (error) => {
      console.error('Error creating student:', error);
      toast.error(`Failed to create student: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Update an existing student
  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, ...studentData }: Student) => {
      // Update profile data (name, email)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: studentData.name,
          email: studentData.email
        })
        .eq('id', id);

      if (profileError) throw profileError;

      // Update student-specific data
      const { error: studentError } = await supabase
        .from('students')
        .update({
          preferred_subjects: studentData.preferredSubjects || [],
          preferred_teachers: studentData.preferredTeachers || [],
          notes: studentData.notes,
          status: studentData.status
        })
        .eq('id', id);

      if (studentError) throw studentError;

      return {
        id,
        ...studentData
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students-management'] });
      toast.success('Student updated successfully');
    },
    onError: (error) => {
      console.error('Error updating student:', error);
      toast.error(`Failed to update student: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  return {
    students: studentsQuery.data || [],
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error,
    createStudent: createStudentMutation.mutateAsync,
    updateStudent: updateStudentMutation.mutateAsync,
    isPendingCreate: createStudentMutation.isPending,
    isPendingUpdate: updateStudentMutation.isPending
  };
};
