
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Upload a file to Supabase Storage
   */
  const uploadFile = async (
    bucket: string,
    path: string,
    file: File,
    options?: {
      cacheControl?: string;
      upsert?: boolean;
    }
  ) => {
    if (!file) {
      throw new Error('No file provided');
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || false,
        });

      if (error) {
        throw error;
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setUploadProgress(100);
      
      return {
        path: data.path,
        publicUrl,
      };
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Delete a file from Supabase Storage
   */
  const deleteFile = async (
    bucket: string,
    path: string
  ) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
      throw error;
    }
  };

  /**
   * Get a list of files from a Supabase Storage bucket
   */
  const listFiles = async (
    bucket: string,
    path?: string
  ) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path || '');

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      toast.error(`Failed to list files: ${error.message}`);
      throw error;
    }
  };

  return {
    uploadFile,
    deleteFile,
    listFiles,
    isUploading,
    uploadProgress,
  };
};
