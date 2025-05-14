
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Reminder } from "@/lib/types";
import { toast } from "sonner";

export interface ReminderFormData {
  recipientId: string;
  type: string;
  message: string;
  channel: string;
  sendAt: Date;
  relatedId?: string;
}

interface RemindersFilterOptions {
  recipientId?: string;
  status?: string[];
  type?: string[];
}

// Transform database reminder to frontend reminder type
const transformReminderFromDB = (reminder: any): Reminder => {
  return {
    id: reminder.id,
    type: reminder.type as "session" | "payment" | "enrollment" | "other",
    recipient_id: reminder.recipient_id,
    related_id: reminder.related_id || undefined,
    message: reminder.message,
    send_at: reminder.send_at,
    sent_at: reminder.sent_at || undefined,
    status: reminder.status as "pending" | "sent" | "failed" | "cancelled",
    channel: reminder.channel as "email" | "in_app" | "sms" | "push",
    created_at: reminder.created_at
  };
};

// Fetch reminders with optional filters
export const useFetchReminders = (filters?: RemindersFilterOptions) => {
  return useQuery({
    queryKey: ['reminders', filters],
    queryFn: async () => {
      let query = supabase.from('reminders')
        .select('*');
      
      // Apply filters
      if (filters?.recipientId) {
        query = query.eq('recipient_id', filters.recipientId);
      }
      
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      
      if (filters?.type && filters.type.length > 0) {
        query = query.in('type', filters.type);
      }
      
      const { data, error } = await query.order('send_at', { ascending: false });
      
      if (error) throw error;
      
      // Map to our Reminder interface
      return data.map(transformReminderFromDB);
    }
  });
};

// Create a new reminder
export const useCreateReminder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: ReminderFormData) => {
      const { recipientId, type, message, channel, sendAt, relatedId } = formData;
      
      const reminderData = {
        recipient_id: recipientId,
        type,
        message,
        channel,
        send_at: sendAt.toISOString(),
        status: 'pending',
        ...(relatedId && { related_id: relatedId })
      };
      
      const { data, error } = await supabase
        .from('reminders')
        .insert(reminderData)
        .select();
      
      if (error) throw error;
      
      return transformReminderFromDB(data[0]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create reminder: ${error.message}`);
    }
  });
};

// Cancel a reminder
export const useCancelReminder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reminderId: string) => {
      const { data, error } = await supabase
        .from('reminders')
        .update({ status: 'cancelled' })
        .eq('id', reminderId)
        .select();
      
      if (error) throw error;
      
      return transformReminderFromDB(data[0]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder cancelled successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to cancel reminder: ${error.message}`);
    }
  });
};
