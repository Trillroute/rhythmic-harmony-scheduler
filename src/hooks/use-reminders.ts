
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

interface Reminder {
  id: string;
  recipientId: string;
  message: string;
  sendAt: string;
  type: "session" | "payment" | "enrollment" | "other";
  channel: "email" | "in_app" | "sms" | "push";
  relatedId?: string;
  status: "pending" | "sent" | "cancelled";
  sentAt?: string;
  createdAt: string;
}

interface CreateReminderProps {
  recipient_id: string;
  message: string;
  send_at: string;  
  type: "session" | "payment" | "enrollment" | "other";
  channel: "email" | "in_app" | "sms" | "push";
  related_id?: string;
  status?: "pending" | "sent" | "cancelled";
}

interface UpdateReminderProps {
  id: string;
  status?: "pending" | "sent" | "cancelled";
  sent_at?: string;
}

export const useReminders = (recipientId?: string) => {
  const queryKey = ["reminders", recipientId];
  
  const fetchReminders = async (): Promise<Reminder[]> => {
    let query = supabase.from("reminders").select("*");
    
    if (recipientId) {
      query = query.eq("recipient_id", recipientId);
    }
    
    const { data, error } = await query.order('send_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Transform data to match our interface
    return data.map(reminder => ({
      id: reminder.id,
      recipientId: reminder.recipient_id,
      message: reminder.message,
      sendAt: reminder.send_at,
      type: reminder.type,
      channel: reminder.channel,
      relatedId: reminder.related_id,
      status: reminder.status,
      sentAt: reminder.sent_at,
      createdAt: reminder.created_at
    }));
  };
  
  return useQuery({
    queryKey,
    queryFn: fetchReminders,
    enabled: !!recipientId
  });
};

export const useCreateReminder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reminderData: CreateReminderProps) => {
      // Ensure send_at is a string
      const formattedData = {
        ...reminderData,
        send_at: typeof reminderData.send_at === 'string' 
          ? reminderData.send_at 
          : reminderData.send_at.toISOString(),
        status: reminderData.status || 'pending'
      };
      
      const { data, error } = await supabase
        .from("reminders")
        .insert([formattedData])
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reminders", data.recipient_id] });
      toast.success("Reminder created successfully");
    },
    onError: (error) => {
      toast.error(`Error creating reminder: ${error.message}`);
    }
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateReminderProps) => {
      // Format sent_at as ISO string if it's a Date object
      const formattedData = {
        ...updateData,
        sent_at: updateData.sent_at && typeof updateData.sent_at !== 'string'
          ? updateData.sent_at.toISOString()
          : updateData.sent_at
      };
      
      const { data, error } = await supabase
        .from("reminders")
        .update(formattedData)
        .eq("id", id)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reminders", data.recipient_id] });
      toast.success("Reminder updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating reminder: ${error.message}`);
    }
  });
};
