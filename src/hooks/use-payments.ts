
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type PaymentMode = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';

export interface Payment {
  id: string;
  student_id: string;
  fee_plan_id: string;
  amount_paid: number;
  paid_at: string;
  payment_mode: PaymentMode;
  notes?: string;
  created_at: string;
}

export interface NewPayment {
  student_id: string;
  fee_plan_id: string;
  amount_paid: number;
  paid_at?: string;
  payment_mode: PaymentMode;
  notes?: string;
}

export const usePayments = (studentId?: string, feePlanId?: string) => {
  const queryClient = useQueryClient();

  const fetchPayments = async (): Promise<Payment[]> => {
    let query = supabase
      .from('payments')
      .select('*');
    
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    
    if (feePlanId) {
      query = query.eq('fee_plan_id', feePlanId);
    }
    
    const { data, error } = await query.order('paid_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching payments',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }

    return data;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['payments', studentId, feePlanId],
    queryFn: fetchPayments,
    enabled: !!studentId || !!feePlanId,
  });

  const createPayment = useMutation({
    mutationFn: async (newPayment: NewPayment) => {
      const { data, error } = await supabase
        .from('payments')
        .insert([newPayment])
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error creating payment',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['fee-plans'] }); // Refresh fee plans as well
      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: 'Error deleting payment',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['fee-plans'] }); // Refresh fee plans as well
      toast({
        title: 'Success',
        description: 'Payment deleted successfully',
      });
    },
  });

  return {
    payments: data || [],
    isLoading,
    error,
    refetch,
    createPayment: createPayment.mutate,
    deletePayment: deletePayment.mutate,
    isPendingCreate: createPayment.isPending,
    isPendingDelete: deletePayment.isPending,
  };
};
