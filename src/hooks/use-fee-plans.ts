
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { prepareForSupabase } from '@/lib/type-utils';

export interface DueDate {
  date: string;
  amount: number;
  description?: string;
}

export interface LateFeePolicy {
  rate_per_day: number;
  maximum: number;
}

export interface FeePlan {
  id: string;
  student_id: string;
  plan_title: string;
  total_amount: number;
  due_dates: DueDate[];
  late_fee_policy?: LateFeePolicy;
  created_at: string;
  updated_at: string;
}

export interface NewFeePlan {
  student_id: string;
  plan_title: string;
  total_amount: number;
  due_dates: DueDate[];
  late_fee_policy?: LateFeePolicy;
}

export const useFeePlans = (studentId?: string) => {
  const queryClient = useQueryClient();

  const fetchFeePlans = async (): Promise<FeePlan[]> => {
    let query = supabase
      .from('fee_plans')
      .select('*');
    
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching fee plans',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }

    // Parse JSON fields
    return data.map(plan => ({
      ...plan,
      due_dates: plan.due_dates as unknown as DueDate[],
      late_fee_policy: plan.late_fee_policy as unknown as LateFeePolicy,
    }));
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['fee-plans', studentId],
    queryFn: fetchFeePlans,
  });

  const createFeePlan = useMutation({
    mutationFn: async (newPlan: NewFeePlan) => {
      // Convert JavaScript objects to JSON strings for Supabase
      const supabaseData = {
        student_id: newPlan.student_id,
        plan_title: newPlan.plan_title,
        total_amount: newPlan.total_amount,
        due_dates: prepareForSupabase(newPlan.due_dates),
        late_fee_policy: newPlan.late_fee_policy ? prepareForSupabase(newPlan.late_fee_policy) : null
      };
      
      const { data, error } = await supabase
        .from('fee_plans')
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error creating fee plan',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-plans'] });
      toast({
        title: 'Success',
        description: 'Fee plan created successfully',
      });
    },
  });

  const updateFeePlan = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<FeePlan> & { id: string }) => {
      // Convert JavaScript objects to JSON strings for Supabase
      const supabaseData: any = {};
      
      if (updateData.student_id) supabaseData.student_id = updateData.student_id;
      if (updateData.plan_title) supabaseData.plan_title = updateData.plan_title;
      if (updateData.total_amount) supabaseData.total_amount = updateData.total_amount;
      if (updateData.due_dates) supabaseData.due_dates = prepareForSupabase(updateData.due_dates);
      if (updateData.late_fee_policy) supabaseData.late_fee_policy = prepareForSupabase(updateData.late_fee_policy);
      
      const { data, error } = await supabase
        .from('fee_plans')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error updating fee plan',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-plans'] });
      toast({
        title: 'Success',
        description: 'Fee plan updated successfully',
      });
    },
  });

  const deleteFeePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fee_plans')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: 'Error deleting fee plan',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-plans'] });
      toast({
        title: 'Success',
        description: 'Fee plan deleted successfully',
      });
    },
  });

  return {
    feePlans: data || [],
    isLoading,
    error,
    refetch,
    createFeePlan: createFeePlan.mutate,
    updateFeePlan: updateFeePlan.mutate,
    deleteFeePlan: deleteFeePlan.mutate,
    isPendingCreate: createFeePlan.isPending,
    isPendingUpdate: updateFeePlan.isPending,
    isPendingDelete: deleteFeePlan.isPending,
  };
};
