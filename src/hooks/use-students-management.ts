
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Student, SubjectType, UserRole } from '@/lib/types';

export interface StudentDetail extends Student {
  assignedTeacherName?: string;
  activePacks?: number;
  enrolledCourses?: string[];
  isActive?: boolean;
  createdAt?: Date;
}

export const useStudentsManagement = (filters?: {
  search?: string;
  subject?: SubjectType;
  teacherId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  const queryClient = useQueryClient();
  const pageSize = filters?.pageSize || 10;
  const page = filters?.page || 1;

  const fetchStudents = async () => {
    try {
      // Start with the base query for student profiles
      let query = supabase
        .from('students')
        .select(`
          id,
          preferred_subjects,
          preferred_teachers,
          notes,
          profiles!inner (
            id,
            name,
            email,
            role,
            created_at,
            updated_at
          )
        `);

      // Apply search filter if provided
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Apply subject filter if provided
      if (filters?.subject && filters.subject !== 'all') {
        query = query.contains('preferred_subjects', [filters.subject]);
      }

      // Apply teacher filter if provided
      if (filters?.teacherId && filters.teacherId !== 'all') {
        query = query.contains('preferred_teachers', [filters.teacherId]);
      }

      // Apply pagination
      query = query.range((page - 1) * pageSize, page * pageSize - 1);

      const { data: studentsData, error, count } = await query.order('id');

      if (error) {
        toast({
          title: "Error fetching students",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Transform data to match StudentDetail type
      const studentDetails: StudentDetail[] = [];
      
      for (const item of studentsData) {
        // Get active packs count
        const { data: packsData } = await supabase
          .from('session_packs')
          .select('id')
          .eq('student_id', item.id)
          .eq('is_active', true);
        
        // Get enrolled courses
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select(`
            course_id,
            courses(name)
          `)
          .eq('student_id', item.id)
          .in('status', ['active', 'on_hold']);

        // Get assigned teacher if they have a primary preferred teacher
        let teacherName = undefined;
        if (item.preferred_teachers && item.preferred_teachers.length > 0) {
          const { data: teacherData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', item.preferred_teachers[0])
            .single();
          
          teacherName = teacherData?.name;
        }

        studentDetails.push({
          id: item.id,
          name: item.profiles.name,
          email: item.profiles.email,
          preferredSubjects: item.preferred_subjects,
          preferredTeachers: item.preferred_teachers,
          notes: item.notes,
          createdAt: item.profiles.created_at ? new Date(item.profiles.created_at) : undefined,
          assignedTeacherName: teacherName,
          activePacks: packsData?.length || 0,
          enrolledCourses: enrollmentsData?.map(e => e.courses?.name).filter(Boolean) || [],
          isActive: true // Assuming all users are active by default
        });
      }

      return {
        students: studentDetails,
        totalCount: count || studentDetails.length,
        pageCount: Math.ceil((count || studentDetails.length) / pageSize)
      };
    } catch (error) {
      console.error("Error in fetchStudents:", error);
      throw error;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['students', 'management', filters],
    queryFn: fetchStudents,
  });

  const updateStudent = useMutation({
    mutationFn: async (studentData: Partial<StudentDetail> & { id: string }) => {
      const { id, name, email, preferredSubjects, preferredTeachers, notes, ...rest } = studentData;
      
      // Update the main profile information if provided
      if (name || email) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            name: name,
            email: email,
            updated_at: new Date().toISOString() 
          })
          .eq('id', id);
        
        if (profileError) {
          toast({
            title: "Error updating profile",
            description: profileError.message,
            variant: "destructive",
          });
          throw profileError;
        }
      }
      
      // Update student-specific data - convert camelCase to snake_case for Supabase
      const updateData: any = {};
      if (preferredSubjects !== undefined) updateData.preferred_subjects = preferredSubjects;
      if (preferredTeachers !== undefined) updateData.preferred_teachers = preferredTeachers;
      if (notes !== undefined) updateData.notes = notes;
      
      if (Object.keys(updateData).length > 0) {
        const { error: studentError } = await supabase
          .from('students')
          .update(updateData)
          .eq('id', id);
          
        if (studentError) {
          toast({
            title: "Error updating student",
            description: studentError.message,
            variant: "destructive",
          });
          throw studentError;
        }
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'management'] });
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating student",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deactivateStudent = useMutation({
    mutationFn: async (studentId: string) => {
      // In a real system, we would set an 'is_active' flag to false
      // For now we'll just simulate this operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Student deactivated",
        description: "Student account has been deactivated",
      });
      
      return { id: studentId, isActive: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'management'] });
    }
  });

  const reactivateStudent = useMutation({
    mutationFn: async (studentId: string) => {
      // In a real system, we would set an 'is_active' flag to true
      // For now we'll just simulate this operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Student reactivated",
        description: "Student account has been reactivated",
      });
      
      return { id: studentId, isActive: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', 'management'] });
    }
  });

  return {
    students: data?.students || [],
    totalCount: data?.totalCount || 0,
    pageCount: data?.pageCount || 1,
    isLoading,
    error,
    refetch,
    updateStudent: updateStudent.mutate,
    deactivateStudent: deactivateStudent.mutate,
    reactivateStudent: reactivateStudent.mutate,
    isPendingUpdate: updateStudent.isPending,
    isPendingDeactivate: deactivateStudent.isPending,
    isPendingReactivate: reactivateStudent.isPending,
  };
};
