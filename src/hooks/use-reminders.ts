
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Reminder } from '@/lib/models';
import { useAuth } from '@/contexts/AuthContext';

export const useReminders = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: reminders, isLoading, error } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          recipient:profiles!reminders_recipient_id_fkey (
            name,
            email
          )
        `)
        .order('send_at', { ascending: true });
      
      if (error) throw error;
      
      return data.map((reminder: any) => ({
        id: reminder.id,
        type: reminder.type,
        recipient_id: reminder.recipient_id,
        recipientName: reminder.recipient?.name,
        recipientEmail: reminder.recipient?.email,
        related_id: reminder.related_id,
        message: reminder.message,
        send_at: new Date(reminder.send_at),
        sent_at: reminder.sent_at ? new Date(reminder.sent_at) : undefined,
        status: reminder.status,
        channel: reminder.channel,
        created_at: new Date(reminder.created_at)
      }));
    }
  });

  const createReminder = useMutation({
    mutationFn: async (reminderData: Partial<Reminder>) => {
      const { data, error } = await supabase
        .from('reminders')
        .insert([reminderData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder scheduled successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to schedule reminder: ${error.message}`);
    }
  });

  const updateReminderStatus = useMutation({
    mutationFn: async ({ id, status, sent_at = new Date() }: { id: string; status: string; sent_at?: Date }) => {
      const { data, error } = await supabase
        .from('reminders')
        .update({ 
          status,
          sent_at: status === 'sent' ? sent_at.toISOString() : null
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update reminder status: ${error.message}`);
    }
  });

  const deleteReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete reminder: ${error.message}`);
    }
  });

  return {
    reminders,
    isLoading,
    error,
    createReminder: createReminder.mutateAsync,
    updateReminderStatus: updateReminderStatus.mutateAsync,
    deleteReminder: deleteReminder.mutateAsync,
    isPendingCreate: createReminder.isPending,
    isPendingUpdate: updateReminderStatus.isPending,
    isPendingDelete: deleteReminder.isPending
  };
};

export const useUserReminders = (userId: string | undefined) => {
  const { data: reminders, isLoading, error } = useQuery({
    queryKey: ['user-reminders', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('recipient_id', userId)
        .eq('status', 'pending')
        .order('send_at', { ascending: true });
      
      if (error) throw error;
      
      return data.map((reminder: any) => ({
        id: reminder.id,
        type: reminder.type,
        recipient_id: reminder.recipient_id,
        related_id: reminder.related_id,
        message: reminder.message,
        send_at: new Date(reminder.send_at),
        status: reminder.status,
        channel: reminder.channel,
        created_at: new Date(reminder.created_at)
      }));
    },
    enabled: !!userId
  });

  return {
    reminders,
    isLoading,
    error
  };
};
