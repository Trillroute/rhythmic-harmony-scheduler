
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Reminder } from "@/lib/types";

export interface ReminderWithRelations extends Reminder {
  recipient?: {
    id: string;
    name: string;
    email: string;
  };
}

export const useReminders = (recipientId?: string) => {
  const queryClient = useQueryClient();

  // Fetch reminders for a specific recipient
  const { data: reminders, isLoading, error } = useQuery({
    queryKey: ['reminders', recipientId],
    queryFn: async () => {
      let query = supabase
        .from('reminders')
        .select(`
          *,
          profiles!recipient_id (
            id,
            name,
            email
          )
        `)
        .order('send_at', { ascending: true });
      
      if (recipientId) {
        query = query.eq('recipient_id', recipientId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map((reminder) => ({
        id: reminder.id,
        type: reminder.type,
        recipient_id: reminder.recipient_id,
        related_id: reminder.related_id,
        message: reminder.message,
        send_at: reminder.send_at,
        sent_at: reminder.sent_at,
        status: reminder.status,
        channel: reminder.channel,
        created_at: reminder.created_at,
        recipient: reminder.profiles ? {
          id: reminder.profiles.id,
          name: reminder.profiles.name,
          email: reminder.profiles.email
        } : undefined
      } as ReminderWithRelations));
    }
  });

  // Create a new reminder
  const createReminder = useMutation({
    mutationFn: async (reminderData: Partial<Reminder>) => {
      // Ensure we have the required fields
      if (!reminderData.recipient_id || !reminderData.message || !reminderData.send_at || 
          !reminderData.type || !reminderData.channel) {
        throw new Error("Missing required reminder fields");
      }
      
      // Create a new object that will hold the formatted fields
      const formattedData: Record<string, any> = {};
      
      // Convert Date objects to ISO strings if present
      Object.entries(reminderData).forEach(([key, value]) => {
        formattedData[key] = typeof value === 'object' && value !== null && 'getTime' in value 
          ? value.toISOString() 
          : value;
      });
      
      const { data, error } = await supabase
        .from('reminders')
        .insert(formattedData)
        .select('id')
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success("Reminder created successfully");
    },
    onError: (error: any) => {
      toast.error(`Error creating reminder: ${error.message}`);
    }
  });

  // Update an existing reminder
  const updateReminder = useMutation({
    mutationFn: async (reminderData: Partial<Reminder> & { id: string }) => {
      const { id, ...updateFields } = reminderData;
      
      // Create a new object that will hold the formatted fields
      const formattedFields: Record<string, any> = {};
      
      // Convert Date objects to ISO strings if present
      Object.entries(updateFields).forEach(([key, value]) => {
        formattedFields[key] = typeof value === 'object' && value !== null && 'getTime' in value 
          ? value.toISOString() 
          : value;
      });
      
      const { error } = await supabase
        .from('reminders')
        .update(formattedFields)
        .eq('id', id);
      
      if (error) throw error;
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success("Reminder updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Error updating reminder: ${error.message}`);
    }
  });

  // Delete a reminder
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
      toast.success("Reminder deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Error deleting reminder: ${error.message}`);
    }
  });

  // Mark reminder as sent
  const markReminderAsSent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reminders')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: (error: any) => {
      toast.error(`Error marking reminder as sent: ${error.message}`);
    }
  });

  return {
    reminders,
    isLoading,
    error,
    createReminder: createReminder.mutateAsync,
    updateReminder: updateReminder.mutateAsync,
    deleteReminder: deleteReminder.mutateAsync,
    markReminderAsSent: markReminderAsSent.mutateAsync,
    isPendingCreate: createReminder.isPending,
    isPendingUpdate: updateReminder.isPending,
    isPendingDelete: deleteReminder.isPending
  };
};

// Fetch pending reminders that need to be sent
export const usePendingReminders = () => {
  return useQuery({
    queryKey: ['pending-reminders'],
    queryFn: async () => {
      const now = new Date();
      
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          profiles!recipient_id (
            id,
            name,
            email
          )
        `)
        .eq('status', 'pending')
        .lte('send_at', now.toISOString())
        .order('send_at', { ascending: true });
      
      if (error) throw error;
      
      return data.map((reminder) => ({
        id: reminder.id,
        type: reminder.type,
        recipient_id: reminder.recipient_id,
        related_id: reminder.related_id,
        message: reminder.message,
        send_at: reminder.send_at,
        status: reminder.status,
        channel: reminder.channel,
        created_at: reminder.created_at,
        recipient: reminder.profiles ? {
          id: reminder.profiles.id,
          name: reminder.profiles.name,
          email: reminder.profiles.email
        } : undefined
      } as ReminderWithRelations));
    }
  });
};
