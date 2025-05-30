
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserRole, SubjectType, UserWithRole } from "@/lib/types";

export const useUsers = (filters?: { role?: UserRole; email?: string }) => {
  const queryClient = useQueryClient();

  // Fetch all users with their role-specific data
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      // Start with profiles query - this will respect RLS policies
      let query = supabase
        .from('profiles')
        .select('*');
      
      // Apply filters if provided
      if (filters?.role) {
        query = query.eq('role', filters.role);
      }
      
      if (filters?.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }
      
      const { data: profiles, error } = await query;
      
      if (error) {
        console.error('Error fetching profiles:', error);
        throw new Error(error.message);
      }
      
      if (!profiles || profiles.length === 0) {
        return [];
      }
      
      // For each profile, fetch role-specific data
      const usersWithRoles: UserWithRole[] = await Promise.all(
        profiles.map(async (profile) => {
          const user: UserWithRole = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role as UserRole,
            createdAt: new Date(profile.created_at),
            updatedAt: new Date(profile.updated_at)
          };
          
          // Fetch role-specific data
          if (profile.role === 'teacher') {
            const { data: teacherData } = await supabase
              .from('teachers')
              .select('*')
              .eq('id', profile.id)
              .single();
              
            if (teacherData) {
              user.teacherData = {
                subjects: teacherData.subjects as SubjectType[],
                maxWeeklySessions: teacherData.max_weekly_sessions || 0,
                availableTimes: [] // Initialize with empty array
              };
            }
          } else if (profile.role === 'student') {
            const { data: studentData } = await supabase
              .from('students')
              .select('*')
              .eq('id', profile.id)
              .single();
              
            if (studentData) {
              user.studentData = {
                preferredSubjects: studentData.preferred_subjects as SubjectType[],
                preferredTeachers: studentData.preferred_teachers || [],
                notes: studentData.notes || '',
              };
            }
          } else if (profile.role === 'admin') {
            const { data: adminData } = await supabase
              .from('admins')
              .select('*')
              .eq('id', profile.id)
              .single();
              
            if (adminData) {
              user.adminData = {
                permissions: adminData.permissions || []
              };
            }
          }
          
          return user;
        })
      );
      
      return usersWithRoles;
    }
  });

  // Update user profile
  const updateUser = useMutation({
    mutationFn: async (userData: Partial<UserWithRole> & { id: string }) => {
      const { id, role, name, email, teacherData, studentData, adminData, ...rest } = userData;
      
      // Update profile - using snake_case for Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          name, 
          email,
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (profileError) {
        throw new Error(profileError.message);
      }
      
      // Update role-specific data - convert camelCase to snake_case
      if (role === 'teacher' && teacherData) {
        const { error: teacherError } = await supabase
          .from('teachers')
          .update({ 
            subjects: teacherData.subjects,
            max_weekly_sessions: teacherData.maxWeeklySessions
          })
          .eq('id', id);
        
        if (teacherError) {
          throw new Error(teacherError.message);
        }
      } else if (role === 'student' && studentData) {
        const { error: studentError } = await supabase
          .from('students')
          .update({ 
            preferred_subjects: studentData.preferredSubjects,
            preferred_teachers: studentData.preferredTeachers,
            notes: studentData.notes
          })
          .eq('id', id);
        
        if (studentError) {
          throw new Error(studentError.message);
        }
      } else if (role === 'admin' && adminData) {
        const { error: adminError } = await supabase
          .from('admins')
          .update({ 
            permissions: adminData.permissions
          })
          .eq('id', id);
        
        if (adminError) {
          throw new Error(adminError.message);
        }
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error.message}`);
    }
  });

  // Delete user
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      // Delete from profiles table - because of cascading deletes, this will remove
      // the user from role-specific tables as well
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { id: userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    }
  });

  return {
    users,
    isLoading,
    error,
    updateUser: updateUser.mutate,
    deleteUser: deleteUser.mutate,
    isPendingUpdate: updateUser.isPending,
    isPendingDelete: deleteUser.isPending
  };
};
