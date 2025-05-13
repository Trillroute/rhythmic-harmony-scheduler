
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadOptions {
  file: File;
  path: string;
  bucket: string;
  onProgress?: (progress: number) => void;
}

interface DeleteOptions {
  path: string;
  bucket: string;
}

export const useStorage = () => {
  // Upload file mutation
  const uploadFile = useMutation({
    mutationFn: async ({ file, path, bucket, onProgress }: UploadOptions) => {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(path, file, {
            cacheControl: '3600',
            upsert: true,
            onUploadProgress: (progress) => {
              if (onProgress) {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                onProgress(percent);
              }
            }
          });
          
        if (error) throw error;
        
        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);
          
        return {
          path: data.path,
          url: publicUrlData.publicUrl
        };
      } catch (error: any) {
        toast.error(`Upload failed: ${error.message}`);
        throw error;
      }
    },
  });
  
  // Delete file mutation
  const deleteFile = useMutation({
    mutationFn: async ({ path, bucket }: DeleteOptions) => {
      try {
        const { error } = await supabase.storage
          .from(bucket)
          .remove([path]);
          
        if (error) throw error;
        return { success: true, path };
      } catch (error: any) {
        toast.error(`Delete failed: ${error.message}`);
        throw error;
      }
    },
  });
  
  // Get public URL from path
  const getPublicUrl = (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
      
    return data.publicUrl;
  };
  
  return {
    uploadFile: uploadFile.mutateAsync,
    deleteFile: deleteFile.mutateAsync,
    getPublicUrl,
    isUploading: uploadFile.isPending,
    isDeleting: deleteFile.isPending,
    uploadProgress: 0, // This would need to be managed with state in the component
  };
};
