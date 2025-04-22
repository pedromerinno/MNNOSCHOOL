
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MAX_FILE_SIZE } from './constants';
import { useDocumentValidation } from './useDocumentValidation';

export const useStorageOperations = () => {
  const { checkBucketExists } = useDocumentValidation();
  
  const uploadToStorage = async (userId: string, file: File): Promise<string> => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 10MB limit");
    }
    
    try {
      // First, ensure the bucket exists
      const bucketExists = await checkBucketExists();
      
      if (!bucketExists) {
        throw new Error("Sistema de armazenamento não está disponível");
      }
      
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
