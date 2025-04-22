
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MAX_FILE_SIZE } from './constants';

export const useStorageOperations = () => {
  const uploadToStorage = async (userId: string, file: File): Promise<string> => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 10MB limit");
    }
    
    try {
      // Create a unique file path
      const userDir = `user-documents/${userId}`;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userDir}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;
      
      return filePath;
    } catch (error: any) {
      console.error("Error in uploadToStorage:", error);
      throw error;
    }
  };

  return { uploadToStorage };
};
