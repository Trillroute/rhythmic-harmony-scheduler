
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useSystemSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as SystemSetting[];
    }
  });

  const getSetting = (key: string) => {
    if (!settings) return null;
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : null;
  };

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data, error } = await supabase
        .from('system_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('Setting updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update setting: ${error.message}`);
    }
  });

  return {
    settings,
    isLoading,
    error,
    getSetting,
    updateSetting: updateSetting.mutate,
    isPending: updateSetting.isPending
  };
};
