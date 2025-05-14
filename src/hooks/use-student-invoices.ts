
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Invoice = {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
  packId?: string;
  planId?: string;
  notes?: string;
};

export const useStudentInvoices = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['invoices', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
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

      return data.map((item: any) => ({
        id: item.id,
        amount: item.amount,
        status: item.status,
        dueDate: item.due_date,
        createdAt: item.created_at,
        packId: item.pack_id,
        planId: item.plan_id,
        notes: item.notes,
      })) as Invoice[];
    },
    enabled: !!studentId,
  });
};
