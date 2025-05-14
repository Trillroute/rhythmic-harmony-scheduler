
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PaymentReminder {
  student_id: string;
  fee_plan_id: string;
  due_date: string;
  amount_due: number;
  days_until_due: number;
}

interface LateFee {
  fee_plan_id: string;
  student_id: string;
  due_date: string;
  amount_due: number;
  late_fee: number;
  days_late: number;
}

export const usePaymentReminders = () => {
  const fetchPaymentReminders = async (): Promise<PaymentReminder[]> => {
    const { data, error } = await supabase.rpc('check_payment_reminders');
    
    if (error) {
      toast({
        title: 'Error fetching payment reminders',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
    
    return data || [];
  };
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['payment-reminders'],
    queryFn: fetchPaymentReminders,
  });
  
  return {
    reminders: data || [],
    isLoading,
    error,
    refetch
  };
};

export const useLateFees = () => {
  const fetchLateFees = async (): Promise<LateFee[]> => {
    const { data, error } = await supabase.rpc('calculate_late_fees');
    
    if (error) {
      toast({
        title: 'Error calculating late fees',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
    
    return data || [];
  };
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['late-fees'],
    queryFn: fetchLateFees,
  });
  
  return {
    lateFees: data || [],
    isLoading,
    error,
    refetch
  };
};
