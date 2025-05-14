
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Invoice {
  id: string;
  amount: number;
  status: string;
  createdAt: string | Date;
  dueDate: string | Date;
  packId?: string;
  planId?: string;
  studentId: string; // Added to match usage in InvoiceManagement
  notes?: string;    // Added to match usage in InvoiceManagement
}

export const useStudentInvoices = (studentId: string | undefined) => {
  const query = useQuery({
    queryKey: ['student-invoices', studentId],
    queryFn: async (): Promise<Invoice[]> => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id, 
          amount, 
          status, 
          created_at,
          due_date,
          pack_id,
          plan_id,
          student_id,
          notes
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Error fetching invoices',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return (data || []).map(item => ({
        id: item.id,
        amount: item.amount,
        status: item.status,
        createdAt: item.created_at,
        dueDate: item.due_date,
        packId: item.pack_id,
        planId: item.plan_id,
        studentId: item.student_id,
        notes: item.notes
      }));
    },
    enabled: !!studentId
  });

  return {
    invoices: query.data || [],
    isLoading: query.isLoading,
    error: query.error
  };
};
