
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BulkUpload } from '@/lib/types';

export const useBulkUploads = () => {
  const queryClient = useQueryClient();

  const fetchBulkUploads = async () => {
    const { data, error } = await supabase
      .from('bulk_uploads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching bulk uploads',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }

    return data as BulkUpload[];
  };

  const { data: uploads, isLoading, error } = useQuery({
    queryKey: ['bulk_uploads'],
    queryFn: fetchBulkUploads,
  });

  const uploadFile = useMutation({
    mutationFn: async ({
      file,
      uploadType,
    }: {
      file: File;
      uploadType: 'students' | 'session_packs' | 'sessions';
    }) => {
      try {
        // 1. Upload the file to storage
        const filePath = `${uploadType}/${Date.now()}_${file.name}`;
        const { data: fileData, error: fileError } = await supabase.storage
          .from('bulk_uploads')
          .upload(filePath, file, { upsert: false });

        if (fileError) {
          throw fileError;
        }

        // 2. Create the upload record
        const { data: uploadData, error: uploadError } = await supabase
          .from('bulk_uploads')
          .insert({
            admin_id: (await supabase.auth.getUser()).data.user?.id,
            upload_type: uploadType,
            file_name: file.name,
            file_path: filePath,
            status: 'processing',
          })
          .select()
          .single();

        if (uploadError) {
          throw uploadError;
        }

        // 3. Start processing the file with our edge function
        const { error: processingError } = await supabase.functions.invoke('process-bulk-upload', {
          body: {
            uploadId: uploadData.id,
            uploadType,
          },
        });

        if (processingError) {
          throw processingError;
        }

        return uploadData as BulkUpload;
      } catch (error: any) {
        toast({
          title: 'Upload failed',
          description: error.message || 'An unexpected error occurred',
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk_uploads'] });
      toast({
        title: 'File uploaded successfully',
        description: 'Your file is being processed. Check the upload history for results.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteUpload = useMutation({
    mutationFn: async (uploadId: string) => {
      // First get the upload details to know which file to delete
      const { data: upload, error: fetchError } = await supabase
        .from('bulk_uploads')
        .select('file_path')
        .eq('id', uploadId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('bulk_uploads')
        .remove([upload.file_path]);

      if (storageError) {
        toast({
          title: 'Warning',
          description: `Could not delete file: ${storageError.message}`,
          variant: 'destructive',
        });
      }

      // Delete the upload record
      const { error: deleteError } = await supabase
        .from('bulk_uploads')
        .delete()
        .eq('id', uploadId);

      if (deleteError) {
        throw deleteError;
      }

      return uploadId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk_uploads'] });
      toast({
        title: 'Upload deleted',
        description: 'The upload record and associated file have been deleted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    uploads,
    isLoading,
    error,
    uploadFile: uploadFile.mutate,
    deleteUpload: deleteUpload.mutate,
    isUploading: uploadFile.isPending,
    isDeleting: deleteUpload.isPending,
  };
};

export const useUploadDetails = (uploadId: string | null) => {
  return useQuery({
    queryKey: ['bulk_uploads', uploadId],
    queryFn: async () => {
      if (!uploadId) return null;

      const { data, error } = await supabase
        .from('bulk_uploads')
        .select('*')
        .eq('id', uploadId)
        .single();

      if (error) {
        toast({
          title: 'Error fetching upload details',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as BulkUpload;
    },
    enabled: !!uploadId,
  });
};
